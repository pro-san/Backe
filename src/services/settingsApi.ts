import { apiClient } from './api';
import { ApiResponse, NotificationItem, ActivityLog, HospitalSettings } from '../types';

export const reportApi = {
  getSummary: async (params?: { start_date?: string; end_date?: string; department?: string }) => {
    const res = await apiClient.get('/dashboard/statistics', { params });
    return res.data;
  },
};

export const notificationApi = {
  getAll: async (): Promise<ApiResponse<NotificationItem[]>> => {
    const res = await apiClient.get<ApiResponse<NotificationItem[]>>('/notifications');
    return res.data;
  },
  markAsRead: async (id: string): Promise<ApiResponse<void>> => {
    const res = await apiClient.put<ApiResponse<void>>(`/notifications/${id}`);
    return res.data;
  },
  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    const res = await apiClient.put<ApiResponse<void>>('/notifications/mark-all-read');
    return res.data;
  },
};

export const activityLogApi = {
  getAll: async (): Promise<ApiResponse<ActivityLog[]>> => {
    const res = await apiClient.get<ApiResponse<ActivityLog[]>>('/activity-logs');
    return res.data;
  },
};

export const settingsApi = {
  getHospitalSettings: async (): Promise<ApiResponse<HospitalSettings>> => {
    const res = await apiClient.get<ApiResponse<HospitalSettings>>('/settings');
    return res.data;
  },
  updateHospitalSettings: async (data: Partial<HospitalSettings>): Promise<ApiResponse<HospitalSettings>> => {
    const res = await apiClient.put<ApiResponse<HospitalSettings>>('/settings', data);
    return res.data;
  },
};
