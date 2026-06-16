export type TransactionType =
  | 'coin_purchase'
  | 'gift_sent'
  | 'gift_received'
  | 'marketplace_purchase'
  | 'marketplace_sale'
  | 'withdrawal'
  | 'tournament_entry'
  | 'tournament_prize'
  | 'refund';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed';

export interface Wallet {
  id: string;
  userId: string;
  coinBalance: number;
  earningsBalanceUsd: number;
  lifetimeEarningsUsd: number;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  status: TransactionStatus;
  coinAmount: number | null;
  usdAmount: number | null;
  description: string;
  referenceId: string | null;
  createdAt: string;
}

export interface CoinPackage {
  id: string;
  coins: number;
  priceUsd: number;
  bonusCoins: number;
  isPopular: boolean;
}
