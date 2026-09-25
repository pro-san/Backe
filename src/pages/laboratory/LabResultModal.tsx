import React, { useState } from 'react';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useSubmitLabResult } from '../../hooks/useHospitalQueries';
import { LabOrder } from '../../types';

interface LabResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: LabOrder | null;
}

export const LabResultModal: React.FC<LabResultModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const submitResultMutation = useSubmitLabResult();

  const [parameters, setParameters] = useState([
    { name: 'Hemoglobin', value: '14.2', range: '13.5 - 17.5', unit: 'g/dL', flag: 'Normal' },
    { name: 'White Blood Cell (WBC)', value: '7.8', range: '4.5 - 11.0', unit: '10^3/uL', flag: 'Normal' },
    { name: 'Platelets', value: '260', range: '150 - 450', unit: '10^3/uL', flag: 'Normal' },
  ]);

  const [technologistNotes, setTechnologistNotes] = useState(
    'Specimen processed in automated analyzer. Quality controls calibrated.'
  );

  if (!order) return null;

  const handleParamChange = (idx: number, field: string, val: string) => {
    setParameters((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitResultMutation.mutateAsync({
      order_id: order.id,
      order_number: order.order_number,
      patient_id: order.patient_id,
      patient_name: order.patient_name,
      test_id: order.test_ids?.[0] || 't_01',
      test_name: order.test_names?.[0] || 'Diagnostic Test',
      result: parameters.map((p) => `${p.name}: ${p.value} ${p.unit}`).join('; '),
      reference_range: parameters[0]?.range || 'Normal',
      unit: parameters[0]?.unit || '',
      status: 'Normal',
      remarks: technologistNotes,
      technician: 'Lead MLS Technologist',
      date: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Enter Diagnostic Results — ${order.order_number}`}
      description={`Patient: ${order.patient_name} · Test: ${order.test_names.join(', ')}`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-3 py-2 text-left">Parameter</th>
                <th className="px-3 py-2 text-left w-24">Result</th>
                <th className="px-3 py-2 text-left">Reference Range</th>
                <th className="px-3 py-2 text-left w-20">Unit</th>
                <th className="px-3 py-2 text-left w-28">Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {parameters.map((param, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2 font-medium">{param.name}</td>
                  <td className="px-3 py-2">
                    <Input
                      value={param.value}
                      onChange={(e) => handleParamChange(idx, 'value', e.target.value)}
                      className="h-7 text-xs"
                      required
                    />
                  </td>
                  <td className="px-3 py-2 text-slate-500">{param.range}</td>
                  <td className="px-3 py-2 text-slate-500">{param.unit}</td>
                  <td className="px-3 py-2">
                    <select
                      value={param.flag}
                      onChange={(e) => handleParamChange(idx, 'flag', e.target.value)}
                      className="h-7 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-1"
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Low">Low</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
            Medical Technologist Interpretation Notes
          </label>
          <textarea
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            rows={2}
            value={technologistNotes}
            onChange={(e) => setTechnologistNotes(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitResultMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={submitResultMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
            Verify & Approve Result
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
