import api from '../api/axios';
import type { ApiResponse } from '../types/index';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'message' | 'info' | 'success' | 'warning';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export const notificationService = {
  getAll: async (page = 1, limit = 20) => {
    const res = await api.get<ApiResponse<{ notifications: Notification[]; total: number; totalPages: number }>>('/users/notifications', { params: { page, limit } });
    return res.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await api.get<ApiResponse<{ count: number }>>('/users/notifications/unread-count');
    return res.data.data.count;
  },

  markAsRead: async (id: string) => {
    const res = await api.patch<ApiResponse<any>>(`/users/notifications/${id}/read`);
    return res.data.data;
  },

  markAllAsRead: async () => {
    const res = await api.patch<ApiResponse<any>>('/users/notifications/mark-all-read');
    return res.data.data;
  },

  delete: async (id: string) => {
    await api.delete(`/users/notifications/${id}`);
  },

  deleteAll: async () => {
    await api.delete('/users/notifications');
  },
};
