import { createServer } from 'http';
import { app } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma/client';
import { connectRedis } from './lib/redis/client';
import { connectMongo } from './lib/mongo/client';
import { initSocket } from './lib/socket';

async function bootstrap(): Promise<void> {
  const isDev = env.NODE_ENV === 'development';

  // In production all services must be up before accepting traffic.
  // In development, warn and continue so Swagger/health are accessible without Docker.
  try {
    await connectRedis();
  } catch (err) {
    if (!isDev) throw err;
    logger.warn('Redis unavailable — some features will not work (run: docker compose up -d)');
  }

  try {
    await connectMongo();
  } catch (err) {
    if (!isDev) throw err;
    logger.warn('MongoDB unavailable — messaging/feed features will not work');
  }

  try {
    await prisma.$connect();
    logger.info('PostgreSQL connected');
  } catch (err) {
    if (!isDev) throw err;
    logger.warn('PostgreSQL unavailable — DB features will not work (run: docker compose up -d)');
  }

  const httpServer = createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    logger.info(`API server running on port ${env.PORT} [${env.NODE_ENV}]`);
    if (isDev) {
      logger.info(`Swagger UI → http://localhost:${env.PORT}/docs`);
      logger.info(`OpenAPI JSON → http://localhost:${env.PORT}/docs.json`);
    }
  });
}

async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received — shutting down gracefully`);
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

void bootstrap();
