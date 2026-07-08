import api from "../api";
import {
  TrustSummaryResponse,
} from "../../types/trust";

export const trustService = {
  /** Current user's full trust snapshot (profile + dashboard). */
  getMySummary: async (): Promise<TrustSummaryResponse> => {
    const response = await api.get<TrustSummaryResponse>("/trust/me");
    return response.data;
  },

  /** Trust snapshot for a specific user (self or staff). */
  getSummary: async (userId: number): Promise<TrustSummaryResponse> => {
    const response = await api.get<TrustSummaryResponse>(`/trust/summary/${userId}`);
    return response.data;
  },
};
