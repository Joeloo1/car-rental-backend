import api from '../api/axios';
import type { Car, ApiResponse } from '../types';

export const carService = {
  getAll: async (params?: Record<string, any>) => {
    const res = await api.get<ApiResponse<{ cars: Car[] }>>('/cars', { params });
    return res.data.data.cars;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<{ car: Car }>>(`/cars/${id}`);
    return res.data.data.car;
  },

  getByLender: async (lenderId: string) => {
    const res = await api.get<ApiResponse<{ cars: Car[] }>>(`/cars/lender/${lenderId}`);
    return res.data.data.cars;
  },

  create: async (carData: any) => {
    const res = await api.post<ApiResponse<{ car: Car }>>('/cars', carData);
    return res.data.data.car;
  },

  update: async (id: string, carData: any) => {
    const res = await api.patch<ApiResponse<{ car: Car }>>(`/cars/${id}`, carData);
    return res.data.data.car;
  },

  delete: async (id: string) => {
    await api.delete(`/cars/${id}`);
  },

  // Bookings related to cars
  reserve: async (carId: string, bookingData: { startDate: string; endDate: string }) => {
    const res = await api.post<ApiResponse<any>>(`/bookings/car/${carId}`, bookingData);
    return res.data.data;
  },

  // Image uploads
  uploadImages: async (carId: string, formData: FormData) => {
    const res = await api.post<ApiResponse<any>>(`/cars/${carId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  }
};

