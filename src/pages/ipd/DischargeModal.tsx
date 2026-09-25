import React, { useState } from 'react';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useDischargePatient } from '../../hooks/useHospitalQueries';
import { Admission } from '../../types';
import { toast } from '../../stores/toastStore';

interface DischargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  admission: Admission | null;
}

export const DischargeModal: React.FC<DischargeModalProps> = ({
  isOpen,
  onClose,
  admission,
}) => {
  const dischargeMutation = useDischargePatient();
  const [dischargeDate, setDischargeDate] = useState(new Date().toISOString().split('T')[0]);
  const [dischargeSummary, setDischargeSummary] = useState(
    'Patient stabilized, hemodynamically stable. Discharged in improved clinical condition.'
  );

  if (!admission) return null;

  const handleDischarge = async (e: React.FormEvent) => {
    e.preventDefault();
    await dischargeMutation.mutateAsync({
      admission_id: admission.id,
      bed_number: admission.bed,
      notes: dischargeSummary,
    });
    toast.success(`Patient ${admission.patient_name} discharged and bed ${admission.bed} released.`);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Discharge Patient — ${admission.admission_number}`}
      description={`Confirm discharge for ${admission.patient_name} from ${admission.ward} (Bed ${admission.bed}).`}
      maxWidth="lg"
    >
      <form onSubmit={handleDischarge} className="space-y-4 text-left">
        <Input
          label="Discharge Date"
          type="date"
          value={dischargeDate}
          onChange={(e) => setDischargeDate(e.target.value)}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
            Discharge Summary & Medical Orders
          </label>
          <textarea
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            rows={3}
            value={dischargeSummary}
            onChange={(e) => setDischargeSummary(e.target.value)}
            required
          />
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-lg text-xs text-amber-800 dark:text-amber-300">
          <strong>Notice:</strong> Completing discharge will mark Bed {admission.bed} as Available and notify the billing department to finalize inpatient room charges.
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={dischargeMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={dischargeMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
            Confirm Patient Discharge
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
