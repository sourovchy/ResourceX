import { UserResponse } from "./user";

export type DisputeStatus = "PENDING" | "RESOLVED" | "REJECTED";

export interface DisputeResponse {
  disputeId: number;
  bookingId: number;
  reporter?: UserResponse;
  status: DisputeStatus;
  reason: string;
  resolution?: string;
  resolvedBy?: UserResponse;
  createdAt: string;
  resolvedAt?: string;
  description?: string;
}
