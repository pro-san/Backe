import { apiClient } from './api';
import { ApiResponse, Prescription } from '../types';

export const prescriptionApi = {
  getAll: async (patientId?: string): Promise<ApiResponse<Prescription[]>> => {
    const res = await apiClient.get<ApiResponse<Prescription[]>>('/prescriptions', {
      params: patientId ? { patient_id: patientId } : undefined,
    });
    return res.data;
  },
  getById: async (id: string): Promise<ApiResponse<Prescription>> => {
    const res = await apiClient.get<ApiResponse<Prescription>>(`/prescriptions/${id}`);
    return res.data;
  },
  create: async (data: Partial<Prescription>): Promise<ApiResponse<Prescription>> => {
    const res = await apiClient.post<ApiResponse<Prescription>>('/prescriptions', data);
    return res.data;
  },
};
