import type { Request, Response } from 'express';
import { successResponse } from '@vesioh/utils';
import * as feedService from '../services/feed.service';
import { PAGINATION } from '../config/constants';

export async function getFollowingFeed(req: Request, res: Response): Promise<void> {
  const page = Number(req.query['page'] ?? 1);
  const limit = Number(req.query['limit'] ?? PAGINATION.DEFAULT_LIMIT);
  const { posts, hasMore } = await feedService.getFollowingFeed(req.user!.userId, page, limit);
  res.json(successResponse({ posts, hasMore }));
}

export async function getExploreFeed(req: Request, res: Response): Promise<void> {
  const page = Number(req.query['page'] ?? 1);
  const limit = Number(req.query['limit'] ?? PAGINATION.DEFAULT_LIMIT);
  const { posts, hasMore } = await feedService.getExploreFeed(req.user?.userId, page, limit);
  res.json(successResponse({ posts, hasMore }));
}

export async function getTrendingHashtags(req: Request, res: Response): Promise<void> {
  const limit = Number(req.query['limit'] ?? 20);
  const tags = await feedService.getTrendingHashtags(limit);
  res.json(successResponse(tags));
}
