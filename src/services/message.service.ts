import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class MessageService {
  // Send a message to a group
  async sendMessage(groupId: string, userId: string, content: string) {
    // Verify user is a member of the group
    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw new AppError('You must be an active member to send messages', 403);
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        groupId,
        userId,
      },
      include: {
        user: {
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

    return message;
  }

  // Get messages for a group with pagination
  async getGroupMessages(groupId: string, userId: string, limit = 50, before?: string) {
    // Verify user is a member of the group
    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw new AppError('You must be an active member to view messages', 403);
    }

    const whereClause: any = {
      groupId,
      isDeleted: false,
    };

    if (before) {
      whereClause.createdAt = {
        lt: new Date(before),
      };
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatar: true,
          },
        },
        readReceipts: {
          select: {
            userId: true,
            readAt: true,
          },
        },
      },
    });

    return messages.reverse(); // Return in chronological order
  }

  // Edit a message
  async editMessage(messageId: string, userId: string, content: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    if (message.userId !== userId) {
      throw new AppError('You can only edit your own messages', 403);
    }

    if (message.isDeleted) {
      throw new AppError('Cannot edit deleted message', 400);
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        isEdited: true,
        editedAt: new Date(),
      },
      include: {
        user: {
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

    return updatedMessage;
  }

  // Delete a message (soft delete)
  async deleteMessage(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    // Check if user is the author or a group admin
    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: message.groupId,
        },
      },
    });

    const canDelete = message.userId === userId || membership?.role === 'ADMIN';

    if (!canDelete) {
      throw new AppError('You do not have permission to delete this message', 403);
    }

    const deletedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        content: '[Message deleted]',
      },
    });

    return deletedMessage;
  }

  // Mark message as read
  async markMessageAsRead(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    // Don't create read receipt for own messages
    if (message.userId === userId) {
      return null;
    }

    const readReceipt = await prisma.messageReadReceipt.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
      create: {
        messageId,
        userId,
      },
      update: {
        readAt: new Date(),
      },
    });

    return readReceipt;
  }

  // Mark all messages in a group as read
  async markAllMessagesAsRead(groupId: string, userId: string) {
    // Get all unread messages in the group
    const messages = await prisma.message.findMany({
      where: {
        groupId,
        userId: {
          not: userId, // Exclude own messages
        },
        isDeleted: false,
        NOT: {
          readReceipts: {
            some: {
              userId,
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    // Create read receipts for all unread messages
    const readReceipts = await prisma.messageReadReceipt.createMany({
      data: messages.map((msg) => ({
        messageId: msg.id,
        userId,
      })),
      skipDuplicates: true,
    });

    return readReceipts;
  }

  // Get unread message count for a group
  async getUnreadCount(groupId: string, userId: string) {
    const count = await prisma.message.count({
      where: {
        groupId,
        userId: {
          not: userId, // Exclude own messages
        },
        isDeleted: false,
        NOT: {
          readReceipts: {
            some: {
              userId,
            },
          },
        },
      },
    });

    return count;
  }

  // Get unread counts for all user's groups
  async getUnreadCounts(userId: string) {
    const memberships = await prisma.membership.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      select: {
        groupId: true,
      },
    });

    const groupIds = memberships.map((m) => m.groupId);

    const unreadCounts = await Promise.all(
      groupIds.map(async (groupId) => ({
        groupId,
        count: await this.getUnreadCount(groupId, userId),
      }))
    );

    return unreadCounts;
  }
}

export default new MessageService();
