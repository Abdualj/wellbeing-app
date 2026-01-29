import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { MemberRole, MembershipStatus } from '@prisma/client';

interface CreateGroupData {
  name: string;
  description?: string;
  purpose?: string;
  maxMembers?: number;
  isPrivate?: boolean;
  requireApproval?: boolean;
}

export class GroupService {
  async createGroup(userId: string, data: CreateGroupData) {
    const group = await prisma.group.create({
      data: {
        ...data,
        memberships: {
          create: {
            userId,
            role: MemberRole.FACILITATOR,
            status: MembershipStatus.ACTIVE,
          },
        },
      },
      include: {
        memberships: {
          where: { userId },
          select: {
            role: true,
            status: true,
          },
        },
      },
    });

    return group;
  }

  async getGroup(groupId: string, userId: string) {
    // Verify membership
    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (!membership || membership.status !== MembershipStatus.ACTIVE) {
      throw new AppError('Access denied: Not a member of this group', 403);
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        _count: {
          select: {
            memberships: {
              where: { status: MembershipStatus.ACTIVE },
            },
          },
        },
      },
    });

    if (!group) {
      throw new AppError('Group not found', 404);
    }

    return {
      ...group,
      memberCount: group._count.memberships,
      userRole: membership.role,
    };
  }

  async updateGroup(groupId: string, userId: string, data: Partial<CreateGroupData>) {
    // Verify facilitator role
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
      (membership.role !== MemberRole.FACILITATOR && membership.role !== MemberRole.ADMIN)
    ) {
      throw new AppError('Access denied: Facilitator role required', 403);
    }

    const group = await prisma.group.update({
      where: { id: groupId },
      data,
    });

    return group;
  }

  async deleteGroup(groupId: string, userId: string) {
    // Verify facilitator role
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
      (membership.role !== MemberRole.FACILITATOR && membership.role !== MemberRole.ADMIN)
    ) {
      throw new AppError('Access denied: Facilitator role required', 403);
    }

    await prisma.group.update({
      where: { id: groupId },
      data: { isActive: false },
    });

    return { message: 'Group deleted successfully' };
  }

  async getGroupMembers(groupId: string, userId: string) {
    // Verify membership
    const userMembership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (!userMembership || userMembership.status !== MembershipStatus.ACTIVE) {
      throw new AppError('Access denied: Not a member of this group', 403);
    }

    const members = await prisma.membership.findMany({
      where: {
        groupId,
        status: MembershipStatus.ACTIVE,
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
      orderBy: {
        joinedAt: 'asc',
      },
    });

    return members.map((m) => ({
      ...m.user,
      role: m.role,
      joinedAt: m.joinedAt,
    }));
  }

  async inviteMember(groupId: string, inviterId: string, inviteeEmail: string) {
    // Verify inviter is facilitator
    const inviterMembership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId: inviterId,
          groupId,
        },
      },
    });

    if (
      !inviterMembership ||
      (inviterMembership.role !== MemberRole.FACILITATOR &&
        inviterMembership.role !== MemberRole.ADMIN)
    ) {
      throw new AppError('Access denied: Facilitator role required', 403);
    }

    // Check group capacity
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        _count: {
          select: {
            memberships: {
              where: { status: MembershipStatus.ACTIVE },
            },
          },
        },
      },
    });

    if (!group) {
      throw new AppError('Group not found', 404);
    }

    if (group._count.memberships >= group.maxMembers) {
      throw new AppError('Group is at maximum capacity', 400);
    }

    // Find invitee
    const invitee = await prisma.user.findUnique({
      where: { email: inviteeEmail },
    });

    if (!invitee) {
      throw new AppError('User not found', 404);
    }

    // Check if already member
    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId: invitee.id,
          groupId,
        },
      },
    });

    if (existingMembership) {
      throw new AppError('User is already a member or has pending invitation', 409);
    }

    // Create membership invitation
    const membership = await prisma.membership.create({
      data: {
        userId: invitee.id,
        groupId,
        status: MembershipStatus.PENDING,
        invitedBy: inviterId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true,
          },
        },
      },
    });

    return membership;
  }

  async acceptInvitation(groupId: string, userId: string) {
    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (!membership) {
      throw new AppError('Invitation not found', 404);
    }

    if (membership.status !== MembershipStatus.PENDING) {
      throw new AppError('Invalid invitation status', 400);
    }

    const updatedMembership = await prisma.membership.update({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
      data: {
        status: MembershipStatus.ACTIVE,
        joinedAt: new Date(),
      },
    });

    return updatedMembership;
  }

  async leaveGroup(groupId: string, userId: string) {
    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (!membership) {
      throw new AppError('Membership not found', 404);
    }

    // Check if last facilitator
    if (membership.role === MemberRole.FACILITATOR || membership.role === MemberRole.ADMIN) {
      const facilitatorCount = await prisma.membership.count({
        where: {
          groupId,
          status: MembershipStatus.ACTIVE,
          role: {
            in: [MemberRole.FACILITATOR, MemberRole.ADMIN],
          },
        },
      });

      if (facilitatorCount <= 1) {
        throw new AppError(
          'Cannot leave group: You are the last facilitator. Please assign another facilitator first.',
          400
        );
      }
    }

    await prisma.membership.update({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
      data: {
        status: MembershipStatus.LEFT,
        leftAt: new Date(),
      },
    });

    return { message: 'Successfully left the group' };
  }

  async removeMember(groupId: string, facilitatorId: string, memberId: string) {
    // Verify facilitator role
    const facilitatorMembership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId: facilitatorId,
          groupId,
        },
      },
    });

    if (
      !facilitatorMembership ||
      (facilitatorMembership.role !== MemberRole.FACILITATOR &&
        facilitatorMembership.role !== MemberRole.ADMIN)
    ) {
      throw new AppError('Access denied: Facilitator role required', 403);
    }

    // Cannot remove self
    if (facilitatorId === memberId) {
      throw new AppError('Cannot remove yourself. Use leave group instead.', 400);
    }

    await prisma.membership.update({
      where: {
        userId_groupId: {
          userId: memberId,
          groupId,
        },
      },
      data: {
        status: MembershipStatus.INACTIVE,
        leftAt: new Date(),
      },
    });

    return { message: 'Member removed successfully' };
  }
}
