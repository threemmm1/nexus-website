export type UserRole = 'user' | 'creator' | 'seller' | 'moderator' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'banned' | 'pending_verification';

export interface User {
  id: string;
  email: string;
  phone: string | null;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  isCreator: boolean;
  isSeller: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  isFollowing?: boolean;
  isFollowedBy?: boolean;
  isBlocked?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
