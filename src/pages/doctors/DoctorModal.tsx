import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useCreateDoctor, useDepartments } from '../../hooks/useHospitalQueries';
import { Doctor } from '../../types';

const doctorSchema = z.object({
  name: z.string().min(3, 'Doctor name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(7, 'Phone number required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  department_id: z.string().min(1, 'Please select a department'),
  specialization: z.string().min(2, 'Specialization is required'),
  license_number: z.string().min(3, 'Medical license number is required'),
  experience: z.number().min(0, 'Years of experience'),
  schedule: z.string().min(3, 'Schedule is required'),
  status: z.enum(['Active', 'Inactive', 'On Leave']),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorToEdit?: Doctor | null;
}

export const DoctorModal: React.FC<DoctorModalProps> = ({
  isOpen,
  onClose,
  doctorToEdit,
}) => {
  const createMutation = useCreateDoctor();
  const { data: departments = [] } = useDepartments();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      gender: 'Male',
      department_id: departments[0]?.id || '',
      specialization: '',
      license_number: '',
      experience: 5,
      schedule: 'Mon - Fri (09:00 - 17:00)',
      status: 'Active',
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (doctorToEdit) {
      reset({
        name: doctorToEdit.name,
        email: doctorToEdit.email,
        phone: doctorToEdit.phone,
        gender: doctorToEdit.gender,
        department_id: doctorToEdit.department_id,
        specialization: doctorToEdit.specialization,
        license_number: doctorToEdit.license_number,
        experience: doctorToEdit.experience,
        schedule: doctorToEdit.schedule,
        status: doctorToEdit.status,
      });
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        gender: 'Male',
        department_id: departments[0]?.id || 'dept_01',
        specialization: '',
        license_number: '',
        experience: 5,
        schedule: 'Mon - Fri (09:00 - 17:00)',
        status: 'Active',
      });
    }
  }, [isOpen, doctorToEdit]);

  const onSubmit = async (data: DoctorFormData) => {
    const selectedDept = departments.find((d) => d.id === data.department_id);
    await createMutation.mutateAsync({
      ...data,
      department_name: selectedDept?.name || 'General',
    });
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={doctorToEdit ? `Edit Doctor — ${doctorToEdit.doctor_id}` : 'Add Attending Doctor'}
      description="Register physician credentials, specialization, and clinical shift schedules."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Doctor Full Name (with title)"
            placeholder="e.g. Dr. Arthur Campbell"
            error={errors.name?.message}
            required
            {...register('name')}
          />
          <Select label="Gender" error={errors.gender?.message} {...register('gender')}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Email Address"
            type="email"
            placeholder="doctor@hospital.org"
            error={errors.email?.message}
            required
            {...register('email')}
          />
          <Input
            label="Phone"
            placeholder="+1 (555) 000-0000"
            error={errors.phone?.message}
            required
            {...register('phone')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Clinical Department"
            error={errors.department_id?.message}
            required
            {...register('department_id')}
          >
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </Select>
          <Input
            label="Specialization"
            placeholder="e.g. Interventional Cardiology"
            error={errors.specialization?.message}
            required
            {...register('specialization')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="License Number"
            placeholder="MD-NY-00000"
            error={errors.license_number?.message}
            required
            {...register('license_number')}
          />
          <Input
            label="Experience (Years)"
            type="number"
            error={errors.experience?.message}
            {...register('experience')}
          />
          <Select label="Status" {...register('status')}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </Select>
        </div>

        <div>
          <Input
            label="Roster & Shift Schedule"
            placeholder="e.g. Mon, Wed, Fri (08:00 - 15:00)"
            error={errors.schedule?.message}
            required
            {...register('schedule')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={createMutation.isPending}>
            {doctorToEdit ? 'Save Changes' : 'Register Doctor'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
