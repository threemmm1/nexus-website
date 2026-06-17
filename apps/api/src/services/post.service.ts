import { prisma } from '../lib/prisma/client';
import { redis } from '../lib/redis/client';
import { AppError } from '../middleware/error.middleware';
import { buildPaginationMeta, parsePagination } from '@vesioh/utils';
import { deleteMediaAssets } from './media.service';
import { createNotification } from './notification.service';
import { ensureOwnerOrMod } from '../lib/permissions';
import { PAGINATION, REDIS_KEYS } from '../config/constants';

export interface ConfirmedMedia {
  cdnUrl: string;
  s3Key: string;
  contentType: string;
  kind: 'image' | 'video';
  width?: number;
  height?: number;
  duration?: number;
  sizeBytes?: number;
  order: number;
}

export interface CreatePostInput {
  authorId: string;
  caption?: string;
  media: ConfirmedMedia[];
  hashtags?: string[];
}

const POST_MEDIA_SELECT = {
  id: true,
  url: true,
  thumbnailUrl: true,
  type: true,
  width: true,
  height: true,
  duration: true,
  order: true,
} as const;

const POST_AUTHOR_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  isCreator: true,
} as const;

export const POST_SELECT = {
  id: true,
  caption: true,
  status: true,
  likesCount: true,
  commentsCount: true,
  sharesCount: true,
  savesCount: true,
  viewsCount: true,
  createdAt: true,
  author: { select: POST_AUTHOR_SELECT },
  media: { select: POST_MEDIA_SELECT, orderBy: { order: 'asc' as const } },
  hashtags: { select: { hashtag: { select: { name: true } } } },
} as const;

export async function createPost(input: CreatePostInput): Promise<object> {
  if (input.media.length === 0 && !input.caption?.trim()) {
    throw new AppError(400, 'EMPTY_POST', 'Post must have media or a caption');
  }

  const captionTags = extractHashtagsFromText(input.caption ?? '');
  const allTags = [...new Set([...captionTags, ...(input.hashtags ?? []).map((t) => t.toLowerCase())])];

  const post = await prisma.$transaction(async (tx) => {
    const newPost = await tx.post.create({
      data: {
        authorId: input.authorId,
        caption: input.caption ?? null,
        status: input.media.length > 0 ? 'processing' : 'active',
        media: {
          create: input.media.map((m) => ({
            s3Key: m.s3Key,
            url: m.cdnUrl,
            type: m.kind,
            mimeType: m.contentType,
            width: m.width ?? null,
            height: m.height ?? null,
            duration: m.duration ?? null,
            sizeBytes: m.sizeBytes ?? 0,
            order: m.order,
          })),
        },
      },
      select: POST_SELECT,
    });

    if (allTags.length > 0) {
      await Promise.all(
        allTags.map((name) =>
          tx.hashtag.upsert({
            where: { name },
            create: { name, postsCount: 1 },
            update: { postsCount: { increment: 1 } },
          }),
        ),
      );

      const hashtagRecords = await tx.hashtag.findMany({
        where: { name: { in: allTags } },
        select: { id: true },
      });

      await tx.postHashtag.createMany({
        data: hashtagRecords.map((h) => ({ postId: newPost.id, hashtagId: h.id })),
        skipDuplicates: true,
      });
    }

    await tx.user.update({
      where: { id: input.authorId },
      data: { postsCount: { increment: 1 } },
    });

    return newPost;
  });

  void redis.del(REDIS_KEYS.feedCache(input.authorId));

  return formatPost(post);
}

export async function markPostActive(postId: string): Promise<void> {
  await prisma.post.update({
    where: { id: postId },
    data: { status: 'active' },
  });
}

