import api from '../api/axios';
import type { ApiResponse } from '../types/index';

export const favoriteService = {
  getFavorites: async (): Promise<string[]> => {
    const res = await api.get<ApiResponse<{ favorites: string[] }>>('/users/favorites');
    return res.data.data.favorites;
  },

  addFavorite: async (carId: string): Promise<void> => {
    await api.post(`/users/favorites/${carId}`);
  },

  removeFavorite: async (carId: string): Promise<void> => {
    await api.delete(`/users/favorites/${carId}`);
  },
};
