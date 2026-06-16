export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const UPLOAD = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_VIDEO_SIZE: 500 * 1024 * 1024, // 500MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/webm'],
};

export const RATE_LIMITS = {
  AUTH: { windowMs: 15 * 60 * 1000, max: 10 },
  API: { windowMs: 60 * 1000, max: 300 },
  UPLOAD: { windowMs: 60 * 1000, max: 20 },
  GIFTS: { windowMs: 60 * 1000, max: 30 },
};

export const WALLET = {
  MIN_WITHDRAWAL_USD: 50,
  PLATFORM_FEE_PERCENT: 20,
  GIFT_TO_USD_RATE: 0.01,
};

export const XP = {
  POST: 10,
  STREAM_MINUTE: 2,
  DAILY_LOGIN: 5,
  FOLLOW_RECEIVED: 3,
  GIFT_RECEIVED: 15,
  TOURNAMENT_WIN: 100,
};

export const REDIS_KEYS = {
  refreshToken: (userId: string) => `refresh_token:${userId}`,
  emailVerify: (token: string) => `email_verify:${token}`,
  phoneVerify: (userId: string) => `phone_verify:${userId}`,
  streamViewers: (streamId: string) => `stream:viewers:${streamId}`,
  feedCache: (userId: string) => `feed:${userId}`,
  rateLimitAuth: (ip: string) => `rate:auth:${ip}`,
  fcmToken: (userId: string) => `fcm:token:${userId}`,
  unreadCount: (userId: string) => `notif:unread:${userId}`,
};
