import { prisma } from '../lib/prisma/client';
import { AppError } from '../middleware/error.middleware';
import { buildPaginationMeta, parsePagination } from '@vesioh/utils';
import { PAGINATION } from '../config/constants';

export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  if (blockerId === blockedId) {
    throw new AppError(400, 'INVALID_ACTION', 'You cannot block yourself');
  }

  const target = await prisma.user.findUnique({
    where: { id: blockedId },
    select: { id: true },
  });

  if (!target) throw new AppError(404, 'NOT_FOUND', 'User not found');

  const existing = await prisma.block.findUnique({
    where: { blockerId_blockedId: { blockerId, blockedId } },
    select: { id: true },
  });

  if (existing) return; // already blocked — idempotent

  // Block + remove any existing follows in both directions atomically
  const followsToRemove = await prisma.follow.findMany({
    where: {
      OR: [
        { followerId: blockerId, followingId: blockedId },
        { followerId: blockedId, followingId: blockerId },
      ],
    },
    select: { followerId: true, followingId: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.block.create({ data: { blockerId, blockedId } });

    for (const f of followsToRemove) {
      await tx.follow.delete({
        where: { followerId_followingId: { followerId: f.followerId, followingId: f.followingId } },
      });
      await tx.user.update({
        where: { id: f.followerId },
        data: { followingCount: { decrement: 1 } },
      });
      await tx.user.update({
        where: { id: f.followingId },
        data: { followersCount: { decrement: 1 } },
      });
    }
  });
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  const existing = await prisma.block.findUnique({
    where: { blockerId_blockedId: { blockerId, blockedId } },
    select: { id: true },
  });

  if (!existing) return; // not blocked — idempotent

  await prisma.block.delete({
    where: { blockerId_blockedId: { blockerId, blockedId } },
  });
}

export async function getBlockedUsers(
  userId: string,
  page: number,
  limit: number,
) {
  const { limit: safeLimit, offset } = parsePagination({ page, limit }, PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

  const [total, blocks] = await Promise.all([
    prisma.block.count({ where: { blockerId: userId } }),
    prisma.block.findMany({
      where: { blockerId: userId },
      select: {
        blocked: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
      skip: offset,
    }),
  ]);

  return {
    users: blocks.map((b) => ({ ...b.blocked, blockedAt: b.createdAt })),
    meta: buildPaginationMeta(total, page, safeLimit),
  };
}

export async function isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  const record = await prisma.block.findUnique({
    where: { blockerId_blockedId: { blockerId, blockedId } },
    select: { id: true },
  });
  return !!record;
}

export async function isBlockedInEitherDirection(
  userAId: string,
  userBId: string,
): Promise<boolean> {
  const record = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: userAId, blockedId: userBId },
        { blockerId: userBId, blockedId: userAId },
      ],
    },
    select: { id: true },
  });
  return !!record;
}
