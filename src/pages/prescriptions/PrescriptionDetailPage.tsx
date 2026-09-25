import React, { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { usePrescriptions } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../lib/formatters';
import { ArrowLeft, Printer, Activity, Send } from 'lucide-react';
import { toast } from '../../stores/toastStore';

export const PrescriptionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: prescriptions = [] } = usePrescriptions();

  const rx = prescriptions.find((p) => p.id === id);

  useEffect(() => {
    if (searchParams.get('print') === 'true' && rx) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [searchParams, rx]);

  if (!rx) {
    return (
      <div className="p-8 text-center">
        <p className="text-xs text-rose-600">Prescription not found.</p>
        <Button size="sm" onClick={() => navigate('/prescriptions')} className="mt-2">
          Back to List
        </Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleSendToPharmacy = () => {
    toast.success(`Prescription ${rx.prescription_number} transmitted to hospital dispensary.`);
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div className="no-print">
        <PageHeader
          title={`Prescription — ${rx.prescription_number}`}
          description="Official signed prescription with dispensing instructions."
          breadcrumbs={[
            { label: 'Home', href: '/dashboard' },
            { label: 'Prescriptions', href: '/prescriptions' },
            { label: rx.prescription_number },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/prescriptions')} className="gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSendToPharmacy} className="gap-1.5">
                <Send className="w-3.5 h-3.5" />
                <span>Send to Pharmacy</span>
              </Button>
              <Button size="sm" onClick={handlePrint} className="gap-1.5">
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </Button>
            </div>
          }
        />
      </div>

      {/* Official Clinical Letterhead Document */}
      <Card className="bg-white text-slate-900 shadow-lg border border-slate-200 overflow-hidden p-8 sm:p-12 print:border-none print:shadow-none print:p-0">
        {/* Letterhead Header */}
        <div className="border-b-2 border-slate-900 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Activity className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-950">
                  St. Jude Apex Medical Center
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  500 Hospital Blvd, Suite 400 · Metro City · Tel: (555) 349-8000
                </p>
                <p className="text-[11px] text-slate-500">
                  Accredited Tertiary Healthcare & Inpatient Hospital
                </p>
              </div>
            </div>

            <div className="sm:text-right text-xs">
              <p className="font-bold text-slate-900 text-sm">{rx.doctor_name}</p>
              <p className="text-slate-600">{rx.doctor_specialization}</p>
              <p className="font-mono text-slate-500">Lic: MD-NY-49201</p>
              <p className="text-[11px] text-slate-500 mt-1">Consultation Slip</p>
            </div>
          </div>
        </div>

        {/* Patient Demographics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-200 text-xs bg-slate-50/70 p-3 rounded-lg my-4">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Patient Name</span>
            <span className="font-bold text-slate-900">{rx.patient_name}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Age / Gender</span>
            <span className="font-medium text-slate-800">{rx.patient_age} yrs · {rx.patient_gender}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Date of Rx</span>
            <span className="font-medium text-slate-800 tabular-nums">{formatDate(rx.date)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Prescription ID</span>
            <span className="font-mono font-bold text-sky-700">{rx.prescription_number}</span>
          </div>
        </div>

        {/* Clinical Diagnosis */}
        <div className="py-2 mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Primary Diagnosis:</span>
          <p className="text-sm font-semibold text-slate-900 mt-0.5">{rx.diagnosis}</p>
        </div>

        {/* Rx Symbol & Medication Table */}
        <div className="space-y-3">
          <div className="text-3xl font-serif font-black text-sky-700 italic">Rx</div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 text-left w-12">#</th>
                  <th className="px-4 py-2.5 text-left">Medication & Strength</th>
                  <th className="px-4 py-2.5 text-left">Dosage</th>
                  <th className="px-4 py-2.5 text-left">Frequency</th>
                  <th className="px-4 py-2.5 text-left">Duration</th>
                  <th className="px-4 py-2.5 text-left">Directions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rx.medicines.map((med, idx) => (
                  <tr key={med.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500 font-mono">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{med.medicine_name}</td>
                    <td className="px-4 py-3 text-slate-800">{med.dosage}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{med.frequency}</td>
                    <td className="px-4 py-3 text-slate-800">{med.duration}</td>
                    <td className="px-4 py-3 text-slate-600 italic">{med.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Advice / Special Notes */}
        {rx.notes && (
          <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="font-bold text-slate-800 block mb-1">Clinical Advice & Patient Guidance:</span>
            <p className="text-slate-700 leading-relaxed">{rx.notes}</p>
          </div>
        )}

        {/* Signature & Seal Footer */}
        <div className="pt-16 mt-8 flex justify-between items-end border-t border-slate-200 text-xs">
          <div className="text-[11px] text-slate-500">
            <p>Generated via ApexHealth EHR System</p>
            <p>Valid for 30 days from date of issue</p>
          </div>
          <div className="text-center w-56">
            <div className="border-b border-slate-800 pb-1 mb-1 italic font-serif text-slate-700 text-base">
              {rx.doctor_name}
            </div>
            <p className="font-semibold text-slate-900 text-xs">{rx.doctor_name}</p>
            <p className="text-[10px] text-slate-500">Attending Specialist Physician</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
