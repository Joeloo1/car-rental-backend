import api from '../api/axios';
import type { ApiResponse } from '../types/index';

export const reviewService = {
  create: async (carId: string, rating: number, comment: string) => {
    const res = await api.post<ApiResponse<any>>(`/cars/${carId}/reviews`, {
      rating,
      comment,
    });
    return res.data.data.review;
  },

  getForCar: async (carId: string) => {
    const res = await api.get<ApiResponse<{ reviews: any[] }>>(`/cars/${carId}/reviews`);
    return res.data.data.reviews;
  },
};
