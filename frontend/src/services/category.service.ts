import api from '../api/axios';
import type { ApiResponse } from '../types';

export interface Category {
  id: number;
  name: string;
}

export const categoryService = {
  getAll: async () => {
    const res = await api.get<ApiResponse<{ categories: Category[] }>>('/category');
    return res.data.data.categories;
  },

  getById: async (id: number) => {
    const res = await api.get<ApiResponse<{ category: Category }>>(`/category/${id}`);
    return res.data.data.category;
  }
};
