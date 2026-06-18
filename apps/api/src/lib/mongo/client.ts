import mongoose from 'mongoose';
import { env } from '../../config/env';
import { logger } from '../logger';

export async function connectMongo(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI, { dbName: 'vesioh' });
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
