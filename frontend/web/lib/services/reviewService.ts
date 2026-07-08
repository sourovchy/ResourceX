import api from "../api";
import {
  Page,
  ReviewEligibility,
  ReviewResponse,
  ReviewSummary,
} from "../../types/review";

export const reviewService = {
  getReviewsByRevieweeId: async (revieweeId: number): Promise<ReviewResponse[]> => {
    const response = await api.get<ReviewResponse[]>(`/reviews/reviewee/${revieweeId}`);
    return response.data;
  },

  getReviewsByReviewerId: async (reviewerId: number): Promise<ReviewResponse[]> => {
    const response = await api.get<ReviewResponse[]>(`/reviews/reviewer/${reviewerId}`);
    return response.data;
  },

  /** Paginated reviews for a single item (newest first). */
  getItemReviews: async (
    itemId: number,
    page = 0,
    size = 5,
  ): Promise<Page<ReviewResponse>> => {
    const response = await api.get<Page<ReviewResponse>>(`/reviews/item/${itemId}`, {
      params: { page, size },
    });
    return response.data;
  },

  /** Average / total / star distribution for a single item. */
  getItemReviewSummary: async (itemId: number): Promise<ReviewSummary> => {
    const response = await api.get<ReviewSummary>(`/reviews/item/${itemId}/summary`);
    return response.data;
  },

  /** Average / total across everything an owner has received. */
  getOwnerReviewSummary: async (ownerId: number): Promise<ReviewSummary> => {
    const response = await api.get<ReviewSummary>(`/reviews/owner/${ownerId}/summary`);
    return response.data;
  },

  /** Server-side check of whether the current user may review an item. */
  getItemReviewEligibility: async (itemId: number): Promise<ReviewEligibility> => {
    const response = await api.get<ReviewEligibility>(
      `/reviews/item/${itemId}/eligibility`,
    );
    return response.data;
  },

  createReview: async (reviewData: {
    bookingId: number;
    rating: number;
    comment: string;
  }): Promise<ReviewResponse> => {
    const response = await api.post<ReviewResponse>("/reviews", reviewData);
    return response.data;
  },
};
