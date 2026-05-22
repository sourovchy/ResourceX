import api from "../api";
import { PenaltyResponse } from "../../types/penalty";

export const penaltyService = {
  getAllPenalties: async (): Promise<PenaltyResponse[]> => {
    const response = await api.get<PenaltyResponse[]>("/penalties");
    return response.data;
  },

  getPenaltiesByUserId: async (userId: number): Promise<PenaltyResponse[]> => {
    const response = await api.get<PenaltyResponse[]>(`/penalties/user/${userId}`);
    return response.data;
  },

  createPenalty: async (penaltyData: {
    userId: number;
    bookingId?: number;
    disputeId?: number;
    amount: number;
    reason: string;
    issuedByUserId: number;
  }): Promise<PenaltyResponse> => {
    const response = await api.post<PenaltyResponse>("/penalties", penaltyData);
    return response.data;
  },

  applyPenalty: async (penaltyId: number): Promise<PenaltyResponse> => {
    const response = await api.patch<PenaltyResponse>(`/penalties/${penaltyId}/apply`);
    return response.data;
  },

  waivePenalty: async (penaltyId: number): Promise<PenaltyResponse> => {
    const response = await api.patch<PenaltyResponse>(`/penalties/${penaltyId}/waive`);
    return response.data;
  },
};
