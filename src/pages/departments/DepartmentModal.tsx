import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useCreateDepartment, useDoctors } from '../../hooks/useHospitalQueries';
import { Department } from '../../types';

const deptSchema = z.object({
  name: z.string().min(2, 'Department name is required'),
  code: z.string().min(2, 'Code is required'),
  description: z.string().optional(),
  head_doctor: z.string().optional(),
  phone: z.string().optional(),
  total_beds: z.number().min(0),
  status: z.enum(['Active', 'Inactive']),
});

type DeptFormData = z.infer<typeof deptSchema>;

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  deptToEdit?: Department | null;
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  deptToEdit,
}) => {
  const createMutation = useCreateDepartment();
  const { data: doctors = [] } = useDoctors();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeptFormData>({
    resolver: zodResolver(deptSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      head_doctor: doctors[0]?.name || '',
      phone: '',
      total_beds: 20,
      status: 'Active',
    },
  });

  const onSubmit = async (data: DeptFormData) => {
    await createMutation.mutateAsync({
      ...data,
      total_doctors: 1,
    });
    reset();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={deptToEdit ? `Edit Department — ${deptToEdit.code}` : 'Add Clinical Department'}
      description="Create a medical department and assign clinical leadership."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Department Name"
            placeholder="e.g. Oncology & Hematology"
            error={errors.name?.message}
            required
            {...register('name')}
          />
          <Input
            label="Department Code"
            placeholder="e.g. ONCO"
            error={errors.code?.message}
            required
            {...register('code')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select label="Head of Department" {...register('head_doctor')}>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.name}>
                {doc.name} ({doc.specialization})
              </option>
            ))}
          </Select>
          <Input
            label="Department Phone / Extension"
            placeholder="+1 (555) 349-8200"
            {...register('phone')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Assigned Ward Beds"
            type="number"
            error={errors.total_beds?.message}
            {...register('total_beds')}
          />
          <Select label="Status" {...register('status')}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
        </div>

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
            Description & Facilities
          </label>
          <textarea
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            rows={3}
            placeholder="Describe clinical capabilities, diagnostic labs, or surgical units..."
            {...register('description')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={createMutation.isPending}>
            Save Department
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
