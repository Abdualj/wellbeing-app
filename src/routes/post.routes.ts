import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validator';
import { authenticate } from '../middleware/auth';
import { isGroupMember } from '../middleware/authorization';
import * as postController from '../controllers/post.controller';
import { auditLog } from '../middleware/auditLog';

const router = Router();

/**
 * @swagger
 * /api/v1/posts/public-feed:
 *   get:
 *     summary: Get public feed (all posts)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 */
router.get('/public-feed', postController.getPublicFeed);

// All routes except public feed require authentication
router.use(authenticate);


/**
 * @swagger
 * /api/v1/posts/group-feed:
 *   get:
 *     summary: Get group feed (posts from user's groups)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 */
router.get('/group-feed', postController.getGroupFeed);

/**
 * @swagger
 * /api/v1/posts/public:
 *   post:
 *     summary: Create a public post (no group)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/public',
  validate([
    body('content').notEmpty().withMessage('Content is required'),
    body('attachments').optional().isArray(),
  ]),
  auditLog('POST_CREATE', 'Post'),
  postController.createPublicPost
);

/**
 * @swagger
 * /api/v1/groups/{groupId}/posts:
 *   post:
 *     summary: Create a post in a group
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/groups/:groupId/posts',
  validate([
    param('groupId').isUUID().withMessage('Invalid group ID'),
    body('content').notEmpty().withMessage('Content is required'),
    body('attachments').optional().isArray(),
  ]),
  isGroupMember,
  auditLog('POST_CREATE', 'Post'),
  postController.createPost
);

/**
 * @swagger
 * /api/v1/groups/{groupId}/posts:
 *   get:
 *     summary: Get posts from a group
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/groups/:groupId/posts',
  validate([param('groupId').isUUID().withMessage('Invalid group ID')]),
  isGroupMember,
  postController.getGroupPosts
);

/**
 * @swagger
 * /api/v1/posts/{postId}:
 *   get:
 *     summary: Get a specific post with comments
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:postId',
  validate([param('postId').isUUID().withMessage('Invalid post ID')]),
  postController.getPost
);

/**
 * @swagger
 * /api/v1/posts/{postId}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/:postId',
  validate([
    param('postId').isUUID().withMessage('Invalid post ID'),
    body('content').notEmpty().withMessage('Content is required'),
  ]),
  auditLog('POST_UPDATE', 'Post'),
  postController.updatePost
);

/**
 * @swagger
 * /api/v1/posts/{postId}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:postId',
  validate([param('postId').isUUID().withMessage('Invalid post ID')]),
  auditLog('POST_DELETE', 'Post'),
  postController.deletePost
);

/**
 * @swagger
 * /api/v1/posts/{postId}/like:
 *   post:
 *     summary: Like or unlike a post (toggle)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:postId/like',
  validate([param('postId').isUUID().withMessage('Invalid post ID')]),
  auditLog('POST_LIKE', 'Like'),
  postController.likePost
);

/**
 * @swagger
 * /api/v1/posts/{postId}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:postId/comments',
  validate([
    param('postId').isUUID().withMessage('Invalid post ID'),
    body('content').notEmpty().withMessage('Content is required'),
  ]),
  auditLog('COMMENT_CREATE', 'Comment'),
  postController.createComment
);

/**
 * @swagger
 * /api/v1/posts/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/comments/:commentId',
  validate([param('commentId').isUUID().withMessage('Invalid comment ID')]),
  auditLog('COMMENT_DELETE', 'Comment'),
  postController.deleteComment
);

export default router;