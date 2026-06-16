export type ListingCategory =
  | 'services'
  | 'digital_items'
  | 'gaming_accounts'
  | 'gaming_coaching'
  | 'gaming_items'
  | 'other';

export type ListingStatus = 'draft' | 'active' | 'sold' | 'removed';

export type OrderStatus =
  | 'pending'
  | 'in_progress'
  | 'delivered'
  | 'completed'
  | 'disputed'
  | 'cancelled'
  | 'refunded';

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: ListingCategory;
  priceUsd: number | null;
  priceCoins: number | null;
  images: string[];
  status: ListingStatus;
  averageRating: number;
  totalSales: number;
  createdAt: string;
}

export interface Order {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  priceUsd: number | null;
  priceCoins: number | null;
  buyerNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  rating: number;
  body: string | null;
  createdAt: string;
}
