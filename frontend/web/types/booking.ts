import { ItemResponse } from "./item";
import { UserResponse } from "./user";

export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "OVERDUE";

export interface BookingResponse {
  bookingId: number;
  item: ItemResponse;
  renter: UserResponse;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  totalPrice: number;
  createdAt?: string;
  updatedAt?: string;
}
