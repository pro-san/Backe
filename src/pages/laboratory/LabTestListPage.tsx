import React from 'react';
import { useLabTests } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { LabTest } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, ClipboardList } from 'lucide-react';

export const LabTestListPage: React.FC = () => {
  const { data: tests = [], isLoading, isError } = useLabTests();
  const navigate = useNavigate();

  const columns: Column<LabTest>[] = [
    {
      key: 'code',
      header: 'Test Code',
      sortable: true,
      className: 'w-28 font-mono font-medium text-sky-600 dark:text-sky-400',
    },
    {
      key: 'name',
      header: 'Diagnostic Test Name',
      sortable: true,
      render: (t) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{t.name}</span>
          <p className="text-[11px] text-slate-400">{t.category}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Discipline',
      sortable: true,
      render: (t) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {t.category}
        </span>
      ),
    },
    {
      key: 'normal_range',
      header: 'Reference Norm',
      render: (t) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 font-mono">
          {t.reference_range || t.normal_range} {t.unit}
        </span>
      ),
    },
    {
      key: 'turnaround_time',
      header: 'Turnaround',
      className: 'text-xs text-slate-500 tabular-nums',
    },
    {
      key: 'price',
      header: 'Standard Tariff',
      sortable: true,
      render: (t) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
          {formatCurrency(t.price)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (t) => <StatusBadge status={t.status} />,
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Diagnostic Laboratory Catalogue"
        description="Pathology test master directory, standard normal ranges, turnaround expectations, and pricing."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Laboratory Catalog' }]}
        actions={
          <Button
            size="sm"
            onClick={() => navigate('/laboratory/orders')}
            className="gap-1.5"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Active Lab Orders</span>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={tests}
        isLoading={isLoading}
        isError={isError}
        searchPlaceholder="Search diagnostic tests by name, code, discipline..."
        searchField={(t) => `${t.code} ${t.name} ${t.category}`}
        emptyTitle="No laboratory tests catalogued"
        emptyDescription="Diagnostic panels and tests will appear here."
      />
    </div>
  );
};
