import { Router } from 'express';
import { z } from 'zod';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rate-limiter.middleware';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  displayName: z.string().min(1, 'Display name is required').max(50),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const phoneSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/, 'Phone must be in E.164 format'),
});

const otpSchema = z.object({
  otp: z.string().length(6).regex(/^\d+$/, 'OTP must be 6 digits'),
});

authRouter.post('/register', authRateLimiter, validate(registerSchema), authController.register);
authRouter.get('/verify-email/:token', authController.verifyEmail);
authRouter.post('/login', authRateLimiter, validate(loginSchema), authController.login);
authRouter.post('/refresh', validate(refreshSchema), authController.refresh);
authRouter.post('/logout', authenticate, authController.logout);
authRouter.post('/phone/send-otp', authenticate, validate(phoneSchema), authController.sendPhoneOtp);
authRouter.post('/phone/verify', authenticate, validate(otpSchema), authController.verifyPhoneOtp);
authRouter.get('/me', authenticate, authController.me);
