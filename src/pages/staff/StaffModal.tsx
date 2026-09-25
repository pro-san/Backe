import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useCreateStaff, useDepartments } from '../../hooks/useHospitalQueries';
import { Staff } from '../../types';

const staffSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  role: z.string().min(2, 'Role is required'),
  department_name: z.string().min(1, 'Department is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Phone number required'),
  qualification: z.string().min(2, 'Qualification required'),
  joining_date: z.string().min(4, 'Joining date required'),
  salary: z.number().min(0, 'Salary required'),
  status: z.enum(['Active', 'On Leave', 'Inactive']),
});

type StaffFormData = z.infer<typeof staffSchema>;

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffToEdit?: Staff | null;
}

export const StaffModal: React.FC<StaffModalProps> = ({ isOpen, onClose, staffToEdit }) => {
  const createMutation = useCreateStaff();
  const { data: departments = [] } = useDepartments();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: '',
      role: 'Staff Nurse',
      department_name: departments[0]?.name || 'Cardiology',
      email: '',
      phone: '',
      qualification: 'BSN, RN',
      joining_date: new Date().toISOString().split('T')[0],
      salary: 65000,
      status: 'Active',
    },
  });

  const onSubmit = async (data: StaffFormData) => {
    await createMutation.mutateAsync({
      ...data,
      department: data.department_name,
    });
    reset();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={staffToEdit ? `Edit Staff — ${staffToEdit.staff_id}` : 'Add Hospital Staff Member'}
      description="Register nurses, lab scientists, pharmacists, and administrative personnel."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Full Name"
            placeholder="e.g. Beatrice Morales"
            error={errors.name?.message}
            required
            {...register('name')}
          />
          <Input
            label="Designation / Position"
            placeholder="e.g. Head ICU Nurse"
            error={errors.role?.message}
            required
            {...register('role')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Department"
            error={errors.department_name?.message}
            required
            {...register('department_name')}
          >
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </Select>
          <Input
            label="Credentials / Degree"
            placeholder="e.g. BSN, RN, CCRN"
            error={errors.qualification?.message}
            required
            {...register('qualification')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Work Email"
            type="email"
            placeholder="staff@hospital.org"
            error={errors.email?.message}
            required
            {...register('email')}
          />
          <Input
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            error={errors.phone?.message}
            required
            {...register('phone')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Joining Date"
            type="date"
            error={errors.joining_date?.message}
            required
            {...register('joining_date')}
          />
          <Input
            label="Annual Compensation ($)"
            type="number"
            error={errors.salary?.message}
            required
            {...register('salary')}
          />
          <Select label="Status" {...register('status')}>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </Select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={createMutation.isPending}>
            Add Staff Record
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
