import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { GroupService } from '../services/group.service';
import { asyncHandler } from '../middleware/errorHandler';

const groupService = new GroupService();

export const createGroup = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const group = await groupService.createGroup(userId, req.body);

    res.status(201).json({
      status: 'success',
      data: group,
    });
  }
);

export const getGroup = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { groupId } = req.params;
    const group = await groupService.getGroup(groupId, userId);

    res.status(200).json({
      status: 'success',
      data: group,
    });
  }
);

export const updateGroup = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { groupId } = req.params;
    const group = await groupService.updateGroup(groupId, userId, req.body);

    res.status(200).json({
      status: 'success',
      data: group,
    });
  }
);

export const deleteGroup = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { groupId } = req.params;
    const result = await groupService.deleteGroup(groupId, userId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

export const getGroupMembers = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { groupId } = req.params;
    const members = await groupService.getGroupMembers(groupId, userId);

    res.status(200).json({
      status: 'success',
      data: members,
    });
  }
);

export const inviteMember = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { groupId } = req.params;
    const { email } = req.body;
    const membership = await groupService.inviteMember(groupId, userId, email);

    res.status(201).json({
      status: 'success',
      data: membership,
    });
  }
);

export const acceptInvitation = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { groupId } = req.params;
    const membership = await groupService.acceptInvitation(groupId, userId);

    res.status(200).json({
      status: 'success',
      data: membership,
    });
  }
);

export const leaveGroup = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { groupId } = req.params;
    const result = await groupService.leaveGroup(groupId, userId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

export const removeMember = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { groupId, memberId } = req.params;
    const result = await groupService.removeMember(groupId, userId, memberId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);
