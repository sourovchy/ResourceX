import api from "../api";
import { ReviewResponse } from "../../types/review";

export const reviewService = {
  getReviewsByRevieweeId: async (revieweeId: number): Promise<ReviewResponse[]> => {
    const response = await api.get<ReviewResponse[]>(`/reviews/reviewee/${revieweeId}`);
    return response.data;
  },

  getReviewsByReviewerId: async (reviewerId: number): Promise<ReviewResponse[]> => {
    const response = await api.get<ReviewResponse[]>(`/reviews/reviewer/${reviewerId}`);
    return response.data;
  },

  createReview: async (reviewData: {
    bookingId: number;
    revieweeId: number;
    rating: number;
    comment: string;
  }): Promise<ReviewResponse> => {
    const response = await api.post<ReviewResponse>("/reviews", reviewData);
    return response.data;
  },
};
