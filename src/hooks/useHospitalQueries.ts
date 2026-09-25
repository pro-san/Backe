import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '../services/patientApi';
import { doctorApi } from '../services/doctorApi';
import { departmentApi } from '../services/departmentApi';
import { appointmentApi } from '../services/appointmentApi';
import { opdApi } from '../services/opdApi';
import { ipdApi } from '../services/ipdApi';
import { prescriptionApi } from '../services/prescriptionApi';
import { pharmacyApi } from '../services/pharmacyApi';
import { laboratoryApi } from '../services/laboratoryApi';
import { billingApi } from '../services/billingApi';
import { staffApi } from '../services/staffApi';
import { userApi } from '../services/userApi';
import { roleApi, SYSTEM_ROLES } from '../services/roleApi';
import { dashboardApi } from '../services/dashboardApi';
import { notificationApi, activityLogApi, settingsApi } from '../services/settingsApi';
import { toast } from '../stores/toastStore';
import { Patient, Doctor, Department, Appointment, OPDQueueItem, Consultation, Prescription, Medicine, LabTest, LabOrder, LabResult, Invoice, Payment, Staff, User, Role, HospitalSettings, Bed, Admission } from '../types';

export const QUERY_KEYS = {
  dashboard: ['dashboard'] as const,
  patients: ['patients'] as const,
  patient: (id: string) => ['patient', id] as const,
  doctors: ['doctors'] as const,
  doctor: (id: string) => ['doctor', id] as const,
  departments: ['departments'] as const,
  appointments: ['appointments'] as const,
  opdQueue: ['opdQueue'] as const,
  prescriptions: ['prescriptions'] as const,
  wards: ['wards'] as const,
  beds: ['beds'] as const,
  admissions: ['admissions'] as const,
  medicines: ['medicines'] as const,
  labTests: ['labTests'] as const,
  labOrders: ['labOrders'] as const,
  labResults: ['labResults'] as const,
  invoices: ['invoices'] as const,
  invoice: (id: string) => ['invoice', id] as const,
  payments: ['payments'] as const,
  staff: ['staff'] as const,
  users: ['users'] as const,
  notifications: ['notifications'] as const,
  activityLogs: ['activityLogs'] as const,
  settings: ['settings'] as const,
};

// Dashboard
export function useDashboardStatistics() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard,
    queryFn: async () => {
      const res = await dashboardApi.getStatistics();
      return res.data;
    },
  });
}

// Patients
export function usePatients(params?: { search?: string }) {
  return useQuery<Patient[]>({
    queryKey: [...QUERY_KEYS.patients, params],
    queryFn: async (): Promise<Patient[]> => {
      const res = await patientApi.getAll(params);
      if (Array.isArray(res?.data)) return res.data as Patient[];
      if (Array.isArray((res?.data as any)?.items)) return (res.data as any).items as Patient[];
      if (Array.isArray((res?.data as any)?.patients)) return (res.data as any).patients as Patient[];
      return [];
    },
  });
}

export function usePatient(id?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.patient(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Patient ID is required');
      const res = await patientApi.getById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Patient>) => patientApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.patients });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      toast.success('Patient record registered successfully');
    },
  });
}

export function useUpdatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) => patientApi.update(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.patients });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.patient(variables.id) });
      toast.success('Patient details updated successfully');
    },
  });
}

export function useDeletePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patientApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.patients });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      toast.success('Patient archived successfully');
    },
  });
}

// Doctors
export function useDoctors(params?: { search?: string; department_id?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEYS.doctors, params],
    queryFn: async () => {
      const res = await doctorApi.getAll(params);
      return res.data;
    },
  });
}

export function useDoctor(id?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.doctor(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Doctor ID required');
      const res = await doctorApi.getById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Doctor>) => doctorApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.doctors });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      toast.success('Doctor credential registered');
    },
  });
}

// Departments
export function useDepartments() {
  return useQuery({
    queryKey: QUERY_KEYS.departments,
    queryFn: async () => {
      const res = await departmentApi.getAll();
      return res.data;
    },
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Department>) => departmentApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.departments });
      toast.success('Department created');
    },
  });
}

// Appointments
export function useAppointments(params?: { date?: string; doctor_id?: string; status?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEYS.appointments, params],
    queryFn: async () => {
      const res = await appointmentApi.getAll(params);
      return res.data;
    },
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Appointment>) => appointmentApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.appointments });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      toast.success('Appointment scheduled successfully');
    },
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) => appointmentApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.appointments });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      toast.success('Appointment status updated');
    },
  });
}

// OPD
export function useOPDQueue() {
  return useQuery({
    queryKey: QUERY_KEYS.opdQueue,
    queryFn: async () => {
      const res = await opdApi.getQueue();
      return res.data;
    },
  });
}

export function useRecordConsultation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Consultation>) => opdApi.recordConsultation(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.opdQueue });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.appointments });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      toast.success('Consultation session saved');
    },
  });
}

// Prescriptions
export function usePrescriptions(patientId?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.prescriptions, patientId],
    queryFn: async () => {
      const res = await prescriptionApi.getAll(patientId);
      return res.data;
    },
  });
}

export function useCreatePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Prescription>) => prescriptionApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.prescriptions });
      toast.success('Prescription generated and signed');
    },
  });
}

// IPD
export function useWards() {
  return useQuery({
    queryKey: QUERY_KEYS.wards,
    queryFn: async () => {
      const res = await ipdApi.getWards();
      return res.data;
    },
  });
}

export function useBeds() {
  return useQuery({
    queryKey: QUERY_KEYS.beds,
    queryFn: async () => {
      const res = await ipdApi.getBeds();
      return res.data;
    },
  });
}

