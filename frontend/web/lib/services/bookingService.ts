import api from "../api";
import { BookingResponse } from "../../types/booking";

export const bookingService = {
  getAllBookings: async (): Promise<BookingResponse[]> => {
    const response = await api.get<BookingResponse[]>("/bookings");
    return response.data;
  },

  getMyBookings: async (): Promise<BookingResponse[]> => {
    const response = await api.get<BookingResponse[]>("/bookings/me");
    return response.data;
  },

  getRequestsForMyListings: async (): Promise<BookingResponse[]> => {
    const response = await api.get<BookingResponse[]>("/bookings/requests");
    return response.data;
  },

  createBooking: async (bookingData: {
    itemId: number;
    startDate: string;
    endDate: string;
  }): Promise<BookingResponse> => {
    const response = await api.post<BookingResponse>("/bookings", bookingData);
    return response.data;
  },

  approveBooking: async (bookingId: number): Promise<BookingResponse> => {
    const response = await api.post<BookingResponse>(`/bookings/${bookingId}/approve`);
    return response.data;
  },

  rejectBooking: async (bookingId: number): Promise<BookingResponse> => {
    const response = await api.post<BookingResponse>(`/bookings/${bookingId}/reject`);
    return response.data;
  },

  cancelBooking: async (bookingId: number): Promise<BookingResponse> => {
    const response = await api.post<BookingResponse>(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  completeBooking: async (bookingId: number): Promise<BookingResponse> => {
    const response = await api.post<BookingResponse>(`/bookings/${bookingId}/complete`);
    return response.data;
  },
};
