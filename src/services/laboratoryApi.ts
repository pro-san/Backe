import { apiClient } from './api';
import { ApiResponse, LabTest, LabOrder, LabResult } from '../types';

export const laboratoryApi = {
  getTests: async (): Promise<ApiResponse<LabTest[]>> => {
    const res = await apiClient.get<ApiResponse<LabTest[]>>('/laboratory/tests');
    return res.data;
  },
  createTest: async (data: Partial<LabTest>): Promise<ApiResponse<LabTest>> => {
    const res = await apiClient.post<ApiResponse<LabTest>>('/laboratory/tests', data);
    return res.data;
  },
  getOrders: async (): Promise<ApiResponse<LabOrder[]>> => {
    const res = await apiClient.get<ApiResponse<LabOrder[]>>('/laboratory/orders');
    return res.data;
  },
  createOrder: async (data: Partial<LabOrder>): Promise<ApiResponse<LabOrder>> => {
    const res = await apiClient.post<ApiResponse<LabOrder>>('/laboratory/orders', data);
    return res.data;
  },
  getResults: async (orderId?: string): Promise<ApiResponse<LabResult[]>> => {
    const res = await apiClient.get<ApiResponse<LabResult[]>>('/laboratory/results', {
      params: orderId ? { order_id: orderId } : undefined,
    });
    return res.data;
  },
  recordResult: async (data: Partial<LabResult>): Promise<ApiResponse<LabResult>> => {
    const res = await apiClient.post<ApiResponse<LabResult>>('/laboratory/results', data);
    return res.data;
  },
};
