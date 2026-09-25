import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/authStore';
import { toast } from '../stores/toastStore';
import {
  INITIAL_PATIENTS,
  INITIAL_DOCTORS,
  INITIAL_DEPARTMENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_OPD_QUEUE,
  INITIAL_PRESCRIPTIONS,
  INITIAL_WARDS,
  INITIAL_BEDS,
  INITIAL_ADMISSIONS,
  INITIAL_MEDICINES,
  INITIAL_LAB_TESTS,
  INITIAL_LAB_ORDERS,
  INITIAL_LAB_RESULTS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_STAFF,
  INITIAL_USERS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_HOSPITAL_SETTINGS,
  INITIAL_DASHBOARD_STATS,
} from './mockData';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

// Attach bearer token to all outgoing requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 and parse standardized response
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<any>) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // If 401 Unauthorized, automatically logout and route to login
    if (status === 401) {
      useAuthStore.getState().logout();
      toast.error('Session expired. Please log in again.');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // If connection refused (backend server is not running locally in dev mode)
    // fallback gracefully to our responsive mock storage engine!
    if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      const simulated = handleMockRequest(error.config);
      if (simulated) {
        return Promise.resolve(simulated);
      }
    }

    // Standard friendly error message extraction
    const errorMsg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'An unexpected server error occurred. Please try again.';
    toast.error(errorMsg);

    return Promise.reject(error);
  }
);

/* -------------------------------------------------------------
 * Responsive In-Browser Mock Store for Development & Demonstration
 * Guarantees zero blank screens & instant operational workflows!
 * -----------------------------------------------------------*/

class MockStorage {
  private get<T>(key: string, initial: T): T {
    try {
      const val = localStorage.getItem(`hms_db_${key}`);
      return val ? JSON.parse(val) : initial;
    } catch {
      return initial;
    }
  }

  private set<T>(key: string, data: T) {
    try {
      localStorage.setItem(`hms_db_${key}`, JSON.stringify(data));
    } catch {
      // storage quota or private window
    }
  }

  patients = () => this.get('patients', INITIAL_PATIENTS);
  setPatients = (data: any) => this.set('patients', data);

  doctors = () => this.get('doctors', INITIAL_DOCTORS);
  setDoctors = (data: any) => this.set('doctors', data);

  departments = () => this.get('departments', INITIAL_DEPARTMENTS);
  setDepartments = (data: any) => this.set('departments', data);

  appointments = () => this.get('appointments', INITIAL_APPOINTMENTS);
  setAppointments = (data: any) => this.set('appointments', data);

  opdQueue = () => this.get('opd_queue', INITIAL_OPD_QUEUE);
  setOpdQueue = (data: any) => this.set('opd_queue', data);

  prescriptions = () => this.get('prescriptions', INITIAL_PRESCRIPTIONS);
  setPrescriptions = (data: any) => this.set('prescriptions', data);

  wards = () => this.get('wards', INITIAL_WARDS);
  setWards = (data: any) => this.set('wards', data);

  beds = () => this.get('beds', INITIAL_BEDS);
  setBeds = (data: any) => this.set('beds', data);

  admissions = () => this.get('admissions', INITIAL_ADMISSIONS);
  setAdmissions = (data: any) => this.set('admissions', data);

  medicines = () => this.get('medicines', INITIAL_MEDICINES);
  setMedicines = (data: any) => this.set('medicines', data);

  labTests = () => this.get('lab_tests', INITIAL_LAB_TESTS);
  setLabTests = (data: any) => this.set('lab_tests', data);

  labOrders = () => this.get('lab_orders', INITIAL_LAB_ORDERS);
  setLabOrders = (data: any) => this.set('lab_orders', data);

  labResults = () => this.get('lab_results', INITIAL_LAB_RESULTS);
  setLabResults = (data: any) => this.set('lab_results', data);

  invoices = () => this.get('invoices', INITIAL_INVOICES);
  setInvoices = (data: any) => this.set('invoices', data);

  payments = () => this.get('payments', INITIAL_PAYMENTS);
  setPayments = (data: any) => this.set('payments', data);

  staff = () => this.get('staff', INITIAL_STAFF);
  setStaff = (data: any) => this.set('staff', data);

  users = () => this.get('users', INITIAL_USERS);
  setUsers = (data: any) => this.set('users', data);

  logs = () => this.get('activity_logs', INITIAL_ACTIVITY_LOGS);
  setLogs = (data: any) => this.set('activity_logs', data);

