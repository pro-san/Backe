import { apiClient } from './api';
import { ApiResponse, Medicine } from '../types';

export const pharmacyApi = {
  getMedicines: async (search?: string): Promise<ApiResponse<Medicine[]>> => {
    const res = await apiClient.get<ApiResponse<Medicine[]>>('/pharmacy/medicines', {
      params: search ? { search } : undefined,
    });
    return res.data;
  },
  createMedicine: async (data: Partial<Medicine>): Promise<ApiResponse<Medicine>> => {
    const res = await apiClient.post<ApiResponse<Medicine>>('/pharmacy/medicines', data);
    return res.data;
  },
  updateMedicine: async (id: string, data: Partial<Medicine>): Promise<ApiResponse<Medicine>> => {
    const res = await apiClient.put<ApiResponse<Medicine>>(`/pharmacy/medicines/${id}`, data);
    return res.data;
  },
  recordSale: async (data: any): Promise<ApiResponse<any>> => {
    const res = await apiClient.post<ApiResponse<any>>('/pharmacy/sales', data);
    return res.data;
  },
};
