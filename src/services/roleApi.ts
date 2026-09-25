import { Role, Permission } from '../types';

export const SYSTEM_ROLES: Role[] = [
  { id: 'r_01', name: 'Super Admin', slug: 'super-admin', description: 'Full root access to all clinical, financial, and infrastructure configurations.', permissions: ['*'] },
  { id: 'r_02', name: 'Hospital Admin', slug: 'hospital-admin', description: 'Administrative director managing clinical operations, inventory, and staff rosters.', permissions: ['patients.*', 'doctors.*', 'departments.*', 'appointments.*', 'opd.*', 'ipd.*', 'prescriptions.*', 'pharmacy.*', 'laboratory.*', 'billing.*', 'staff.*', 'users.*', 'reports.*', 'settings.*'] },
  { id: 'r_03', name: 'Doctor', slug: 'doctor', description: 'Attending physicians diagnosing patients, queue management, and writing prescriptions.', permissions: ['patients.view', 'patients.edit', 'appointments.*', 'opd.*', 'prescriptions.*', 'ipd.view', 'laboratory.orders'] },
  { id: 'r_04', name: 'Nurse', slug: 'nurse', description: 'Inpatient ward rounds, vital signs recordings, and medication dispensation checks.', permissions: ['patients.view', 'opd.queue', 'ipd.*', 'prescriptions.view'] },
  { id: 'r_05', name: 'Receptionist', slug: 'receptionist', description: 'Front desk patient onboarding, appointment bookings, and initial consultation queueing.', permissions: ['patients.*', 'appointments.*', 'opd.queue', 'billing.view'] },
  { id: 'r_06', name: 'Pharmacist', slug: 'pharmacist', description: 'Pharmacy dispensary, stock replenishment, and medication fulfillment.', permissions: ['pharmacy.*', 'prescriptions.view'] },
  { id: 'r_07', name: 'Laboratory Staff', slug: 'laboratory', description: 'Specimen processing, pathology test verification, and laboratory result publications.', permissions: ['laboratory.*', 'patients.view'] },
  { id: 'r_08', name: 'Accountant', slug: 'accountant', description: 'Patient invoicing, receipt generation, insurance claims, and revenue reports.', permissions: ['billing.*', 'reports.revenue'] },
];

export const SYSTEM_PERMISSIONS: Permission[] = [
  { id: 'p_1', name: 'patients.view', module: 'Patients', description: 'View patient master directory and clinical history' },
  { id: 'p_2', name: 'patients.create', module: 'Patients', description: 'Register new patients into EHR system' },
  { id: 'p_3', name: 'patients.edit', module: 'Patients', description: 'Update patient demographics and notes' },
  { id: 'p_4', name: 'patients.delete', module: 'Patients', description: 'Archive or purge patient records' },
  { id: 'p_5', name: 'appointments.view', module: 'Appointments', description: 'View appointment calendar and lists' },
  { id: 'p_6', name: 'appointments.create', module: 'Appointments', description: 'Schedule new patient appointments' },
  { id: 'p_7', name: 'appointments.edit', module: 'Appointments', description: 'Modify or reschedule appointments' },
  { id: 'p_8', name: 'appointments.delete', module: 'Appointments', description: 'Cancel existing bookings' },
  { id: 'p_9', name: 'billing.view', module: 'Billing', description: 'View invoices and transaction ledger' },
  { id: 'p_10', name: 'billing.create', module: 'Billing', description: 'Generate patient invoices and items' },
  { id: 'p_11', name: 'billing.edit', module: 'Billing', description: 'Apply discounts and adjustments' },
  { id: 'p_12', name: 'reports.view', module: 'Reports', description: 'Access aggregate analytics and metrics' },
];

export const roleApi = {
  getRoles: async (): Promise<Role[]> => SYSTEM_ROLES,
  getPermissions: async (): Promise<Permission[]> => SYSTEM_PERMISSIONS,
};
