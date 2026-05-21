import api from "../api";
import { UserResponse, PendingUserResponse } from "../../types/user";

export const userService = {
  getAllUsers: async (): Promise<UserResponse[]> => {
    const response = await api.get<UserResponse[]>("/admin/users");
    // If not found in admin space, fall back/try users list
    return response.data;
  },

  getPendingUsers: async (): Promise<PendingUserResponse[]> => {
    const response = await api.get<PendingUserResponse[]>("/admin/pending-users");
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
