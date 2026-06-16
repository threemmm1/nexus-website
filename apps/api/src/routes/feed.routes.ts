import { Router } from 'express';
import { z } from 'zod';
import * as feedController from '../controllers/feed.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

export const feedRouter = Router();

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const trendingSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

feedRouter.get('/', authenticate, validate(paginationSchema, 'query'), feedController.getFollowingFeed);
feedRouter.get('/explore', validate(paginationSchema, 'query'), feedController.getExploreFeed);
feedRouter.get('/trending/hashtags', validate(trendingSchema, 'query'), feedController.getTrendingHashtags);
