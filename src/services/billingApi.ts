import { apiClient } from './api';
import { ApiResponse, Invoice, Payment } from '../types';

export const billingApi = {
  getInvoices: async (): Promise<ApiResponse<Invoice[]>> => {
    const res = await apiClient.get<ApiResponse<Invoice[]>>('/billing/invoices');
    return res.data;
  },
  getInvoiceById: async (id: string): Promise<ApiResponse<Invoice>> => {
    const res = await apiClient.get<ApiResponse<Invoice>>(`/billing/invoices/${id}`);
    return res.data;
  },
  createInvoice: async (data: Partial<Invoice>): Promise<ApiResponse<Invoice>> => {
    const res = await apiClient.post<ApiResponse<Invoice>>('/billing/invoices', data);
    return res.data;
  },
  updateInvoice: async (id: string, data: Partial<Invoice>): Promise<ApiResponse<Invoice>> => {
    const res = await apiClient.put<ApiResponse<Invoice>>(`/billing/invoices/${id}`, data);
    return res.data;
  },
  getPayments: async (): Promise<ApiResponse<Payment[]>> => {
    const res = await apiClient.get<ApiResponse<Payment[]>>('/billing/payments');
    return res.data;
  },
  recordPayment: async (data: Partial<Payment>): Promise<ApiResponse<Payment>> => {
    const res = await apiClient.post<ApiResponse<Payment>>('/billing/payments', data);
    return res.data;
  },
};
