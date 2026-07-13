import api from '../api/axios';
import type { ApiResponse, User, Car } from '../types/index';

export const adminService = {
  getStats: async () => {
    const res = await api.get<ApiResponse<{ stats: any }>>('/admin/stats');
    return res.data.data.stats;
  },

  getAllUsers: async (page = 1, limit = 20) => {
    const res = await api.get<ApiResponse<{ users: User[]; pagination: any }>>('/admin/users', { params: { page, limit } });
    return res.data.data;
  },

  updateUser: async (id: string, data: { role?: string; accountStatus?: string }) => {
    const res = await api.patch<ApiResponse<{ user: User }>>(`/admin/users/${id}`, data);
    return res.data.data.user;
  },

  deleteUser: async (id: string) => {
    await api.delete(`/admin/users/${id}`);
  },

  getAllCars: async (page = 1, limit = 20, approved?: boolean) => {
    const params: any = { page, limit };
    if (approved !== undefined) params.approved = approved;
    const res = await api.get<ApiResponse<{ cars: Car[]; pagination: any }>>('/admin/cars', { params });
    return res.data.data;
  },

  approveCar: async (id: string) => {
    const res = await api.patch<ApiResponse<{ car: Car }>>(`/admin/cars/${id}/approve`);
    return res.data.data.car;
  },

  rejectCar: async (id: string) => {
    const res = await api.patch<ApiResponse<{ car: Car }>>(`/admin/cars/${id}/reject`);
    return res.data.data.car;
  },

  deleteCar: async (id: string) => {
    await api.delete(`/cars/${id}`);
  },

  getAllBookings: async (page = 1, limit = 20, status?: string) => {
    const params: any = { page, limit };
    if (status) params.status = status;
    const res = await api.get<ApiResponse<{ bookings: any[]; pagination: any }>>('/admin/bookings', { params });
    return res.data.data;
  },
};
