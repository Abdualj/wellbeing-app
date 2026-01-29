import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validator';
import { authenticate } from '../middleware/auth';
import * as userController from '../controllers/user.controller';
import { auditLog } from '../middleware/auditLog';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', userController.getProfile);

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/profile',
  validate([
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('displayName').optional().notEmpty().withMessage('Display name cannot be empty'),
    body('bio').optional().isString(),
    body('avatar').optional().isString(),
    body('notificationPreference')
      .optional()
      .isIn(['NONE', 'MINIMAL', 'NORMAL', 'ALL'])
      .withMessage('Invalid notification preference'),
  ]),
  auditLog('USER_UPDATE_PROFILE', 'User'),
  userController.updateProfile
);

/**
 * @swagger
 * /api/v1/users/consent:
 *   put:
 *     summary: Update user consent settings (GDPR)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/consent',
  validate([
    body('dataProcessingConsent').optional().isBoolean(),
    body('marketingConsent').optional().isBoolean(),
  ]),
  auditLog('USER_UPDATE_CONSENT', 'User'),
  userController.updateConsent
);

/**
 * @swagger
 * /api/v1/users/data-deletion:
 *   post:
 *     summary: Request account and data deletion (GDPR right to be forgotten)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/data-deletion',
  auditLog('USER_REQUEST_DELETION', 'User'),
  userController.requestDataDeletion
);

/**
 * @swagger
 * /api/v1/users/export-data:
 *   get:
 *     summary: Export user data (GDPR right to data portability)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/export-data',
  auditLog('USER_EXPORT_DATA', 'User'),
  userController.exportData
);

/**
 * @swagger
 * /api/v1/users/groups:
 *   get:
 *     summary: Get user's groups
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/groups', userController.getUserGroups);

export default router;
