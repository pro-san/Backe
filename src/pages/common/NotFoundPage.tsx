import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
        <FileQuestion className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">404</h1>
        <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300">Page Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          The medical record or screen you requested does not exist or has been relocated.
        </p>
      </div>
      <NavLink to="/dashboard">
        <Button size="sm" variant="primary" className="gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Button>
      </NavLink>
    </div>
  );
};
