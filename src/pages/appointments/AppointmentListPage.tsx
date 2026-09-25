import React, { useState } from 'react';
import { useAppointments, useDoctors, useUpdateAppointment } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { AppointmentModal } from './AppointmentModal';
import { Appointment } from '../../types';
import { formatDate } from '../../lib/formatters';
import { Select } from '../../components/ui/Select';
import { Calendar as CalendarIcon, List, Edit2, CheckCircle, Ban, Filter, Plus } from 'lucide-react';
import { toast } from '../../stores/toastStore';

export const AppointmentListPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [doctorFilter, setDoctorFilter] = useState('ALL');

  const { data: appointments = [], isLoading, isError } = useAppointments();
  const { data: doctors = [] } = useDoctors();
  const updateMutation = useUpdateAppointment();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const filteredAppointments = appointments.filter((apt) => {
    if (statusFilter !== 'ALL' && apt.status !== statusFilter) return false;
    if (doctorFilter !== 'ALL' && apt.doctor_id !== doctorFilter) return false;
    return true;
  });

  const handleStatusChange = async (apt: Appointment, newStatus: any) => {
    await updateMutation.mutateAsync({
      id: apt.id,
      data: { status: newStatus },
    });
  };

  const columns: Column<Appointment>[] = [
    {
      key: 'appointment_number',
      header: 'Appt Number',
      sortable: true,
      className: 'w-32 font-mono font-medium text-sky-600 dark:text-sky-400',
    },
    {
      key: 'patient_name',
      header: 'Patient Details',
      sortable: true,
      render: (a) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{a.patient_name}</span>
          <p className="text-[11px] text-slate-400">{a.patient_phone || 'No phone'}</p>
        </div>
      ),
    },
    {
      key: 'doctor_name',
      header: 'Assigned Physician',
      sortable: true,
      render: (a) => (
        <div>
          <span className="font-medium text-slate-800 dark:text-slate-200">{a.doctor_name}</span>
          <p className="text-[11px] text-sky-600 dark:text-sky-400">{a.department_name}</p>
        </div>
      ),
    },
    {
      key: 'appointment_date',
      header: 'Date & Time',
      sortable: true,
      render: (a) => (
        <span className="tabular-nums">
          {formatDate(a.appointment_date)} at <strong>{a.appointment_time}</strong>
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Visit Type',
      render: (a) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{a.type}</span>
      ),
    },
    {
      key: 'reason',
      header: 'Chief Complaint',
      className: 'max-w-[200px] truncate text-slate-600 dark:text-slate-400',
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
          {a.status === 'Scheduled' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleStatusChange(a, 'Waiting')}
              title="Patient Checked In (Queue to Waiting)"
              className="h-7 w-7 text-emerald-600 hover:bg-emerald-50"
            >
              <CheckCircle className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedAppointment(a);
              setModalOpen(true);
            }}
            title="Edit / Reschedule"
            className="h-7 w-7 text-slate-500 hover:text-sky-600"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          {a.status !== 'Cancelled' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleStatusChange(a, 'Cancelled')}
              title="Cancel Appointment"
              className="h-7 w-7 text-slate-500 hover:text-rose-600"
            >
              <Ban className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Appointment Scheduling"
        description="Comprehensive outpatient visit timetable, patient check-in queue, and consultation slots."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Appointments' }]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-800/80">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Calendar Grid</span>
              </button>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setSelectedAppointment(null);
                setModalOpen(true);
              }}
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </Button>
          </div>
        }
      />

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          <span className="font-semibold">Filter:</span>
        </div>
        <div className="w-40">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Waiting">Waiting</option>
            <option value="In Consultation">In Consultation</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </Select>
        </div>
        <div className="w-48">
          <Select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="h-8 text-xs"
          >
            <option value="ALL">All Doctors</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {viewMode === 'list' ? (
        <DataTable
          columns={columns}
          data={filteredAppointments}
          isLoading={isLoading}
          isError={isError}
          searchPlaceholder="Search appointments by patient, doctor, appointment #..."
          searchField={(a) => `${a.appointment_number} ${a.patient_name} ${a.doctor_name} ${a.reason}`}
          onAdd={() => {
            setSelectedAppointment(null);
            setModalOpen(true);
          }}
          addLabel="Book Appointment"
          emptyTitle="No appointments found"
          emptyDescription="Schedule an appointment for outpatients visiting hospital clinics."
        />
      ) : (
        /* Calendar Grid Schedule Mode */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Schedule Overview — {formatDate(new Date().toISOString())}
            </h3>
            <span className="text-xs text-slate-500">Showing confirmed outpatient slots</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-sky-300 dark:hover:border-sky-700 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                    {apt.appointment_time}
                  </span>
                  <StatusBadge status={apt.status} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{apt.patient_name}</h4>
                  <p className="text-[11px] text-slate-500">With {apt.doctor_name} ({apt.department_name})</p>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                  {apt.reason}
                </p>
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] px-2"
                    onClick={() => {
                      setSelectedAppointment(apt);
                      setModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modalOpen && (
        <AppointmentModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointmentToEdit={selectedAppointment}
        />
      )}
    </div>
  );
};
