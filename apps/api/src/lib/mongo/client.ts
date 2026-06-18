import mongoose from 'mongoose';
import { env } from '../../config/env';
import { logger } from '../logger';

export async function connectMongo(): Promise<void> {
  // Default serverSelectionTimeoutMS is 30s, which makes startup hang when Mongo
  // is unreachable. Fail fast (5s) so the dev warn-and-continue path is quick and
  // production aborts startup promptly instead of stalling the readiness probe.
  await mongoose.connect(env.MONGODB_URI, {
    dbName: 'vesioh',
    serverSelectionTimeoutMS: 5000,
  });
  logger.info('MongoDB connected');
}

export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
}

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

mongoose.connection.on('error', (err) => logger.error('MongoDB error', { err }));
mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
