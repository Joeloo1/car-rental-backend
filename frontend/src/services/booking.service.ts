import api from '../api/axios';
import type { Booking, ApiResponse } from '../types/index';

interface DashboardStats {
  totalTrips: number;
  totalEarnings: number;
  activeRentals: number;
  verifiedCars: number;
}

export const bookingService = {
  getMyBookings: async (page = 1, limit = 10) => {
    const res = await api.get<ApiResponse<{ data: Booking[]; pagination: any }>>('/bookings/me', { params: { page, limit } });
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<{ booking: Booking }>>(`/bookings/${id}`);
    return res.data.data.booking;
  },

  getLenderBookings: async (page = 1, limit = 10) => {
    const res = await api.get<ApiResponse<{ data: Booking[]; pagination: any }>>('/bookings/lender', { params: { page, limit } });
    return res.data.data;
  },

  getDashboardStats: async () => {
    const res = await api.get<ApiResponse<{ stats: DashboardStats }>>('/bookings/stats');
    return res.data.data.stats;
  },

  updateBookingStatus: async (id: string, status: string) => {
    const res = await api.patch<ApiResponse<unknown>>(`/bookings/${id}/status`, { status });
    return res.data.data;
  },
};
