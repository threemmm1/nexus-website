import { Router } from 'express';
import { z } from 'zod';
import * as usersController from '../controllers/users.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

export const usersRouter = Router();

const updateProfileSchema = z
  .object({
    displayName: z.string().min(1).max(50).optional(),
    bio: z.string().max(300).optional(),
    website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    location: z.string().max(100).optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: 'At least one field is required',
  });

const usernameSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
});

const contentTypeSchema = z.object({
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
});

const cdnUrlSchema = z.object({
  cdnUrl: z.string().url(),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const searchSchema = z.object({
  q: z.string().min(1).max(100),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

usersRouter.get('/search', validate(searchSchema, 'query'), usersController.searchUsers);
usersRouter.get('/check-username/:username', usersController.checkUsername);
usersRouter.get('/me', authenticate, usersController.getMyProfile);
usersRouter.patch('/me', authenticate, validate(updateProfileSchema), usersController.updateProfile);
usersRouter.patch('/me/username', authenticate, validate(usernameSchema), usersController.changeUsername);
usersRouter.post('/me/avatar/request-upload', authenticate, validate(contentTypeSchema), usersController.requestAvatarUpload);
usersRouter.post('/me/avatar/confirm', authenticate, validate(cdnUrlSchema), usersController.confirmAvatarUpload);
usersRouter.post('/me/banner/request-upload', authenticate, validate(contentTypeSchema), usersController.requestBannerUpload);
usersRouter.post('/me/banner/confirm', authenticate, validate(cdnUrlSchema), usersController.confirmBannerUpload);
usersRouter.get('/me/blocked', authenticate, validate(paginationSchema, 'query'), usersController.getBlockedUsers);

// /:username must come after all /me/* and /search routes to avoid param conflicts
usersRouter.get('/:username', usersController.getProfile);

usersRouter.post('/:userId/follow', authenticate, usersController.followUser);
usersRouter.delete('/:userId/follow', authenticate, usersController.unfollowUser);
usersRouter.delete('/:userId/follower', authenticate, usersController.removeFollower);
usersRouter.get('/:userId/follow-status', authenticate, usersController.getFollowStatus);
usersRouter.get('/:userId/followers', validate(paginationSchema, 'query'), usersController.getFollowers);
usersRouter.get('/:userId/following', validate(paginationSchema, 'query'), usersController.getFollowing);
usersRouter.post('/:userId/block', authenticate, usersController.blockUser);
usersRouter.delete('/:userId/block', authenticate, usersController.unblockUser);
