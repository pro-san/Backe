import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSidebarStore } from '../../stores/sidebarStore';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  BedDouble,
  UserCheck,
  Building2,
  FileText,
  Pill,
  FlaskConical,
  CreditCard,
  Briefcase,
  ShieldCheck,
  BarChart3,
  Bell,
  History,
  Settings,
  X,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  permission?: string;
  badge?: string | number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { isCollapsed, isMobileOpen, setMobileOpen } = useSidebarStore();
  const { hasPermission } = useAuthStore();
  const location = useLocation();

  const sections: NavSection[] = [
    {
      title: 'Main',
      items: [
        {
          label: 'Dashboard',
          path: '/dashboard',
          icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      title: 'Patient Care',
      items: [
        {
          label: 'Patients',
          path: '/patients',
          icon: <Users className="w-4 h-4 shrink-0" />,
          permission: 'patients.view',
        },
        {
          label: 'Appointments',
          path: '/appointments',
          icon: <Calendar className="w-4 h-4 shrink-0" />,
          permission: 'appointments.view',
        },
        {
          label: 'OPD Queue',
          path: '/opd/queue',
          icon: <Stethoscope className="w-4 h-4 shrink-0" />,
          permission: 'opd.queue',
        },
        {
          label: 'IPD Admissions',
          path: '/ipd/admissions',
          icon: <BedDouble className="w-4 h-4 shrink-0" />,
          permission: 'ipd.view',
        },
      ],
    },
    {
      title: 'Medical',
      items: [
        {
          label: 'Doctors',
          path: '/doctors',
          icon: <UserCheck className="w-4 h-4 shrink-0" />,
        },
        {
          label: 'Departments',
          path: '/departments',
          icon: <Building2 className="w-4 h-4 shrink-0" />,
        },
        {
          label: 'Prescriptions',
          path: '/prescriptions',
          icon: <FileText className="w-4 h-4 shrink-0" />,
          permission: 'prescriptions.view',
        },
      ],
    },
    {
      title: 'Operations',
      items: [
        {
          label: 'Pharmacy',
          path: '/pharmacy/medicines',
          icon: <Pill className="w-4 h-4 shrink-0" />,
          permission: 'pharmacy.view',
        },
        {
          label: 'Laboratory',
          path: '/laboratory/tests',
          icon: <FlaskConical className="w-4 h-4 shrink-0" />,
          permission: 'laboratory.view',
        },
        {
          label: 'Billing & Invoices',
          path: '/billing/invoices',
          icon: <CreditCard className="w-4 h-4 shrink-0" />,
          permission: 'billing.view',
        },
      ],
    },
    {
      title: 'Administration',
      items: [
        {
          label: 'Staff Directory',
          path: '/staff',
          icon: <Briefcase className="w-4 h-4 shrink-0" />,
        },
        {
          label: 'Users & Roles',
          path: '/settings/users',
          icon: <ShieldCheck className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      title: 'Analytics',
      items: [
        {
          label: 'Reports',
          path: '/reports',
          icon: <BarChart3 className="w-4 h-4 shrink-0" />,
          permission: 'reports.view',
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          label: 'Notifications',
          path: '/notifications',
          icon: <Bell className="w-4 h-4 shrink-0" />,
        },
        {
          label: 'Activity Logs',
          path: '/activity-logs',
          icon: <History className="w-4 h-4 shrink-0" />,
        },
        {
          label: 'Settings',
          path: '/settings',
          icon: <Settings className="w-4 h-4 shrink-0" />,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 select-none border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800/80 shrink-0">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white tracking-tight truncate leading-tight">
                ApexHealth
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                CLINICAL SUITE
              </span>
            </div>
          )}
        </NavLink>

        {isMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-6">
        {sections.map((section) => {
          // Filter items user has permission to see
          const visibleItems = section.items.filter(
            (item) => !item.permission || hasPermission(item.permission)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 mb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              {visibleItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => isMobileOpen && setMobileOpen(false)}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors group relative',
                      isActive
                        ? 'bg-sky-500/15 text-sky-400 font-semibold border-l-2 border-sky-400'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    )}
                  >
                    <span className={cn('transition-colors', isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200')}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {!isCollapsed && isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-sky-400 shrink-0 opacity-80" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Bottom Profile Summary */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-sky-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-xs font-bold shrink-0">
              AC
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">Dr. Campbell</p>
              <p className="text-[10px] text-slate-500 truncate">Super Admin</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={cn(
          'hidden md:block fixed top-0 bottom-0 left-0 z-30 transition-all duration-200 no-print',
          isCollapsed ? 'w-16' : 'w-60'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden no-print">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
