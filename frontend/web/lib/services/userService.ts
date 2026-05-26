import api from "../api";
import { UserResponse, PendingUserResponse } from "../../types/user";

export const userService = {
  getAllUsers: async (): Promise<UserResponse[]> => {
    const response = await api.get<UserResponse[]>("/users");
    return response.data;
  },

  getPendingUsers: async (): Promise<PendingUserResponse[]> => {
    const response = await api.get<PendingUserResponse[]>("/users/pending");
    return response.data;
  },

  approveUser: async (pendingUserId: number): Promise<void> => {
    await api.post(`/users/approve/${pendingUserId}`);
  },

  rejectUser: async (pendingUserId: number, reason?: string): Promise<void> => {
    await api.post(`/users/reject/${pendingUserId}`, { reason });
  },

  blockUser: async (userId: number): Promise<void> => {
    await api.post(`/users/block/${userId}`);
  },

  unblockUser: async (userId: number): Promise<void> => {
    await api.post(`/users/unblock/${userId}`);
  },
};
