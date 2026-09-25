import React from 'react';
import { useActivityLogs } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { ActivityLog } from '../../types';
import { formatDate } from '../../lib/formatters';
import { History, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ActivityLogsPage: React.FC = () => {
  const { data: logs = [], isLoading, isError } = useActivityLogs();

  const columns: Column<ActivityLog>[] = [
    {
      key: 'created_at',
      header: 'Timestamp',
      sortable: true,
      className: 'w-44 tabular-nums text-xs',
      render: (l) => formatDate(l.created_at),
    },
    {
      key: 'user_name',
      header: 'User / Identity',
      sortable: true,
      render: (l) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{l.user_name}</span>
          <p className="text-[10px] text-slate-400 font-mono">IP: {l.ip_address}</p>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action Performed',
      sortable: true,
      render: (l) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
          {l.action}
        </span>
      ),
    },
    {
      key: 'module',
      header: 'Module Scope',
      sortable: true,
      render: (l) => (
        <span className="text-xs font-medium text-sky-600 dark:text-sky-400 font-mono">
          {l.module}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Audit Trail Details',
      className: 'text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate',
      render: (l) => l.details || l.description,
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Audit Logs & Compliance Trails"
        description="Immutable HIPAA & HITECH-compliant electronic record access logs, patient data modifications, and staff actions."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Activity Logs' }]}
      />

      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        isError={isError}
        searchPlaceholder="Search audit trails by user, module, action..."
        searchField={(l) => `${l.user_name} ${l.action} ${l.module} ${l.details || l.description}`}
        emptyTitle="No audit records"
        emptyDescription="System user activity and clinical actions are automatically logged here."
      />
    </div>
  );
};
