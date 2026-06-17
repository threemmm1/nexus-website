import { prisma } from '../lib/prisma/client';
import { redis } from '../lib/redis/client';
import { getMessaging } from '../lib/firebase/admin';
import { getIO } from '../lib/socket';
import { AppError } from '../middleware/error.middleware';
import { buildPaginationMeta, parsePagination } from '@vesioh/utils';
import { REDIS_KEYS, PAGINATION } from '../config/constants';
import type { NotificationType } from '@prisma/client';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  imageUrl?: string;
  referenceId?: string;
}

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: input.userId },
  });

  if (prefs && !isTypeEnabled(input.type, prefs)) return;

  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
      ...(input.referenceId !== undefined && { referenceId: input.referenceId }),
    },
  });

  await redis.incr(REDIS_KEYS.unreadCount(input.userId));

  const unreadCount = await getUnreadCount(input.userId);

  try {
    getIO().to(`user:${input.userId}`).emit('notification', { notification, unreadCount });
  } catch {
    // getIO() throws if Socket.io was never initialized — safe to skip in tests
  }

  await sendPushNotification(input.userId, input.title, input.body, input.referenceId);
}

export async function getNotifications(userId: string, page: number, limit: number) {
  const { limit: safeLimit, offset } = parsePagination({ page, limit }, PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

  const [total, notifications] = await Promise.all([
    prisma.notification.count({ where: { userId } }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
      skip: offset,
    }),
  ]);

  return { notifications, meta: buildPaginationMeta(total, page, safeLimit) };
}

export async function markAsRead(userId: string, notificationId: string): Promise<void> {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { id: true, userId: true, isRead: true },
  });

  if (!notification) throw new AppError(404, 'NOT_FOUND', 'Notification not found');
  if (notification.userId !== userId) throw new AppError(403, 'FORBIDDEN', 'Access denied');
  if (notification.isRead) return;

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  await redis.decr(REDIS_KEYS.unreadCount(userId));
}

export async function markAllAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  await redis.set(REDIS_KEYS.unreadCount(userId), 0);
}

export async function deleteNotification(userId: string, notificationId: string): Promise<void> {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { id: true, userId: true, isRead: true },
  });

  if (!notification) throw new AppError(404, 'NOT_FOUND', 'Notification not found');
  if (notification.userId !== userId) throw new AppError(403, 'FORBIDDEN', 'Access denied');

  await prisma.notification.delete({ where: { id: notificationId } });

  if (!notification.isRead) {
    await redis.decr(REDIS_KEYS.unreadCount(userId));
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  const cached = await redis.get(REDIS_KEYS.unreadCount(userId));
  if (cached !== null) return parseInt(cached, 10);

  const count = await prisma.notification.count({ where: { userId, isRead: false } });
  await redis.set(REDIS_KEYS.unreadCount(userId), count);
  return count;
}

export async function getPreferences(userId: string) {
  const prefs = await prisma.notificationPreference.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
  return prefs;
}

export async function updatePreferences(
  userId: string,
  data: Partial<{
    likes: boolean;
    comments: boolean;
    follows: boolean;
    mentions: boolean;
    gifts: boolean;
    streamLive: boolean;
    dms: boolean;
    system: boolean;
  }>,
) {
  const prefs = await prisma.notificationPreference.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
  return prefs;
}

export async function registerFcmToken(userId: string, token: string): Promise<void> {
  await redis.set(REDIS_KEYS.fcmToken(userId), token);
}

export async function removeFcmToken(userId: string): Promise<void> {
  await redis.del(REDIS_KEYS.fcmToken(userId));
}

async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  referenceId?: string,
): Promise<void> {
  const token = await redis.get(REDIS_KEYS.fcmToken(userId));
  if (!token) return;

  try {
    const messaging = getMessaging();
    await messaging.send({
      token,
      notification: { title, body },
      data: referenceId ? { referenceId } : {},
      apns: {
        payload: { aps: { badge: await getUnreadCount(userId), sound: 'default' } },
      },
      android: {
        notification: { sound: 'default', clickAction: 'FLUTTER_NOTIFICATION_CLICK' },
      },
    });
  } catch (err: unknown) {
    if (isInvalidTokenError(err)) {
      await redis.del(REDIS_KEYS.fcmToken(userId));
    }
  }
}

function isInvalidTokenError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const code = (err as Record<string, unknown>)['code'];
  return code === 'messaging/registration-token-not-registered' ||
    code === 'messaging/invalid-registration-token';
}

function isTypeEnabled(
  type: NotificationType,
  prefs: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    mentions: boolean;
    gifts: boolean;
    streamLive: boolean;
    dms: boolean;
    system: boolean;
  },
): boolean {
  const map: Record<NotificationType, boolean> = {
    like: prefs.likes,
    comment: prefs.comments,
    follow: prefs.follows,
    mention: prefs.mentions,
    gift: prefs.gifts,
    stream_live: prefs.streamLive,
    dm: prefs.dms,
    system: prefs.system,
    tournament: prefs.system,
  };
  return map[type] ?? true;
}
