import rateLimit, { type Options, type Store } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { RATE_LIMITS } from '../config/constants';
import { errorResponse } from '@vesioh/utils';
import { env } from '../config/env';
import { redis } from '../lib/redis/client';

// A Redis-backed store keeps rate limits consistent across every API instance
// behind the load balancer. In development Redis may be absent, so we fall back
// to the library's in-memory store.
function buildStore(prefix: string): Store | undefined {
  if (env.NODE_ENV === 'development') return undefined;
  return new RedisStore({
    prefix,
    sendCommand: (command: string, ...args: string[]) =>
      redis.call(command, ...args) as Promise<never>,
  });
}

function createLimiter(
  config: { windowMs: number; max: number },
  prefix: string,
  message: string,
): ReturnType<typeof rateLimit> {
  const options: Partial<Options> = {
    ...config,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json(errorResponse('RATE_LIMITED', message));
    },
  };

  const store = buildStore(prefix);
  if (store) options.store = store;

  return rateLimit(options);
}

export const authRateLimiter = createLimiter(
  RATE_LIMITS.AUTH,
  'rl:auth:',
  'Too many requests, please try again later',
);

export const apiRateLimiter = createLimiter(
  RATE_LIMITS.API,
  'rl:api:',
  'Too many requests, please try again later',
);

export const uploadRateLimiter = createLimiter(
  RATE_LIMITS.UPLOAD,
  'rl:upload:',
  'Upload limit exceeded',
);
