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

// Regular expression for international & domestic phone numbers (7 to 15 digits)
const PHONE_REGEX = /^\+?[0-9\s\-().]{7,20}$/;

export const patientSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  last_name: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  gender: z.enum(['Male', 'Female', 'Other']),
  date_of_birth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine(
      (val) => {
        const d = new Date(val);
        if (isNaN(d.getTime())) return false;
        const today = new Date();
        return d <= today;
      },
      { message: 'Date of birth cannot be in the future' }
    )
    .refine(
      (val) => {
        const d = new Date(val);
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 130);
        return d >= minDate;
      },
      { message: 'Please enter a realistic date of birth' }
    ),
  phone: z
    .string()
    .trim()
    .min(1, 'Contact phone number is required')
    .refine((val) => PHONE_REGEX.test(val), {
      message: 'Please enter a valid phone number (e.g. +1 (555) 000-0000 or 10 digits)',
    })
    .refine(
      (val) => {
        const digitsOnly = val.replace(/\D/g, '');
        return digitsOnly.length >= 7 && digitsOnly.length <= 15;
      },
      { message: 'Phone number must contain between 7 and 15 digits' }
    ),
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address (e.g. patient@example.com)')
    .max(100, 'Email address cannot exceed 100 characters'),
  address: z.string().trim().max(200, 'Address cannot exceed 200 characters').optional(),
  blood_group: z.string().optional(),
  marital_status: z.enum(['Single', 'Married', 'Divorced', 'Widowed']).optional(),
  emergency_contact: z.string().trim().max(100, 'Emergency contact name cannot exceed 100 characters').optional(),
  emergency_phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim().length === 0) return true;
        return PHONE_REGEX.test(val);
      },
      { message: 'Please enter a valid emergency phone number (e.g. +1 (555) 000-0000)' }
    )
    .refine(
      (val) => {
        if (!val || val.trim().length === 0) return true;
        const digitsOnly = val.replace(/\D/g, '');
        return digitsOnly.length >= 7 && digitsOnly.length <= 15;
      },
      { message: 'Emergency phone number must contain between 7 and 15 digits' }
    ),
  allergies: z.string().trim().max(300, 'Allergies cannot exceed 300 characters').optional(),
  medical_notes: z.string().trim().max(500, 'Medical notes cannot exceed 500 characters').optional(),
  status: z.enum(['Active', 'Inactive', 'Deceased']),
});

export type PatientFormData = z.infer<typeof patientSchema>;

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
    formState: { errors, isValid, isDirty },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    mode: 'onTouched',
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
      description="Enter patient demographics, contact channels, clinical allergies, and emergency contact details."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
            max={new Date().toISOString().split('T')[0]}
            error={errors.date_of_birth?.message}
            required
            {...register('date_of_birth')}
          />
          <Input
            label="Contact Phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            hint="7–15 digits"
            error={errors.phone?.message}
            required
            {...register('phone')}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="patient@example.com"
            hint="Format: name@domain.com"
            error={errors.email?.message}
            required
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
            error={errors.address?.message}
            {...register('address')}
          />
        </div>

        {/* Row 5: Emergency Contacts */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Emergency Contact Information
            </span>
            <span className="text-[11px] text-slate-400">Optional</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Contact Name & Relationship"
              placeholder="e.g. John Doe (Spouse)"
              error={errors.emergency_contact?.message}
              {...register('emergency_contact')}
            />
            <Input
              label="Emergency Phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              error={errors.emergency_phone?.message}
              {...register('emergency_phone')}
            />
          </div>
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
            {errors.allergies && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                {errors.allergies.message}
              </p>
            )}
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
            {errors.medical_notes && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                {errors.medical_notes.message}
              </p>
            )}
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
