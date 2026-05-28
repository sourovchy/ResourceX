import { UserResponse } from "./user";

export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "CLOSED";

export interface DisputeResponse {
  disputeId: number;
  bookingId: number;
  reporter?: UserResponse;
  status: DisputeStatus;
  reason: string;
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}
