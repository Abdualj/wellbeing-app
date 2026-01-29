import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../middleware/errorHandler';

const authService = new AuthService();

export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await authService.register(req.body);

    res.status(201).json({
      status: 'success',
      data: result,
    });
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await authService.login(req.body);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

export const refreshToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  }
);
