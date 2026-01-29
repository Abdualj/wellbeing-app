import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PostService } from '../services/post.service';
import { asyncHandler } from '../middleware/errorHandler';

const postService = new PostService();

export const createPost = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { groupId } = req.params;
    const post = await postService.createPost(groupId, userId, req.body);

    res.status(201).json({
      status: 'success',
      data: post,
    });
  }
);

export const getGroupPosts = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { groupId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const posts = await postService.getGroupPosts(groupId, userId, limit, offset);

    res.status(200).json({
      status: 'success',
      data: posts,
    });
  }
);

export const getPost = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { postId } = req.params;
    const post = await postService.getPost(postId, userId);

    res.status(200).json({
      status: 'success',
      data: post,
    });
  }
);

export const updatePost = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { postId } = req.params;
    const post = await postService.updatePost(postId, userId, req.body);

    res.status(200).json({
      status: 'success',
      data: post,
    });
  }
);

export const deletePost = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { postId } = req.params;
    const result = await postService.deletePost(postId, userId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

export const createComment = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { postId } = req.params;
    const { content } = req.body;
    const comment = await postService.createComment(postId, userId, content);

    res.status(201).json({
      status: 'success',
      data: comment,
    });
  }
);

export const deleteComment = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { commentId } = req.params;
    const result = await postService.deleteComment(commentId, userId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);
