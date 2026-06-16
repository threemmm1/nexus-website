import type { Request, Response } from 'express';
import { successResponse } from '@vesioh/utils';
import * as postService from '../services/post.service';
import * as commentService from '../services/comment.service';
import * as mediaService from '../services/media.service';
import * as feedService from '../services/feed.service';
import { PAGINATION } from '../config/constants';

// ─── Media ────────────────────────────────────────────────────────────────────

export async function requestMediaUploads(req: Request, res: Response): Promise<void> {
  const { files } = req.body as { files: Array<{ contentType: string }> };
  const slots = await mediaService.requestMultipleMediaUploads(req.user!.userId, files, 'posts');
  res.json(successResponse(slots));
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function createPost(req: Request, res: Response): Promise<void> {
  const { caption, media, hashtags } = req.body as {
    caption?: string;
    media: Array<{
      cdnUrl: string;
      s3Key: string;
      contentType: string;
      kind: 'image' | 'video';
      width?: number;
      height?: number;
      duration?: number;
      sizeBytes?: number;
      order: number;
    }>;
    hashtags?: string[];
  };

  const post = await postService.createPost({
    authorId: req.user!.userId,
    ...(caption !== undefined && { caption }),
    media: media ?? [],
    ...(hashtags !== undefined && { hashtags }),
  });

  // Fanout to followers' feed caches async
  void feedService.fanoutPost(req.user!.userId);

  res.status(201).json(successResponse(post));
}

export async function getPost(req: Request, res: Response): Promise<void> {
  const { postId } = req.params as { postId: string };
  const post = await postService.getPostById(postId, req.user?.userId);
  res.json(successResponse(post));
}

export async function getUserPosts(req: Request, res: Response): Promise<void> {
  const { userId } = req.params as { userId: string };
  const page = Number(req.query['page'] ?? 1);
  const limit = Number(req.query['limit'] ?? PAGINATION.DEFAULT_LIMIT);
  const { posts, meta } = await postService.getUserPosts(userId, page, limit, req.user?.userId);
  res.json(successResponse(posts, meta));
}

export async function deletePost(req: Request, res: Response): Promise<void> {
  const { postId } = req.params as { postId: string };
  await postService.deletePost(postId, req.user!.userId, req.user!.role);
  res.json(successResponse({ message: 'Post deleted' }));
}

export async function likePost(req: Request, res: Response): Promise<void> {
  const { postId } = req.params as { postId: string };
  await postService.likePost(req.user!.userId, postId);
  res.json(successResponse({ message: 'Post liked' }));
}

export async function unlikePost(req: Request, res: Response): Promise<void> {
  const { postId } = req.params as { postId: string };
  await postService.unlikePost(req.user!.userId, postId);
  res.json(successResponse({ message: 'Post unliked' }));
}

export async function savePost(req: Request, res: Response): Promise<void> {
  const { postId } = req.params as { postId: string };
  await postService.savePost(req.user!.userId, postId);
  res.json(successResponse({ message: 'Post saved' }));
}

export async function unsavePost(req: Request, res: Response): Promise<void> {
  const { postId } = req.params as { postId: string };
  await postService.unsavePost(req.user!.userId, postId);
  res.json(successResponse({ message: 'Post unsaved' }));
}

export async function getSavedPosts(req: Request, res: Response): Promise<void> {
  const page = Number(req.query['page'] ?? 1);
  const limit = Number(req.query['limit'] ?? PAGINATION.DEFAULT_LIMIT);
  const { posts, meta } = await postService.getSavedPosts(req.user!.userId, page, limit);
  res.json(successResponse(posts, meta));
}

export async function getHashtagPosts(req: Request, res: Response): Promise<void> {
  const { tag } = req.params as { tag: string };
  const page = Number(req.query['page'] ?? 1);
  const limit = Number(req.query['limit'] ?? PAGINATION.DEFAULT_LIMIT);
  const result = await postService.getPostsByHashtag(tag, page, limit);
  res.json(successResponse(result));
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function createComment(req: Request, res: Response): Promise<void> {
  const { postId } = req.params as { postId: string };
  const { body, parentId } = req.body as { body: string; parentId?: string };
  const comment = await commentService.createComment(req.user!.userId, postId, body, parentId);
  res.status(201).json(successResponse(comment));
}

export async function getPostComments(req: Request, res: Response): Promise<void> {
  const { postId } = req.params as { postId: string };
  const page = Number(req.query['page'] ?? 1);
  const limit = Number(req.query['limit'] ?? PAGINATION.DEFAULT_LIMIT);
  const { comments, meta } = await commentService.getPostComments(postId, page, limit, req.user?.userId);
  res.json(successResponse(comments, meta));
}

export async function getCommentReplies(req: Request, res: Response): Promise<void> {
  const { commentId } = req.params as { commentId: string };
  const page = Number(req.query['page'] ?? 1);
  const limit = Number(req.query['limit'] ?? 20);
  const { replies, meta } = await commentService.getCommentReplies(commentId, page, limit);
  res.json(successResponse(replies, meta));
}

export async function deleteComment(req: Request, res: Response): Promise<void> {
  const { commentId } = req.params as { commentId: string };
  await commentService.deleteComment(commentId, req.user!.userId, req.user!.role);
  res.json(successResponse({ message: 'Comment deleted' }));
}

export async function likeComment(req: Request, res: Response): Promise<void> {
  const { commentId } = req.params as { commentId: string };
  await commentService.likeComment(req.user!.userId, commentId);
  res.json(successResponse({ message: 'Comment liked' }));
}

export async function unlikeComment(req: Request, res: Response): Promise<void> {
  const { commentId } = req.params as { commentId: string };
  await commentService.unlikeComment(req.user!.userId, commentId);
  res.json(successResponse({ message: 'Comment unliked' }));
}
