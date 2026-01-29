import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { NotificationLevel } from '@prisma/client';

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  notificationPreference?: NotificationLevel;
}

export class UserService {
  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        bio: true,
        avatar: true,
        notificationPreference: true,
        consentGiven: true,
        dataProcessingConsent: true,
        marketingConsent: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async updateUserProfile(userId: string, data: UpdateUserData) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        bio: true,
        avatar: true,
        notificationPreference: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updateConsent(
    userId: string,
    consent: {
      dataProcessingConsent?: boolean;
      marketingConsent?: boolean;
    }
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...consent,
        consentDate: new Date(),
      },
      select: {
        id: true,
        consentGiven: true,
        dataProcessingConsent: true,
        marketingConsent: true,
        consentDate: true,
      },
    });

    return user;
  }

  async requestDataDeletion(userId: string) {
    // Mark user for deletion (GDPR right to be forgotten)
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletionRequested: true,
        deletionRequestDate: new Date(),
        isActive: false,
      },
    });

    // Note: Actual deletion should be handled by a background job
    // after the anonymization delay period

    return {
      message: 'Data deletion requested. Your account will be deleted after the required waiting period.',
      deletionDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
      ),
    };
  }

  async exportUserData(userId: string) {
    // GDPR right to data portability
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        posts: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            groupId: true,
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
        eventParticipants: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startTime: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Remove sensitive data
    const { passwordHash, ...userData } = user;

    return userData;
  }

  async getUserGroups(userId: string) {
    const memberships = await prisma.membership.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            description: true,
            avatar: true,
            maxMembers: true,
            createdAt: true,
            _count: {
              select: {
                memberships: {
                  where: { status: 'ACTIVE' },
                },
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    return memberships.map((m) => ({
      ...m.group,
      role: m.role,
      joinedAt: m.joinedAt,
      memberCount: m.group._count.memberships,
    }));
  }
}
