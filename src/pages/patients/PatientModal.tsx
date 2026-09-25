import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useCreatePatient, useUpdatePatient } from '../../hooks/useHospitalQueries';
import { Patient } from '../../types';

const patientSchema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  date_of_birth: z.string().min(4, 'Date of birth is required'),
  phone: z.string().min(7, 'Valid phone number is required'),
  email: z.string().email('Valid email required').or(z.literal('')),
  address: z.string().optional(),
  blood_group: z.string().optional(),
  marital_status: z.enum(['Single', 'Married', 'Divorced', 'Widowed']).optional(),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
  allergies: z.string().optional(),
  medical_notes: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'Deceased']),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientToEdit?: Patient | null;
}

export const PatientModal: React.FC<PatientModalProps> = ({
  isOpen,
  onClose,
  patientToEdit,
}) => {
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      gender: 'Male',
      date_of_birth: '1990-01-01',
      phone: '',
      email: '',
      address: '',
      blood_group: 'O+',
      marital_status: 'Single',
      emergency_contact: '',
      emergency_phone: '',
      allergies: '',
      medical_notes: '',
      status: 'Active',
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (patientToEdit) {
      reset({
        first_name: patientToEdit.first_name,
        last_name: patientToEdit.last_name,
        gender: patientToEdit.gender,
        date_of_birth: patientToEdit.date_of_birth,
        phone: patientToEdit.phone,
        email: patientToEdit.email || '',
        address: patientToEdit.address || '',
        blood_group: patientToEdit.blood_group || 'O+',
        marital_status: (patientToEdit.marital_status as any) || 'Single',
        emergency_contact: patientToEdit.emergency_contact || '',
        emergency_phone: patientToEdit.emergency_phone || '',
        allergies: patientToEdit.allergies || '',
        medical_notes: patientToEdit.medical_notes || '',
        status: patientToEdit.status,
      });
    } else {
      reset({
        first_name: '',
        last_name: '',
        gender: 'Male',
        date_of_birth: '1990-01-01',
        phone: '',
        email: '',
        address: '',
        blood_group: 'O+',
        marital_status: 'Single',
        emergency_contact: '',
        emergency_phone: '',
        allergies: '',
        medical_notes: '',
        status: 'Active',
      });
    }
  }, [isOpen, patientToEdit]);

  const onSubmit = async (data: PatientFormData) => {
    const payload = data as unknown as Partial<Patient>;
    if (patientToEdit) {
      await updateMutation.mutateAsync({ id: patientToEdit.id, data: payload });
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
      title={patientToEdit ? `Edit Patient — ${patientToEdit.patient_id}` : 'Register New Patient'}
      description="Enter patient demographics, clinical allergies, and emergency contact."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Row 1: Name & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="First Name"
            placeholder="e.g. Eleanor"
            error={errors.first_name?.message}
            required
            {...register('first_name')}
          />
          <Input
            label="Last Name"
            placeholder="e.g. Rigby"
            error={errors.last_name?.message}
            required
            {...register('last_name')}
          />
          <Select label="Gender" error={errors.gender?.message} required {...register('gender')}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Select>
        </div>

        {/* Row 2: DOB, Phone, Email */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Date of Birth"
            type="date"
            error={errors.date_of_birth?.message}
            required
            {...register('date_of_birth')}
          />
          <Input
            label="Contact Phone"
            placeholder="+1 (555) 000-0000"
            error={errors.phone?.message}
            required
            {...register('phone')}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="patient@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        {/* Row 3: Blood Group, Marital Status, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select label="Blood Group" {...register('blood_group')}>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </Select>
          <Select label="Marital Status" {...register('marital_status')}>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </Select>
          <Select label="Account Status" {...register('status')}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Deceased">Deceased</option>
          </Select>
        </div>

        {/* Row 4: Address */}
        <div>
          <Input
            label="Residential Address"
            placeholder="Street address, unit/apt, city, zip"
            {...register('address')}
          />
        </div>

        {/* Row 5: Emergency Contacts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
          <Input
            label="Emergency Contact Name & Relationship"
            placeholder="e.g. John Doe (Spouse)"
            {...register('emergency_contact')}
          />
          <Input
            label="Emergency Contact Phone"
            placeholder="+1 (555) 000-0000"
            {...register('emergency_phone')}
          />
        </div>

        {/* Row 6: Allergies & Medical History */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
              Known Allergies
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              rows={2}
              placeholder="e.g. Penicillin, NSAIDs, Shellfish"
              {...register('allergies')}
            />
          </div>
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
              Medical Notes / Chronic Conditions
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              rows={2}
              placeholder="e.g. Type 2 Diabetes, Stage 1 Hypertension"
              {...register('medical_notes')}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isSaving}>
            {patientToEdit ? 'Save Changes' : 'Register Patient'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
