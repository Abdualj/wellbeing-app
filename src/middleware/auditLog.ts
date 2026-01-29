import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../config/database';
import logger from '../config/logger';

export const auditLog = (action: string, entity: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const entityId = req.params.id || req.params.groupId || req.body.id;
      
      // Store original send function
      const originalSend = res.json.bind(res);
      
      // Override send to capture response
      res.json = function (body: any) {
        // Only log successful operations (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          prisma.auditLog.create({
            data: {
              userId,
              action,
              entity,
              entityId,
              metadata: {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
              },
              ipAddress: req.ip,
              userAgent: req.get('user-agent'),
            },
          }).catch((error) => {
            logger.error('Failed to create audit log:', error);
          });
        }
        
        return originalSend(body);
      };
      
      next();
    } catch (error) {
      // Don't block request if audit logging fails
      logger.error('Audit log middleware error:', error);
      next();
    }
  };
};
