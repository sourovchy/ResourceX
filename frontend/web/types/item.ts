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
  status: ItemStatus;
  imageUrls: string[];
  createdAt?: string;
  updatedAt?: string;
}
