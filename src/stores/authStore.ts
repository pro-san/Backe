import { create } from 'zustand';
import { User } from '../types';

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  'Super Admin': ['*'],
  'Hospital Admin': [
    'patients.*', 'doctors.*', 'departments.*', 'appointments.*',
    'opd.*', 'ipd.*', 'prescriptions.*', 'pharmacy.*', 'laboratory.*',
    'billing.*', 'staff.*', 'users.*', 'roles.*', 'reports.*', 'settings.*', 'activity.*', 'notifications.*'
  ],
  'Doctor': [
    'patients.view', 'patients.create', 'patients.edit',
    'appointments.view', 'appointments.create', 'appointments.edit',
    'opd.queue', 'opd.consultation',
    'prescriptions.view', 'prescriptions.create', 'prescriptions.edit',
    'ipd.view', 'ipd.admissions',
    'laboratory.view', 'laboratory.orders',
    'reports.view', 'notifications.view'
  ],
  'Nurse': [
    'patients.view',
    'appointments.view',
    'opd.queue',
    'ipd.view', 'ipd.admissions', 'ipd.beds', 'ipd.wards',
    'prescriptions.view',
    'notifications.view'
  ],
  'Receptionist': [
    'patients.view', 'patients.create', 'patients.edit',
    'appointments.view', 'appointments.create', 'appointments.edit', 'appointments.delete',
    'opd.queue',
    'billing.view', 'billing.create',
    'notifications.view'
  ],
  'Pharmacist': [
    'pharmacy.view', 'pharmacy.create', 'pharmacy.edit', 'pharmacy.stock', 'pharmacy.sales',
    'prescriptions.view',
    'notifications.view'
  ],
  'Laboratory Staff': [
    'laboratory.view', 'laboratory.orders', 'laboratory.results',
    'patients.view',
    'notifications.view'
  ],
  'Accountant': [
    'billing.view', 'billing.create', 'billing.edit', 'billing.payments',
    'reports.revenue', 'reports.view',
    'notifications.view'
  ],
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: string | string[]) => boolean;
}

const AUTH_USER_KEY = 'hms_auth_user';
const AUTH_TOKEN_KEY = 'hms_auth_token';

export const useAuthStore = create<AuthState>((set, get) => {
  let savedUser: User | null = null;
  let savedToken: string | null = null;

  if (typeof window !== 'undefined') {
    try {
      const u = localStorage.getItem(AUTH_USER_KEY);
      const t = localStorage.getItem(AUTH_TOKEN_KEY);
      if (u && t) {
        savedUser = JSON.parse(u);
        savedToken = t;
      }
    } catch {
      // ignore JSON parse error
    }
  }

  // Default pre-authenticated Super Admin if not logged in, so demo works right away if desired
  const defaultUser: User = {
    id: 'usr_admin_01',
    name: 'Dr. Arthur Campbell',
    email: 'admin@hospital.org',
    role: 'Super Admin',
    status: 'Active',
    last_login: new Date().toISOString(),
    created_at: '2024-01-10T08:00:00Z',
  };
  const initialUser = savedUser || defaultUser;
  const initialToken = savedToken || 'demo-auth-bearer-token-2026';

  return {
    user: initialUser,
    token: initialToken,
    isAuthenticated: !!initialUser,
    login: (user: User, token: string) => {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      set({ user: null, token: null, isAuthenticated: false });
    },
    hasPermission: (permission: string) => {
      const { user } = get();
      if (!user) return false;
      const permissions = ROLE_PERMISSIONS[user.role] || [];
      if (permissions.includes('*')) return true;
      if (permissions.includes(permission)) return true;
      const [module] = permission.split('.');
      if (permissions.includes(`${module}.*`)) return true;
      return false;
    },
    hasRole: (roles: string | string[]) => {
      const { user } = get();
      if (!user) return false;
      if (user.role === 'Super Admin') return true;
      if (Array.isArray(roles)) {
        return roles.includes(user.role);
      }
      return user.role === roles;
    },
  };
});
