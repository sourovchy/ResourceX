export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export interface PaymentResponse {
  paymentId: number;
  bookingId: number;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  transactionRef: string;
  paidAt?: string;
  createdAt: string;
}
