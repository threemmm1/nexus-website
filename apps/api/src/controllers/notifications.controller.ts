import type { Request, Response } from 'express';
import { successResponse } from '@vesioh/utils';
import * as notifService from '../services/notification.service';
import { PAGINATION } from '../config/constants';

export async function listNotifications(req: Request, res: Response): Promise<void> {
  const page = Math.max(1, parseInt((req.query['page'] as string) ?? '1', 10));
  const limit = Math.min(
    parseInt((req.query['limit'] as string) ?? String(PAGINATION.DEFAULT_LIMIT), 10),
    PAGINATION.MAX_LIMIT,
  );
  const result = await notifService.getNotifications(req.user!.userId, page, limit);
  res.json(successResponse(result.notifications, result.meta));
}

export async function getUnreadCount(req: Request, res: Response): Promise<void> {
  const count = await notifService.getUnreadCount(req.user!.userId);
  res.json(successResponse({ count }));
}

export async function markOneRead(req: Request, res: Response): Promise<void> {
  const { notificationId } = req.params as { notificationId: string };
  await notifService.markAsRead(req.user!.userId, notificationId);
  res.json(successResponse(null));
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  await notifService.markAllAsRead(req.user!.userId);
  res.json(successResponse(null));
}

export async function deleteOne(req: Request, res: Response): Promise<void> {
  const { notificationId } = req.params as { notificationId: string };
  await notifService.deleteNotification(req.user!.userId, notificationId);
  res.status(204).send();
}

export async function getPreferences(req: Request, res: Response): Promise<void> {
  const prefs = await notifService.getPreferences(req.user!.userId);
  res.json(successResponse(prefs));
}

export async function updatePreferences(req: Request, res: Response): Promise<void> {
  const prefs = await notifService.updatePreferences(req.user!.userId, req.body as Parameters<typeof notifService.updatePreferences>[1]);
  res.json(successResponse(prefs));
}

export async function registerFcmToken(req: Request, res: Response): Promise<void> {
  const { token } = req.body as { token: string };
  await notifService.registerFcmToken(req.user!.userId, token);
  res.json(successResponse(null));
}

export async function removeFcmToken(req: Request, res: Response): Promise<void> {
  await notifService.removeFcmToken(req.user!.userId);
  res.json(successResponse(null));
}
