import React, { useState } from 'react';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import {
  useCreatePrescription,
  usePatients,
  useDoctors,
  useMedicines,
} from '../../hooks/useHospitalQueries';
import { calculateAge } from '../../lib/dateUtils';
import { Plus, Trash2 } from 'lucide-react';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({ isOpen, onClose }) => {
  const createMutation = useCreatePrescription();
  const { data: patients = [] } = usePatients();
  const { data: doctors = [] } = useDoctors();
  const { data: medicinesCatalog = [] } = useMedicines();

  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  const [medicines, setMedicines] = useState([
    {
      id: 'item_1',
      medicine_name: 'Amoxicillin 500mg',
      dosage: '1 capsule',
      frequency: 'Every 8 hours',
      duration: '7 days',
      instructions: 'Take after meals',
    },
  ]);

  const addMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      {
        id: 'item_' + Date.now(),
        medicine_name: medicinesCatalog[0]?.name || 'Paracetamol 500mg',
        dosage: '1 tablet',
        frequency: 'As needed',
        duration: '3 days',
        instructions: 'Take with plenty of water',
      },
    ]);
  };

  const removeMedicine = (id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMedicine = (id: string, field: string, val: string) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = patients.find((pat) => pat.id === patientId) || patients[0];
    const d = doctors.find((doc) => doc.id === doctorId) || doctors[0];
    const ageVal = calculateAge(p?.date_of_birth);

    await createMutation.mutateAsync({
      patient_id: p.id,
      patient_name: `${p.first_name} ${p.last_name}`,
      patient_age: typeof ageVal === 'number' ? ageVal : undefined,
      patient_gender: p.gender,
      doctor_id: d.id,
      doctor_name: d.name,
      doctor_specialization: d.specialization,
      date: new Date().toISOString().split('T')[0],
      diagnosis: diagnosis || 'Clinical evaluation',
      notes: notes,
      medicines: medicines.map((m) => ({
        ...m,
        route: 'Oral' as const,
      })),
    });
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create Medical Prescription (Rx)"
      description="Write outpatient drug prescription and dispatch to hospital pharmacy."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Patient"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.first_name} {p.last_name} ({p.patient_id})
              </option>
            ))}
          </Select>

          <Select
            label="Prescribing Physician"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            required
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.specialization})
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Clinical Diagnosis"
          placeholder="e.g. Acute Pharyngitis with fever"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          required
        />

        {/* Medicines List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Prescribed Medications
            </span>
            <Button type="button" variant="outline" size="sm" onClick={addMedicine} className="h-7 text-xs gap-1">
              <Plus className="w-3 h-3" />
              <span>Add Medication</span>
            </Button>
          </div>

          <div className="space-y-2">
            {medicines.map((m, idx) => (
              <div
                key={m.id}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-sky-600">Medication #{idx + 1}</span>
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(m.id)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <Input
                      label="Drug Name"
                      value={m.medicine_name}
                      onChange={(e) => updateMedicine(m.id, 'medicine_name', e.target.value)}
                      className="h-8 text-xs"
                      required
                    />
                  </div>
                  <Input
                    label="Dosage"
                    value={m.dosage}
                    onChange={(e) => updateMedicine(m.id, 'dosage', e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    label="Frequency"
                    value={m.frequency}
                    onChange={(e) => updateMedicine(m.id, 'frequency', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    label="Duration"
                    value={m.duration}
                    onChange={(e) => updateMedicine(m.id, 'duration', e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    label="Special Instructions"
                    value={m.instructions}
                    onChange={(e) => updateMedicine(m.id, 'instructions', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
            Advice / Dietary Warnings
          </label>
          <textarea
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Plenty of oral fluids, rest, avoid strenuous exercise."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={createMutation.isPending}>
            Sign & Issue Prescription
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
