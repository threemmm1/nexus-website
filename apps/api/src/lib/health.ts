import { prisma } from './prisma/client';
import { redis } from './redis/client';
import { isMongoConnected } from './mongo/client';

export type DependencyStatus = 'up' | 'down';

export interface HealthReport {
  status: 'ok' | 'degraded';
  dependencies: {
    postgres: DependencyStatus;
    redis: DependencyStatus;
    mongo: DependencyStatus;
  };
}

async function pingPostgres(): Promise<DependencyStatus> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'up';
  } catch {
    return 'down';
  }
}

async function pingRedis(): Promise<DependencyStatus> {
  try {
    if (redis.status !== 'ready') return 'down';
    const pong = await redis.ping();
    return pong === 'PONG' ? 'up' : 'down';
  } catch {
    return 'down';
  }
}

export async function checkHealth(): Promise<HealthReport> {
  const [postgres, redisStatus] = await Promise.all([pingPostgres(), pingRedis()]);
  const mongo: DependencyStatus = isMongoConnected() ? 'up' : 'down';

  const allUp = postgres === 'up' && redisStatus === 'up' && mongo === 'up';

  return {
    status: allUp ? 'ok' : 'degraded',
    dependencies: { postgres, redis: redisStatus, mongo },
  };
}
