import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validator';
import { authenticate } from '../middleware/auth';
import { isGroupMember, isGroupFacilitator } from '../middleware/authorization';
import * as groupController from '../controllers/group.controller';
import { auditLog } from '../middleware/auditLog';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  validate([
    body('name').notEmpty().withMessage('Group name is required'),
    body('description').optional().isString(),
    body('purpose').optional().isString(),
    body('maxMembers')
      .optional()
      .isInt({ min: 4, max: 12 })
      .withMessage('Max members must be between 4 and 12'),
    body('isPrivate').optional().isBoolean(),
    body('requireApproval').optional().isBoolean(),
  ]),
  auditLog('GROUP_CREATE', 'Group'),
  groupController.createGroup
);

/**
 * @swagger
 * /api/v1/groups/:groupId:
 *   get:
 *     summary: Get group details
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:groupId',
  validate([param('groupId').isUUID().withMessage('Invalid group ID')]),
  isGroupMember,
  groupController.getGroup
);

/**
 * @swagger
 * /api/v1/groups/:groupId:
 *   put:
 *     summary: Update group details
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/:groupId',
  validate([
    param('groupId').isUUID().withMessage('Invalid group ID'),
    body('name').optional().notEmpty().withMessage('Group name cannot be empty'),
    body('description').optional().isString(),
    body('purpose').optional().isString(),
    body('maxMembers')
      .optional()
      .isInt({ min: 4, max: 12 })
      .withMessage('Max members must be between 4 and 12'),
  ]),
  isGroupFacilitator,
  auditLog('GROUP_UPDATE', 'Group'),
  groupController.updateGroup
);

/**
 * @swagger
 * /api/v1/groups/:groupId:
 *   delete:
 *     summary: Delete/deactivate group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:groupId',
  validate([param('groupId').isUUID().withMessage('Invalid group ID')]),
  isGroupFacilitator,
  auditLog('GROUP_DELETE', 'Group'),
  groupController.deleteGroup
);

/**
 * @swagger
 * /api/v1/groups/:groupId/members:
 *   get:
 *     summary: Get group members
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:groupId/members',
  validate([param('groupId').isUUID().withMessage('Invalid group ID')]),
  isGroupMember,
  groupController.getGroupMembers
);

/**
 * @swagger
 * /api/v1/groups/:groupId/invite:
 *   post:
 *     summary: Invite a member to the group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:groupId/invite',
  validate([
    param('groupId').isUUID().withMessage('Invalid group ID'),
    body('email').isEmail().withMessage('Valid email is required'),
  ]),
  isGroupFacilitator,
  auditLog('GROUP_INVITE_MEMBER', 'Membership'),
  groupController.inviteMember
);

/**
 * @swagger
 * /api/v1/groups/:groupId/accept:
 *   post:
 *     summary: Accept group invitation
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:groupId/accept',
  validate([param('groupId').isUUID().withMessage('Invalid group ID')]),
  auditLog('GROUP_ACCEPT_INVITATION', 'Membership'),
  groupController.acceptInvitation
);

/**
 * @swagger
 * /api/v1/groups/:groupId/leave:
 *   post:
 *     summary: Leave a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:groupId/leave',
  validate([param('groupId').isUUID().withMessage('Invalid group ID')]),
  isGroupMember,
  auditLog('GROUP_LEAVE', 'Membership'),
  groupController.leaveGroup
);

/**
 * @swagger
 * /api/v1/groups/:groupId/members/:memberId:
 *   delete:
 *     summary: Remove a member from group (facilitator only)
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:groupId/members/:memberId',
  validate([
    param('groupId').isUUID().withMessage('Invalid group ID'),
    param('memberId').isUUID().withMessage('Invalid member ID'),
  ]),
  isGroupFacilitator,
  auditLog('GROUP_REMOVE_MEMBER', 'Membership'),
  groupController.removeMember
);

export default router;
