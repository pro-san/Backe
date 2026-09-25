import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  usePatient,
  useDoctors,
  useMedicines,
  useLabTests,
  useRecordConsultation,
  useCreatePrescription,
  useCreateLabOrder,
} from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { PageLoading } from '../../components/ui/Skeleton';
import { toast } from '../../stores/toastStore';
import { calculateAge } from '../../lib/dateUtils';
import {
  Stethoscope,
  Activity,
  Plus,
  Trash2,
  FileCheck,
  FlaskConical,
  ArrowLeft,
  Calendar,
} from 'lucide-react';

interface MedicineRow {
  id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export const ConsultationPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [searchParams] = useSearchParams();
  const opdId = searchParams.get('opd_id');
  const navigate = useNavigate();

  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  const { data: doctors = [] } = useDoctors();
  const { data: medicinesCatalog = [] } = useMedicines();
  const { data: labTestsCatalog = [] } = useLabTests();

  const recordConsultationMutation = useRecordConsultation();
  const createPrescriptionMutation = useCreatePrescription();
  const createLabOrderMutation = useCreateLabOrder();

  // Consultation state
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || 'doc_01');
  const [complaints, setComplaints] = useState('Patient presents with 3-day history of exertional fatigue.');
  const [diagnosis, setDiagnosis] = useState('Essential Hypertension, Stage 1');
  const [clinicalNotes, setClinicalNotes] = useState('Heart sounds regular S1/S2. No lower limb edema. Chest clear.');
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 14 * 86400 * 1000).toISOString().split('T')[0]
  );

  // Vitals state
  const [bp, setBp] = useState('130/84');
  const [hr, setHr] = useState(72);
  const [temp, setTemp] = useState(98.6);
  const [rr, setRr] = useState(16);
  const [spo2, setSpo2] = useState(98);
  const [weight, setWeight] = useState(78); // kg
  const [height, setHeight] = useState(175); // cm

  // Auto-calculated BMI
  const bmi = useMemo(() => {
    if (!height || !weight) return '0.0';
    const heightInMeters = height / 100;
    const calc = weight / (heightInMeters * heightInMeters);
    return calc.toFixed(1);
  }, [height, weight]);

  // Dynamic Medicine Rows
  const [medicines, setMedicines] = useState<MedicineRow[]>([
    {
      id: 'med_row_1',
      medicine_name: 'Amlodipine Besylate 5mg',
      dosage: '1 tablet (5mg)',
      frequency: 'Once Daily (Morning)',
      duration: '30 days',
      instructions: 'Take in the morning with water.',
    },
  ]);

  // Selected Lab Tests
  const [selectedLabTests, setSelectedLabTests] = useState<string[]>([]);

  const handleAddMedicineRow = () => {
    setMedicines((prev) => [
      ...prev,
      {
        id: 'med_row_' + Date.now(),
        medicine_name: medicinesCatalog[0]?.name || '',
        dosage: '1 tablet',
        frequency: 'Twice Daily',
        duration: '7 days',
        instructions: 'Take after meals',
      },
    ]);
  };

  const handleRemoveMedicineRow = (rowId: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== rowId));
  };

  const handleMedicineChange = (rowId: string, field: keyof MedicineRow, val: string) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === rowId ? { ...m, [field]: val } : m))
    );
  };

  const toggleLabTest = (testId: string) => {
    setSelectedLabTests((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]
    );
  };

  const handleCompleteConsultation = async () => {
    if (!patient) return;
    const attendingDoc = doctors.find((d) => d.id === doctorId) || doctors[0];

    // 1. Record Consultation
    await recordConsultationMutation.mutateAsync({
      patient_id: patient.id,
      patient_name: `${patient.first_name} ${patient.last_name}`,
      doctor_id: doctorId,
      doctor_name: attendingDoc?.name || 'Dr. Arthur Campbell',
      date: new Date().toISOString(),
      symptoms: complaints,
      diagnosis: diagnosis,
      clinical_notes: clinicalNotes,
      vitals: {
        blood_pressure: `${bp} mmHg`,
        heart_rate: hr,
        temperature: temp,
        respiratory_rate: rr,
        oxygen_saturation: spo2,
        weight: weight,
        height: height,
        bmi: Number(bmi),
      },
      follow_up_date: followUpDate,
    });

    // 2. Save Prescription if medications are added
    if (medicines.length > 0) {
      const ageVal = calculateAge(patient.date_of_birth);
      await createPrescriptionMutation.mutateAsync({
        patient_id: patient.id,
        patient_name: `${patient.first_name} ${patient.last_name}`,
        patient_age: typeof ageVal === 'number' ? ageVal : undefined,
        patient_gender: patient.gender,
        doctor_id: doctorId,
        doctor_name: attendingDoc?.name || 'Dr. Arthur Campbell',
        doctor_specialization: attendingDoc?.specialization || 'General Medicine',
        date: new Date().toISOString().split('T')[0],
        diagnosis: diagnosis,
        notes: clinicalNotes,
        medicines: medicines.map((m) => ({
          id: m.id,
          medicine_name: m.medicine_name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions,
        })),
      });
    }

    // 3. Create Lab Order if tests selected
    if (selectedLabTests.length > 0) {
      const tests = labTestsCatalog.filter((t) => selectedLabTests.includes(t.id));
      await createLabOrderMutation.mutateAsync({
        patient_id: patient.id,
        patient_name: `${patient.first_name} ${patient.last_name}`,
        doctor_id: doctorId,
        doctor_name: attendingDoc?.name || 'Dr. Arthur Campbell',
        test_ids: selectedLabTests,
        test_names: tests.map((t) => t.name),
        priority: 'Normal',
        status: 'Pending',
      });
    }

    toast.success('Consultation completed, prescription issued and sent to pharmacy!');
    navigate('/opd/queue');
  };

  if (patientLoading) return <PageLoading message="Loading patient clinical chart..." />;
  if (!patient) {
    return (
      <div className="p-8 text-center">
        <p className="text-xs text-rose-600">Patient not found.</p>
        <Button size="sm" onClick={() => navigate('/opd/queue')} className="mt-2">
          Return to OPD
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={`Physician Consultation — ${patient.first_name} ${patient.last_name}`}
        description={`EHR: ${patient.patient_id} · ${patient.gender} · ${calculateAge(patient.date_of_birth)} yrs · Blood Group: ${patient.blood_group || 'O+'}`}
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'OPD Queue', href: '/opd/queue' },
          { label: 'Consultation' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/opd/queue')} className="gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel / Exit</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCompleteConsultation}
              isLoading={recordConsultationMutation.isPending}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            >
              <FileCheck className="w-4 h-4" />
              <span>Complete Consultation</span>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Vitals & Clinical Assessment */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Objective Vitals Check */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <CardTitle>Physical Examination & Vital Signs</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Input
                  label="Blood Pressure"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  placeholder="120/80"
                  hint="mmHg"
                />
                <Input
                  label="Heart Rate"
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(Number(e.target.value))}
                  hint="bpm"
                />
                <Input
                  label="Temperature"
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  hint="°F"
                />
                <Input
                  label="Resp. Rate"
                  type="number"
                  value={rr}
                  onChange={(e) => setRr(Number(e.target.value))}
                  hint="breaths/min"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Input
                  label="SpO2 Saturation"
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                  hint="%"
                />
                <Input
                  label="Weight"
                  type="number"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  hint="kg"
                />
                <Input
                  label="Height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  hint="cm"
                />
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Calculated BMI
                  </label>
                  <div className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 flex items-center justify-between text-xs font-bold tabular-nums">
                    <span>{bmi} kg/m²</span>
                    <span className="text-[10px] font-medium text-emerald-600">Normal</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Chief Complaint & Clinical Notes */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <CardTitle>Subjective Assessment & Diagnosis</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Chief Complaints & Onset
                </label>
                <textarea
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  rows={2}
                  value={complaints}
                  onChange={(e) => setComplaints(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Input
                  label="Primary Clinical Diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Essential Hypertension / Type 2 Diabetes"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Clinical Examination Findings & Management Plan
                </label>
                <textarea
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  rows={3}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Interactive Prescription Writer & Lab Ordering */}
        <div className="lg:col-span-5 space-y-6">
          {/* Prescription Writer */}
          <Card>
            <CardHeader>
              <CardTitle>Prescription Writer (Rx)</CardTitle>
              <Button size="sm" variant="outline" onClick={handleAddMedicineRow} className="h-7 text-xs gap-1">
                <Plus className="w-3 h-3" />
                <span>Add Drug</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {medicines.map((row, idx) => (
                <div
                  key={row.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                      Item #{idx + 1}
                    </span>
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicineRow(row.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <Select
                      label="Select Medication"
                      value={row.medicine_name}
                      onChange={(e) => handleMedicineChange(row.id, 'medicine_name', e.target.value)}
                      className="h-8 text-xs"
                    >
                      {medicinesCatalog.map((med) => (
                        <option key={med.id} value={med.name}>
                          {med.name} ({med.category})
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Dosage"
                      value={row.dosage}
                      onChange={(e) => handleMedicineChange(row.id, 'dosage', e.target.value)}
                      placeholder="e.g. 500mg"
                      className="h-8 text-xs"
                    />
                    <Input
                      label="Frequency"
                      value={row.frequency}
                      onChange={(e) => handleMedicineChange(row.id, 'frequency', e.target.value)}
                      placeholder="e.g. Twice Daily"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Duration"
                      value={row.duration}
                      onChange={(e) => handleMedicineChange(row.id, 'duration', e.target.value)}
                      placeholder="e.g. 7 days"
                      className="h-8 text-xs"
                    />
                    <Input
                      label="Directions"
                      value={row.instructions}
                      onChange={(e) => handleMedicineChange(row.id, 'instructions', e.target.value)}
                      placeholder="e.g. Take after meal"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Diagnostic Laboratory Requisition */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <CardTitle>Requisition Laboratory Tests</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {labTestsCatalog.map((test) => {
                  const isChecked = selectedLabTests.includes(test.id);
                  return (
                    <label
                      key={test.id}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleLabTest(test.id)}
                          className="rounded text-sky-600 focus:ring-sky-500"
                        />
                        <span className="font-medium">{test.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 tabular-nums">${test.price.toFixed(2)}</span>
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Follow-up Scheduling */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <CardTitle>Next Review / Follow-Up</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Input
                label="Follow-up Date"
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
