import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),

  // Database
  DATABASE_URL: z.string().url(),
  MONGODB_URI: z.string().url(),
  REDIS_URL: z.string().url(),

  // Auth
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  BCRYPT_ROUNDS: z.coerce.number().default(12),

  // AWS — optional in dev (media upload routes will fail gracefully without these)
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().default(''),
  AWS_SECRET_ACCESS_KEY: z.string().default(''),
  AWS_S3_BUCKET: z.string().default(''),
  AWS_CLOUDFRONT_URL: z.string().url().default('https://localhost'),

  // Stripe — optional in dev (wallet/payment routes will fail gracefully)
  STRIPE_SECRET_KEY: z.string().default('sk_test_dev_placeholder'),
  STRIPE_WEBHOOK_SECRET: z.string().default('whsec_dev_placeholder'),

  // Email — optional in dev
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  EMAIL_FROM: z.string().email().default('noreply@vesioh.com'),

  // Twilio — optional in dev (phone verify routes will fail gracefully)
  TWILIO_ACCOUNT_SID: z.string().default(''),
  TWILIO_AUTH_TOKEN: z.string().default(''),
  TWILIO_PHONE_NUMBER: z.string().default(''),

  // Firebase — optional in dev (push notifications will fail gracefully)
  FIREBASE_PROJECT_ID: z.string().default(''),
  FIREBASE_CLIENT_EMAIL: z.string().default('dev@placeholder.com'),
  FIREBASE_PRIVATE_KEY: z.string().default(''),

  // Agora — optional in dev (livestreaming routes will fail gracefully)
  AGORA_APP_ID: z.string().default(''),
  AGORA_APP_CERTIFICATE: z.string().default(''),

  // App
  CLIENT_URL: z.string().url().default('http://localhost:3000'),
  API_URL: z.string().url().default('http://localhost:4000'),
});

// In production, dev placeholders and weak secrets must never slip through.
// These defaults exist only so the app boots locally without every integration.
const PLACEHOLDER_VALUES = new Set([
  '',
  'sk_test_dev_placeholder',
  'whsec_dev_placeholder',
  'dev@placeholder.com',
  'https://localhost',
]);

const productionSchema = envSchema.superRefine((cfg, ctx) => {
  if (cfg.NODE_ENV !== 'production') return;

  const required: Array<keyof typeof cfg> = [
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET',
    'AWS_CLOUDFRONT_URL',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ];

  for (const key of required) {
    const value = cfg[key];
    if (typeof value === 'string' && PLACEHOLDER_VALUES.has(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [key],
        message: `${key} must be set to a real value in production (placeholder detected)`,
      });
    }
  }

  for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const) {
    if (cfg[key].length < 64) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [key],
        message: `${key} must be at least 64 characters in production`,
      });
    }
  }
});

const parsed = productionSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
