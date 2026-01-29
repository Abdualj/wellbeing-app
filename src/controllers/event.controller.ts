import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { EventService } from '../services/event.service';
import { asyncHandler } from '../middleware/errorHandler';
import { ParticipationStatus } from '@prisma/client';

const eventService = new EventService();

export const createEvent = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { groupId } = req.params;
    
    // Convert string dates to Date objects
    const eventData = {
      ...req.body,
      startTime: new Date(req.body.startTime),
      endTime: req.body.endTime ? new Date(req.body.endTime) : undefined,
    };
    
    const event = await eventService.createEvent(groupId, userId, eventData);

    res.status(201).json({
      status: 'success',
      data: event,
    });
  }
);

export const getGroupEvents = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { groupId } = req.params;
    const upcoming = req.query.upcoming !== 'false';

    const events = await eventService.getGroupEvents(groupId, userId, upcoming);

    res.status(200).json({
      status: 'success',
      data: events,
    });
  }
);

export const getEvent = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { eventId } = req.params;
    const event = await eventService.getEvent(eventId, userId);

    res.status(200).json({
      status: 'success',
      data: event,
    });
  }
);

export const updateEvent = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { eventId } = req.params;
    
    const eventData: any = { ...req.body };
    if (eventData.startTime) {
      eventData.startTime = new Date(eventData.startTime);
    }
    if (eventData.endTime) {
      eventData.endTime = new Date(eventData.endTime);
    }
    
    const event = await eventService.updateEvent(eventId, userId, eventData);

    res.status(200).json({
      status: 'success',
      data: event,
    });
  }
);

export const cancelEvent = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { eventId } = req.params;
    const result = await eventService.cancelEvent(eventId, userId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

export const respondToEvent = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { eventId } = req.params;
    const { status } = req.body;
    
    const participant = await eventService.respondToEvent(
      eventId,
      userId,
      status as ParticipationStatus
    );

    res.status(200).json({
      status: 'success',
      data: participant,
    });
  }
);

export const getEventParticipants = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { eventId } = req.params;
    const participants = await eventService.getEventParticipants(eventId, userId);

    res.status(200).json({
      status: 'success',
      data: participants,
    });
  }
);
