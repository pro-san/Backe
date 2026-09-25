export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | string;
export type Gender = 'Male' | 'Female' | 'Other';
export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';
export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled' | 'No Show' | string;
export type OPDStatus = 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled';
export type BedStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
export type InvoiceStatus = 'Paid' | 'Partial' | 'Pending' | 'Cancelled' | 'Partially Paid' | 'Unpaid' | string;
export type LabOrderStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
export type MedicineStatus = 'Available' | 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expired' | 'Expiring Soon';

export interface Patient {
  id: string;
  patient_id: string;
  first_name: string;
  last_name: string;
  gender: Gender;
  date_of_birth: string;
  phone: string;
  email: string;
  address: string;
  blood_group: BloodGroup;
  marital_status: MaritalStatus;
  emergency_contact: string;
  emergency_phone: string;
  allergies?: string;
  medical_notes?: string;
  status: 'Active' | 'Inactive' | 'Deceased';
  created_at: string;
  updated_at?: string;
}

export interface Doctor {
  id: string;
  doctor_id: string;
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  specialization: string;
  department_id: string;
  department_name: string;
  license_number: string;
  experience: number; // years
  status: 'Active' | 'On Leave' | 'Inactive';
  available_days?: string[];
  schedule?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  head_doctor: string;
  head_doctor_id?: string;
  phone: string;
  status: 'Active' | 'Inactive';
  total_doctors: number;
  total_beds: number;
}

export interface Appointment {
  id: string;
  appointment_number: string;
  patient_id: string;
  patient_name: string;
  patient_phone?: string;
  doctor_id: string;
  doctor_name: string;
  department_id: string;
  department_name: string;
  appointment_date: string;
  appointment_time: string;
  type: 'General Checkup' | 'Follow-up' | 'Emergency' | 'Specialist Consultation' | 'Routine';
  reason: string;
  notes?: string;
  status: AppointmentStatus;
  created_at?: string;
}

export interface VitalSigns {
  blood_pressure: string; // e.g. "120/80 mmHg"
  heart_rate: number; // bpm
  temperature: number; // °F or °C
  respiratory_rate: number; // breaths/min
  oxygen_saturation: number; // % SpO2
  weight: number; // kg
  height: number; // cm
  bmi?: number | string;
}

export interface OPDQueueItem {
  id: string;
  queue_number: number;
  appointment_id?: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  department_name: string;
  appointment_time: string;
  priority: 'Normal' | 'Urgent' | 'Emergency';
  status: OPDStatus;
  vitals?: VitalSigns;
  symptoms?: string;
}

export interface Consultation {
  id: string;
  opd_id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  consultation_date: string;
  date?: string;
  vitals: VitalSigns;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  clinical_notes?: string;
  doctor_notes?: string;
  follow_up_date?: string;
  created_at: string;
}

export interface PrescriptionMedicine {
  id: string;
  medicine_name: string;
  dosage: string;
  frequency: string; // e.g. "1-0-1", "TDS", "Every 8 hours"
  duration: string; // e.g. "5 days", "2 weeks"
  route?: 'Oral' | 'IV' | 'IM' | 'Sublingual' | 'Topical' | 'Inhalation' | 'Ophthalmic';
  instructions: string;
}

export interface Prescription {
  id: string;
  prescription_number: string;
  patient_id: string;
  patient_name: string;
  patient_age?: number;
  patient_gender?: string;
  doctor_id: string;
  doctor_name: string;
  doctor_specialization?: string;
  doctor_license?: string;
  date: string;
  diagnosis: string;
  notes?: string;
  medicines: PrescriptionMedicine[];
  created_at: string;
}

export interface Admission {
  id: string;
  admission_number: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  ward: string;
  room: string;
  bed: string;
  admission_date: string;
  discharge_date?: string;
  diagnosis: string;
  notes?: string;
  status: 'Admitted' | 'Discharged' | 'Transferred';
}

export interface Bed {
  id: string;
  bed_number: string;
  room_number: string;
  room?: string;
  ward_id: string;
  ward_name: string;
  type: 'General' | 'Semi-Private' | 'ICU' | 'CCU' | 'Maternity' | 'Pediatric';
  status: BedStatus;
  current_patient_id?: string;
  current_patient_name?: string;
  patient_name?: string;
  daily_rate: number;
}

export interface Ward {
  id: string;
  name: string;
  code: string;
  type: string;
  floor: string;
  capacity: number;
  occupied: number;
  available: number;
}

