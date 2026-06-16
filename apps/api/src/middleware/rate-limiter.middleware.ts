import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from '../config/constants';
import { errorResponse } from '@vesioh/utils';

export const authRateLimiter = rateLimit({
  ...RATE_LIMITS.AUTH,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(errorResponse('RATE_LIMITED', 'Too many requests, please try again later'));
  },
});

export const apiRateLimiter = rateLimit({
  ...RATE_LIMITS.API,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(errorResponse('RATE_LIMITED', 'Too many requests, please try again later'));
  },
});

export const uploadRateLimiter = rateLimit({
  ...RATE_LIMITS.UPLOAD,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(errorResponse('RATE_LIMITED', 'Upload limit exceeded'));
  },
});
