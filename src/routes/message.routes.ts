import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as messageController from '../controllers/message.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get unread counts for all groups
router.get('/unread-counts', messageController.getUnreadCounts);

// Group-specific message routes
router.post('/groups/:groupId/messages', messageController.sendMessage);
router.get('/groups/:groupId/messages', messageController.getGroupMessages);
router.get('/groups/:groupId/unread-count', messageController.getUnreadCount);
router.post('/groups/:groupId/mark-all-read', messageController.markAllAsRead);

// Individual message routes
router.put('/messages/:messageId', messageController.editMessage);
router.delete('/messages/:messageId', messageController.deleteMessage);
router.post('/messages/:messageId/read', messageController.markMessageAsRead);

export default router;
