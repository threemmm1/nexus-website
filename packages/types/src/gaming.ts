export type TournamentStatus = 'upcoming' | 'open' | 'in_progress' | 'completed' | 'cancelled';
export type TournamentFormat = 'single_elimination' | 'double_elimination' | 'round_robin';

export interface GamingProfile {
  id: string;
  userId: string;
  favoriteGames: string[];
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt: string;
}

export interface Clan {
  id: string;
  name: string;
  tag: string;
  description: string | null;
  logoUrl: string | null;
  ownerId: string;
  memberCount: number;
  isPublic: boolean;
  createdAt: string;
}

export interface Tournament {
  id: string;
  title: string;
  game: string;
  format: TournamentFormat;
  status: TournamentStatus;
  entryFeeCoins: number;
  prizePoolCoins: number;
  maxParticipants: number;
  currentParticipants: number;
  startsAt: string;
  createdAt: string;
}
