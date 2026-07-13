import api from '../api/axios';
import type { ApiResponse } from '../types/index';

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  reference: string;
  status: 'pending' | 'successful' | 'failed';
  provider: string;
  paidAt: string | null;
  createdAt: string;
}

export const paymentService = {
  initiate: async (bookingId: string) => {
    const res = await api.post<ApiResponse<{ authorizationUrl: string; reference: string; accessCode: string }>>(`/payments/initiate/${bookingId}`);
    return res.data.data;
  },

  verify: async (reference: string) => {
    const res = await api.get<ApiResponse<{ booking: any }>>(`/payments/verify/${reference}`);
    return res.data.data;
  },

  getByBooking: async (bookingId: string) => {
    const res = await api.get<ApiResponse<{ payment: Payment }>>(`/payments/booking/${bookingId}`);
    return res.data.data.payment;
  },
};