export function useUpdateBed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Bed> }) => ipdApi.updateBed(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.beds });
      toast.success('Bed status updated');
    },
  });
}

export function useAdmissions() {
  return useQuery({
    queryKey: QUERY_KEYS.admissions,
    queryFn: async () => {
      const res = await ipdApi.getAdmissions();
      return res.data;
    },
  });
}

export function useCreateAdmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Admission>) => ipdApi.createAdmission(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.admissions });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.beds });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      toast.success('Patient admitted to ward');
    },
  });
}

export function useDischargePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { admission_id: string; bed_number?: string; notes?: string }) => ipdApi.dischargePatient(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.admissions });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.beds });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      toast.success('Patient discharge order processed');
    },
  });
}

// Pharmacy
export function useMedicines(search?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.medicines, search],
    queryFn: async () => {
      const res = await pharmacyApi.getMedicines(search);
      return res.data;
    },
  });
}

export function useCreateMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Medicine>) => pharmacyApi.createMedicine(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.medicines });
      toast.success('Medicine added to formulary');
    },
  });
}

export function useUpdateMedicine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Medicine> }) => pharmacyApi.updateMedicine(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.medicines });
      toast.success('Medicine stock updated');
    },
  });
}

export function useDispenseMedicines() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => pharmacyApi.recordSale(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.medicines });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      toast.success('Medicines dispensed successfully');
    },
  });
}

// Laboratory
export function useLabTests() {
  return useQuery({
    queryKey: QUERY_KEYS.labTests,
    queryFn: async () => {
      const res = await laboratoryApi.getTests();
      return res.data;
    },
  });
}

export function useLabOrders() {
  return useQuery({
    queryKey: QUERY_KEYS.labOrders,
    queryFn: async () => {
      const res = await laboratoryApi.getOrders();
      return res.data;
    },
  });
}

export function useCreateLabOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<LabOrder>) => laboratoryApi.createOrder(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.labOrders });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      toast.success('Laboratory requisition submitted');
    },
  });
}

export function useLabResults(orderId?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.labResults, orderId],
    queryFn: async () => {
      const res = await laboratoryApi.getResults(orderId);
      return res.data;
    },
  });
}

export function useRecordLabResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<LabResult>) => laboratoryApi.recordResult(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.labResults });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.labOrders });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      toast.success('Lab test result recorded and verified');
    },
  });
}

export const useSubmitLabResult = useRecordLabResult;

// Billing
export function useInvoices() {
  return useQuery({
    queryKey: QUERY_KEYS.invoices,
    queryFn: async () => {
      const res = await billingApi.getInvoices();
      return res.data;
    },
  });
}

export function useInvoice(id?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.invoice(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Invoice ID required');
      const res = await billingApi.getInvoiceById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Invoice>) => billingApi.createInvoice(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.invoices });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      toast.success('Patient invoice issued');
    },
  });
}

export function usePayments() {
  return useQuery({
    queryKey: QUERY_KEYS.payments,
    queryFn: async () => {
      const res = await billingApi.getPayments();
      return res.data;
    },
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const payload = data.invoiceId
        ? {
            invoice_id: data.invoiceId,
            amount: data.paymentData?.amount,
            payment_method: data.paymentData?.method,
            notes: data.paymentData?.notes,
            ...data.paymentData,
          }
        : data;
      return billingApi.recordPayment(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.payments });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.invoices });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      toast.success('Payment receipt recorded');
    },
  });
}

// Staff
export function useStaff(role?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.staff, role],
    queryFn: async () => {
      const res = await staffApi.getAll(role);
      return res.data;
    },
  });
}

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Staff>) => staffApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.staff });
      toast.success('Staff member onboarded');
    },
  });
}

// Users
export function useUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.users,
    queryFn: async () => {
      const res = await userApi.getAll();
      return res.data;
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<User>) => userApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.users });
      toast.success('User account created');
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => userApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.users });
      toast.success('User updated successfully');
    },
  });
}

// Roles & Permissions
export function useRoles() {
  return useQuery({
    queryKey: ['roles'] as const,
    queryFn: async () => {
      return roleApi.getRoles();
    },
  });
}

export function useUpdateRolePermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ roleId, permissions }: { roleId: string; permissions: string[] }) => {
      const role = SYSTEM_ROLES.find((r) => r.name === roleId || r.id === roleId);
      if (role) {
        role.permissions = permissions;
      }
      return { roleId, permissions };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role permissions updated');
    },
  });
}

// Notifications
export function useNotifications() {
  return useQuery({
    queryKey: QUERY_KEYS.notifications,
    queryFn: async () => {
      const res = await notificationApi.getAll();
      return res.data;
    },
  });
}

export function useMarkNotificationAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
      toast.success('Marked all as read');
    },
  });
}

// Activity logs
export function useActivityLogs() {
  return useQuery({
    queryKey: QUERY_KEYS.activityLogs,
    queryFn: async () => {
      const res = await activityLogApi.getAll();
      return res.data;
    },
  });
}

// Settings
export function useHospitalSettings() {
  return useQuery({
    queryKey: QUERY_KEYS.settings,
    queryFn: async () => {
      const res = await settingsApi.getHospitalSettings();
      return res.data;
    },
  });
}

export function useUpdateHospitalSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<HospitalSettings>) => settingsApi.updateHospitalSettings(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.settings });
      toast.success('Hospital settings updated');
    },
  });
}

export const useSettings = useHospitalSettings;
export const useUpdateSettings = useUpdateHospitalSettings;
