import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { MembershipStatus } from '@prisma/client';

interface CreatePostData {
  content: string;
  attachments?: string[];
  visibility?: 'PUBLIC' | 'GROUP';
}

export class PostService {
  async createPost(
    userId: string,
    groupId: string | null,
    data: CreatePostData
  ) {
    if (groupId) {
      // Verify membership
      const membership = await prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId,
            groupId,
          },
        },
      });

      if (!membership || membership.status !== MembershipStatus.ACTIVE) {
        throw new AppError('Access denied: Not a member of this group', 403);
      }
    }

    const post = await prisma.post.create({
      data: {
        groupId: groupId || null,
        authorId: userId,
        content: data.content,
        visibility: groupId 
          ? (data.visibility === 'PUBLIC' ? 'PUBLIC' : 'GROUP')
          : 'PUBLIC',
        attachments: data.attachments || [],
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return post;
  }

  async getPublicFeed(limit: number, offset: number) {
    return prisma.post.findMany({
      where: {
        isDeleted: false,
        visibility: 'PUBLIC',
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          where: { isDeleted: false },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: { 
            comments: true,
            likes: true,
          },
        },
      },
    });
  }

  async getGroupFeed(userId: string, limit: number, offset: number) {
    const memberships = await prisma.membership.findMany({
      where: {
        userId,
        status: MembershipStatus.ACTIVE,
      },
      select: {
        groupId: true,
      },
    });

    const groupIds = memberships.map((m) => m.groupId);

    return prisma.post.findMany({
      where: {
        isDeleted: false,
        groupId: { in: groupIds },
        visibility: 'GROUP',
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          where: { isDeleted: false },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: { 
            comments: true,
            likes: true,
          },
        },
      },
    });
  }

  async getGroupPosts(
    groupId: string,
    userId: string,
    limit = 20,
    offset = 0
  ) {
    // Verify membership
    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (!membership || membership.status !== MembershipStatus.ACTIVE) {
      throw new AppError('Access denied: Not a member of this group', 403);
    }

    return prisma.post.findMany({
      where: {
        groupId,
        isDeleted: false,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: {
              where: { isDeleted: false },
            },
            likes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async getPost(postId: string, userId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          where: { isDeleted: false },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                displayName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!post) throw new AppError('Post not found', 404);

    if (post.groupId && post.visibility === 'GROUP') {
      // Verify membership
      const membership = await prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId,
            groupId: post.groupId,
          },
        },
      });

      if (!membership || membership.status !== MembershipStatus.ACTIVE) {
        throw new AppError('Access denied', 403);
      }
    }

    return post;
  }

  async updatePost(
    postId: string,
    userId: string,
    data: { content: string }
  ) {
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) throw new AppError('Post not found', 404);
    if (post.authorId !== userId)
      throw new AppError('Access denied: You can only edit your own posts', 403);
    if (post.isDeleted) throw new AppError('Cannot edit deleted post', 400);

    return prisma.post.update({
      where: { id: postId },
      data: { content: data.content },
    });
  }

  async deletePost(postId: string, userId: string) {
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) throw new AppError('Post not found', 404);

    // User can delete own post, or facilitator can delete any post
    if (post.authorId !== userId) {
      if (!post.groupId) throw new AppError('Post not found', 404);

      const membership = await prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId,
            groupId: post.groupId,
          },
        },
      });

      if (
        !membership ||
        (membership.role !== 'FACILITATOR' &&
          membership.role !== 'ADMIN')
      ) {
        throw new AppError('Access denied', 403);
      }
    }

    await prisma.post.update({
      where: { id: postId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return { message: 'Post deleted successfully' };
  }

  async createComment(
    postId: string,
    userId: string,
    content: string
  ) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) throw new AppError('Post not found', 404);

    if (post.groupId && post.visibility === 'GROUP') {
      // Verify membership
      const membership = await prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId,
            groupId: post.groupId,
          },
        },
      });

      if (!membership || membership.status !== MembershipStatus.ACTIVE) {
        throw new AppError('Access denied', 403);
      }
    }

    return prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        content,
      },
    });
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: true },
    });

    if (!comment) throw new AppError('Comment not found', 404);
    // User can delete own comment, or facilitator can delete any comment
    if (comment.authorId !== userId) {
      const post = comment.post;

      if (post.groupId && post.visibility === 'GROUP') {
        const membership = await prisma.membership.findUnique({
          where: {
            userId_groupId: {
              userId,
              groupId: post.groupId,
            },
          },
        });

        if (
          !membership ||
          (membership.role !== 'FACILITATOR' &&
            membership.role !== 'ADMIN')
        ) {
          throw new AppError('Access denied', 403);
        }
      }
    }

    return prisma.comment.update({
      where: { id: commentId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async likePost(postId: string, userId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) throw new AppError('Post not found', 404);

    if (post.groupId && post.visibility === 'GROUP') {
      const membership = await prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId,
            groupId: post.groupId,
          },
        },
      });

      if (!membership || membership.status !== MembershipStatus.ACTIVE) {
        throw new AppError('Access denied', 403);
      }
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      return { liked: false };
    }

    const like = await prisma.like.create({
      data: { userId, postId },
    });

    return { liked: true, data: like };
  }
}