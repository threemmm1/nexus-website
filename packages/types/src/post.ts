export type MediaType = 'image' | 'video';
export type PostStatus = 'processing' | 'active' | 'removed' | 'flagged';

export interface MediaAsset {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  type: MediaType;
  width: number | null;
  height: number | null;
  duration: number | null;
  size: number;
}

export interface Post {
  id: string;
  authorId: string;
  caption: string | null;
  media: MediaAsset[];
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  body: string;
  likesCount: number;
  repliesCount: number;
  createdAt: string;
}
