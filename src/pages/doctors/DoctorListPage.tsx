import React, { useState } from 'react';
import { useDoctors, useDepartments } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { DoctorModal } from './DoctorModal';
import { Doctor } from '../../types';
import { Select } from '../../components/ui/Select';
import { Edit2, Trash2, Filter } from 'lucide-react';

export const DoctorListPage: React.FC = () => {
  const [deptFilter, setDeptFilter] = useState('ALL');
  const { data: doctors = [], isLoading, isError } = useDoctors();
  const { data: departments = [] } = useDepartments();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const filteredDoctors = doctors.filter((d) => {
    if (deptFilter !== 'ALL' && d.department_id !== deptFilter) return false;
    return true;
  });

  const columns: Column<Doctor>[] = [
    {
      key: 'doctor_id',
      header: 'Doctor ID',
      sortable: true,
      className: 'w-28 font-mono font-medium text-sky-600 dark:text-sky-400',
    },
    {
      key: 'name',
      header: 'Physician',
      sortable: true,
      render: (d) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{d.name}</span>
          <p className="text-[11px] text-slate-400 font-mono">{d.license_number}</p>
        </div>
      ),
    },
    {
      key: 'specialization',
      header: 'Specialization & Department',
      sortable: true,
      render: (d) => (
        <div>
          <span className="font-medium text-slate-800 dark:text-slate-200">{d.specialization}</span>
          <p className="text-[11px] text-sky-600 dark:text-sky-400">{d.department_name}</p>
        </div>
      ),
    },
    {
      key: 'experience',
      header: 'Experience',
      sortable: true,
      render: (d) => <span className="tabular-nums">{d.experience} yrs</span>,
    },
    {
      key: 'schedule',
      header: 'Clinical Schedule',
      className: 'text-slate-600 dark:text-slate-300 text-xs',
    },
    {
      key: 'phone',
      header: 'Direct Phone',
      className: 'tabular-nums',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (d) => <StatusBadge status={d.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (d) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedDoctor(d);
              setModalOpen(true);
            }}
            title="Edit Doctor"
            className="h-7 w-7 text-slate-500 hover:text-amber-600"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Attending Physicians Directory"
        description="Clinical specialists, credential licensing, departmental affiliations, and consultation schedules."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Doctors' }]}
      />

      {/* Filter by Department */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 max-w-sm">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Department:</span>
        <Select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="h-8 text-xs flex-1"
        >
          <option value="ALL">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredDoctors}
        isLoading={isLoading}
        isError={isError}
        searchPlaceholder="Search doctors by name, license, specialization..."
        searchField={(d) => `${d.name} ${d.license_number} ${d.specialization} ${d.department_name}`}
        onAdd={() => {
          setSelectedDoctor(null);
          setModalOpen(true);
        }}
        addLabel="Add Doctor"
        emptyTitle="No physicians found"
        emptyDescription="Register specialist doctors to accept patient consultations."
      />

      {modalOpen && (
        <DoctorModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedDoctor(null);
          }}
          doctorToEdit={selectedDoctor}
        />
      )}
    </div>
  );
};
