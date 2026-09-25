import { apiClient } from './api';
import { ApiResponse, Doctor } from '../types';

export const doctorApi = {
  getAll: async (params?: { search?: string; department_id?: string }): Promise<ApiResponse<Doctor[]>> => {
    const res = await apiClient.get<ApiResponse<Doctor[]>>('/doctors', { params });
    return res.data;
  },
  getById: async (id: string): Promise<ApiResponse<Doctor>> => {
    const res = await apiClient.get<ApiResponse<Doctor>>(`/doctors/${id}`);
    return res.data;
  },
  create: async (data: Partial<Doctor>): Promise<ApiResponse<Doctor>> => {
    const res = await apiClient.post<ApiResponse<Doctor>>('/doctors', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Doctor>): Promise<ApiResponse<Doctor>> => {
    const res = await apiClient.put<ApiResponse<Doctor>>(`/doctors/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<ApiResponse<{ id: string }>> => {
    const res = await apiClient.delete<ApiResponse<{ id: string }>>(`/doctors/${id}`);
    return res.data;
  },
};