export async function getPostById(postId: string, viewerId?: string): Promise<object> {
  const post = await prisma.post.findUnique({
    where: { id: postId, status: 'active' },
    select: POST_SELECT,
  });

  if (!post) throw new AppError(404, 'NOT_FOUND', 'Post not found');

  void prisma.post.update({ where: { id: postId }, data: { viewsCount: { increment: 1 } } });

  if (!viewerId) return formatPost(post);

  const [liked, saved] = await Promise.all([
    prisma.like.findUnique({
      where: { userId_postId: { userId: viewerId, postId } },
      select: { id: true },
    }),
    prisma.save.findUnique({
      where: { userId_postId: { userId: viewerId, postId } },
      select: { id: true },
    }),
  ]);

  return { ...formatPost(post), isLiked: !!liked, isSaved: !!saved };
}

export async function getUserPosts(
  userId: string,
  page: number,
  limit: number,
  viewerId?: string,
) {
  const { limit: safeLimit, offset } = parsePagination({ page, limit }, PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

  const [total, posts] = await Promise.all([
    prisma.post.count({ where: { authorId: userId, status: 'active' } }),
    prisma.post.findMany({
      where: { authorId: userId, status: 'active' },
      select: POST_SELECT,
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
      skip: offset,
    }),
  ]);

  const formatted = posts.map(formatPost);
  const withFlags = await attachPostViewerFlags(formatted, posts.map((p) => p.id), viewerId);

  return { posts: withFlags, meta: buildPaginationMeta(total, page, safeLimit) };
}

export async function getSavedPosts(userId: string, page: number, limit: number) {
  const { limit: safeLimit, offset } = parsePagination({ page, limit }, PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

  const [total, saves] = await Promise.all([
    prisma.save.count({ where: { userId } }),
    prisma.save.findMany({
      where: { userId },
      select: { post: { select: POST_SELECT }, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
      skip: offset,
    }),
  ]);

  return {
    posts: saves.map((s) => ({ ...formatPost(s.post), savedAt: s.createdAt, isLiked: false, isSaved: true })),
    meta: buildPaginationMeta(total, page, safeLimit),
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deletePost(postId: string, requesterId: string, requesterRole: string): Promise<void> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      authorId: true,
      media: { select: { s3Key: true } },
      hashtags: { select: { hashtag: { select: { id: true, name: true } } } },
    },
  });

  if (!post) throw new AppError(404, 'NOT_FOUND', 'Post not found');

  ensureOwnerOrMod(post.authorId, requesterId, requesterRole, 'You do not have permission to delete this post');

  await prisma.$transaction(async (tx) => {
    await tx.post.delete({ where: { id: postId } });

    const tagNames = post.hashtags.map((h) => h.hashtag.name);
    if (tagNames.length > 0) {
      await tx.hashtag.updateMany({
        where: { name: { in: tagNames } },
        data: { postsCount: { decrement: 1 } },
      });
    }

    await tx.user.update({
      where: { id: post.authorId },
      data: { postsCount: { decrement: 1 } },
    });
  });

  const s3Keys = post.media.map((m) => m.s3Key);
  if (s3Keys.length > 0) void deleteMediaAssets(s3Keys);
}

export async function likePost(userId: string, postId: string): Promise<void> {
  const post = await prisma.post.findUnique({
    where: { id: postId, status: 'active' },
    select: { id: true, authorId: true },
  });
  if (!post) throw new AppError(404, 'NOT_FOUND', 'Post not found');

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
    select: { id: true },
  });
  if (existing) return;

  const [liker] = await prisma.$transaction([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { displayName: true, avatarUrl: true } }),
    prisma.like.create({ data: { userId, postId } }),
    prisma.post.update({ where: { id: postId }, data: { likesCount: { increment: 1 } } }),
  ]);

  if (post.authorId !== userId) {
    void createNotification({
      userId: post.authorId,
      type: 'like',
      title: 'New like',
      body: `${liker.displayName ?? 'Someone'} liked your post`,
      ...(liker.avatarUrl !== null && { imageUrl: liker.avatarUrl }),
      referenceId: postId,
    });
  }
}

export async function unlikePost(userId: string, postId: string): Promise<void> {
  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
    select: { id: true },
  });
  if (!existing) return;

  await prisma.$transaction([
    prisma.like.delete({ where: { userId_postId: { userId, postId } } }),
    prisma.post.update({ where: { id: postId }, data: { likesCount: { decrement: 1 } } }),
  ]);
}

