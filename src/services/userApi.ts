import { apiClient } from './api';
import { ApiResponse, User } from '../types';

export const userApi = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    const res = await apiClient.get<ApiResponse<User[]>>('/users');
    return res.data;
  },
  create: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const res = await apiClient.post<ApiResponse<User>>('/users', data);
    return res.data;
  },
  update: async (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    const res = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
    return res.data;
  },
};
