import { createServer, type Server } from 'http';
import { app } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma/client';
import { connectRedis, disconnectRedis } from './lib/redis/client';
import { connectMongo, disconnectMongo } from './lib/mongo/client';
import { initSocket, closeSocket } from './lib/socket';

const SHUTDOWN_TIMEOUT_MS = 10_000;

let httpServer: Server | undefined;
let shuttingDown = false;

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

  httpServer = createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    logger.info(`API server running on port ${env.PORT} [${env.NODE_ENV}]`);
    if (isDev) {
      logger.info(`Swagger UI → http://localhost:${env.PORT}/docs`);
      logger.info(`OpenAPI JSON → http://localhost:${env.PORT}/docs.json`);
    }
  });
}

async function closeResources(): Promise<void> {
  await closeSocket();
  await Promise.allSettled([prisma.$disconnect(), disconnectRedis(), disconnectMongo()]);
}

async function shutdown(signal: string, exitCode = 0): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`${signal} received — shutting down gracefully`);

  // Force-exit if cleanup hangs so orchestrators don't wait indefinitely.
  const forceExit = setTimeout(() => {
    logger.error('Graceful shutdown timed out — forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();

  try {
    if (httpServer) {
      await new Promise<void>((resolve, reject) => {
        httpServer!.close((err) => (err ? reject(err) : resolve()));
      });
    }
    await closeResources();
    clearTimeout(forceExit);
    process.exit(exitCode);
  } catch (err) {
    logger.error('Error during shutdown', { err });
    process.exit(1);
  }
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

// A rejected promise or thrown error with no handler leaves the process in an
// undefined state. Log it and shut down cleanly rather than running on corrupted state.
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason });
  void shutdown('unhandledRejection', 1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { err });
  void shutdown('uncaughtException', 1);
});

void bootstrap();
