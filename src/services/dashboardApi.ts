import { apiClient } from './api';
import { ApiResponse, DashboardStatistics } from '../types';

export const dashboardApi = {
  getStatistics: async (): Promise<ApiResponse<DashboardStatistics>> => {
    const res = await apiClient.get<ApiResponse<DashboardStatistics>>('/dashboard/statistics');
    return res.data;
  },
};
