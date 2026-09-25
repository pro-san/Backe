import { z } from 'zod';

// Regular expression for international & domestic phone numbers (7 to 15 digits)
export const PHONE_REGEX = /^\+?[0-9\s\-().]{7,20}$/;

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
        if (!val) return false;
        const d = new Date(val);
        if (isNaN(d.getTime())) return false;
        const today = new Date();
        return d <= today;
      },
      { message: 'Date of birth cannot be in the future' }
    )
    .refine(
      (val) => {
        if (!val) return false;
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
export type PatientFormValues = PatientFormData;
