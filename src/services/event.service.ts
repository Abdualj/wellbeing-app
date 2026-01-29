import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { MembershipStatus, ParticipationStatus } from '@prisma/client';

interface CreateEventData {
  title: string;
  description?: string;
  location?: string;
  locationDetails?: string;
  startTime: Date;
  endTime?: Date;
  maxParticipants?: number;
  isOnline?: boolean;
  meetingLink?: string;
}

export class EventService {
  async createEvent(groupId: string, userId: string, data: CreateEventData) {
    // Verify membership (preferably facilitator)
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

    const event = await prisma.event.create({
      data: {
        groupId,
        ...data,
      },
    });

    return event;
  }

  async getGroupEvents(groupId: string, userId: string, upcoming = true) {
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

    const now = new Date();

    const events = await prisma.event.findMany({
      where: {
        groupId,
        isCancelled: false,
        ...(upcoming ? { startTime: { gte: now } } : { startTime: { lt: now } }),
      },
      include: {
        _count: {
          select: {
            participants: {
              where: { status: ParticipationStatus.GOING },
            },
          },
        },
        participants: {
          where: { userId },
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        startTime: upcoming ? 'asc' : 'desc',
      },
    });

    return events.map((event) => ({
      ...event,
      goingCount: event._count.participants,
      userStatus: event.participants[0]?.status || null,
      participants: undefined,
    }));
  }

  async getEvent(eventId: string, userId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        participants: {
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
        },
      },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    // Verify membership
    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: event.groupId,
        },
      },
    });

    if (!membership || membership.status !== MembershipStatus.ACTIVE) {
      throw new AppError('Access denied: Not a member of this group', 403);
    }

    return event;
  }

  async updateEvent(eventId: string, userId: string, data: Partial<CreateEventData>) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    // Verify facilitator role
    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: event.groupId,
        },
      },
    });

    if (
      !membership ||
      (membership.role !== 'FACILITATOR' && membership.role !== 'ADMIN')
    ) {
      throw new AppError('Access denied: Facilitator role required', 403);
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data,
    });

    return updatedEvent;
  }

  async cancelEvent(eventId: string, userId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    // Verify facilitator role
    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: event.groupId,
        },
      },
    });

    if (
      !membership ||
      (membership.role !== 'FACILITATOR' && membership.role !== 'ADMIN')
    ) {
      throw new AppError('Access denied: Facilitator role required', 403);
    }

    await prisma.event.update({
      where: { id: eventId },
      data: {
        isCancelled: true,
      },
    });

    return { message: 'Event cancelled successfully' };
  }

  async respondToEvent(eventId: string, userId: string, status: ParticipationStatus) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            participants: {
              where: { status: ParticipationStatus.GOING },
            },
          },
        },
      },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    // Verify membership
    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: event.groupId,
        },
      },
    });

    if (!membership || membership.status !== MembershipStatus.ACTIVE) {
      throw new AppError('Access denied: Not a member of this group', 403);
    }

    // Check capacity if responding "GOING"
    if (
      status === ParticipationStatus.GOING &&
      event.maxParticipants &&
      event._count.participants >= event.maxParticipants
    ) {
      throw new AppError('Event is at maximum capacity', 400);
    }

    const participant = await prisma.eventParticipant.upsert({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
      update: {
        status,
        respondedAt: new Date(),
      },
      create: {
        eventId,
        userId,
        status,
      },
    });

    return participant;
  }

  async getEventParticipants(eventId: string, userId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    // Verify membership
    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: event.groupId,
        },
      },
    });

    if (!membership || membership.status !== MembershipStatus.ACTIVE) {
      throw new AppError('Access denied: Not a member of this group', 403);
    }

    const participants = await prisma.eventParticipant.findMany({
      where: { eventId },
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
        respondedAt: 'asc',
      },
    });

    return participants.map((p) => ({
      ...p.user,
      status: p.status,
      respondedAt: p.respondedAt,
    }));
  }
}
