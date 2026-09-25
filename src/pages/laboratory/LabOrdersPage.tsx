import React, { useState } from 'react';
import { useLabOrders } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { LabResultModal } from './LabResultModal';
import { LabOrder } from '../../types';
import { formatDate } from '../../lib/formatters';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, ArrowLeft, CheckCircle, FileText, Activity } from 'lucide-react';

export const LabOrdersPage: React.FC = () => {
  const { data: orders = [], isLoading, isError } = useLabOrders();
  const navigate = useNavigate();

  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);

  const handleEnterResult = (order: LabOrder) => {
    setSelectedOrder(order);
    setResultModalOpen(true);
  };

  const columns: Column<LabOrder>[] = [
    {
      key: 'order_number',
      header: 'Order #',
      sortable: true,
      className: 'w-32 font-mono font-medium text-sky-600 dark:text-sky-400',
    },
    {
      key: 'patient_name',
      header: 'Patient Details',
      sortable: true,
      render: (o) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{o.patient_name}</span>
          <p className="text-[11px] text-slate-400">Attending: {o.doctor_name}</p>
        </div>
      ),
    },
    {
      key: 'test_names',
      header: 'Requisitioned Panels',
      render: (o) => (
        <div className="flex flex-wrap gap-1">
          {o.test_names.map((t, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-900/40"
            >
              {t}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Triage Priority',
      sortable: true,
      render: (o) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            o.priority === 'STAT' || o.priority === 'Emergency'
              ? 'bg-rose-100 text-rose-700 border border-rose-300'
              : o.priority === 'Urgent'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {o.priority}
        </span>
      ),
    },
    {
      key: 'order_date',
      header: 'Ordered At',
      sortable: true,
      render: (o) => <span className="tabular-nums text-xs">{formatDate(o.created_at || o.order_date)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (o) => <StatusBadge status={o.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (o) => (
        <div className="flex items-center justify-end gap-1">
          {o.status !== 'Completed' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEnterResult(o)}
              className="h-7 text-xs gap-1 text-sky-700 border-sky-300 hover:bg-sky-50"
            >
              <Activity className="w-3 h-3" />
              <span>Enter Results</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEnterResult(o)}
              className="h-7 text-xs gap-1 text-emerald-600 hover:bg-emerald-50"
            >
              <FileText className="w-3 h-3" />
              <span>Verified Report</span>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Pathology Worklist & Specimen Tracking"
        description="Clinical laboratory orders requisitioned by outpatient clinics and inpatient wards."
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Laboratory Catalog', href: '/laboratory/tests' },
          { label: 'Orders' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/laboratory/tests')} className="gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Test Catalog</span>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        isError={isError}
        searchPlaceholder="Search lab orders by patient, order #, test name..."
        searchField={(o) => `${o.order_number} ${o.patient_name} ${o.doctor_name} ${o.test_names.join(' ')}`}
        emptyTitle="No laboratory orders awaiting processing"
        emptyDescription="Lab orders placed during patient consultations will automatically sync here."
      />

      <LabResultModal
        isOpen={resultModalOpen}
        onClose={() => {
          setResultModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />
    </div>
  );
};
