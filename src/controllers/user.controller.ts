import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserService } from '../services/user.service';
import { asyncHandler } from '../middleware/errorHandler';

const userService = new UserService();

export const getProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const user = await userService.getUserProfile(userId);

    res.status(200).json({
      status: 'success',
      data: user,
    });
  }
);

export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const user = await userService.updateUserProfile(userId, req.body);

    res.status(200).json({
      status: 'success',
      data: user,
    });
  }
);

export const updateConsent = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const user = await userService.updateConsent(userId, req.body);

    res.status(200).json({
      status: 'success',
      data: user,
    });
  }
);

export const requestDataDeletion = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const result = await userService.requestDataDeletion(userId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

export const exportData = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const data = await userService.exportUserData(userId);

    res.status(200).json({
      status: 'success',
      data,
    });
  }
);

export const getUserGroups = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const groups = await userService.getUserGroups(userId);

    res.status(200).json({
      status: 'success',
      data: groups,
    });
  }
);
