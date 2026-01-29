import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { MembershipStatus } from '@prisma/client';

interface CreatePostData {
  content: string;
  attachments?: string[];
}

export class PostService {
  async createPost(groupId: string, userId: string, data: CreatePostData) {
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

    const post = await prisma.post.create({
      data: {
        groupId,
        authorId: userId,
        content: data.content,
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
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    return post;
  }

  async getGroupPosts(groupId: string, userId: string, limit = 20, offset = 0) {
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

    const posts = await prisma.post.findMany({
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return posts;
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
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

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
      throw new AppError('Access denied: Not a member of this group', 403);
    }

    return post;
  }

  async updatePost(postId: string, userId: string, data: { content: string }) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    if (post.authorId !== userId) {
      throw new AppError('Access denied: You can only edit your own posts', 403);
    }

    if (post.isDeleted) {
      throw new AppError('Cannot edit deleted post', 400);
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        content: data.content,
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
      },
    });

    return updatedPost;
  }

  async deletePost(postId: string, userId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // User can delete own post, or facilitator can delete any post
    if (post.authorId !== userId) {
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
        (membership.role !== 'FACILITATOR' && membership.role !== 'ADMIN')
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

  async createComment(postId: string, userId: string, content: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { group: true },
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

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
      throw new AppError('Access denied: Not a member of this group', 403);
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        content,
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
      },
    });

    return comment;
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          include: {
            group: true,
          },
        },
      },
    });

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // User can delete own comment, or facilitator can delete any comment
    if (comment.authorId !== userId) {
      const membership = await prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId,
            groupId: comment.post.groupId,
          },
        },
      });

      if (
        !membership ||
        (membership.role !== 'FACILITATOR' && membership.role !== 'ADMIN')
      ) {
        throw new AppError('Access denied', 403);
      }
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return { message: 'Comment deleted successfully' };
  }
}
