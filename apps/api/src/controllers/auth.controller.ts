import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { prisma } from '../lib/prisma/client';
import { successResponse } from '@vesioh/utils';

export async function register(req: Request, res: Response): Promise<void> {
  const { userId, verificationToken } = await authService.registerWithEmail(req.body);

  const isDev = process.env['NODE_ENV'] === 'development';

  res.status(201).json(
    successResponse({
      userId,
      message: 'Account created. Please check your email to verify your account.',
      ...(isDev && { verificationToken }),
    }),
  );
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const { token } = req.params as { token: string };
  await authService.verifyEmail(token);
  res.json(successResponse({ message: 'Email verified successfully' }));
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };
  const tokens = await authService.loginWithEmail(email, password);
  res.json(successResponse(tokens));
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as { refreshToken: string };
  const tokens = await authService.refreshSession(refreshToken);
  res.json(successResponse(tokens));
}

export async function logout(req: Request, res: Response): Promise<void> {
  await authService.logout(req.user!.userId);
  res.json(successResponse({ message: 'Logged out successfully' }));
}

export async function sendPhoneOtp(req: Request, res: Response): Promise<void> {
  const { phone } = req.body as { phone: string };
  await authService.sendPhoneVerification(req.user!.userId, phone);
  res.json(successResponse({ message: 'OTP sent to your phone number' }));
}

export async function verifyPhoneOtp(req: Request, res: Response): Promise<void> {
  const { otp } = req.body as { otp: string };
  await authService.verifyPhone(req.user!.userId, otp);
  res.json(successResponse({ message: 'Phone number verified successfully' }));
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bannerUrl: true,
      bio: true,
      role: true,
      status: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      isCreator: true,
      isSeller: true,
      followersCount: true,
      followingCount: true,
      postsCount: true,
      createdAt: true,
    },
  });

  res.json(successResponse(user));
}
