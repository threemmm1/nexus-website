import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { redis } from '../lib/redis/client';
import { REDIS_KEYS } from '../config/constants';
import type { UserRole } from '@vesioh/types';

interface AccessTokenPayload {
  userId: string;
  role: UserRole;
}

interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  // jwt types use a broad overload set — cast to bypass exactOptionalPropertyTypes friction
  return (jwt.sign as (p: object, s: string, o: object) => string)(
    payload,
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN },
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  } catch {
    return null;
  }
}

export async function issueRefreshToken(userId: string): Promise<string> {
  const tokenId = uuidv4();
  const token = (jwt.sign as (p: object, s: string, o: object) => string)(
    { userId, tokenId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN },
  );

  // Store tokenId in Redis — allows server-side revocation
  const ttlSeconds = 30 * 24 * 60 * 60; // 30 days
  await redis.set(REDIS_KEYS.refreshToken(userId), tokenId, 'EX', ttlSeconds);

  return token;
}

export async function verifyRefreshToken(
  token: string,
): Promise<{ userId: string } | null> {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
    const storedTokenId = await redis.get(REDIS_KEYS.refreshToken(payload.userId));

    if (storedTokenId !== payload.tokenId) return null;

    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export async function revokeRefreshToken(userId: string): Promise<void> {
  await redis.del(REDIS_KEYS.refreshToken(userId));
}
