import { initializeApp, cert, type App } from 'firebase-admin/app';
import { getMessaging as getFirebaseMessaging, type Messaging } from 'firebase-admin/messaging';
import { env } from '../../config/env';
import { logger } from '../logger';

let app: App | null = null;

export function getFirebaseApp(): App {
  if (app) return app;

  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_PRIVATE_KEY || !env.FIREBASE_CLIENT_EMAIL) {
    throw new Error('Firebase credentials not configured');
  }

  app = initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });

  logger.info('Firebase Admin initialized');
  return app;
}

export function getMessaging(): Messaging {
  return getFirebaseMessaging(getFirebaseApp());
}
