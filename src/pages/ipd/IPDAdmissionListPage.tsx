import React, { useState } from 'react';
import { useAdmissions } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { AdmissionModal } from './AdmissionModal';
import { DischargeModal } from './DischargeModal';
import { Admission } from '../../types';
import { formatDate } from '../../lib/formatters';
import { BedDouble, LogOut, Plus, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const IPDAdmissionListPage: React.FC = () => {
  const { data: admissions = [], isLoading, isError } = useAdmissions();
  const navigate = useNavigate();

  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);
  const [dischargeModalOpen, setDischargeModalOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);

  const columns: Column<Admission>[] = [
    {
      key: 'admission_number',
      header: 'Admission #',
      sortable: true,
      className: 'w-32 font-mono font-medium text-sky-600 dark:text-sky-400',
    },
    {
      key: 'patient_name',
      header: 'Inpatient Details',
      sortable: true,
      render: (a) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{a.patient_name}</span>
          <p className="text-[11px] text-slate-400">Diagnosis: {a.diagnosis}</p>
        </div>
      ),
    },
    {
      key: 'ward',
      header: 'Ward & Bed',
      sortable: true,
      render: (a) => (
        <div>
          <span className="font-medium text-slate-800 dark:text-slate-200">{a.ward}</span>
          <p className="text-[11px] text-sky-600 dark:text-sky-400 font-mono">
            Room {a.room} · Bed {a.bed}
          </p>
        </div>
      ),
    },
    {
      key: 'doctor_name',
      header: 'Attending Physician',
      sortable: true,
      render: (a) => <span className="font-medium text-slate-700 dark:text-slate-300">{a.doctor_name}</span>,
    },
    {
      key: 'admission_date',
      header: 'Admitted Date',
      sortable: true,
      render: (a) => <span className="tabular-nums">{formatDate(a.admission_date)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (a) => <StatusBadge status={a.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (a) => (
        <div className="flex items-center justify-end gap-1">
          {a.status === 'Admitted' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedAdmission(a);
                setDischargeModalOpen(true);
              }}
              className="h-7 text-xs gap-1 text-emerald-700 hover:bg-emerald-50 border-emerald-200"
            >
              <LogOut className="w-3 h-3" />
              <span>Discharge</span>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Inpatient Admissions (IPD)"
        description="Ward occupancy, inpatient diagnosis tracking, patient bed allocation, and discharge coordination."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'IPD Admissions' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/ipd/beds')}
              className="gap-1.5"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Bed Visual Board</span>
            </Button>
            <Button size="sm" onClick={() => setAdmissionModalOpen(true)} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Admit Patient</span>
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={admissions}
        isLoading={isLoading}
        isError={isError}
        searchPlaceholder="Search admissions by patient, bed, doctor, diagnosis..."
        searchField={(a) => `${a.admission_number} ${a.patient_name} ${a.ward} ${a.bed} ${a.diagnosis}`}
        onAdd={() => setAdmissionModalOpen(true)}
        addLabel="Admit Patient"
        emptyTitle="No active inpatients"
        emptyDescription="All hospital beds are currently available or awaiting new admissions."
      />

      <AdmissionModal
        isOpen={admissionModalOpen}
        onClose={() => setAdmissionModalOpen(false)}
      />

      <DischargeModal
        isOpen={dischargeModalOpen}
        onClose={() => {
          setDischargeModalOpen(false);
          setSelectedAdmission(null);
        }}
        admission={selectedAdmission}
      />
    </div>
  );
};
