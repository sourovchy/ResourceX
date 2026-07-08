import { UserResponse } from "./user";

export type ItemStatus = "AVAILABLE" | "UNAVAILABLE" | "BLOCKED" | "DELETED";

export interface ItemResponse {
  itemId: number;
  title: string;
  description: string;
  category: string;
  itemCondition: string;
  owner?: UserResponse;
  dailyRate: number;
  deposit?: number | null;
  status: ItemStatus;
  imageUrls: string[];
  createdAt?: string;
  updatedAt?: string;
  availabilityScope?: string;
  rating?: number;
  reviews?: number;
}
