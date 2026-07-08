import { UserResponse } from "./user";

export interface ReviewResponse {
  reviewId: number;
  bookingId: number;
  reviewer: UserResponse;
  reviewee: UserResponse;
  rating: number;
  comment: string;
  createdAt: string;
}

/** Aggregate rating snapshot for an item or owner. */
export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  /** Star value (1–5) → count. */
  distribution: Record<string, number>;
  completedRentals?: number;
}

/** Server-side verdict on whether the current user may review an item. */
export interface ReviewEligibility {
  eligible: boolean;
  bookingId: number | null;
  alreadyReviewed: boolean;
  ownItem: boolean;
  reason: string | null;
}

/** Spring Data page envelope. */
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
