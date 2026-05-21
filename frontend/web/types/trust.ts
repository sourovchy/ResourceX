export type TrustEventType = "LATE_RETURN" | "GOOD_BEHAVIOR" | "COMPLAINT_UPHELD" | "VERIFICATION_BONUS" | "PENALTY_DEDUCTION" | "SYSTEM_ADJUSTMENT" | "REVIEW_POSITIVE" | "REVIEW_NEGATIVE" | string;

export interface TrustEventResponse {
  trustEventId: number;
  userId: number;
  userName: string;
  eventType: TrustEventType;
  points: number;
  reason: string;
  createdAt: string;
}
