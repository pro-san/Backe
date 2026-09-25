import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, RefreshCw, Server, Layers, Link as LinkIcon } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { dbApi, DbStatusResponse } from '../../services/dbApi';
import { toast } from '../../stores/toastStore';

interface MongoDbModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (status: DbStatusResponse) => void;
}

export const MongoDbModal: React.FC<MongoDbModalProps> = ({ isOpen, onClose, onStatusChange }) => {
  const [status, setStatus] = useState<DbStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [customUri, setCustomUri] = useState('');
  const [connecting, setConnecting] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await dbApi.getStatus();
      if (res?.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
        setStatus(res.data);
        if (res.data.uri && !customUri) {
          setCustomUri(res.data.uri);
        }
        onStatusChange?.(res.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUri.trim()) {
      toast.error('Please enter a MongoDB connection string');
      return;
    }

    setConnecting(true);
    try {
      const res = await dbApi.connect(customUri.trim());
      if (res?.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
        setStatus(res.data);
        onStatusChange?.(res.data);
      }
      if (res.success) {
        toast.success('Successfully connected to MongoDB database!');
      } else {
        toast.error(`Connection notice: ${res.message}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to connect to MongoDB');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="MongoDB Database & Frontend Connection"
      description="Real-time MongoDB database connection and full-stack API integration status."
      maxWidth="xl"
    >
      <div className="space-y-4 text-left">
        {/* Connection Status Banner */}
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            status?.connected
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
          }`}
        >
          <div className="mt-0.5">
            {status?.connected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            )}
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {status?.connected ? 'MongoDB Connected' : 'Frontend Connected (Express + In-Memory Fallback)'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full font-medium text-[10px] ${
                  status?.connected
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                }`}
              >
                {status?.statusText || 'Checking...'}
              </span>
            </div>
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              {status?.connected
                ? 'All clinical and patient data are actively queried and persisted in MongoDB database.'
                : 'Full-stack Express API is running at /api/*. You can connect to MongoDB Atlas or local MongoDB using the connection string below.'}
            </p>
          </div>
        </div>

        {/* Database Details & Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Database</span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 truncate">
              {status?.database || 'hospital_management'}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              <span>Patients</span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
              {status?.collections?.patients ?? '—'}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
              <Server className="w-3.5 h-3.5 text-indigo-600" />
              <span>Doctors</span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
              {status?.collections?.doctors ?? '—'}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
              <LinkIcon className="w-3.5 h-3.5 text-purple-600" />
              <span>Appointments</span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
              {status?.collections?.appointments ?? '—'}
            </p>
          </div>
        </div>

        {/* MongoDB Connection String Form */}
        <form onSubmit={handleConnect} className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <Input
            label="MongoDB Connection String (URI)"
            placeholder="mongodb://127.0.0.1:27017/hospital_management or mongodb+srv://..."
            hint="Supports MongoDB Atlas (mongodb+srv://...) and local MongoDB instances."
            value={customUri}
            onChange={(e) => setCustomUri(e.target.value)}
          />

          <div className="flex items-center justify-between pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchStatus}
              disabled={loading || connecting}
              className="gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
              <Button type="submit" size="sm" isLoading={connecting} disabled={connecting} className="gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Connect MongoDB</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Dialog>
  );
};
