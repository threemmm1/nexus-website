import Redis from 'ioredis';
import { env } from '../../config/env';
import { logger } from '../logger';

const isDev = env.NODE_ENV === 'development';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: isDev ? 1 : 3,
  // In dev, stop retrying after first failure so the server can start without Redis
  retryStrategy: isDev ? () => null : (times) => Math.min(times * 50, 2000),
  lazyConnect: true,
  enableOfflineQueue: false,
});

redis.on('connect', () => logger.info('Redis connected'));
// Silence repeated connection errors in dev — server.ts already warns once
redis.on('error', (err) => {
  if (env.NODE_ENV !== 'development') logger.error('Redis error', { err });
});

export async function connectRedis(): Promise<void> {
  // With lazyConnect the client starts in "wait". A retryStrategy reconnect can
  // already have moved it past "wait", in which case connect() would throw
  // "already connecting/connected" — only call it when genuinely idle, and
  // otherwise wait for the in-progress connection to become ready.
  if (redis.status === 'ready') return;
  if (redis.status !== 'wait') {
    await new Promise<void>((resolve, reject) => {
      redis.once('ready', resolve);
      redis.once('error', reject);
    });
    return;
  }
  await redis.connect();
}

export async function disconnectRedis(): Promise<void> {
  if (redis.status === 'end' || redis.status === 'close') return;
  await redis.quit();
}
