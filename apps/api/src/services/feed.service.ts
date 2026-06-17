import { prisma } from '../lib/prisma/client';
import { redis } from '../lib/redis/client';
import { parsePagination } from '@vesioh/utils';
import { REDIS_KEYS, PAGINATION } from '../config/constants';
import { POST_SELECT, formatPost, attachPostViewerFlags } from './post.service';

const FEED_CACHE_TTL = 300;
const LARGE_ACCOUNT_THRESHOLD = 10_000;

function computeScore(
  likes: number,
  comments: number,
  shares: number,
  saves: number,
  createdAt: Date,
): number {
  const raw = likes * 1 + comments * 3 + shares * 5 + saves * 2;
  const hoursSince = (Date.now() - createdAt.getTime()) / 3_600_000;
  return raw / Math.pow(hoursSince + 2, 1.5);
}

export async function getFollowingFeed(
  userId: string,
  page: number,
  limit: number,
): Promise<{ posts: object[]; hasMore: boolean }> {
  const { limit: safeLimit, offset } = parsePagination({ page, limit }, PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

  if (page === 1) {
    const cached = await redis.get(REDIS_KEYS.feedCache(userId));
    if (cached) {
      const postIds = JSON.parse(cached) as string[];
      const slice = postIds.slice(0, safeLimit);
      if (slice.length > 0) {
        const posts = await hydratePostIds(slice, userId);
        return { posts, hasMore: postIds.length > safeLimit };
      }
    }
  }

  const followingIds = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  if (followingIds.length === 0) {
    return getExploreFeed(userId, page, limit);
  }

  const authorIds = followingIds.map((f) => f.followingId);

  const posts = await prisma.post.findMany({
    where: {
      authorId: { in: authorIds },
      status: 'active',
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // last 7 days
    },
    select: POST_SELECT,
    orderBy: { createdAt: 'desc' },
    take: 200, // fetch more than needed to score + sort
  });

  const scored = posts
    .map((p) => ({
      post: p,
      score: computeScore(p.likesCount, p.commentsCount, p.sharesCount, p.savesCount, p.createdAt),
    }))
    .sort((a, b) => b.score - a.score);

  if (page === 1) {
    const idList = scored.map((s) => s.post.id);
    void redis.set(REDIS_KEYS.feedCache(userId), JSON.stringify(idList), 'EX', FEED_CACHE_TTL);
  }

  const slice = scored.slice(offset, offset + safeLimit);
  const slicePosts = slice.map((s) => formatPost(s.post as Record<string, unknown>));
  const formatted = await attachPostViewerFlags(slicePosts, slicePosts.map((p) => p.id), userId);

  return { posts: formatted, hasMore: scored.length > offset + safeLimit };
}

export async function getExploreFeed(
  userId: string | undefined,
  page: number,
  limit: number,
): Promise<{ posts: object[]; hasMore: boolean }> {
  const { limit: safeLimit, offset } = parsePagination({ page, limit }, PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

  const blockedByIds = userId
    ? (await prisma.block.findMany({ where: { blockedId: userId }, select: { blockerId: true } })).map((b) => b.blockerId)
    : [];

  const exploreWhere = {
    status: 'active' as const,
    createdAt: { gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    ...(blockedByIds.length > 0 && { authorId: { notIn: blockedByIds } }),
  };

  const posts = await prisma.post.findMany({
    where: exploreWhere,
    select: POST_SELECT,
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  const scored = posts
    .map((p) => ({
      post: p,
      score: computeScore(p.likesCount, p.commentsCount, p.sharesCount, p.savesCount, p.createdAt),
    }))
    .sort((a, b) => b.score - a.score);

  const slice = scored.slice(offset, offset + safeLimit);
  const slicePosts = slice.map((s) => formatPost(s.post as Record<string, unknown>));
  const formatted = await attachPostViewerFlags(slicePosts, slicePosts.map((p) => p.id), userId);

  return { posts: formatted, hasMore: scored.length > offset + safeLimit };
}

export async function fanoutPost(authorId: string): Promise<void> {
  const author = await prisma.user.findUnique({
    where: { id: authorId },
    select: { followersCount: true },
  });

  if (!author || author.followersCount > LARGE_ACCOUNT_THRESHOLD) return;

  const followers = await prisma.follow.findMany({
    where: { followingId: authorId },
    select: { followerId: true },
  });

  if (followers.length > 0) {
    const keys = followers.map((f) => REDIS_KEYS.feedCache(f.followerId));
    await redis.del(...keys);
  }
}

export async function getTrendingHashtags(limit = 20): Promise<object[]> {
  return prisma.hashtag.findMany({
    where: { postsCount: { gt: 0 } },
    orderBy: { postsCount: 'desc' },
    take: limit,
    select: { name: true, postsCount: true },
  });
}

async function hydratePostIds(postIds: string[], viewerId?: string): Promise<object[]> {
  const posts = await prisma.post.findMany({
    where: { id: { in: postIds }, status: 'active' },
    select: POST_SELECT,
  });

  const map = new Map(posts.map((p) => [p.id, p]));
  const ordered = postIds.map((id) => map.get(id)).filter(Boolean);
  const formatted = ordered.map((p) => formatPost(p as Record<string, unknown>));

  return attachPostViewerFlags(formatted, formatted.map((p) => p.id), viewerId);
}
