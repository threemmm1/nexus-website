export type StreamStatus = 'idle' | 'live' | 'ended';

export interface Stream {
  id: string;
  hostId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  category: string;
  tags: string[];
  status: StreamStatus;
  viewerCount: number;
  peakViewerCount: number;
  totalGiftsCoins: number;
  recordingUrl: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
}

export interface StreamMessage {
  id: string;
  streamId: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  body: string;
  isCreator: boolean;
  isModerator: boolean;
  createdAt: string;
}

export interface GiftEvent {
  streamId: string;
  senderId: string;
  senderUsername: string;
  giftId: string;
  giftName: string;
  giftAnimationUrl: string;
  coinValue: number;
}
