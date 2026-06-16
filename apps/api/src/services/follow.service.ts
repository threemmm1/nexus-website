import { prisma } from '../lib/prisma/client';
import { AppError } from '../middleware/error.middleware';
import { buildPaginationMeta } from '@vesioh/utils';
import { PAGINATION } from '../config/constants';
import { createNotification } from './notification.service';

export async function followUser(followerId: string, followingId: string): Promise<void> {
  if (followerId === followingId) {
    throw new AppError(400, 'INVALID_ACTION', 'You cannot follow yourself');
  }

  const target = await prisma.user.findUnique({
    where: { id: followingId },
    select: { id: true, status: true },
  });

  if (!target || target.status === 'banned') {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }

  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: followerId, blockedId: followingId },
        { blockerId: followingId, blockedId: followerId },
      ],
    },
    select: { id: true },
  });

  if (block) throw new AppError(403, 'BLOCKED', 'Cannot follow this user');

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
    select: { id: true },
  });

  if (existing) return;

  const [follower] = await prisma.$transaction([
    prisma.user.findUniqueOrThrow({ where: { id: followerId }, select: { displayName: true, avatarUrl: true } }),
    prisma.follow.create({ data: { followerId, followingId } }),
    prisma.user.update({ where: { id: followerId }, data: { followingCount: { increment: 1 } } }),
    prisma.user.update({ where: { id: followingId }, data: { followersCount: { increment: 1 } } }),
  ]);

  void createNotification({
    userId: followingId,
    type: 'follow',
    title: 'New follower',
    body: `${follower.displayName ?? 'Someone'} started following you`,
    ...(follower.avatarUrl !== null && { imageUrl: follower.avatarUrl }),
    referenceId: followerId,
  });
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  if (followerId === followingId) {
    throw new AppError(400, 'INVALID_ACTION', 'You cannot unfollow yourself');
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
    select: { id: true },
  });

  if (!existing) return;

  await prisma.$transaction([
    prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    }),
    prisma.user.update({
      where: { id: followerId },
      data: { followingCount: { decrement: 1 } },
    }),
    prisma.user.update({
      where: { id: followingId },
      data: { followersCount: { decrement: 1 } },
    }),
  ]);
}

export async function removeFollower(userId: string, followerId: string): Promise<void> {
  await unfollowUser(followerId, userId);
}

const FOLLOW_USER_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  isCreator: true,
  followersCount: true,
} as const;

export async function getFollowers(
  userId: string,
  page: number,
  limit: number,
  viewerId?: string,
) {
  const safeLimit = Math.min(limit, PAGINATION.MAX_LIMIT);
  const offset = (page - 1) * safeLimit;

  const [total, follows] = await Promise.all([
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.findMany({
      where: { followingId: userId },
      select: { follower: { select: FOLLOW_USER_SELECT }, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
      skip: offset,
    }),
  ]);

  const users = follows.map((f) => f.follower);

  if (viewerId) {
    const ids = users.map((u) => u.id);
    const viewerFollows = await prisma.follow.findMany({
      where: { followerId: viewerId, followingId: { in: ids } },
      select: { followingId: true },
    });
    const followingSet = new Set(viewerFollows.map((f) => f.followingId));
    return {
      users: users.map((u) => ({ ...u, isFollowing: followingSet.has(u.id) })),
      meta: buildPaginationMeta(total, page, safeLimit),
    };
  }

  return { users, meta: buildPaginationMeta(total, page, safeLimit) };
}

export async function getFollowing(
  userId: string,
  page: number,
  limit: number,
  viewerId?: string,
) {
  const safeLimit = Math.min(limit, PAGINATION.MAX_LIMIT);
  const offset = (page - 1) * safeLimit;

  const [total, follows] = await Promise.all([
    prisma.follow.count({ where: { followerId: userId } }),
    prisma.follow.findMany({
      where: { followerId: userId },
      select: { following: { select: FOLLOW_USER_SELECT }, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
      skip: offset,
    }),
  ]);

  const users = follows.map((f) => f.following);

  if (viewerId) {
    const ids = users.map((u) => u.id);
    const viewerFollows = await prisma.follow.findMany({
      where: { followerId: viewerId, followingId: { in: ids } },
      select: { followingId: true },
    });
    const followingSet = new Set(viewerFollows.map((f) => f.followingId));
    return {
      users: users.map((u) => ({ ...u, isFollowing: followingSet.has(u.id) })),
      meta: buildPaginationMeta(total, page, safeLimit),
    };
  }

  return { users, meta: buildPaginationMeta(total, page, safeLimit) };
}

export async function getFollowStatus(
  viewerId: string,
  targetId: string,
): Promise<{ isFollowing: boolean; isFollowedBy: boolean }> {
  const [following, followedBy] = await Promise.all([
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: viewerId, followingId: targetId } },
      select: { id: true },
    }),
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: targetId, followingId: viewerId } },
      select: { id: true },
    }),
  ]);

  return { isFollowing: !!following, isFollowedBy: !!followedBy };
}
