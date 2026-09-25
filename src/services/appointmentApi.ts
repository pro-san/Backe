import { apiClient } from './api';
import { ApiResponse, Appointment } from '../types';

export const appointmentApi = {
  getAll: async (params?: { date?: string; doctor_id?: string; status?: string }): Promise<ApiResponse<Appointment[]>> => {
    const res = await apiClient.get<ApiResponse<Appointment[]>>('/appointments', { params });
    return res.data;
  },
  getById: async (id: string): Promise<ApiResponse<Appointment>> => {
    const res = await apiClient.get<ApiResponse<Appointment>>(`/appointments/${id}`);
    return res.data;
  },
  create: async (data: Partial<Appointment>): Promise<ApiResponse<Appointment>> => {
    const res = await apiClient.post<ApiResponse<Appointment>>('/appointments', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Appointment>): Promise<ApiResponse<Appointment>> => {
    const res = await apiClient.put<ApiResponse<Appointment>>(`/appointments/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<ApiResponse<{ id: string }>> => {
    const res = await apiClient.delete<ApiResponse<{ id: string }>>(`/appointments/${id}`);
    return res.data;
  },
};
