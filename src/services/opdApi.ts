import { apiClient } from './api';
import { ApiResponse, OPDQueueItem, Consultation } from '../types';

export const opdApi = {
  getQueue: async (): Promise<ApiResponse<OPDQueueItem[]>> => {
    const res = await apiClient.get<ApiResponse<OPDQueueItem[]>>('/opd/queue');
    return res.data;
  },
  addToQueue: async (data: Partial<OPDQueueItem>): Promise<ApiResponse<OPDQueueItem>> => {
    const res = await apiClient.post<ApiResponse<OPDQueueItem>>('/opd/queue', data);
    return res.data;
  },
  recordConsultation: async (data: Partial<Consultation>): Promise<ApiResponse<Consultation>> => {
    const res = await apiClient.post<ApiResponse<Consultation>>('/opd/consultations', data);
    return res.data;
  },
};
