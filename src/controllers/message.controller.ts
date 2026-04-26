import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import messageService from '../services/message.service';
import { getWebSocketServer } from '../websocket';

// Send a message to a group
export const sendMessage = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    const { content } = req.body;
    const userId = req.user!.id;

    const message = await messageService.sendMessage(groupId, userId, content);

    // Emit WebSocket event
    try {
      const ws = getWebSocketServer();
      ws.emitNewMessage(groupId, message);
    } catch (error) {
      // WebSocket not critical, continue
    }

    res.status(201).json({
      status: 'success',
      data: message,
    });
  }
);

// Get messages for a group
export const getGroupMessages = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const before = req.query.before as string;

    const messages = await messageService.getGroupMessages(groupId, userId, limit, before);

    res.status(200).json({
      status: 'success',
      data: messages,
      pagination: {
        limit,
        hasMore: messages.length === limit,
      },
    });
  }
);

// Edit a message
export const editMessage = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user!.id;

    const message = await messageService.editMessage(messageId, userId, content);

    res.status(200).json({
      status: 'success',
      data: message,
    });
  }
);

// Delete a message
export const deleteMessage = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { messageId } = req.params;
    const userId = req.user!.id;

    await messageService.deleteMessage(messageId, userId);

    res.status(200).json({
      status: 'success',
      message: 'Message deleted successfully',
    });
  }
);

// Mark message as read
export const markMessageAsRead = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { messageId } = req.params;
    const userId = req.user!.id;

    await messageService.markMessageAsRead(messageId, userId);

    res.status(200).json({
      status: 'success',
      message: 'Message marked as read',
    });
  }
);

// Mark all messages in a group as read
export const markAllAsRead = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    const userId = req.user!.id;

    await messageService.markAllMessagesAsRead(groupId, userId);

    res.status(200).json({
      status: 'success',
      message: 'All messages marked as read',
    });
  }
);

// Get unread message count for a group
export const getUnreadCount = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    const userId = req.user!.id;

    const count = await messageService.getUnreadCount(groupId, userId);

    res.status(200).json({
      status: 'success',
      data: { unreadCount: count },
    });
  }
);

// Get unread counts for all user's groups
export const getUnreadCounts = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;

    const counts = await messageService.getUnreadCounts(userId);

    res.status(200).json({
      status: 'success',
      data: counts,
    });
  }
);
