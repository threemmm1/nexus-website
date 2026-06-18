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

// Converts a JWT duration string ("15m", "30d", "3600") into seconds so the
// client and the token agree on a single source of truth for expiry.
export function durationToSeconds(value: string): number {
  const match = /^(\d+)\s*(s|m|h|d)?$/.exec(value.trim());
  if (!match) return 0;
  const amount = Number(match[1]);
  const unit = match[2] ?? 's';
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return amount * (multipliers[unit] ?? 1);
}

export const accessTokenTtlSeconds = durationToSeconds(env.JWT_ACCESS_EXPIRES_IN);
export const refreshTokenTtlSeconds = durationToSeconds(env.JWT_REFRESH_EXPIRES_IN);

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

  // Store tokenId in Redis — allows server-side revocation. TTL mirrors the
  // signed token's own expiry so Redis and the JWT invalidate together.
  await redis.set(REDIS_KEYS.refreshToken(userId), tokenId, 'EX', refreshTokenTtlSeconds);

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
