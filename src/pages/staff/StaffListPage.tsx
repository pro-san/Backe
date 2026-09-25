import React, { useState } from 'react';
import { useStaff } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { StaffModal } from './StaffModal';
import { Staff } from '../../types';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { Plus, Briefcase, Mail, Phone } from 'lucide-react';

export const StaffListPage: React.FC = () => {
  const { data: staffList = [], isLoading, isError } = useStaff();
  const [modalOpen, setModalOpen] = useState(false);

  const columns: Column<Staff>[] = [
    {
      key: 'staff_id',
      header: 'Staff ID',
      sortable: true,
      className: 'w-28 font-mono font-medium text-sky-600 dark:text-sky-400',
    },
    {
      key: 'name',
      header: 'Employee Name & Role',
      sortable: true,
      render: (s) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{s.name}</span>
          <p className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">{s.role}</p>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      render: (s) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {s.department_name || s.department}
        </span>
      ),
    },
    {
      key: 'qualification',
      header: 'Credentials',
      className: 'text-xs text-slate-500',
    },
    {
      key: 'email',
      header: 'Contact Email',
      render: (s) => (
        <div>
          <span className="text-xs text-slate-700 dark:text-slate-300">{s.email}</span>
          <p className="text-[11px] text-slate-400">{s.phone}</p>
        </div>
      ),
    },
    {
      key: 'salary',
      header: 'Compensation',
      sortable: true,
      render: (s) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
          {formatCurrency(s.salary || 65000)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (s) => <StatusBadge status={s.status} />,
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Hospital Staff Directory"
        description="Nursing teams, pharmacists, diagnostic laboratory technicians, and administrative officers."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Staff' }]}
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Staff Member</span>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={staffList}
        isLoading={isLoading}
        isError={isError}
        searchPlaceholder="Search staff by name, role, department..."
        searchField={(s) => `${s.staff_id} ${s.name} ${s.role} ${s.department_name || s.department} ${s.email}`}
        onAdd={() => setModalOpen(true)}
        addLabel="Add Staff Member"
        emptyTitle="No staff members registered"
        emptyDescription="Add healthcare personnel and assign them to hospital departments."
      />

      <StaffModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
