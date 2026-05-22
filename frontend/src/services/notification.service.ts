import api from '../api/axios';
import type { ApiResponse } from '../types';

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
  getAll: async () => {
    const res = await api.get<ApiResponse<{ notifications: Notification[] }>>('/users/notifications');
    return res.data.data.notifications;
  },

  markAsRead: async (id: string) => {
    const res = await api.patch<ApiResponse<any>>(`/users/notifications/${id}/read`);
    return res.data.data;
  },

  markAllAsRead: async () => {
    const res = await api.patch<ApiResponse<any>>('/users/notifications/read-all');
    return res.data.data;
  }
};
