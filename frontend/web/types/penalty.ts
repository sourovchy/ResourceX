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
  issuedByStaffId?: number;
  issuedByStaffName?: string;
  createdAt: string;
  appliedAt?: string;
}
