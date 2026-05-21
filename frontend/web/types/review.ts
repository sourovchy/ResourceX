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
