import api from '../api/axios';
import type { ApiResponse, User, Car } from '../types/index';

export const adminService = {
  getAllUsers: async (): Promise<User[]> => {
    const res = await api.get<ApiResponse<{ users: User[] }>>('/admin/users');
    return res.data.data?.users || (res.data.data as any) || [];
  },

  updateUser: async (id: string, data: { role?: string; isVerified?: boolean }) => {
    const res = await api.patch<ApiResponse<{ user: User }>>(`/admin/users/${id}`, data);
    return res.data.data.user;
  },

  deleteUser: async (id: string) => {
    await api.delete(`/admin/users/${id}`);
  },

  getAllCars: async (): Promise<Car[]> => {
    const res = await api.get<ApiResponse<{ cars: Car[] }>>('/cars', { params: { limit: 100 } });
    return res.data.data?.cars || (res.data.data as any) || [];
  },

  deleteCar: async (id: string) => {
    await api.delete(`/cars/${id}`);
  },
};
