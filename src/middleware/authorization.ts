import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../config/database';
import { AppError } from './errorHandler';
import { MemberRole } from '@prisma/client';

export const isGroupMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const groupId = req.params.groupId || req.body.groupId;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    if (!groupId) {
      throw new AppError('Group ID required', 400);
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      throw new AppError('Access denied: Not a member of this group', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const isGroupFacilitator = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const groupId = req.params.groupId || req.body.groupId;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    if (!groupId) {
      throw new AppError('Group ID required', 400);
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (
      !membership ||
      membership.status !== 'ACTIVE' ||
      (membership.role !== MemberRole.FACILITATOR && membership.role !== MemberRole.ADMIN)
    ) {
      throw new AppError('Access denied: Facilitator role required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};
