import { AppError } from '../middleware/error.middleware';

export function ensureOwnerOrMod(
  ownerId: string,
  requesterId: string,
  requesterRole: string,
  errorMessage: string,
): void {
  const isOwner = ownerId === requesterId;
  const isMod = requesterRole === 'moderator' || requesterRole === 'admin';
  if (!isOwner && !isMod) {
    throw new AppError(403, 'FORBIDDEN', errorMessage);
  }
}
