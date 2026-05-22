import api from "../api";
import { DisputeResponse } from "../../types/dispute";

export const disputeService = {
  getAllDisputes: async (): Promise<DisputeResponse[]> => {
    const response = await api.get<DisputeResponse[]>("/disputes");
    return response.data;
  },

  getDisputeById: async (disputeId: number): Promise<DisputeResponse> => {
    const response = await api.get<DisputeResponse>(`/disputes/${disputeId}`);
    return response.data;
  },

  createDispute: async (disputeData: {
    bookingId: number;
    reason: string;
  }): Promise<DisputeResponse> => {
    const response = await api.post<DisputeResponse>("/disputes", disputeData);
    return response.data;
  },

  resolveDispute: async (
    disputeId: number,
    resolutionData: {
      resolution: string;
      resolvedByUserId: number;
    }
  ): Promise<DisputeResponse> => {
    const response = await api.post<DisputeResponse>(
      `/disputes/${disputeId}/resolve`,
      null,
      {
        params: {
          resolution: resolutionData.resolution,
          userId: resolutionData.resolvedByUserId,
        },
      }
    );
    return response.data;
  },
};
