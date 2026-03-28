import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { GroupService } from '../services/group.service';
import { asyncHandler } from '../middleware/errorHandler';

const groupService = new GroupService();

export const getAllGroups = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Use real userId when authentication is implemented
    const userId = req.user!.id;
    const { search, category, activity, myGroups } = req.query;
    
    const groups = await groupService.getAllGroups(userId, {
      search: search as string,
      category: category as string,
      activity: activity as string,
      myGroups: myGroups === 'true',
    });

    res.status(200).json({
      status: 'success',
      data: groups,
    });
  }
);

export const createGroup = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Use real userId when authentication is implemented
    const userId = req.user!.id;
    
    // Map frontend fields to backend schema
    const groupData = {
      name: req.body.name,
      description: req.body.description,
      purpose: req.body.activity || req.body.purpose, // Map activity to purpose
      avatar: req.body.imageUrl || req.body.avatar, // Map imageUrl to avatar
      maxMembers: req.body.capacity || req.body.maxMembers || 12, // Map capacity to maxMembers
      isPrivate: req.body.privacy === 'private', // Map privacy to isPrivate
      requireApproval: req.body.requireApproval !== false, // Default to true
    };
    
    const group = await groupService.createGroup(userId, groupData);

    res.status(201).json({
      status: 'success',
      data: group,
    });
  }
);

export const getGroup = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Use real userId when authentication is implemented
    const userId = req.user!.id;
    const { groupId } = req.params;
    const group = await groupService.getGroup(groupId, userId);

    res.status(200).json({
      status: 'success',
      data: group,
    });
  }
);

export const joinGroup = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Use real userId when authentication is implemented
    const userId = req.user!.id;
    const { groupId } = req.params;
    const result = await groupService.joinGroup(groupId, userId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

export const updateGroup = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: Use real userId when authentication is implemented
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
    // TODO: Use real userId when authentication is implemented
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
    // TODO: Use real userId when authentication is implemented
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
    // TODO: Use real userId when authentication is implemented
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
    // TODO: Use real userId when authentication is implemented
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
    // TODO: Use real userId when authentication is implemented
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
    // TODO: Use real userId when authentication is implemented
    const userId = req.user!.id;
    const { groupId, memberId } = req.params;
    const result = await groupService.removeMember(groupId, userId, memberId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);
