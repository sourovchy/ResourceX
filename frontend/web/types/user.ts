export type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED";

export interface StudentProfileResponse {
  studentId: string;
  phone: string;
  university?: string | null;
  department?: string | null;
  trustScore: number;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface UserResponse {
  userId: number;
  name: string;
  email: string;
  status?: UserStatus;
  studentProfile?: StudentProfileResponse | null;
  roles?: string[];
  createdAt?: string;
}

export interface PendingUserResponse {
  id: number;
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
