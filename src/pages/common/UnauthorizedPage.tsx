import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export const UnauthorizedPage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Access Restricted</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          Your current security persona (<span className="font-semibold text-slate-700 dark:text-slate-200">{user?.role}</span>) does not have authorization to view this module.
        </p>
      </div>
      <div className="flex gap-2">
        <NavLink to="/dashboard">
          <Button size="sm" variant="primary" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Button>
        </NavLink>
      </div>
    </div>
  );
};
