import { apiClient } from './api';
import { ApiResponse, Department } from '../types';

export const departmentApi = {
  getAll: async (): Promise<ApiResponse<Department[]>> => {
    const res = await apiClient.get<ApiResponse<Department[]>>('/departments');
    return res.data;
  },
  getById: async (id: string): Promise<ApiResponse<Department>> => {
    const res = await apiClient.get<ApiResponse<Department>>(`/departments/${id}`);
    return res.data;
  },
  create: async (data: Partial<Department>): Promise<ApiResponse<Department>> => {
    const res = await apiClient.post<ApiResponse<Department>>('/departments', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Department>): Promise<ApiResponse<Department>> => {
    const res = await apiClient.put<ApiResponse<Department>>(`/departments/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<ApiResponse<{ id: string }>> => {
    const res = await apiClient.delete<ApiResponse<{ id: string }>>(`/departments/${id}`);
    return res.data;
  },
};