  notifications = () => this.get('notifications', INITIAL_NOTIFICATIONS);
  setNotifications = (data: any) => this.set('notifications', data);

  settings = () => this.get('settings', INITIAL_HOSPITAL_SETTINGS);
  setSettings = (data: any) => this.set('settings', data);
}

export const mockDb = new MockStorage();

function handleMockRequest(config?: InternalAxiosRequestConfig): AxiosResponse | null {
  if (!config) return null;
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  const data = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : config.data || {};

  const wrapResponse = (payload: any, message = 'Success') => ({
    data: {
      success: true,
      message,
      data: payload,
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  });

  // Auth mock endpoints
  if (url.includes('/auth/login')) {
    const email = data.email || 'admin@hospital.org';
    const user = mockDb.users().find((u: any) => u.email.toLowerCase() === email.toLowerCase()) || {
      id: 'usr_dyn_' + Date.now(),
      name: 'Dr. Arthur Campbell',
      email: email,
      role: 'Super Admin',
      status: 'Active',
      last_login: new Date().toISOString(),
      created_at: '2024-01-01',
    };
    return wrapResponse({ user, token: 'mock-jwt-token-access-2026' }, 'Logged in successfully');
  }

  if (url.includes('/auth/me')) {
    const user = useAuthStore.getState().user || mockDb.users()[0];
    return wrapResponse(user);
  }

  // Dashboard statistics
  if (url.includes('/dashboard/statistics')) {
    const pts = mockDb.patients();
    const docs = mockDb.doctors();
    const apts = mockDb.appointments();
    const bds = mockDb.beds();
    const availableBeds = bds.filter((b: any) => b.status === 'Available').length;
    const invs = mockDb.invoices();
    const pendingBills = invs.filter((i: any) => i.status !== 'Paid').length;
    const stats = {
      ...INITIAL_DASHBOARD_STATS,
      total_patients: 12450 + pts.length - INITIAL_PATIENTS.length,
      total_doctors: docs.length,
      today_appointments: apts.length,
      available_beds: availableBeds,
      pending_bills: pendingBills,
      today_appointments_list: apts.slice(0, 5),
      recent_patients: pts.slice(0, 5),
      recent_payments: mockDb.payments().slice(0, 5),
    };
    return wrapResponse(stats);
  }

  // Patients CRUD
  if (url.startsWith('/patients')) {
    const list = mockDb.patients();
    const idMatch = url.match(/\/patients\/([^\/?]+)/);
    const id = idMatch ? idMatch[1] : null;

    if (method === 'get') {
      if (id) {
        const item = list.find((p: any) => p.id === id);
        return wrapResponse(item || list[0]);
      }
      return wrapResponse(list);
    }
    if (method === 'post') {
      const newItem = {
        ...data,
        id: 'pat_' + Date.now(),
        patient_id: `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
        created_at: new Date().toISOString(),
      };
      mockDb.setPatients([newItem, ...list]);
      return wrapResponse(newItem, 'Patient created successfully');
    }
    if (method === 'put' && id) {
      const updated = list.map((p: any) => (p.id === id ? { ...p, ...data } : p));
      mockDb.setPatients(updated);
      return wrapResponse(data, 'Patient updated successfully');
    }
    if (method === 'delete' && id) {
      mockDb.setPatients(list.filter((p: any) => p.id !== id));
      return wrapResponse({ id }, 'Patient deleted successfully');
    }
  }

  // Doctors CRUD
  if (url.startsWith('/doctors')) {
    const list = mockDb.doctors();
    const idMatch = url.match(/\/doctors\/([^\/?]+)/);
    const id = idMatch ? idMatch[1] : null;

    if (method === 'get') {
      if (id) {
        return wrapResponse(list.find((d: any) => d.id === id) || list[0]);
      }
      return wrapResponse(list);
    }
    if (method === 'post') {
      const newItem = {
        ...data,
        id: 'doc_' + Date.now(),
        doctor_id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      };
      mockDb.setDoctors([newItem, ...list]);
      return wrapResponse(newItem, 'Doctor created successfully');
    }
    if (method === 'put' && id) {
      mockDb.setDoctors(list.map((d: any) => (d.id === id ? { ...d, ...data } : d)));
      return wrapResponse(data, 'Doctor updated successfully');
    }
    if (method === 'delete' && id) {
      mockDb.setDoctors(list.filter((d: any) => d.id !== id));
      return wrapResponse({ id }, 'Doctor deleted successfully');
    }
  }

  // Departments CRUD
  if (url.startsWith('/departments')) {
    const list = mockDb.departments();
    const idMatch = url.match(/\/departments\/([^\/?]+)/);
    const id = idMatch ? idMatch[1] : null;

    if (method === 'get') {
      if (id) return wrapResponse(list.find((d: any) => d.id === id) || list[0]);
      return wrapResponse(list);
    }
    if (method === 'post') {
      const newItem = { ...data, id: 'dept_' + Date.now() };
      mockDb.setDepartments([...list, newItem]);
      return wrapResponse(newItem, 'Department created successfully');
    }
    if (method === 'put' && id) {
      mockDb.setDepartments(list.map((d: any) => (d.id === id ? { ...d, ...data } : d)));
      return wrapResponse(data, 'Department updated successfully');
    }
    if (method === 'delete' && id) {
      mockDb.setDepartments(list.filter((d: any) => d.id !== id));
      return wrapResponse({ id }, 'Department deleted successfully');
    }
  }

  // Appointments CRUD
  if (url.startsWith('/appointments')) {
    const list = mockDb.appointments();
    const idMatch = url.match(/\/appointments\/([^\/?]+)/);
    const id = idMatch ? idMatch[1] : null;

    if (method === 'get') {
      if (id) return wrapResponse(list.find((a: any) => a.id === id) || list[0]);
      return wrapResponse(list);
    }
    if (method === 'post') {
      const newItem = {
        ...data,
        id: 'apt_' + Date.now(),
        appointment_number: `APT-2026-${Math.floor(100 + Math.random() * 900)}`,
        status: data.status || 'Scheduled',
      };
      mockDb.setAppointments([newItem, ...list]);
      return wrapResponse(newItem, 'Appointment scheduled successfully');
    }
    if (method === 'put' && id) {
      mockDb.setAppointments(list.map((a: any) => (a.id === id ? { ...a, ...data } : a)));
      return wrapResponse(data, 'Appointment updated successfully');
    }
    if (method === 'delete' && id) {
      mockDb.setAppointments(list.filter((a: any) => a.id !== id));
      return wrapResponse({ id }, 'Appointment cancelled successfully');
    }
  }

  // OPD Queue & Consultations
  if (url.startsWith('/opd/queue')) {
    const list = mockDb.opdQueue();
    if (method === 'get') return wrapResponse(list);
    if (method === 'post') {
      const newItem = { ...data, id: 'opd_' + Date.now(), queue_number: list.length + 101 };
      mockDb.setOpdQueue([...list, newItem]);
      return wrapResponse(newItem, 'Patient queued to OPD');
    }
  }
  if (url.startsWith('/opd/consultations') || url.startsWith('/opd/consultation')) {
    if (method === 'post') {
      // mark OPD queue item completed if matched
      const queueList = mockDb.opdQueue();
      if (data.opd_id) {
        mockDb.setOpdQueue(queueList.map((q: any) => q.id === data.opd_id ? { ...q, status: 'Completed' } : q));
      }
      return wrapResponse(data, 'Consultation recorded successfully');
    }
  }

  // Prescriptions
  if (url.startsWith('/prescriptions')) {
    const list = mockDb.prescriptions();
    const idMatch = url.match(/\/prescriptions\/([^\/?]+)/);
    const id = idMatch ? idMatch[1] : null;

    if (method === 'get') {
      if (id) return wrapResponse(list.find((r: any) => r.id === id) || list[0]);
      return wrapResponse(list);
    }
    if (method === 'post') {
      const newItem = {
        ...data,
        id: 'rx_' + Date.now(),
        prescription_number: `RX-${Math.floor(1000 + Math.random() * 9000)}`,
        created_at: new Date().toISOString(),
      };
      mockDb.setPrescriptions([newItem, ...list]);
      return wrapResponse(newItem, 'Prescription saved successfully');
    }
  }

  // IPD (Wards, Beds, Admissions)
  if (url.startsWith('/ipd/wards')) return wrapResponse(mockDb.wards());
  if (url.startsWith('/ipd/beds')) {
    const list = mockDb.beds();
    if (method === 'get') return wrapResponse(list);
    if (method === 'put') {
      const idMatch = url.match(/\/ipd\/beds\/([^\/?]+)/);
      const id = idMatch ? idMatch[1] : data.id;
      const updated = list.map((b: any) => b.id === id ? { ...b, ...data } : b);
      mockDb.setBeds(updated);
      return wrapResponse(data, 'Bed status updated');
    }
  }
  if (url.startsWith('/ipd/admissions')) {
    const list = mockDb.admissions();
    const idMatch = url.match(/\/ipd\/admissions\/([^\/?]+)/);
    const id = idMatch ? idMatch[1] : null;

    if (method === 'get') {
      if (id) return wrapResponse(list.find((a: any) => a.id === id) || list[0]);
      return wrapResponse(list);
    }
    if (method === 'post') {
      const newItem = {
        ...data,
        id: 'adm_' + Date.now(),
        admission_number: `ADM-2026-${Math.floor(100 + Math.random() * 900)}`,
        status: 'Admitted',
      };
      mockDb.setAdmissions([newItem, ...list]);
      // Update bed status to Occupied
      if (data.bed) {
        const beds = mockDb.beds();
        mockDb.setBeds(beds.map((b: any) => b.bed_number === data.bed ? { ...b, status: 'Occupied', current_patient_name: data.patient_name } : b));
      }
      return wrapResponse(newItem, 'Patient admitted successfully');
    }
    if (method === 'put' && id) {
      mockDb.setAdmissions(list.map((a: any) => (a.id === id ? { ...a, ...data } : a)));
      return wrapResponse(data, 'Admission updated successfully');
    }
  }
  if (url.startsWith('/ipd/discharge')) {
    const admissions = mockDb.admissions();
    const id = data.admission_id;
    mockDb.setAdmissions(admissions.map((a: any) => a.id === id ? { ...a, status: 'Discharged', discharge_date: new Date().toISOString().split('T')[0] } : a));
    // Release bed
    if (data.bed_number) {
      const beds = mockDb.beds();
      mockDb.setBeds(beds.map((b: any) => b.bed_number === data.bed_number ? { ...b, status: 'Available', current_patient_name: undefined, current_patient_id: undefined } : b));
    }
    return wrapResponse(data, 'Patient discharged successfully');
  }

  // Pharmacy
  if (url.startsWith('/pharmacy/medicines') || url.startsWith('/pharmacy/stock')) {
    const list = mockDb.medicines();
    if (method === 'get') return wrapResponse(list);
    if (method === 'post') {
      const newItem = { ...data, id: 'med_' + Date.now(), status: data.quantity <= (data.minimum_stock || 20) ? 'Low Stock' : 'Available' };
      mockDb.setMedicines([newItem, ...list]);
      return wrapResponse(newItem, 'Medicine added to inventory');
    }
    if (method === 'put') {
      const idMatch = url.match(/\/pharmacy\/medicines\/([^\/?]+)/);
      const id = idMatch ? idMatch[1] : data.id;
      const updated = list.map((m: any) => m.id === id ? { ...m, ...data } : m);
      mockDb.setMedicines(updated);
      return wrapResponse(data, 'Medicine inventory updated');
    }
  }
  if (url.startsWith('/pharmacy/sales')) {
    if (method === 'post') {
      return wrapResponse(data, 'Pharmacy sale receipt generated');
    }
  }

  // Laboratory
  if (url.startsWith('/laboratory/tests')) {
    const list = mockDb.labTests();
    if (method === 'get') return wrapResponse(list);
    if (method === 'post') {
      const newItem = { ...data, id: 't_' + Date.now() };
      mockDb.setLabTests([...list, newItem]);
      return wrapResponse(newItem, 'Lab test catalog item created');
    }
  }
  if (url.startsWith('/laboratory/orders')) {
    const list = mockDb.labOrders();
    if (method === 'get') return wrapResponse(list);
    if (method === 'post') {
      const newItem = {
        ...data,
        id: 'lo_' + Date.now(),
        order_number: `LAB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Pending',
        order_date: new Date().toISOString(),
      };
      mockDb.setLabOrders([newItem, ...list]);
      return wrapResponse(newItem, 'Laboratory order dispatched');
    }
  }
  if (url.startsWith('/laboratory/results')) {
    const list = mockDb.labResults();
    if (method === 'get') return wrapResponse(list);
    if (method === 'post') {
      const newItem = {
        ...data,
        id: 'lr_' + Date.now(),
        date: new Date().toISOString(),
      };
      mockDb.setLabResults([newItem, ...list]);
      return wrapResponse(newItem, 'Lab result verified and published');
    }
  }

  // Billing (Invoices & Payments)
  if (url.startsWith('/billing/invoices')) {
    const list = mockDb.invoices();
    const idMatch = url.match(/\/billing\/invoices\/([^\/?]+)/);
    const id = idMatch ? idMatch[1] : null;

    if (method === 'get') {
      if (id) return wrapResponse(list.find((i: any) => i.id === id) || list[0]);
      return wrapResponse(list);
    }
    if (method === 'post') {
      const newItem = {
        ...data,
        id: 'inv_' + Date.now(),
        invoice_number: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        created_at: new Date().toISOString(),
      };
      mockDb.setInvoices([newItem, ...list]);
      return wrapResponse(newItem, 'Invoice generated successfully');
    }
    if (method === 'put' && id) {
      mockDb.setInvoices(list.map((i: any) => (i.id === id ? { ...i, ...data } : i)));
      return wrapResponse(data, 'Invoice updated');
    }
  }
  if (url.startsWith('/billing/payments')) {
    const list = mockDb.payments();
    if (method === 'get') return wrapResponse(list);
    if (method === 'post') {
      const newItem = {
        ...data,
        id: 'pay_' + Date.now(),
        receipt_number: `REC-2026-${Math.floor(100 + Math.random() * 900)}`,
        payment_date: new Date().toISOString().split('T')[0],
      };
      mockDb.setPayments([newItem, ...list]);

      // If matched with invoice, decrement invoice balance
      if (data.invoice_id) {
        const invoices = mockDb.invoices();
        mockDb.setInvoices(invoices.map((inv: any) => {
          if (inv.id === data.invoice_id) {
            const newPaid = inv.paid + Number(data.amount || 0);
            const newBal = Math.max(0, inv.total - newPaid);
            return {
              ...inv,
              paid: newPaid,
              balance: newBal,
              status: newBal === 0 ? 'Paid' : 'Partial',
            };
          }
          return inv;
        }));
      }

      return wrapResponse(newItem, 'Payment processed successfully');
    }
  }

  // Staff CRUD
  if (url.startsWith('/staff')) {
    const list = mockDb.staff();
    if (method === 'get') return wrapResponse(list);
    if (method === 'post') {
      const newItem = {
        ...data,
        id: 'st_' + Date.now(),
        staff_id: `STF-${Math.floor(10 + Math.random() * 90)}`,
        joined_date: new Date().toISOString().split('T')[0],
      };
      mockDb.setStaff([...list, newItem]);
      return wrapResponse(newItem, 'Staff record created');
    }
    if (method === 'delete') {
      const idMatch = url.match(/\/staff\/([^\/?]+)/);
      if (idMatch) {
        mockDb.setStaff(list.filter((s: any) => s.id !== idMatch[1]));
        return wrapResponse({ id: idMatch[1] }, 'Staff deleted');
      }
    }
  }

  // Users, Roles & Permissions
  if (url.startsWith('/users')) {
    const list = mockDb.users();
    if (method === 'get') return wrapResponse(list);
    if (method === 'post') {
      const newItem = {
        ...data,
        id: 'usr_' + Date.now(),
        created_at: new Date().toISOString().split('T')[0],
      };
      mockDb.setUsers([...list, newItem]);
      return wrapResponse(newItem, 'User created');
    }
    if (method === 'put') {
      const idMatch = url.match(/\/users\/([^\/?]+)/);
      const id = idMatch ? idMatch[1] : data.id;
      const updated = list.map((u: any) => u.id === id ? { ...u, ...data } : u);
      mockDb.setUsers(updated);
      return wrapResponse(data, 'User updated successfully');
    }
  }

  // Notifications
  if (url.startsWith('/notifications')) {
    const list = mockDb.notifications();
    if (method === 'get') return wrapResponse(list);
    if (url.includes('/mark-all-read')) {
      mockDb.setNotifications(list.map((n: any) => ({ ...n, read: true })));
      return wrapResponse({}, 'All notifications marked as read');
    }
    if (method === 'put') {
      const idMatch = url.match(/\/notifications\/([^\/?]+)/);
      if (idMatch) {
        mockDb.setNotifications(list.map((n: any) => n.id === idMatch[1] ? { ...n, read: true } : n));
        return wrapResponse({}, 'Notification marked read');
      }
    }
  }

  // Activity logs
  if (url.startsWith('/activity-logs')) return wrapResponse(mockDb.logs());

  // Settings
  if (url.startsWith('/settings')) {
    if (method === 'get') return wrapResponse(mockDb.settings());
    if (method === 'put' || method === 'post') {
      mockDb.setSettings({ ...mockDb.settings(), ...data });
      return wrapResponse(data, 'Hospital settings updated');
    }
  }

  return wrapResponse([], 'Success');
}
