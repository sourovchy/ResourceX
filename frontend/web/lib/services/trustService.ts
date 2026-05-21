import api from "../api";
import { TrustEventResponse, TrustEventType } from "../../types/trust";

export const trustService = {
  getAllTrustEvents: async (): Promise<TrustEventResponse[]> => {
    const response = await api.get<TrustEventResponse[]>("/trust/events");
    return response.data;
  },

  getTrustEventsByUserId: async (userId: number): Promise<TrustEventResponse[]> => {
    const response = await api.get<TrustEventResponse[]>(`/trust/events/user/${userId}`);
    return response.data;
  },

  getTrustScore: async (userId: number): Promise<number> => {
    const response = await api.get<number>(`/trust/score/user/${userId}`);
    return response.data;
  },

  createTrustEvent: async (trustEventData: {
    userId: number;
    eventType: TrustEventType;
    points: number;
    reason: string;
  }): Promise<TrustEventResponse> => {
    const response = await api.post<TrustEventResponse>("/trust/events", trustEventData);
    return response.data;
  },
};
