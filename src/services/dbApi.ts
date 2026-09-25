import { apiClient } from './api';

export interface DbStatusResponse {
  type: string;
  connected: boolean;
  readyState: number;
  statusText: string;
  uri: string;
  database: string;
  collections: {
    patients: number;
    doctors: number;
    departments: number;
    appointments: number;
  };
  lastError: string | null;
  timestamp: string;
}

export const dbApi = {
  getStatus: async () => {
    const res = await apiClient.get<{ success: boolean; data: DbStatusResponse }>('/db/status');
    return res.data;
  },
  connect: async (uri: string) => {
    const res = await apiClient.post<{ success: boolean; message: string; data: DbStatusResponse }>('/db/connect', { uri });
    return res.data;
  },
  seed: async () => {
    const res = await apiClient.post<{ success: boolean; message: string; data: DbStatusResponse }>('/db/seed');
    return res.data;
  },
};
