import React, { useState } from 'react';
import { useSidebarStore } from '../../stores/sidebarStore';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import {
  Menu,
  Sun,
  Moon,
  Laptop,
  Bell,
  LogOut,
  User,
  Shield,
  ChevronDown,
  Activity,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from '../../stores/toastStore';

export const Header: React.FC = () => {
  const { toggleCollapse, toggleMobile } = useSidebarStore();
  const { user, logout, login } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [roleSwitchOpen, setRoleSwitchOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('Logged out from medical session');
    navigate('/login');
  };

  const demoRoles = [
    { role: 'Super Admin', name: 'Dr. Arthur Campbell', email: 'admin@hospital.org' },
    { role: 'Doctor', name: 'Dr. Elena Rostova', email: 'e.rostova@hospital.org' },
    { role: 'Nurse', name: 'Nurse Beatrice Morales', email: 'b.morales@hospital.org' },
    { role: 'Pharmacist', name: 'Fiona Gallagher', email: 'pharmacy@hospital.org' },
    { role: 'Laboratory Staff', name: 'Clara Oswald', email: 'lab@hospital.org' },
    { role: 'Receptionist', name: 'Hannah Wright', email: 'reception@hospital.org' },
    { role: 'Accountant', name: 'Julian Drake', email: 'billing@hospital.org' },
  ];

  const handleRoleSwitch = (r: typeof demoRoles[0]) => {
    login(
      {
        id: 'usr_' + r.role.toLowerCase().replace(/\s+/g, '_'),
        name: r.name,
        email: r.email,
        role: r.role,
        status: 'Active',
        created_at: '2024-01-01',
      },
      'demo-switch-token'
    );
    toast.success(`Active persona switched to ${r.role} (${r.name})`);
    setRoleSwitchOpen(false);
    setProfileOpen(false);
  };

  return (
    <header className="sticky top-0 z-20 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between no-print">
      {/* Left zone: Collapse button & Hospital Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobile}
          aria-label="Open navigation drawer"
          className="md:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={toggleCollapse}
          aria-label="Toggle sidebar collapse"
          className="hidden md:flex p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-slate-200">St. Jude Apex Medical Center</span>
          <span aria-hidden="true">·</span>
          <span>EHR & Clinical Workflow</span>
        </div>
      </div>

      {/* Right zone: Actions (Role Persona Badge, Notifications, Theme, Profile) */}
      <div className="flex items-center gap-2">
        {/* Role Persona Switcher Button */}
        <div className="relative">
          <button
            onClick={() => setRoleSwitchOpen(!roleSwitchOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span className="hidden sm:inline">Role:</span>
            <span className="font-semibold text-sky-700 dark:text-sky-300">{user?.role || 'Guest'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {roleSwitchOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setRoleSwitchOpen(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 text-left text-xs">
                <div className="px-2.5 py-1.5 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                  Switch Demo Persona
                </div>
                <div className="space-y-0.5">
                  {demoRoles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => handleRoleSwitch(r)}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{r.role}</p>
                        <p className="text-[11px] text-slate-500 truncate">{r.name}</p>
                      </div>
                      {user?.role === r.role && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notifications Shortcut */}
        <NavLink
          to="/notifications"
          aria-label="View notifications"
          className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
        </NavLink>

        {/* Theme Toggle Button */}
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-800/80">
          <button
            onClick={() => setTheme('light')}
            aria-label="Light mode"
            className={`p-1.5 rounded-md transition-colors ${
              theme === 'light'
                ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            aria-label="Dark mode"
            className={`p-1.5 rounded-md transition-colors ${
              theme === 'dark'
                ? 'bg-white dark:bg-slate-700 text-sky-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('system')}
            aria-label="System theme mode"
            className={`p-1.5 rounded-md transition-colors ${
              theme === 'system'
                ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-semibold">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                {user?.name || 'Staff User'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{user?.role || 'Guest'}</p>
            </div>
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 text-left text-xs">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <NavLink
                    to="/settings/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Profile</span>
                  </NavLink>
                  <NavLink
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Activity className="w-3.5 h-3.5 text-slate-400" />
                    <span>Settings</span>
                  </NavLink>
                </div>
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
