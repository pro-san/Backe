import React, { useState } from 'react';
import { usePatients, useDeletePatient } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PatientModal } from './PatientModal';
import { Patient } from '../../types';
import { calculateAge } from '../../lib/dateUtils';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, Trash2, Download, Filter } from 'lucide-react';
import { Select } from '../../components/ui/Select';
import { toast } from '../../stores/toastStore';

export const PatientListPage: React.FC = () => {
  const { data: patients = [], isLoading, isError } = usePatients();
  const deleteMutation = useDeletePatient();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  // Filters
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [bloodFilter, setBloodFilter] = useState('ALL');

  const filteredPatients = patients.filter((p) => {
    if (genderFilter !== 'ALL' && p.gender !== genderFilter) return false;
    if (bloodFilter !== 'ALL' && p.blood_group !== bloodFilter) return false;
    return true;
  });

  const handleEdit = (p: Patient) => {
    setSelectedPatient(p);
    setModalOpen(true);
  };

  const handleDeletePrompt = (p: Patient) => {
    setPatientToDelete(p);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (patientToDelete) {
      await deleteMutation.mutateAsync(patientToDelete.id);
      setDeleteConfirmOpen(false);
      setPatientToDelete(null);
    }
  };

  const handleExportCsv = () => {
    const headers = ['Patient ID', 'First Name', 'Last Name', 'Gender', 'DOB', 'Phone', 'Email', 'Blood Group', 'Status'];
    const rows = filteredPatients.map((p) => [
      p.patient_id,
      p.first_name,
      p.last_name,
      p.gender,
      p.date_of_birth,
      p.phone,
      p.email || '',
      p.blood_group || '',
      p.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `patients_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Patient list exported to CSV');
  };

  const columns: Column<Patient>[] = [
    {
      key: 'patient_id',
      header: 'Patient ID',
      sortable: true,
      className: 'w-28 font-mono font-medium text-sky-600 dark:text-sky-400',
    },
    {
      key: 'name',
      header: 'Patient Name',
      sortable: true,
      render: (p) => (
        <div>
          <button
            onClick={() => navigate(`/patients/${p.id}`)}
            className="font-semibold text-slate-900 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400 text-left transition-colors"
          >
            {p.first_name} {p.last_name}
          </button>
          <p className="text-[11px] text-slate-400">{p.email || 'No email registered'}</p>
        </div>
      ),
    },
    {
      key: 'gender',
      header: 'Gender & Age',
      render: (p) => (
        <span className="tabular-nums">
          {p.gender} · {calculateAge(p.date_of_birth)} yrs
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      className: 'tabular-nums',
    },
    {
      key: 'blood_group',
      header: 'Blood Group',
      sortable: true,
      render: (p) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 tabular-nums">
          {p.blood_group || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/patients/${p.id}`)}
            title="View Patient Record"
            className="h-7 w-7 text-slate-500 hover:text-sky-600"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(p)}
            title="Edit Demographics"
            className="h-7 w-7 text-slate-500 hover:text-amber-600"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeletePrompt(p)}
            title="Archive Patient"
            className="h-7 w-7 text-slate-500 hover:text-rose-600"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Patient Master Index"
        description="Comprehensive Electronic Health Records (EHR) registry, vitals tracking, and clinical profiles."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Patients' }]}
        actions={
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        }
      />

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          <span className="font-semibold">Filters:</span>
        </div>
        <div className="w-36">
          <Select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="h-8 text-xs"
          >
            <option value="ALL">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Select>
        </div>
        <div className="w-36">
          <Select
            value={bloodFilter}
            onChange={(e) => setBloodFilter(e.target.value)}
            className="h-8 text-xs"
          >
            <option value="ALL">All Blood Groups</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredPatients}
        isLoading={isLoading}
        isError={isError}
        searchPlaceholder="Search patients by name, MRN, phone, or email..."
        searchField={(p) => `${p.first_name} ${p.last_name} ${p.patient_id} ${p.phone} ${p.email}`}
        onAdd={() => {
          setSelectedPatient(null);
          setModalOpen(true);
        }}
        addLabel="New Patient"
        emptyTitle="No patient records found"
        emptyDescription="Get started by registering a new patient into the hospital registry."
      />

      {/* Modals */}
      {modalOpen && (
        <PatientModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedPatient(null);
          }}
          patientToEdit={selectedPatient}
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Archive Patient Record"
        message={`Are you sure you want to archive ${patientToDelete?.first_name} ${patientToDelete?.last_name} (${patientToDelete?.patient_id})? This will restrict active appointments.`}
        confirmLabel="Archive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
