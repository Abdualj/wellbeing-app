import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { NotificationLevel } from '@prisma/client';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  consentGiven: boolean;
  dataProcessingConsent: boolean;
}

interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterData) {
    // Check GDPR consent
    if (!data.consentGiven || !data.dataProcessingConsent) {
      throw new AppError('User consent required for registration', 400);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('User already exists with this email', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName || `${data.firstName} ${data.lastName}`,
        consentGiven: data.consentGiven,
        consentDate: new Date(),
        dataProcessingConsent: data.dataProcessingConsent,
        notificationPreference: NotificationLevel.MINIMAL,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginData) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is inactive', 403);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshTokenValue: string) {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenValue },
      include: { user: true },
    });

    if (!refreshToken || refreshToken.isRevoked) {
      throw new AppError('Invalid refresh token', 401);
    }

    if (refreshToken.expiresAt < new Date()) {
      throw new AppError('Refresh token expired', 401);
    }

    if (!refreshToken.user.isActive) {
      throw new AppError('User account is inactive', 403);
    }

    const accessToken = this.generateAccessToken(
      refreshToken.user.id,
      refreshToken.user.email
    );

    return { accessToken };
  }

  async logout(refreshTokenValue: string) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshTokenValue },
      data: { isRevoked: true },
    });
  }

  private generateAccessToken(userId: string, email: string): string {
    return jwt.sign(
      { id: userId, email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = jwt.sign(
      { id: userId },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return token;
  }
}
