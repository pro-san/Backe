import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useCreateAdmission, usePatients, useDoctors, useWards, useBeds } from '../../hooks/useHospitalQueries';

const admissionSchema = z.object({
  patient_id: z.string().min(1, 'Please select patient'),
  doctor_id: z.string().min(1, 'Please select doctor'),
  ward: z.string().min(1, 'Select ward'),
  room: z.string().min(1, 'Room number required'),
  bed: z.string().min(1, 'Select bed'),
  admission_date: z.string().min(4, 'Date required'),
  diagnosis: z.string().min(3, 'Diagnosis is required'),
  notes: z.string().optional(),
});

type AdmissionFormData = z.infer<typeof admissionSchema>;

interface AdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdmissionModal: React.FC<AdmissionModalProps> = ({ isOpen, onClose }) => {
  const createMutation = useCreateAdmission();
  const { data: patients = [] } = usePatients();
  const { data: doctors = [] } = useDoctors();
  const { data: wards = [] } = useWards();
  const { data: beds = [] } = useBeds();

  const availableBeds = beds.filter((b) => b.status === 'Available');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AdmissionFormData>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      patient_id: patients[0]?.id || '',
      doctor_id: doctors[0]?.id || '',
      ward: wards[0]?.name || 'Cardiovascular Care Ward',
      room: '301',
      bed: availableBeds[0]?.bed_number || 'B-301-B',
      admission_date: new Date().toISOString().split('T')[0],
      diagnosis: '',
      notes: '',
    },
  });

  const onSubmit = async (data: AdmissionFormData) => {
    const p = patients.find((pat) => pat.id === data.patient_id);
    const d = doctors.find((doc) => doc.id === data.doctor_id);

    await createMutation.mutateAsync({
      ...data,
      patient_name: p ? `${p.first_name} ${p.last_name}` : 'Patient',
      doctor_name: d?.name || 'Attending Physician',
    });
    reset();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Admit Patient to Inpatient Care (IPD)"
      description="Assign patient to ward, available bed, and attending medical team."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Patient & Doctor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select label="Patient" error={errors.patient_id?.message} required {...register('patient_id')}>
            <option value="">Select Patient...</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.first_name} {p.last_name} ({p.patient_id})
              </option>
            ))}
          </Select>

          <Select label="Attending Physician" error={errors.doctor_id?.message} required {...register('doctor_id')}>
            <option value="">Select Doctor...</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.specialization})
              </option>
            ))}
          </Select>
        </div>

        {/* Ward & Bed Allocation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Inpatient Ward"
            error={errors.ward?.message}
            required
            {...register('ward')}
          >
            {wards.map((w) => (
              <option key={w.id} value={w.name}>
                {w.name}
              </option>
            ))}
          </Select>

          <Input
            label="Room Number"
            placeholder="e.g. 301"
            error={errors.room?.message}
            required
            {...register('room')}
          />

          <Select
            label="Available Bed"
            error={errors.bed?.message}
            required
            {...register('bed')}
          >
            <option value="">Select Bed...</option>
            {availableBeds.map((b) => (
              <option key={b.id} value={b.bed_number}>
                {b.bed_number} ({b.type} - ${b.daily_rate}/day)
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Input
            label="Admission Date"
            type="date"
            error={errors.admission_date?.message}
            required
            {...register('admission_date')}
          />
        </div>

        {/* Diagnosis & Care Instructions */}
        <div>
          <Input
            label="Admission Diagnosis / Primary Reason"
            placeholder="e.g. Acute Coronary Syndrome r/o NSTEMI"
            error={errors.diagnosis?.message}
            required
            {...register('diagnosis')}
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
            Nursing & Monitoring Instructions
          </label>
          <textarea
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            rows={2}
            placeholder="e.g. Continuous telemetry, vitals q4h, NPO after midnight."
            {...register('notes')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={createMutation.isPending}>
            Confirm Admission & Assign Bed
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
