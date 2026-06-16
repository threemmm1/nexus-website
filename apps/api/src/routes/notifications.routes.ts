import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import * as ctrl from '../controllers/notifications.controller';

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

const prefsSchema = z.object({
  likes: z.boolean().optional(),
  comments: z.boolean().optional(),
  follows: z.boolean().optional(),
  mentions: z.boolean().optional(),
  gifts: z.boolean().optional(),
  streamLive: z.boolean().optional(),
  dms: z.boolean().optional(),
  system: z.boolean().optional(),
});

const fcmTokenSchema = z.object({
  token: z.string().min(1),
});

notificationsRouter.get('/', ctrl.listNotifications);
notificationsRouter.get('/unread-count', ctrl.getUnreadCount);
notificationsRouter.patch('/read-all', ctrl.markAllRead);
notificationsRouter.patch('/:notificationId/read', ctrl.markOneRead);
notificationsRouter.delete('/:notificationId', ctrl.deleteOne);
notificationsRouter.get('/preferences', ctrl.getPreferences);
notificationsRouter.patch('/preferences', validate(prefsSchema), ctrl.updatePreferences);
notificationsRouter.post('/fcm-token', validate(fcmTokenSchema), ctrl.registerFcmToken);
notificationsRouter.delete('/fcm-token', ctrl.removeFcmToken);
