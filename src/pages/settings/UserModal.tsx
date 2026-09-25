import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useCreateUser } from '../../hooks/useHospitalQueries';
import { User } from '../../types';

const userSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  role: z.string().min(2, 'Role required'),
  status: z.enum(['Active', 'Inactive']),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, userToEdit }) => {
  const createMutation = useCreateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'Doctor',
      status: 'Active',
    },
  });

  const onSubmit = async (data: UserFormData) => {
    await createMutation.mutateAsync(data);
    reset();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={userToEdit ? `Edit User — ${userToEdit.name}` : 'Provision System User Account'}
      description="Create portal login credentials and assign security authorization role."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        <Input
          label="Full Legal Name"
          placeholder="e.g. Dr. Julian Vance"
          error={errors.name?.message}
          required
          {...register('name')}
        />

        <Input
          label="Work Email Address"
          type="email"
          placeholder="user@hospital.org"
          error={errors.email?.message}
          required
          {...register('email')}
        />

        <Select label="Security Persona / Role" error={errors.role?.message} {...register('role')}>
          <option value="Super Admin">Super Admin</option>
          <option value="Doctor">Doctor</option>
          <option value="Nurse">Nurse</option>
          <option value="Pharmacist">Pharmacist</option>
          <option value="Laboratory Staff">Laboratory Staff</option>
          <option value="Receptionist">Receptionist</option>
          <option value="Accountant">Accountant</option>
        </Select>

        <Select label="Account Status" {...register('status')}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </Select>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={createMutation.isPending}>
            Provision User
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
