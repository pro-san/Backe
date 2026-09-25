import React, { useState } from 'react';
import { usePrescriptions } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/ui/Button';
import { PrescriptionModal } from './PrescriptionModal';
import { Prescription } from '../../types';
import { formatDate } from '../../lib/formatters';
import { useNavigate } from 'react-router-dom';
import { Eye, Printer, Plus, Send } from 'lucide-react';
import { toast } from '../../stores/toastStore';

export const PrescriptionListPage: React.FC = () => {
  const { data: prescriptions = [], isLoading, isError } = usePrescriptions();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const handleSendToPharmacy = (rx: Prescription) => {
    toast.success(`Prescription ${rx.prescription_number} dispatched to Hospital Pharmacy Dispensing Queue.`);
  };

  const columns: Column<Prescription>[] = [
    {
      key: 'prescription_number',
      header: 'Prescription #',
      sortable: true,
      className: 'w-36 font-mono font-medium text-sky-600 dark:text-sky-400',
    },
    {
      key: 'patient_name',
      header: 'Patient Details',
      sortable: true,
      render: (rx) => (
        <div>
          <button
            onClick={() => navigate(`/prescriptions/${rx.id}`)}
            className="font-semibold text-slate-900 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400 text-left"
          >
            {rx.patient_name}
          </button>
          <p className="text-[11px] text-slate-400">
            {rx.patient_gender} · {rx.patient_age} yrs
          </p>
        </div>
      ),
    },
    {
      key: 'doctor_name',
      header: 'Prescribing Doctor',
      sortable: true,
      render: (rx) => (
        <div>
          <span className="font-medium text-slate-800 dark:text-slate-200">{rx.doctor_name}</span>
          <p className="text-[11px] text-slate-400">{rx.doctor_specialization}</p>
        </div>
      ),
    },
    {
      key: 'diagnosis',
      header: 'Clinical Diagnosis',
      className: 'max-w-[200px] truncate text-slate-600 dark:text-slate-400',
    },
    {
      key: 'medicines',
      header: 'Medications',
      render: (rx) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
          {rx.medicines.length} items
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date Issued',
      sortable: true,
      render: (rx) => <span className="tabular-nums">{formatDate(rx.date)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (rx) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/prescriptions/${rx.id}`)}
            title="View Prescription"
            className="h-7 w-7 text-slate-500 hover:text-sky-600"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              navigate(`/prescriptions/${rx.id}?print=true`);
            }}
            title="Print Rx"
            className="h-7 w-7 text-slate-500 hover:text-indigo-600"
          >
            <Printer className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleSendToPharmacy(rx)}
            title="Send to Pharmacy"
            className="h-7 w-7 text-emerald-600 hover:bg-emerald-50"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Electronic Prescriptions (e-Rx)"
        description="Signed medication orders, dosage regimens, automated pharmacy routing, and printed doctor slips."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Prescriptions' }]}
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Create Prescription</span>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={prescriptions}
        isLoading={isLoading}
        isError={isError}
        searchPlaceholder="Search prescriptions by patient, doctor, diagnosis, Rx #..."
        searchField={(r) => `${r.prescription_number} ${r.patient_name} ${r.doctor_name} ${r.diagnosis}`}
        onAdd={() => setModalOpen(true)}
        addLabel="Create Prescription"
        emptyTitle="No prescriptions recorded"
        emptyDescription="Prescriptions generated during physician consultations will appear here."
      />

      <PrescriptionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
