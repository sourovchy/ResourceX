import api from "../api";
import { UserResponse, PendingUserResponse } from "../../types/user";

export const userService = {
  getAllUsers: async (page = 0, size = 10): Promise<{ content: UserResponse[]; totalPages: number }> => {
    const response = await api.get(`/users?page=${page}&size=${size}`);
    return response.data;
  },

  getPendingUsers: async (page = 0, size = 10): Promise<{ content: PendingUserResponse[]; totalPages: number }> => {
    const response = await api.get(`/admin/pending-users?page=${page}&size=${size}`);
    return response.data;
  },

  approveUser: async (pendingUserId: number): Promise<void> => {
    await api.post(`/admin/approve/${pendingUserId}`);
  },

  rejectUser: async (pendingUserId: number, reason?: string): Promise<void> => {
    await api.post(`/admin/reject/${pendingUserId}`, { reason });
  },

  blockUser: async (userId: number): Promise<void> => {
    await api.post(`/admin/block/${userId}`);
  },

  unblockUser: async (userId: number): Promise<void> => {
    await api.post(`/admin/unblock/${userId}`);
  },
};
