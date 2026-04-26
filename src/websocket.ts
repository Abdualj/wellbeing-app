import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './config';
import logger from './config/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthSocket extends Socket {
  userId?: string;
}

export class WebSocketServer {
  private io: SocketIOServer;
  private userSockets: Map<string, string[]>; // userId -> socketIds[]

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: config.cors.origin,
        credentials: true,
      },
    });

    this.userSockets = new Map();
    this.initialize();
  }

  private initialize() {
    // Authentication middleware
    this.io.use(async (socket: AuthSocket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
        socket.userId = decoded.userId;

        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    // Connection handler
    this.io.on('connection', (socket: AuthSocket) => {
      const userId = socket.userId!;
      logger.info(`User ${userId} connected with socket ${socket.id}`);

      // Track user's socket connections
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, []);
      }
      this.userSockets.get(userId)!.push(socket.id);

      // Join user's groups
      this.joinUserGroups(socket, userId);

      // Handle typing indicators
      socket.on('typing:start', (data: { groupId: string }) => {
        socket.to(`group:${data.groupId}`).emit('user:typing', {
          userId,
          groupId: data.groupId,
        });
      });

      socket.on('typing:stop', (data: { groupId: string }) => {
        socket.to(`group:${data.groupId}`).emit('user:stop-typing', {
          userId,
          groupId: data.groupId,
        });
      });

      // Handle new messages (relay from HTTP API)
      socket.on('message:send', (data: any) => {
        this.io.to(`group:${data.groupId}`).emit('message:new', data);
      });

      // Handle message edits
      socket.on('message:edit', (data: any) => {
        this.io.to(`group:${data.groupId}`).emit('message:edited', data);
      });

      // Handle message deletions
      socket.on('message:delete', (data: any) => {
        this.io.to(`group:${data.groupId}`).emit('message:deleted', data);
      });

      // Handle read receipts
      socket.on('message:read', (data: { messageId: string; groupId: string }) => {
        socket.to(`group:${data.groupId}`).emit('message:read-receipt', {
          messageId: data.messageId,
          userId,
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`User ${userId} disconnected from socket ${socket.id}`);
        
        // Remove socket from user's connections
        const sockets = this.userSockets.get(userId) || [];
        const index = sockets.indexOf(socket.id);
        if (index > -1) {
          sockets.splice(index, 1);
        }
        
        if (sockets.length === 0) {
          this.userSockets.delete(userId);
        }
      });
    });
  }

  // Join all groups the user is a member of
  private async joinUserGroups(socket: AuthSocket, userId: string) {
    try {
      const memberships = await prisma.membership.findMany({
        where: {
          userId,
          status: 'ACTIVE',
        },
        select: {
          groupId: true,
        },
      });

      memberships.forEach((membership) => {
        socket.join(`group:${membership.groupId}`);
        logger.info(`User ${userId} joined group room: group:${membership.groupId}`);
      });
    } catch (error) {
      logger.error('Error joining user groups:', error);
    }
  }

  // Emit new message to group
  public emitNewMessage(groupId: string, message: any) {
    this.io.to(`group:${groupId}`).emit('message:new', message);
  }

  // Emit message edit to group
  public emitMessageEdit(groupId: string, message: any) {
    this.io.to(`group:${groupId}`).emit('message:edited', message);
  }

  // Emit message delete to group
  public emitMessageDelete(groupId: string, messageId: string) {
    this.io.to(`group:${groupId}`).emit('message:deleted', { messageId });
  }

  // Emit read receipt
  public emitReadReceipt(groupId: string, messageId: string, userId: string) {
    this.io.to(`group:${groupId}`).emit('message:read-receipt', {
      messageId,
      userId,
    });
  }

  // Get Socket.IO instance
  public getIO() {
    return this.io;
  }
}

let webSocketServer: WebSocketServer;

export const initializeWebSocket = (httpServer: HTTPServer) => {
  webSocketServer = new WebSocketServer(httpServer);
  return webSocketServer;
};

export const getWebSocketServer = () => {
  if (!webSocketServer) {
    throw new Error('WebSocket server not initialized');
  }
  return webSocketServer;
};
