import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env';

export const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export type UploadFolder = 'avatars' | 'banners' | 'posts' | 'listings' | 'gifts' | 'thumbnails';

export function buildS3Key(folder: UploadFolder, userId: string, ext: string): string {
  return `${folder}/${userId}/${uuidv4()}.${ext}`;
}

export function buildCdnUrl(s3Key: string): string {
  return `${env.AWS_CLOUDFRONT_URL}/${s3Key}`;
}

export async function getPresignedUploadUrl(
  s3Key: string,
  contentType: string,
  expiresIn = 300,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: s3Key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn });
}

export async function deleteS3Object(s3Key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: s3Key }),
  );
}

export function extractS3KeyFromUrl(cdnUrl: string): string | null {
  const prefix = env.AWS_CLOUDFRONT_URL + '/';
  if (!cdnUrl.startsWith(prefix)) return null;
  return cdnUrl.slice(prefix.length);
}
