import { v4 as uuidv4 } from 'uuid';
import { buildS3Key, buildCdnUrl, getPresignedUploadUrl, deleteS3Object } from '../lib/storage/s3';
import { AppError } from '../middleware/error.middleware';
import { UPLOAD } from '../config/constants';

export type MediaKind = 'image' | 'video';

export interface MediaUploadRequest {
  userId: string;
  contentType: string;
  folder: 'posts' | 'listings' | 'thumbnails';
}

export interface MediaUploadSlot {
  uploadId: string;
  uploadUrl: string;
  cdnUrl: string;
  s3Key: string;
  contentType: string;
  kind: MediaKind;
}

const ALLOWED_IMAGES = new Set(UPLOAD.ALLOWED_IMAGE_TYPES);
const ALLOWED_VIDEOS = new Set(UPLOAD.ALLOWED_VIDEO_TYPES);

function resolveKind(contentType: string): MediaKind {
  if (ALLOWED_IMAGES.has(contentType)) return 'image';
  if (ALLOWED_VIDEOS.has(contentType)) return 'video';
  throw new AppError(
    400,
    'INVALID_FILE_TYPE',
    `File type "${contentType}" is not allowed. Accepted: JPEG, PNG, WebP, GIF, MP4, MOV, WebM`,
  );
}

export async function requestMediaUpload(req: MediaUploadRequest): Promise<MediaUploadSlot> {
  const kind = resolveKind(req.contentType);

  const ext = req.contentType.split('/')[1]?.replace('quicktime', 'mov') ?? 'bin';
  const s3Key = buildS3Key(req.folder, req.userId, ext);
  const cdnUrl = buildCdnUrl(s3Key);

  // Presigned URL expires in 10 min for videos (larger), 5 min for images
  const expiresIn = kind === 'video' ? 600 : 300;
  const uploadUrl = await getPresignedUploadUrl(s3Key, req.contentType, expiresIn);

  return {
    uploadId: uuidv4(),
    uploadUrl,
    cdnUrl,
    s3Key,
    contentType: req.contentType,
    kind,
  };
}

export async function requestMultipleMediaUploads(
  userId: string,
  files: Array<{ contentType: string }>,
  folder: 'posts' | 'listings',
): Promise<MediaUploadSlot[]> {
  if (files.length === 0) throw new AppError(400, 'NO_FILES', 'At least one file is required');
  if (files.length > 10) throw new AppError(400, 'TOO_MANY_FILES', 'Maximum 10 files per post');

  return Promise.all(
    files.map((f) => requestMediaUpload({ userId, contentType: f.contentType, folder })),
  );
}

export async function deleteMediaAssets(s3Keys: string[]): Promise<void> {
  await Promise.allSettled(s3Keys.map((key) => deleteS3Object(key)));
}
