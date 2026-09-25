import { apiClient } from './api';
import { ApiResponse, Staff } from '../types';

export const staffApi = {
  getAll: async (role?: string): Promise<ApiResponse<Staff[]>> => {
    const res = await apiClient.get<ApiResponse<Staff[]>>('/staff', {
      params: role ? { role } : undefined,
    });
    return res.data;
  },
  create: async (data: Partial<Staff>): Promise<ApiResponse<Staff>> => {
    const res = await apiClient.post<ApiResponse<Staff>>('/staff', data);
    return res.data;
  },
  delete: async (id: string): Promise<ApiResponse<{ id: string }>> => {
    const res = await apiClient.delete<ApiResponse<{ id: string }>>(`/staff/${id}`);
    return res.data;
  },
};
