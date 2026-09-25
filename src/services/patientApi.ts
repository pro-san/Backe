import { apiClient } from './api';
import { ApiResponse, Patient } from '../types';

export const patientApi = {
  getAll: async (params?: { search?: string; page?: number; per_page?: number }): Promise<ApiResponse<Patient[]>> => {
    const res = await apiClient.get<ApiResponse<Patient[]>>('/patients', { params });
    return res.data;
  },
  getById: async (id: string): Promise<ApiResponse<Patient>> => {
    const res = await apiClient.get<ApiResponse<Patient>>(`/patients/${id}`);
    return res.data;
  },
  create: async (data: Partial<Patient>): Promise<ApiResponse<Patient>> => {
    const res = await apiClient.post<ApiResponse<Patient>>('/patients', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Patient>): Promise<ApiResponse<Patient>> => {
    const res = await apiClient.put<ApiResponse<Patient>>(`/patients/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<ApiResponse<{ id: string }>> => {
    const res = await apiClient.delete<ApiResponse<{ id: string }>>(`/patients/${id}`);
    return res.data;
  },
};