export async function savePost(userId: string, postId: string): Promise<void> {
  const post = await prisma.post.findUnique({ where: { id: postId, status: 'active' }, select: { id: true } });
  if (!post) throw new AppError(404, 'NOT_FOUND', 'Post not found');

  const existing = await prisma.save.findUnique({
    where: { userId_postId: { userId, postId } },
    select: { id: true },
  });
  if (existing) return;

  await prisma.$transaction([
    prisma.save.create({ data: { userId, postId } }),
    prisma.post.update({ where: { id: postId }, data: { savesCount: { increment: 1 } } }),
  ]);
}

export async function unsavePost(userId: string, postId: string): Promise<void> {
  const existing = await prisma.save.findUnique({
    where: { userId_postId: { userId, postId } },
    select: { id: true },
  });
  if (!existing) return;

  await prisma.$transaction([
    prisma.save.delete({ where: { userId_postId: { userId, postId } } }),
    prisma.post.update({ where: { id: postId }, data: { savesCount: { decrement: 1 } } }),
  ]);
}

export async function getPostsByHashtag(tag: string, page: number, limit: number) {
  const { limit: safeLimit, offset } = parsePagination({ page, limit }, PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

  const hashtag = await prisma.hashtag.findUnique({ where: { name: tag.toLowerCase() }, select: { id: true, name: true, postsCount: true } });
  if (!hashtag) throw new AppError(404, 'NOT_FOUND', 'Hashtag not found');

  const postHashtags = await prisma.postHashtag.findMany({
    where: { hashtagId: hashtag.id },
    select: { post: { select: POST_SELECT } },
    orderBy: { post: { createdAt: 'desc' } },
    take: safeLimit,
    skip: offset,
  });

  return {
    hashtag,
    posts: postHashtags.map((ph) => formatPost(ph.post)),
    meta: buildPaginationMeta(hashtag.postsCount, page, safeLimit),
  };
}

function extractHashtagsFromText(text: string): string[] {
  const matches = text.match(/#([a-zA-Z0-9_]+)/g) ?? [];
  return matches.map((t) => t.slice(1).toLowerCase());
}

export interface FormattedPost {
  id: string;
  caption: string | null;
  status: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  viewsCount: number;
  createdAt: Date;
  author: unknown;
  media: unknown[];
  hashtags: string[];
}

export async function attachPostViewerFlags(
  posts: FormattedPost[],
  postIds: string[],
  viewerId?: string,
): Promise<Array<FormattedPost & { isLiked: boolean; isSaved: boolean }>> {
  if (!viewerId || posts.length === 0) {
    return posts.map((p) => ({ ...p, isLiked: false, isSaved: false }));
  }
  const [likes, saves] = await Promise.all([
    prisma.like.findMany({ where: { userId: viewerId, postId: { in: postIds } }, select: { postId: true } }),
    prisma.save.findMany({ where: { userId: viewerId, postId: { in: postIds } }, select: { postId: true } }),
  ]);
  const likedSet = new Set(likes.map((l) => l.postId));
  const savedSet = new Set(saves.map((s) => s.postId));
  return posts.map((p) => ({ ...p, isLiked: likedSet.has(p.id), isSaved: savedSet.has(p.id) }));
}

export function formatPost(post: Record<string, unknown>): FormattedPost {
  const raw = post as {
    id: string;
    caption: string | null;
    status: string;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    savesCount: number;
    viewsCount: number;
    createdAt: Date;
    author: unknown;
    media: unknown[];
    hashtags: Array<{ hashtag: { name: string } }>;
  };

  return {
    id: raw.id,
    caption: raw.caption,
    status: raw.status,
    likesCount: raw.likesCount,
    commentsCount: raw.commentsCount,
    sharesCount: raw.sharesCount,
    savesCount: raw.savesCount,
    viewsCount: raw.viewsCount,
    createdAt: raw.createdAt,
    author: raw.author,
    media: raw.media,
    hashtags: raw.hashtags.map((h) => h.hashtag.name),
  };
}
