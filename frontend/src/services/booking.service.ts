import api from '../api/axios';
import type { Booking, ApiResponse } from '../types';

interface DashboardStats {
  totalTrips: number;
  totalEarnings: number;
  activeRentals: number;
  verifiedCars: number;
}

export const bookingService = {
  getMyBookings: async () => {
    const res = await api.get<ApiResponse<{ bookings: Booking[] }>>('/bookings/me');
    return res.data.data.bookings;
  },

  getLenderBookings: async () => {
    const res = await api.get<ApiResponse<{ bookings: Booking[] }>>('/bookings/lender');
    return res.data.data.bookings;
  },

  getDashboardStats: async () => {
    const res = await api.get<ApiResponse<{ stats: DashboardStats }>>('/bookings/stats');
    return res.data.data.stats;
  },

  updateBookingStatus: async (id: string, status: string) => {
    const res = await api.patch<ApiResponse<unknown>>(`/bookings/${id}/status`, { status });
    return res.data.data;
  }
};
