import api from "../api/axios";
import type { Car, ApiResponse } from "../types/index";

export interface CarsPage {
  cars: Car[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export const carService = {
  getAll: async (params?: Record<string, any>): Promise<CarsPage> => {
    const res = await api.get<ApiResponse<{ cars: Car[]; pagination: CarsPage["pagination"] }>>("/cars", { params });
    return {
      cars: res.data.data?.cars ?? [],
      pagination: res.data.data?.pagination ?? { total: 0, page: 1, limit: 10, totalPages: 1 },
    };
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<{ car: Car }>>(`/cars/${id}`);
    return res.data.data.car;
  },

  getByLender: async (lenderId: string) => {
    const res = await api.get<ApiResponse<{ cars: Car[] }>>(
      `/cars/lender/${lenderId}`,
    );
    return res.data.data.cars;
  },

  create: async (carData: any) => {
    const res = await api.post<ApiResponse<{ car: Car }>>("/cars", carData);
    return res.data.data.car;
  },

  update: async (id: string, carData: any) => {
    const res = await api.patch<ApiResponse<{ car: Car }>>(
      `/cars/${id}`,
      carData,
    );
    return res.data.data.car;
  },

  delete: async (id: string) => {
    await api.delete(`/cars/${id}`);
  },

  // Bookings related to cars
  reserve: async (
    carId: string,
    bookingData: { startDate: string; endDate: string },
  ) => {
    const res = await api.post<ApiResponse<any>>(
      `/bookings/car/${carId}`,
      bookingData,
    );
    return res.data.data;
  },

  checkAvailability: async (carId: string, startDate: string, endDate: string) => {
    const res = await api.get<ApiResponse<{ available: boolean; carStatus: string; conflictingDates: { startDate: string; endDate: string } | null }>>(`/cars/${carId}/availability`, { params: { startDate, endDate } });
    return res.data.data;
  },

  search: async (q: string) => {
    const res = await api.get<ApiResponse<{ brands: string[]; models: string[]; cities: string[] }>>('/cars/search', { params: { q } });
    return res.data.data;
  },

  // Image uploads
  uploadImages: async (carId: string, formData: FormData) => {
    const res = await api.post<ApiResponse<any>>(
      `/cars/${carId}/images`,
      formData,
    );
    return res.data.data;
  },
};
