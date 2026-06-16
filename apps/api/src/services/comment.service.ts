import { prisma } from '../lib/prisma/client';
import { redis } from '../lib/redis/client';
import { AppError } from '../middleware/error.middleware';
import { buildPaginationMeta } from '@vesioh/utils';
import { PAGINATION } from '../config/constants';
import { createNotification } from './notification.service';

const COMMENT_SELECT = {
  id: true,
  postId: true,
  parentId: true,
  body: true,
  likesCount: true,
  repliesCount: true,
  createdAt: true,
  author: {
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },
} as const;

export async function createComment(
  authorId: string,
  postId: string,
  body: string,
  parentId?: string,
): Promise<object> {
  const post = await prisma.post.findUnique({
    where: { id: postId, status: 'active' },
    select: { id: true, authorId: true },
  });
  if (!post) throw new AppError(404, 'NOT_FOUND', 'Post not found');

  let parentAuthorId: string | null = null;

  if (parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentId, postId },
      select: { id: true, parentId: true, authorId: true },
    });
    if (!parent) throw new AppError(404, 'NOT_FOUND', 'Parent comment not found');
    if (parent.parentId) {
      throw new AppError(400, 'NESTING_NOT_ALLOWED', 'Replies can only be made to top-level comments');
    }
    parentAuthorId = parent.authorId;
  }

  const [commenter, comment] = await prisma.$transaction([
    prisma.user.findUniqueOrThrow({ where: { id: authorId }, select: { displayName: true, avatarUrl: true } }),
    prisma.comment.create({
      data: { authorId, postId, body, parentId: parentId ?? null },
      select: COMMENT_SELECT,
    }),
    prisma.post.update({ where: { id: postId }, data: { commentsCount: { increment: 1 } } }),
    ...(parentId
      ? [prisma.comment.update({ where: { id: parentId }, data: { repliesCount: { increment: 1 } } })]
      : []),
  ]);

  const notifBody = `${commenter.displayName ?? 'Someone'} commented: ${body.slice(0, 60)}`;
  const avatar = commenter.avatarUrl !== null ? { imageUrl: commenter.avatarUrl } : {};

  if (post.authorId !== authorId) {
    void createNotification({
      userId: post.authorId,
      type: 'comment',
      title: 'New comment',
      body: notifBody,
      ...avatar,
      referenceId: postId,
    });
  }

  if (parentAuthorId && parentAuthorId !== authorId && parentAuthorId !== post.authorId) {
    void createNotification({
      userId: parentAuthorId,
      type: 'comment',
      title: 'New reply',
      body: `${commenter.displayName ?? 'Someone'} replied to your comment`,
      ...avatar,
      referenceId: postId,
    });
  }

  return comment;
}

export async function getPostComments(
  postId: string,
  page: number,
  limit: number,
  _viewerId?: string,
) {
  const safeLimit = Math.min(limit, PAGINATION.MAX_LIMIT);
  const offset = (page - 1) * safeLimit;

  const [total, comments] = await Promise.all([
    prisma.comment.count({ where: { postId, parentId: null } }),
    prisma.comment.findMany({
      where: { postId, parentId: null },
      select: COMMENT_SELECT,
      orderBy: { createdAt: 'asc' },
      take: safeLimit,
      skip: offset,
    }),
  ]);

  return { comments, meta: buildPaginationMeta(total, page, safeLimit) };
}

export async function getCommentReplies(
  commentId: string,
  page: number,
  limit: number,
) {
  const safeLimit = Math.min(limit, 50);
  const offset = (page - 1) * safeLimit;

  const [total, replies] = await Promise.all([
    prisma.comment.count({ where: { parentId: commentId } }),
    prisma.comment.findMany({
      where: { parentId: commentId },
      select: COMMENT_SELECT,
      orderBy: { createdAt: 'asc' },
      take: safeLimit,
      skip: offset,
    }),
  ]);

  return { replies, meta: buildPaginationMeta(total, page, safeLimit) };
}

export async function deleteComment(
  commentId: string,
  requesterId: string,
  requesterRole: string,
): Promise<void> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, postId: true, parentId: true },
  });
  if (!comment) throw new AppError(404, 'NOT_FOUND', 'Comment not found');

  const isOwner = comment.authorId === requesterId;
  const isMod = requesterRole === 'moderator' || requesterRole === 'admin';
  if (!isOwner && !isMod) throw new AppError(403, 'FORBIDDEN', 'Cannot delete this comment');

  await prisma.$transaction([
    prisma.comment.delete({ where: { id: commentId } }),
    prisma.post.update({
      where: { id: comment.postId },
      data: { commentsCount: { decrement: 1 } },
    }),
    ...(comment.parentId
      ? [prisma.comment.update({ where: { id: comment.parentId }, data: { repliesCount: { decrement: 1 } } })]
      : []),
  ]);
}

export async function likeComment(userId: string, commentId: string): Promise<void> {
  const comment = await prisma.comment.findUnique({ where: { id: commentId }, select: { id: true } });
  if (!comment) throw new AppError(404, 'NOT_FOUND', 'Comment not found');

  const key = `comment_likes:${commentId}`;
  const added = await redis.sadd(key, userId);
  if (added === 0) return;

  await redis.expire(key, 60 * 60 * 24 * 7);
  await prisma.comment.update({ where: { id: commentId }, data: { likesCount: { increment: 1 } } });
}

export async function unlikeComment(userId: string, commentId: string): Promise<void> {
  const key = `comment_likes:${commentId}`;
  const removed = await redis.srem(key, userId);
  if (removed === 0) return;

  await prisma.comment.update({ where: { id: commentId }, data: { likesCount: { decrement: 1 } } });
}
