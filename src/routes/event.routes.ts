import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validator';
import { authenticate } from '../middleware/auth';
import { isGroupMember } from '../middleware/authorization';
import * as eventController from '../controllers/event.controller';
import { auditLog } from '../middleware/auditLog';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/groups/:groupId/events:
 *   post:
 *     summary: Create an event in a group
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:groupId/events',
  validate([
    param('groupId').isUUID().withMessage('Invalid group ID'),
    body('title').notEmpty().withMessage('Event title is required'),
    body('description').optional().isString(),
    body('location').optional().isString(),
    body('locationDetails').optional().isString(),
    body('startTime').isISO8601().withMessage('Valid start time is required'),
    body('endTime').optional().isISO8601().withMessage('Valid end time required if provided'),
    body('maxParticipants').optional().isInt({ min: 1 }),
    body('isOnline').optional().isBoolean(),
    body('meetingLink').optional().isString(),
  ]),
  isGroupMember,
  auditLog('EVENT_CREATE', 'Event'),
  eventController.createEvent
);

/**
 * @swagger
 * /api/v1/groups/:groupId/events:
 *   get:
 *     summary: Get events for a group
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:groupId/events',
  validate([param('groupId').isUUID().withMessage('Invalid group ID')]),
  isGroupMember,
  eventController.getGroupEvents
);

/**
 * @swagger
 * /api/v1/events/:eventId:
 *   get:
 *     summary: Get event details
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:eventId',
  validate([param('eventId').isUUID().withMessage('Invalid event ID')]),
  eventController.getEvent
);

/**
 * @swagger
 * /api/v1/events/:eventId:
 *   put:
 *     summary: Update event details
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/:eventId',
  validate([
    param('eventId').isUUID().withMessage('Invalid event ID'),
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().isString(),
    body('location').optional().isString(),
    body('startTime').optional().isISO8601(),
    body('endTime').optional().isISO8601(),
    body('maxParticipants').optional().isInt({ min: 1 }),
    body('isOnline').optional().isBoolean(),
    body('meetingLink').optional().isString(),
  ]),
  auditLog('EVENT_UPDATE', 'Event'),
  eventController.updateEvent
);

/**
 * @swagger
 * /api/v1/events/:eventId/cancel:
 *   post:
 *     summary: Cancel an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:eventId/cancel',
  validate([param('eventId').isUUID().withMessage('Invalid event ID')]),
  auditLog('EVENT_CANCEL', 'Event'),
  eventController.cancelEvent
);

/**
 * @swagger
 * /api/v1/events/:eventId/respond:
 *   post:
 *     summary: Respond to an event (GOING, MAYBE, NOT_GOING)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:eventId/respond',
  validate([
    param('eventId').isUUID().withMessage('Invalid event ID'),
    body('status')
      .isIn(['GOING', 'MAYBE', 'NOT_GOING'])
      .withMessage('Status must be GOING, MAYBE, or NOT_GOING'),
  ]),
  auditLog('EVENT_RESPOND', 'EventParticipant'),
  eventController.respondToEvent
);

/**
 * @swagger
 * /api/v1/events/:eventId/participants:
 *   get:
 *     summary: Get event participants
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:eventId/participants',
  validate([param('eventId').isUUID().withMessage('Invalid event ID')]),
  eventController.getEventParticipants
);

export default router;
