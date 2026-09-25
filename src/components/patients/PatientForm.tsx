import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertCircle } from 'lucide-react';
import { patientSchema, PatientFormData } from '../../lib/validations/patient';
import { Patient } from '../../types';
import { Input, Label, Select, DatePicker, Button } from '../ui';

export interface PatientFormProps {
  initialData?: Partial<Patient> | null;
  onSubmit: (data: PatientFormData) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitText?: string;
  className?: string;
}

const BLOOD_GROUPS = [
  { value: '', label: 'Select Blood Group (Optional)' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

const MARITAL_STATUS_OPTIONS = [
  { value: 'Single', label: 'Single' },
  { value: 'Married', label: 'Married' },
  { value: 'Divorced', label: 'Divorced' },
  { value: 'Widowed', label: 'Widowed' },
];

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Deceased', label: 'Deceased' },
];

export const PatientForm: React.FC<PatientFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitText,
  className = '',
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    mode: 'onTouched',
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      gender: (initialData?.gender as 'Male' | 'Female' | 'Other') || 'Male',
      date_of_birth: initialData?.date_of_birth || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      address: initialData?.address || '',
      blood_group: initialData?.blood_group || '',
      marital_status: initialData?.marital_status || 'Single',
      emergency_contact: initialData?.emergency_contact || '',
      emergency_phone: initialData?.emergency_phone || '',
      allergies: initialData?.allergies || '',
      medical_notes: initialData?.medical_notes || '',
      status: (initialData?.status as 'Active' | 'Inactive' | 'Deceased') || 'Active',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        gender: (initialData.gender as 'Male' | 'Female' | 'Other') || 'Male',
        date_of_birth: initialData.date_of_birth || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        address: initialData.address || '',
        blood_group: initialData.blood_group || '',
        marital_status: initialData.marital_status || 'Single',
        emergency_contact: initialData.emergency_contact || '',
        emergency_phone: initialData.emergency_phone || '',
        allergies: initialData.allergies || '',
        medical_notes: initialData.medical_notes || '',
        status: (initialData.status as 'Active' | 'Inactive' | 'Deceased') || 'Active',
      });
    }
  }, [initialData, reset]);

  const isPending = isLoading || isSubmitting;
  const resolvedSubmitText = submitText || (initialData ? 'Save Changes' : 'Register Patient');
  const todayDateString = new Date().toISOString().split('T')[0];
  const errorCount = Object.keys(errors).length;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-5 text-left ${className}`}
      noValidate
      aria-label="Patient Information Form"
    >
      {/* WCAG 3.3.1 Error Identification: Dynamic Live Region Error Summary */}
      {errorCount > 0 && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">
              Please correct the {errorCount} required field{errorCount > 1 ? 's' : ''} before proceeding:
            </p>
            <ul className="mt-1.5 list-disc list-inside space-y-0.5 text-rose-700 dark:text-rose-300">
              {Object.entries(errors).map(([field, err]) => (
                <li key={field}>
                  <a href={`#${field}`} className="underline hover:text-rose-950 dark:hover:text-rose-100 font-medium">
                    {err?.message as string || `Error in ${field}`}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* SECTION 1: Demographics */}
      <div className="space-y-3">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-1.5">
          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Patient Demographics
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <Input
            id="first_name"
            label="First Name"
            placeholder="e.g. John"
            required
            error={errors.first_name?.message}
            aria-invalid={errors.first_name ? 'true' : 'false'}
            aria-describedby={errors.first_name ? 'first_name-error' : undefined}
            {...register('first_name')}
          />
          <Input
            id="last_name"
            label="Last Name"
            placeholder="e.g. Doe"
            required
            error={errors.last_name?.message}
            aria-invalid={errors.last_name ? 'true' : 'false'}
            aria-describedby={errors.last_name ? 'last_name-error' : undefined}
            {...register('last_name')}
          />
          <Select
            id="gender"
            label="Gender"
            required
            options={GENDER_OPTIONS}
            error={errors.gender?.message}
            aria-invalid={errors.gender ? 'true' : 'false'}
            aria-describedby={errors.gender ? 'gender-error' : undefined}
            {...register('gender')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <DatePicker
            id="date_of_birth"
            label="Date of Birth"
            required
            max={todayDateString}
            error={errors.date_of_birth?.message}
            aria-invalid={errors.date_of_birth ? 'true' : 'false'}
            aria-describedby={errors.date_of_birth ? 'date_of_birth-error' : undefined}
            {...register('date_of_birth')}
          />
          <Select
            id="blood_group"
            label="Blood Group"
            options={BLOOD_GROUPS}
            error={errors.blood_group?.message}
            aria-invalid={errors.blood_group ? 'true' : 'false'}
            aria-describedby={errors.blood_group ? 'blood_group-error' : undefined}
            {...register('blood_group')}
          />
          <Select
            id="marital_status"
            label="Marital Status"
            options={MARITAL_STATUS_OPTIONS}
            error={errors.marital_status?.message}
            aria-invalid={errors.marital_status ? 'true' : 'false'}
            aria-describedby={errors.marital_status ? 'marital_status-error' : undefined}
            {...register('marital_status')}
          />
        </div>
      </div>

      {/* SECTION 2: Contact Information */}
      <div className="space-y-3">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-1.5">
          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Contact Information
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="phone"
            label="Contact Phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            hint="7–15 digits"
            required
            error={errors.phone?.message}
            aria-invalid={errors.phone ? 'true' : 'false'}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            {...register('phone')}
          />
          <Input
            id="email"
            label="Email Address"
            type="email"
            placeholder="patient@example.com"
            hint="Format: name@domain.com"
            required
            error={errors.email?.message}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
        </div>

        <div>
          <Input
            id="address"
            label="Residential Address"
            placeholder="Street address, unit/apt, city, zip code"
            error={errors.address?.message}
            aria-invalid={errors.address ? 'true' : 'false'}
            aria-describedby={errors.address ? 'address-error' : undefined}
            {...register('address')}
          />
        </div>
      </div>

      {/* SECTION 3: Emergency Contacts */}
      <div className="space-y-3">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Emergency Contact Information
          </h4>
          <span className="text-[11px] text-slate-400">Optional</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
          <Input
            id="emergency_contact"
            label="Contact Name & Relationship"
            placeholder="e.g. Mary Doe (Spouse)"
            error={errors.emergency_contact?.message}
            aria-invalid={errors.emergency_contact ? 'true' : 'false'}
            aria-describedby={errors.emergency_contact ? 'emergency_contact-error' : undefined}
            {...register('emergency_contact')}
          />
          <Input
            id="emergency_phone"
            label="Emergency Contact Phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            error={errors.emergency_phone?.message}
            aria-invalid={errors.emergency_phone ? 'true' : 'false'}
            aria-describedby={errors.emergency_phone ? 'emergency_phone-error' : undefined}
            {...register('emergency_phone')}
          />
        </div>
      </div>

      {/* SECTION 4: Clinical Allergies & Medical Notes */}
      <div className="space-y-3">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-1.5">
          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Clinical Details & Medical History
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="allergies" error={!!errors.allergies}>
              Known Allergies
            </Label>
            <textarea
              id="allergies"
              aria-invalid={errors.allergies ? 'true' : 'false'}
              aria-describedby={errors.allergies ? 'allergies-error' : undefined}
              className={`w-full h-20 rounded-lg border bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                errors.allergies
                  ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-sky-500'
              }`}
              placeholder="e.g. Penicillin, NSAIDs, Shellfish, Latex"
              {...register('allergies')}
            />
            {errors.allergies && (
              <p id="allergies-error" role="alert" aria-live="polite" className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">
                {errors.allergies.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="medical_notes" error={!!errors.medical_notes}>
              Medical Notes / Chronic Conditions
            </Label>
            <textarea
              id="medical_notes"
              aria-invalid={errors.medical_notes ? 'true' : 'false'}
              aria-describedby={errors.medical_notes ? 'medical_notes-error' : undefined}
              className={`w-full h-20 rounded-lg border bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                errors.medical_notes
                  ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-sky-500'
              }`}
              placeholder="e.g. Type 2 Diabetes, Stage 1 Hypertension, Asthma"
              {...register('medical_notes')}
            />
            {errors.medical_notes && (
              <p id="medical_notes-error" role="alert" aria-live="polite" className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">
                {errors.medical_notes.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 5: Record Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <Select
          id="status"
          label="Account / Patient Status"
          required
          options={STATUS_OPTIONS}
          error={errors.status?.message}
          aria-invalid={errors.status ? 'true' : 'false'}
          aria-describedby={errors.status ? 'status-error' : undefined}
          {...register('status')}
        />
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" isLoading={isPending} disabled={isPending} className="gap-1.5">
          {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>{resolvedSubmitText}</span>
        </Button>
      </div>
    </form>
  );
};

export default PatientForm;
