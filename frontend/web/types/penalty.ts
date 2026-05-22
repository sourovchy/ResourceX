export type PenaltyStatus = "PENDING" | "APPLIED" | "WAIVED";

export interface PenaltyResponse {
  penaltyId: number;
  userId: number;
  userName: string;
  bookingId?: number;
  disputeId?: number;
  amount: number;
  reason: string;
  status: PenaltyStatus;
  issuedByUserId?: number;
  issuedByUserName?: string;
  createdAt: string;
  appliedAt?: string;
}
