import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useCreateMedicine, useUpdateMedicine } from '../../hooks/useHospitalQueries';
import { Medicine } from '../../types';

const medicineSchema = z.object({
  name: z.string().min(2, 'Medicine name required'),
  generic_name: z.string().min(2, 'Generic name required'),
  category: z.string().min(2, 'Category required'),
  manufacturer: z.string().min(2, 'Manufacturer required'),
  batch_number: z.string().min(2, 'Batch number required'),
  expiry_date: z.string().min(4, 'Expiry date required'),
  unit_price: z.number().min(0.01, 'Price must be positive'),
  cost_price: z.number().min(0.01, 'Cost must be positive'),
  stock: z.number().min(0, 'Stock must be non-negative'),
  reorder_level: z.number().min(0, 'Reorder level required'),
  status: z.enum(['In Stock', 'Low Stock', 'Out of Stock', 'Expired']),
});

type MedicineFormData = z.infer<typeof medicineSchema>;

interface MedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicineToEdit?: Medicine | null;
}

export const MedicineModal: React.FC<MedicineModalProps> = ({
  isOpen,
  onClose,
  medicineToEdit,
}) => {
  const createMutation = useCreateMedicine();
  const updateMutation = useUpdateMedicine();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MedicineFormData>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: '',
      generic_name: '',
      category: 'Antibiotic',
      manufacturer: '',
      batch_number: 'BTH-' + Math.floor(1000 + Math.random() * 9000),
      expiry_date: '2026-12-31',
      unit_price: 15.0,
      cost_price: 8.5,
      stock: 100,
      reorder_level: 20,
      status: 'In Stock',
    },
  });

  const onSubmit = async (data: MedicineFormData) => {
    let calculatedStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (data.stock <= 0) {
      calculatedStatus = 'Out of Stock';
    } else if (data.stock <= data.reorder_level) {
      calculatedStatus = 'Low Stock';
    }

    const payload: Partial<Medicine> = {
      ...data,
      selling_price: data.unit_price,
      purchase_price: data.cost_price,
      quantity: data.stock,
      minimum_stock: data.reorder_level,
      status: calculatedStatus,
    };

    if (medicineToEdit) {
      await updateMutation.mutateAsync({ id: medicineToEdit.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    reset();
    onClose();
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={medicineToEdit ? `Edit Medicine — ${medicineToEdit.code || medicineToEdit.name}` : 'Add Pharmaceutical Inventory'}
      description="Record drug batch, expiration, wholesale acquisition, and inventory thresholds."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Brand Name & Strength"
            placeholder="e.g. Lipitor 20mg"
            error={errors.name?.message}
            required
            {...register('name')}
          />
          <Input
            label="Generic Chemical Name"
            placeholder="e.g. Atorvastatin Calcium"
            error={errors.generic_name?.message}
            required
            {...register('generic_name')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select label="Therapeutic Category" error={errors.category?.message} {...register('category')}>
            <option value="Cardiovascular">Cardiovascular</option>
            <option value="Antibiotic">Antibiotic</option>
            <option value="Analgesic">Analgesic / Anti-inflammatory</option>
            <option value="Antidiabetic">Antidiabetic</option>
            <option value="Respiratory">Respiratory</option>
            <option value="Gastrointestinal">Gastrointestinal</option>
          </Select>
          <Input
            label="Manufacturer"
            placeholder="e.g. Pfizer Pharmaceuticals"
            error={errors.manufacturer?.message}
            required
            {...register('manufacturer')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Batch / Lot Number"
            placeholder="e.g. BTH-8921"
            error={errors.batch_number?.message}
            required
            {...register('batch_number')}
          />
          <Input
            label="Expiration Date"
            type="date"
            error={errors.expiry_date?.message}
            required
            {...register('expiry_date')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input
            label="Unit Retail Price ($)"
            type="number"
            step="0.01"
            error={errors.unit_price?.message}
            required
            {...register('unit_price')}
          />
          <Input
            label="Cost Price ($)"
            type="number"
            step="0.01"
            error={errors.cost_price?.message}
            required
            {...register('cost_price')}
          />
          <Input
            label="Current Units in Stock"
            type="number"
            error={errors.stock?.message}
            required
            {...register('stock')}
          />
          <Input
            label="Reorder Alert Level"
            type="number"
            error={errors.reorder_level?.message}
            required
            {...register('reorder_level')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isSaving}>
            {medicineToEdit ? 'Save Changes' : 'Add Medication to Inventory'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
