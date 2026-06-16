import admin from 'firebase-admin';
import { env } from '../../config/env';
import { logger } from '../logger';

let app: admin.app.App | null = null;

export function getFirebaseApp(): admin.app.App {
  if (app) return app;

  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_PRIVATE_KEY || !env.FIREBASE_CLIENT_EMAIL) {
    throw new Error('Firebase credentials not configured');
  }

  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });

  logger.info('Firebase Admin initialized');
  return app;
}

export function getMessaging(): admin.messaging.Messaging {
  return getFirebaseApp().messaging();
}
