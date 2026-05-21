export type UserStatus = "ACTIVE" | "PENDING_VERIFICATION" | "PENDING_APPROVAL" | "REJECTED" | "SUSPENDED" | "BANNED";

export interface UserResponse {
  userId: number;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  university?: string;
  department?: string;
  trustScore?: number;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  status?: UserStatus;
  roles?: string[];
  createdAt?: string;
}

export interface PendingUserResponse {
  pendingUserId: number;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  university?: string;
  department?: string;
  idCardDataUrl?: string;
  status?: string;
  createdAt?: string;
}
