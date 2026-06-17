import type { Request, Response } from 'express';
import { successResponse, parsePagination } from '@vesioh/utils';
import * as userService from '../services/user.service';
import * as followService from '../services/follow.service';
import * as blockService from '../services/block.service';
import { PAGINATION } from '../config/constants';

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getProfile(req: Request, res: Response): Promise<void> {
  const { username } = req.params as { username: string };
  const viewerId = req.user?.userId;
  const profile = await userService.getProfileByHandle(username, viewerId);
  res.json(successResponse(profile));
}

export async function getMyProfile(req: Request, res: Response): Promise<void> {
  const profile = await userService.getProfileById(req.user!.userId);
  res.json(successResponse(profile));
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const updated = await userService.updateProfile(req.user!.userId, req.body);
  res.json(successResponse(updated));
}

export async function checkUsername(req: Request, res: Response): Promise<void> {
  const { username } = req.params as { username: string };
  const available = await userService.checkUsernameAvailable(username);
  res.json(successResponse({ username: username.toLowerCase(), available }));
}

export async function changeUsername(req: Request, res: Response): Promise<void> {
  const { username } = req.body as { username: string };
  await userService.changeUsername(req.user!.userId, username);
  res.json(successResponse({ message: 'Username updated successfully' }));
}

// ─── Avatar / Banner ──────────────────────────────────────────────────────────

export async function requestAvatarUpload(req: Request, res: Response): Promise<void> {
  const { contentType } = req.body as { contentType: string };
  const result = await userService.requestProfileImageUpload({
    userId: req.user!.userId,
    contentType,
    kind: 'avatar',
  });
  res.json(successResponse(result));
}

export async function confirmAvatarUpload(req: Request, res: Response): Promise<void> {
  const { cdnUrl } = req.body as { cdnUrl: string };
  await userService.confirmProfileImageUpload(req.user!.userId, 'avatar', cdnUrl);
  res.json(successResponse({ message: 'Avatar updated successfully' }));
}

export async function requestBannerUpload(req: Request, res: Response): Promise<void> {
  const { contentType } = req.body as { contentType: string };
  const result = await userService.requestProfileImageUpload({
    userId: req.user!.userId,
    contentType,
    kind: 'banner',
  });
  res.json(successResponse(result));
}

export async function confirmBannerUpload(req: Request, res: Response): Promise<void> {
  const { cdnUrl } = req.body as { cdnUrl: string };
  await userService.confirmProfileImageUpload(req.user!.userId, 'banner', cdnUrl);
  res.json(successResponse({ message: 'Banner updated successfully' }));
}

// ─── Follow ───────────────────────────────────────────────────────────────────

export async function followUser(req: Request, res: Response): Promise<void> {
  const { userId } = req.params as { userId: string };
  await followService.followUser(req.user!.userId, userId);
  res.json(successResponse({ message: 'Followed successfully' }));
}

export async function unfollowUser(req: Request, res: Response): Promise<void> {
  const { userId } = req.params as { userId: string };
  await followService.unfollowUser(req.user!.userId, userId);
  res.json(successResponse({ message: 'Unfollowed successfully' }));
}

export async function removeFollower(req: Request, res: Response): Promise<void> {
  const { userId } = req.params as { userId: string };
  await followService.removeFollower(req.user!.userId, userId);
  res.json(successResponse({ message: 'Follower removed' }));
}

export async function getFollowers(req: Request, res: Response): Promise<void> {
  const { userId } = req.params as { userId: string };
  const { page, limit } = parsePagination(req.query as Record<string, unknown>, PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const { users, meta } = await followService.getFollowers(userId, page, limit, req.user?.userId);
  res.json(successResponse(users, meta));
}

export async function getFollowing(req: Request, res: Response): Promise<void> {
  const { userId } = req.params as { userId: string };
  const { page, limit } = parsePagination(req.query as Record<string, unknown>, PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const { users, meta } = await followService.getFollowing(userId, page, limit, req.user?.userId);
  res.json(successResponse(users, meta));
}

export async function getFollowStatus(req: Request, res: Response): Promise<void> {
  const { userId } = req.params as { userId: string };
  const status = await followService.getFollowStatus(req.user!.userId, userId);
  res.json(successResponse(status));
}

// ─── Block ────────────────────────────────────────────────────────────────────

export async function blockUser(req: Request, res: Response): Promise<void> {
  const { userId } = req.params as { userId: string };
  await blockService.blockUser(req.user!.userId, userId);
  res.json(successResponse({ message: 'User blocked' }));
}

export async function unblockUser(req: Request, res: Response): Promise<void> {
  const { userId } = req.params as { userId: string };
  await blockService.unblockUser(req.user!.userId, userId);
  res.json(successResponse({ message: 'User unblocked' }));
}

export async function getBlockedUsers(req: Request, res: Response): Promise<void> {
  const { page, limit } = parsePagination(req.query as Record<string, unknown>, PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const { users, meta } = await blockService.getBlockedUsers(req.user!.userId, page, limit);
  res.json(successResponse(users, meta));
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchUsers(req: Request, res: Response): Promise<void> {
  const q = String(req.query['q'] ?? '').trim();
  const { limit, offset } = parsePagination(req.query as Record<string, unknown>, PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

  const users = await userService.searchUsers(q, req.user?.userId, limit, offset);
  res.json(successResponse(users));
}
