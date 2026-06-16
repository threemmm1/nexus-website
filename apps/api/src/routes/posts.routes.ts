import { Router } from 'express';
import { z } from 'zod';
import * as postsController from '../controllers/posts.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { uploadRateLimiter } from '../middleware/rate-limiter.middleware';

export const postsRouter = Router();

const mediaFileSchema = z.object({
  contentType: z.enum([
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/quicktime', 'video/webm',
  ]),
});

const requestUploadSchema = z.object({
  files: z.array(mediaFileSchema).min(1).max(10),
});

const confirmedMediaSchema = z.object({
  cdnUrl: z.string().url(),
  s3Key: z.string().min(1),
  contentType: z.string().min(1),
  kind: z.enum(['image', 'video']),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  duration: z.number().positive().optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
  order: z.number().int().min(0),
});

const createPostSchema = z
  .object({
    caption: z.string().max(2200).optional(),
    media: z.array(confirmedMediaSchema).max(10).default([]),
    hashtags: z.array(z.string().max(100)).max(30).optional(),
  })
  .refine((d) => d.media.length > 0 || (d.caption?.trim() ?? '').length > 0, {
    message: 'Post must have media or a caption',
  });

const createCommentSchema = z.object({
  body: z.string().min(1).max(1000),
  parentId: z.string().cuid().optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

postsRouter.post(
  '/media/request-upload',
  authenticate,
  uploadRateLimiter,
  validate(requestUploadSchema),
  postsController.requestMediaUploads,
);

postsRouter.get(
  '/saved',
  authenticate,
  validate(paginationSchema, 'query'),
  postsController.getSavedPosts,
);

postsRouter.get(
  '/hashtag/:tag',
  validate(paginationSchema, 'query'),
  postsController.getHashtagPosts,
);

postsRouter.get(
  '/user/:userId',
  validate(paginationSchema, 'query'),
  postsController.getUserPosts,
);

postsRouter.post(
  '/',
  authenticate,
  validate(createPostSchema),
  postsController.createPost,
);

postsRouter.get('/:postId', postsController.getPost);

postsRouter.delete('/:postId', authenticate, postsController.deletePost);

// ─── Like / Save ──────────────────────────────────────────────────────────────

postsRouter.post('/:postId/like', authenticate, postsController.likePost);
postsRouter.delete('/:postId/like', authenticate, postsController.unlikePost);
postsRouter.post('/:postId/save', authenticate, postsController.savePost);
postsRouter.delete('/:postId/save', authenticate, postsController.unsavePost);

// ─── Comments ─────────────────────────────────────────────────────────────────

postsRouter.post(
  '/:postId/comments',
  authenticate,
  validate(createCommentSchema),
  postsController.createComment,
);

postsRouter.get(
  '/:postId/comments',
  validate(paginationSchema, 'query'),
  postsController.getPostComments,
);

postsRouter.get(
  '/comments/:commentId/replies',
  validate(paginationSchema, 'query'),
  postsController.getCommentReplies,
);

postsRouter.delete('/comments/:commentId', authenticate, postsController.deleteComment);
postsRouter.post('/comments/:commentId/like', authenticate, postsController.likeComment);
postsRouter.delete('/comments/:commentId/like', authenticate, postsController.unlikeComment);
