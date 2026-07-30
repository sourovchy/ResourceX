import { ItemResponse } from "./item";
import { UserResponse } from "./user";

export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "ACTIVE" | "COMPLETED" | "OVERDUE";


export interface BookingResponse {
  bookingId: number;
  item: ItemResponse;
  renter: UserResponse;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  rejectionReason?: string | null;
  totalPrice: number;
  createdAt?: string;
  updatedAt?: string;
}
