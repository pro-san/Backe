import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import {
  useCreateAppointment,
  useUpdateAppointment,
  usePatients,
  useDoctors,
  useDepartments,
} from '../../hooks/useHospitalQueries';
import { Appointment } from '../../types';

const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Please select a patient'),
  doctor_id: z.string().min(1, 'Please select a doctor'),
  department_id: z.string().min(1, 'Please select a department'),
  appointment_date: z.string().min(4, 'Appointment date is required'),
  appointment_time: z.string().min(2, 'Time is required'),
  type: z.enum(['Routine', 'Follow-up', 'Emergency', 'Specialist Consultation']),
  reason: z.string().min(3, 'Reason for visit is required'),
  notes: z.string().optional(),
  status: z.enum(['Scheduled', 'Confirmed', 'Waiting', 'In Consultation', 'Completed', 'Cancelled', 'No Show']),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentToEdit?: Appointment | null;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  appointmentToEdit,
}) => {
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const { data: patients = [] } = usePatients();
  const { data: doctors = [] } = useDoctors();
  const { data: departments = [] } = useDepartments();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: '',
      doctor_id: '',
      department_id: '',
      appointment_date: new Date().toISOString().split('T')[0],
      appointment_time: '09:30',
      type: 'Routine',
      reason: '',
      notes: '',
      status: 'Scheduled',
    },
  });

  const selectedDeptId = watch('department_id');
  const filteredDoctors = doctors.filter((doc) => !selectedDeptId || doc.department_id === selectedDeptId);

  useEffect(() => {
    if (!isOpen) return;

    if (appointmentToEdit) {
      reset({
        patient_id: appointmentToEdit.patient_id,
        doctor_id: appointmentToEdit.doctor_id,
        department_id: appointmentToEdit.department_id,
        appointment_date: appointmentToEdit.appointment_date,
        appointment_time: appointmentToEdit.appointment_time,
        type: appointmentToEdit.type as any,
        reason: appointmentToEdit.reason,
        notes: appointmentToEdit.notes || '',
        status: (appointmentToEdit.status as any) || 'Scheduled',
      });
    } else {
      reset({
        patient_id: patients[0]?.id || '',
        doctor_id: doctors[0]?.id || '',
        department_id: departments[0]?.id || '',
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: '09:30',
        type: 'Routine',
        reason: '',
        notes: '',
        status: 'Scheduled',
      });
    }
  }, [isOpen, appointmentToEdit]);

  const onSubmit = async (data: AppointmentFormData) => {
    const p = patients.find((pat) => pat.id === data.patient_id);
    const d = doctors.find((doc) => doc.id === data.doctor_id);
    const dept = departments.find((dep) => dep.id === data.department_id);

    const payload = {
      ...data,
      patient_name: p ? `${p.first_name} ${p.last_name}` : 'Unknown Patient',
      patient_phone: p?.phone || '',
      doctor_name: d?.name || 'Assigned Physician',
      department_name: dept?.name || 'Outpatient Clinic',
    };

    if (appointmentToEdit) {
      await updateMutation.mutateAsync({ id: appointmentToEdit.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={appointmentToEdit ? `Update Appointment — ${appointmentToEdit.appointment_number}` : 'Book Patient Appointment'}
      description="Schedule clinical consultation with department specialists."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Patient Selection */}
        <div className="space-y-1.5 text-left">
          <Select
            label="Patient"
            error={errors.patient_id?.message}
            required
            {...register('patient_id')}
          >
            <option value="">Select Patient...</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.first_name} {p.last_name} ({p.patient_id}) — {p.phone}
              </option>
            ))}
          </Select>
        </div>

        {/* Department & Doctor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Department"
            error={errors.department_id?.message}
            required
            {...register('department_id')}
            onChange={(e) => {
              setValue('department_id', e.target.value);
              const firstDoc = doctors.find((d) => d.department_id === e.target.value);
              if (firstDoc) setValue('doctor_id', firstDoc.id);
            }}
          >
            <option value="">Select Department...</option>
            {departments.map((dep) => (
              <option key={dep.id} value={dep.id}>
                {dep.name}
              </option>
            ))}
          </Select>

          <Select
            label="Attending Doctor"
            error={errors.doctor_id?.message}
            required
            {...register('doctor_id')}
          >
            <option value="">Select Doctor...</option>
            {filteredDoctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.specialization})
              </option>
            ))}
          </Select>
        </div>

        {/* Date, Time Slot, Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Date"
            type="date"
            error={errors.appointment_date?.message}
            required
            {...register('appointment_date')}
          />
          <Input
            label="Time Slot"
            type="time"
            error={errors.appointment_time?.message}
            required
            {...register('appointment_time')}
          />
          <Select label="Visit Type" error={errors.type?.message} {...register('type')}>
            <option value="Routine">Routine</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Specialist Consultation">Specialist Consultation</option>
            <option value="Emergency">Emergency</option>
          </Select>
        </div>

        {/* Status (if editing) */}
        {appointmentToEdit && (
          <div>
            <Select label="Appointment Status" {...register('status')}>
              <option value="Scheduled">Scheduled</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Waiting">Waiting</option>
              <option value="In Consultation">In Consultation</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No Show">No Show</option>
            </Select>
          </div>
        )}

        {/* Reason for Visit */}
        <div>
          <Input
            label="Chief Complaint / Reason for Visit"
            placeholder="e.g. Recurrent cephalea with photophobia"
            error={errors.reason?.message}
            required
            {...register('reason')}
          />
        </div>

        {/* Clinical Preparation Notes */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
            Special Instructions / Clinical Notes
          </label>
          <textarea
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            rows={2}
            placeholder="e.g. Fasting blood work required before checkup."
            {...register('notes')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isSaving}>
            {appointmentToEdit ? 'Save Changes' : 'Confirm Booking'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
