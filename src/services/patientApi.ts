import { apiClient } from './api';
import { ApiResponse, Patient, Gender, BloodGroup, MaritalStatus } from '../types';

/**
 * Filter and query options for fetching patient lists.
 */
export interface PatientQueryParams {
  search?: string;
  gender?: Gender | 'ALL' | string;
  blood_group?: BloodGroup | 'ALL' | string;
  status?: 'Active' | 'Inactive' | 'Deceased' | 'ALL' | string;
  page?: number;
  per_page?: number;
  limit?: number;
  sort_by?: keyof Patient | string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Payload for registering a new patient record.
 */
export type PatientCreatePayload = Partial<Patient>;

/**
 * Payload for updating an existing patient record.
 */
export type PatientUpdatePayload = Partial<Omit<Patient, 'id' | 'created_at'>> | Partial<Patient>;

/**
 * Standardized patient responses conforming to API contracts.
 */
export type PatientListResponse = ApiResponse<Patient[]>;
export type PatientDetailResponse = ApiResponse<Patient>;
export type PatientDeleteResponse = ApiResponse<{ id: string; patient_id?: string }>;

/**
 * Defensive utility to extract a clean Patient array from various API response envelopes
 * (e.g., ApiResponse<Patient[]>, PaginatedResponse, or direct arrays).
 */
export function extractPatientList(response: any): Patient[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.items)) return response.data.items;
  if (Array.isArray(response.data?.patients)) return response.data.patients;
  return [];
}

/**
 * Defensive utility to extract a single Patient object from an API response envelope.
 */
export function extractPatient(response: any): Patient | null {
  if (!response) return null;
  if (response.id && response.patient_id) return response as Patient;
  if (response.data && response.data.id) return response.data as Patient;
  return null;
}

/**
 * Patient API service built on top of the centralized axios client (`apiClient`).
 * Handles GET, POST, PUT, and DELETE operations with response normalization and error handling.
 */
export const patientApi = {
  /**
   * Retrieve a list of patients with optional filtering, search, and pagination.
   * GET /patients
   */
  getAll: async (params?: PatientQueryParams): Promise<PatientListResponse> => {
    try {
      // Clean query parameters: omit undefined, empty, or 'ALL' filter tokens
      const sanitizedParams: Record<string, any> = {};
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== '' && val !== 'ALL') {
            sanitizedParams[key] = val;
          }
        });
      }

      const response = await apiClient.get<PatientListResponse>('/patients', {
        params: sanitizedParams,
      });

      // Ensure response conforms to ApiResponse structure
      const rawData = response.data;
      if (rawData && typeof rawData === 'object' && 'data' in rawData) {
        return rawData;
      }

      // Fallback for direct array responses
      return {
        success: true,
        message: 'Patients retrieved successfully',
        data: Array.isArray(rawData) ? rawData : [],
      };
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to retrieve patient records';
      throw new Error(message);
    }
  },

  /**
   * Retrieve a single patient by primary ID or unique patient medical ID.
   * GET /patients/:id
   */
  getById: async (id: string): Promise<PatientDetailResponse> => {
    if (!id || typeof id !== 'string') {
      throw new Error('A valid patient ID must be provided');
    }

    try {
      const encodedId = encodeURIComponent(id.trim());
      const response = await apiClient.get<PatientDetailResponse>(`/patients/${encodedId}`);

      const rawData = response.data;
      if (rawData && typeof rawData === 'object' && 'data' in rawData) {
        return rawData;
      }

      return {
        success: true,
        message: 'Patient retrieved successfully',
        data: rawData as Patient,
      };
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || `Failed to fetch patient record #${id}`;
      throw new Error(message);
    }
  },

  /**
   * Register a new patient in the hospital database.
   * POST /patients
   */
  create: async (payload: PatientCreatePayload): Promise<PatientDetailResponse> => {
    if (!payload.first_name || !payload.last_name) {
      throw new Error('Patient first name and last name are required');
    }

    try {
      const response = await apiClient.post<PatientDetailResponse>('/patients', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const rawData = response.data;
      if (rawData && typeof rawData === 'object' && 'data' in rawData) {
        return rawData;
      }

      return {
        success: true,
        message: 'Patient registered successfully',
        data: rawData as Patient,
      };
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to register patient';
      throw new Error(message);
    }
  },

  /**
   * Update an existing patient record.
   * PUT /patients/:id
   */
  update: async (id: string, payload: PatientUpdatePayload): Promise<PatientDetailResponse> => {
    if (!id || typeof id !== 'string') {
      throw new Error('A valid patient ID must be provided for update');
    }

    try {
      const encodedId = encodeURIComponent(id.trim());
      const response = await apiClient.put<PatientDetailResponse>(`/patients/${encodedId}`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const rawData = response.data;
      if (rawData && typeof rawData === 'object' && 'data' in rawData) {
        return rawData;
      }

      return {
        success: true,
        message: 'Patient record updated successfully',
        data: rawData as Patient,
      };
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || `Failed to update patient #${id}`;
      throw new Error(message);
    }
  },

  /**
   * Delete or archive a patient record.
   * DELETE /patients/:id
   */
  delete: async (id: string): Promise<PatientDeleteResponse> => {
    if (!id || typeof id !== 'string') {
      throw new Error('A valid patient ID must be provided for deletion');
    }

    try {
      const encodedId = encodeURIComponent(id.trim());
      const response = await apiClient.delete<PatientDeleteResponse>(`/patients/${encodedId}`);

      const rawData = response.data;
      if (rawData && typeof rawData === 'object' && 'data' in rawData) {
        return rawData;
      }

      return {
        success: true,
        message: 'Patient deleted successfully',
        data: { id },
      };
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || `Failed to delete patient #${id}`;
      throw new Error(message);
    }
  },

  /**
   * Quick text search across patient name, phone, email, and patient_id.
   * GET /patients?search=...
   */
  search: async (query: string): Promise<Patient[]> => {
    if (!query || !query.trim()) return [];
    const response = await patientApi.getAll({ search: query.trim() });
    return extractPatientList(response);
  },

  /**
   * Convenience lookup by clinical medical record number (e.g., 'PAT-0091').
   */
  getByPatientId: async (patientId: string): Promise<Patient | null> => {
    if (!patientId) return null;
    const listResponse = await patientApi.getAll({ search: patientId.trim() });
    const patients = extractPatientList(listResponse);
    return patients.find((p) => p.patient_id.toLowerCase() === patientId.trim().toLowerCase()) || null;
  },
};

export default patientApi;
