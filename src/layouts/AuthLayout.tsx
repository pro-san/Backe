import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Activity, ShieldCheck, HeartPulse, CheckCircle2 } from 'lucide-react';
import { ToastContainer } from '../components/ui/ToastContainer';

export const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-between">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Left Column: Clinical Brand & Security Overview */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white p-8 flex-col justify-between relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-md">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-white leading-tight">ApexHealth</h2>
                  <p className="text-[11px] font-medium text-sky-400">Clinical Management Suite</p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-xl font-bold tracking-tight text-slate-100 leading-snug">
                  Precision Patient Care & Clinical Operations
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enterprise Electronic Health Records (EHR), dynamic triage queues, automated pharmacy dispensing, and secure billing.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>HIPAA & HITECH Compliant Auditing</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <HeartPulse className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Integrated Real-Time OPD/IPD Workflows</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Role-Based Granular Access Control</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-8 border-t border-slate-800 text-[11px] text-slate-400">
              St. Jude Apex Medical Center · Hospital System v2.4
            </div>

            {/* Background subtle mesh glow */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Right Column: Form Container */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} St. Jude Apex Medical Center. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Clinical Compliance</span>
          </div>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
};