export interface Medicine {
  id: string;
  code?: string;
  name: string;
  generic_name: string;
  category: string;
  manufacturer: string;
  batch_number: string;
  expiry_date: string;
  unit: string;
  purchase_price: number;
  cost_price?: number;
  selling_price: number;
  unit_price?: number;
  quantity: number;
  stock?: number;
  minimum_stock: number;
  reorder_level?: number;
  status: MedicineStatus;
}

export interface PharmacyPurchase {
  id: string;
  invoice_no: string;
  supplier: string;
  purchase_date: string;
  total_amount: number;
  payment_status: 'Paid' | 'Pending' | 'Partial';
  items_count: number;
}

export interface PharmacySale {
  id: string;
  receipt_no: string;
  patient_id: string;
  patient_name: string;
  sale_date: string;
  total_amount: number;
  payment_method: 'Cash' | 'Credit Card' | 'Debit Card' | 'Insurance' | 'Online';
  items_count: number;
}

export interface LabTest {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  price: number;
  normal_range: string;
  reference_range?: string;
  unit: string;
  status: 'Active' | 'Inactive';
}

export interface LabOrder {
  id: string;
  order_number: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  test_ids: string[];
  test_names: string[];
  priority: 'Normal' | 'Urgent' | 'Emergency' | 'STAT' | string;
  sample_type: string;
  order_date: string;
  created_at?: string;
  status: LabOrderStatus;
}

export interface LabResult {
  id: string;
  order_id: string;
  order_number?: string;
  test_id: string;
  test_name: string;
  patient_id: string;
  patient_name: string;
  result: string;
  reference_range: string;
  unit: string;
  status: 'Normal' | 'Abnormal' | 'Critical';
  remarks?: string;
  technician: string;
  date: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  category: 'Consultation' | 'Pharmacy' | 'Laboratory' | 'Room/Bed' | 'Procedure' | 'Other';
  quantity: number;
  unit_price: number;
  total: number;
  amount?: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  patient_id: string;
  patient_name: string;
  patient_phone?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  balance: number;
  status: InvoiceStatus;
  date?: string;
  due_date: string;
  created_at: string;
  payment_method?: string;
}

export interface Payment {
  id: string;
  receipt_number: string;
  invoice_id: string;
  invoice_number: string;
  patient_name: string;
  amount: number;
  payment_date: string;
  payment_method: 'Cash' | 'Credit Card' | 'Debit Card' | 'Insurance' | 'Bank Transfer';
  notes?: string;
}

export interface Staff {
  id: string;
  staff_id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Doctor' | 'Nurse' | 'Receptionist' | 'Pharmacist' | 'Laboratory Staff' | 'Accountant' | 'Administrator' | string;
  department: string;
  department_name?: string;
  department_id?: string;
  salary?: number;
  qualification?: string;
  status: 'Active' | 'On Leave' | 'Terminated' | 'Inactive';
  joined_date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  last_login?: string;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string;
  permissions: string[];
}

export interface Permission {
  id: string;
  name: string;
  module: string;
  description: string;
}

export interface NotificationItem {
  id: string;
  type: 'appointment' | 'pharmacy' | 'lab' | 'billing' | 'ipd' | 'system' | string;
  title: string;
  message: string;
  read: boolean;
  is_read?: boolean;
  created_at: string;
  link?: string;
}

export interface ActivityLog {
  id: string;
  user_name: string;
  user_role: string;
  action: string;
  module: string;
  description: string;
  details?: string;
  ip_address: string;
  created_at: string;
}

export interface HospitalSettings {
  name: string;
  hospital_name?: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  registration_number?: string;
  currency: string;
  currency_symbol?: string;
  timezone?: string;
  tax_rate?: number;
  invoice_prefix?: string;
  appointment_interval?: number;
}

export interface DashboardStatistics {
  total_patients: number;
  patients_trend: number;
  total_doctors: number;
  today_appointments: number;
  available_beds: number;
  total_beds: number;
  today_admissions: number;
  pending_bills: number;
  monthly_revenue: number;
  revenue_trend: number;
  pending_lab_tests: number;
  weekly_patients: { day: string; admitted: number; discharged: number; opd: number }[];
  monthly_revenue_data: { month: string; revenue: number; expenses: number }[];
  appointments_by_department: { department: string; count: number }[];
  appointment_status_distribution: { name: string; value: number }[];
  today_appointments_list: Appointment[];
  recent_patients: Patient[];
  recent_payments: Payment[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: PaginatedData<T>;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
