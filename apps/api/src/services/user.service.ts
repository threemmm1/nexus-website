import { prisma } from '../lib/prisma/client';
import { AppError } from '../middleware/error.middleware';
import {
  buildS3Key,
  buildCdnUrl,
  getPresignedUploadUrl,
  deleteS3Object,
  extractS3KeyFromUrl,
} from '../lib/storage/s3';
import type { UploadFolder } from '../lib/storage/s3';
import { UPLOAD } from '../config/constants';

export interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
  website?: string;
  location?: string;
}

export interface ProfileUploadRequest {
  userId: string;
  contentType: string;
  kind: 'avatar' | 'banner';
}

const PUBLIC_PROFILE_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  bannerUrl: true,
  bio: true,
  website: true,
  location: true,
  role: true,
  isCreator: true,
  isSeller: true,
  followersCount: true,
  followingCount: true,
  postsCount: true,
  createdAt: true,
} as const;

export async function getProfileByHandle(
  username: string,
  viewerId?: string,
): Promise<object> {
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: PUBLIC_PROFILE_SELECT,
  });

  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');

  if (!viewerId) return user;

  const [followRecord, blockRecord] = await Promise.all([
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: viewerId, followingId: user.id } },
      select: { id: true },
    }),
    prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: viewerId, blockedId: user.id } },
      select: { id: true },
    }),
  ]);

  return {
    ...user,
    isFollowing: !!followRecord,
    isBlocked: !!blockRecord,
    isOwnProfile: viewerId === user.id,
  };
}

export async function getProfileById(userId: string): Promise<object> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...PUBLIC_PROFILE_SELECT,
      email: true,
      phone: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      status: true,
      updatedAt: true,
    },
  });

  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
  return user;
}

export async function updateProfile(
  userId: string,
  data: UpdateProfileInput,
): Promise<object> {
  if (Object.keys(data).length === 0) {
    throw new AppError(400, 'NOTHING_TO_UPDATE', 'No fields provided to update');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: PUBLIC_PROFILE_SELECT,
  });

  return updated;
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const existing = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true },
  });
  return !existing;
}

export async function changeUsername(userId: string, newUsername: string): Promise<void> {
  const available = await checkUsernameAvailable(newUsername);
  if (!available) throw new AppError(409, 'USERNAME_TAKEN', 'Username is already taken');

  await prisma.user.update({
    where: { id: userId },
    data: { username: newUsername.toLowerCase() },
  });
}

const ALLOWED_IMAGE_TYPES = new Set(UPLOAD.ALLOWED_IMAGE_TYPES);

export async function requestProfileImageUpload(
  req: ProfileUploadRequest,
): Promise<{ uploadUrl: string; cdnUrl: string; s3Key: string }> {
  if (!ALLOWED_IMAGE_TYPES.has(req.contentType)) {
    throw new AppError(400, 'INVALID_FILE_TYPE', 'Only JPEG, PNG, WebP, and GIF images are allowed');
  }

  const ext = req.contentType.split('/')[1] ?? 'jpg';
  const folder: UploadFolder = req.kind === 'avatar' ? 'avatars' : 'banners';
  const s3Key = buildS3Key(folder, req.userId, ext);
  const cdnUrl = buildCdnUrl(s3Key);
  const uploadUrl = await getPresignedUploadUrl(s3Key, req.contentType);

  return { uploadUrl, cdnUrl, s3Key };
}

export async function confirmProfileImageUpload(
  userId: string,
  kind: 'avatar' | 'banner',
  cdnUrl: string,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true, bannerUrl: true },
  });

  const field = kind === 'avatar' ? 'avatarUrl' : 'bannerUrl';
  const oldUrl = user?.[field];

  await prisma.user.update({ where: { id: userId }, data: { [field]: cdnUrl } });

  if (oldUrl) {
    const oldKey = extractS3KeyFromUrl(oldUrl);
    if (oldKey) void deleteS3Object(oldKey).catch(() => null);
  }
}

export async function searchUsers(
  query: string,
  viewerId?: string,
  limit = 20,
  offset = 0,
): Promise<object[]> {
  const users = await prisma.user.findMany({
    where: {
      status: 'active',
      OR: [
        { username: { contains: query.toLowerCase(), mode: 'insensitive' } },
        { displayName: { contains: query, mode: 'insensitive' } },
      ],
      ...(viewerId && {
        NOT: {
          blockedUsers: { some: { blockedId: viewerId } },
        },
      }),
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      isCreator: true,
      followersCount: true,
    },
    take: limit,
    skip: offset,
    orderBy: { followersCount: 'desc' },
  });

  return users;
}
