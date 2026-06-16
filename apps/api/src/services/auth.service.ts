import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { randomInt } from 'crypto';
import { prisma } from '../lib/prisma/client';
import { redis } from '../lib/redis/client';
import { signAccessToken, issueRefreshToken, revokeRefreshToken } from './token.service';
import { AppError } from '../middleware/error.middleware';
import { REDIS_KEYS } from '../config/constants';
import { env } from '../config/env';
import type { AuthTokens } from '@vesioh/types';

const EMAIL_VERIFY_TTL = 60 * 60 * 24;
const PHONE_VERIFY_TTL = 60 * 10;

export async function registerWithEmail(data: {
  email: string;
  username: string;
  displayName: string;
  password: string;
}): Promise<{ userId: string; verificationToken: string }> {
  const [existingEmail, existingUsername] = await Promise.all([
    prisma.user.findUnique({ where: { email: data.email }, select: { id: true } }),
    prisma.user.findUnique({ where: { username: data.username }, select: { id: true } }),
  ]);

  if (existingEmail) throw new AppError(409, 'EMAIL_TAKEN', 'Email is already registered');
  if (existingUsername) throw new AppError(409, 'USERNAME_TAKEN', 'Username is already taken');

  const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: data.email,
        username: data.username.toLowerCase(),
        displayName: data.displayName,
        passwordHash,
      },
    });

    await tx.wallet.create({ data: { userId: newUser.id } });
    await tx.gamingProfile.create({ data: { userId: newUser.id } });
    await tx.notificationPreference.create({ data: { userId: newUser.id } });

    return newUser;
  });

  const verificationToken = uuidv4();
  await redis.set(
    REDIS_KEYS.emailVerify(verificationToken),
    user.id,
    'EX',
    EMAIL_VERIFY_TTL,
  );

  return { userId: user.id, verificationToken };
}

export async function verifyEmail(token: string): Promise<void> {
  const userId = await redis.get(REDIS_KEYS.emailVerify(token));
  if (!userId) throw new AppError(400, 'INVALID_TOKEN', 'Verification link is invalid or expired');

  await prisma.user.update({
    where: { id: userId },
    data: { isEmailVerified: true, status: 'active' },
  });

  await redis.del(REDIS_KEYS.emailVerify(token));
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<AuthTokens & { userId: string }> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      passwordHash: true,
      status: true,
      role: true,
      isEmailVerified: true,
    },
  });

  if (!user) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

  if (!user.isEmailVerified) {
    throw new AppError(403, 'EMAIL_NOT_VERIFIED', 'Please verify your email before logging in');
  }

  if (user.status === 'suspended') {
    throw new AppError(403, 'ACCOUNT_SUSPENDED', 'Your account has been suspended');
  }

  if (user.status === 'banned') {
    throw new AppError(403, 'ACCOUNT_BANNED', 'Your account has been banned');
  }

  const [accessToken, refreshToken] = await Promise.all([
    Promise.resolve(signAccessToken({ userId: user.id, role: user.role })),
    issueRefreshToken(user.id),
  ]);

  void prisma.user.update({
    where: { id: user.id },
    data: { lastActiveAt: new Date() },
  });

  return {
    userId: user.id,
    accessToken,
    refreshToken,
    expiresIn: 15 * 60,
  };
}

export async function refreshSession(
  refreshToken: string,
): Promise<AuthTokens> {
  const { verifyRefreshToken } = await import('./token.service'); // lazy to avoid circular dep
  const result = await verifyRefreshToken(refreshToken);
  if (!result) throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Session expired, please log in again');

  const user = await prisma.user.findUnique({
    where: { id: result.userId },
    select: { id: true, role: true, status: true },
  });

  if (!user || user.status === 'banned' || user.status === 'suspended') {
    throw new AppError(401, 'ACCOUNT_INACTIVE', 'Account is not active');
  }

  const [newAccessToken, newRefreshToken] = await Promise.all([
    Promise.resolve(signAccessToken({ userId: user.id, role: user.role })),
    issueRefreshToken(user.id),
  ]);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn: 15 * 60,
  };
}

export async function logout(userId: string): Promise<void> {
  await revokeRefreshToken(userId);
}

export async function sendPhoneVerification(userId: string, phone: string): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { phone }, select: { id: true } });
  if (existing && existing.id !== userId) {
    throw new AppError(409, 'PHONE_TAKEN', 'Phone number is already registered');
  }

  const otp = randomInt(100000, 1000000).toString();
  await redis.set(REDIS_KEYS.phoneVerify(userId), `${otp}:${phone}`, 'EX', PHONE_VERIFY_TTL);

  const twilio = (await import('twilio')).default;
  const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body: `Your Vesioh verification code is: ${otp}`,
    from: env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
}

export async function verifyPhone(userId: string, otp: string): Promise<void> {
  const stored = await redis.get(REDIS_KEYS.phoneVerify(userId));
  if (!stored) throw new AppError(400, 'INVALID_OTP', 'OTP is invalid or expired');

  const [storedOtp, phone] = stored.split(':');
  if (storedOtp !== otp) throw new AppError(400, 'INVALID_OTP', 'Incorrect OTP');

  await prisma.user.update({
    where: { id: userId },
    data: { phone: phone ?? null, isPhoneVerified: true },
  });

  await redis.del(REDIS_KEYS.phoneVerify(userId));
}
