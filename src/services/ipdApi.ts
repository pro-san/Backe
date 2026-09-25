import { apiClient } from './api';
import { ApiResponse, Admission, Ward, Bed } from '../types';

export const ipdApi = {
  getAdmissions: async (): Promise<ApiResponse<Admission[]>> => {
    const res = await apiClient.get<ApiResponse<Admission[]>>('/ipd/admissions');
    return res.data;
  },
  getAdmissionById: async (id: string): Promise<ApiResponse<Admission>> => {
    const res = await apiClient.get<ApiResponse<Admission>>(`/ipd/admissions/${id}`);
    return res.data;
  },
  createAdmission: async (data: Partial<Admission>): Promise<ApiResponse<Admission>> => {
    const res = await apiClient.post<ApiResponse<Admission>>('/ipd/admissions', data);
    return res.data;
  },
  getWards: async (): Promise<ApiResponse<Ward[]>> => {
    const res = await apiClient.get<ApiResponse<Ward[]>>('/ipd/wards');
    return res.data;
  },
  getBeds: async (): Promise<ApiResponse<Bed[]>> => {
    const res = await apiClient.get<ApiResponse<Bed[]>>('/ipd/beds');
    return res.data;
  },
  updateBed: async (id: string, data: Partial<Bed>): Promise<ApiResponse<Bed>> => {
    const res = await apiClient.put<ApiResponse<Bed>>(`/ipd/beds/${id}`, data);
    return res.data;
  },
  dischargePatient: async (data: { admission_id: string; bed_number?: string; notes?: string }): Promise<ApiResponse<void>> => {
    const res = await apiClient.post<ApiResponse<void>>('/ipd/discharge', data);
    return res.data;
  },
};
