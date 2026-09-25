import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient, useAppointments, usePrescriptions, useInvoices, useAdmissions } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { StatusBadge } from '../../components/common/StatusBadge';
import { calculateAge } from '../../lib/dateUtils';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { PageLoading } from '../../components/ui/Skeleton';
import { PatientModal } from './PatientModal';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  Calendar,
  FileText,
  BedDouble,
  CreditCard,
  Edit2,
  ArrowLeft,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading, isError } = usePatient(id);
  const { data: allAppointments = [] } = useAppointments();
  const { data: allPrescriptions = [] } = usePrescriptions();
  const { data: allInvoices = [] } = useInvoices();
  const { data: allAdmissions = [] } = useAdmissions();

  const [activeTab, setActiveTab] = useState('overview');
  const [editModalOpen, setEditModalOpen] = useState(false);

  if (isLoading) return <PageLoading message="Loading electronic medical record..." />;
  if (isError || !patient) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-semibold text-rose-600">Patient not found or archived.</p>
        <Button size="sm" variant="outline" onClick={() => navigate('/patients')}>
          Back to Directory
        </Button>
      </div>
    );
  }

  // Filter linked records
  const patientAppointments = allAppointments.filter(
    (a) => a.patient_id === patient.id || a.patient_name?.toLowerCase().includes(patient.last_name.toLowerCase())
  );
  const patientPrescriptions = allPrescriptions.filter(
    (p) => p.patient_id === patient.id || p.patient_name?.toLowerCase().includes(patient.last_name.toLowerCase())
  );
  const patientInvoices = allInvoices.filter(
    (i) => i.patient_id === patient.id || i.patient_name?.toLowerCase().includes(patient.last_name.toLowerCase())
  );
  const patientAdmissions = allAdmissions.filter(
    (a) => a.patient_id === patient.id || a.patient_name?.toLowerCase().includes(patient.last_name.toLowerCase())
  );

  // Vitals simulation data for charting
  const vitalsHistory = [
    { date: 'Jan 10', systolic: 142, diastolic: 90, hr: 78, weight: 86.2 },
    { date: 'Feb 15', systolic: 138, diastolic: 88, hr: 75, weight: 85.5 },
    { date: 'Apr 02', systolic: 134, diastolic: 84, hr: 72, weight: 84.8 },
    { date: 'Today', systolic: 128, diastolic: 80, hr: 70, weight: 84.1 },
  ];

  const tabs = [
    { id: 'overview', label: 'Clinical Overview', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'vitals', label: 'Vitals & Charting', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'appointments', label: 'Appointments', count: patientAppointments.length, icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'prescriptions', label: 'Prescriptions', count: patientPrescriptions.length, icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'admissions', label: 'Inpatient Admissions', count: patientAdmissions.length, icon: <BedDouble className="w-3.5 h-3.5" /> },
    { id: 'billing', label: 'Billing & Invoices', count: patientInvoices.length, icon: <CreditCard className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={`${patient.first_name} ${patient.last_name}`}
        description={`EHR Record: ${patient.patient_id} · Registered ${formatDate(patient.created_at)}`}
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Patients', href: '/patients' },
          { label: `${patient.first_name} ${patient.last_name}` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/patients')} className="gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Button>
            <Button size="sm" onClick={() => setEditModalOpen(true)} className="gap-1.5">
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Record</span>
            </Button>
          </div>
        }
      />

      {/* Patient Header Banner */}
      <Card className="p-5 bg-gradient-to-r from-sky-50/70 to-slate-50 dark:from-sky-950/20 dark:to-slate-900 border-sky-100 dark:border-sky-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white font-bold text-xl flex items-center justify-center shadow-xs">
              {patient.first_name[0]}{patient.last_name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {patient.first_name} {patient.last_name}
                </h2>
                <StatusBadge status={patient.status} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>MRN: <strong className="text-slate-800 dark:text-slate-200 font-mono">{patient.patient_id}</strong></span>
                <span>·</span>
                <span>{patient.gender} · {calculateAge(patient.date_of_birth)} years old (DOB: {formatDate(patient.date_of_birth)})</span>
                <span>·</span>
                <span>Blood: <strong className="text-rose-600 dark:text-rose-400 font-bold">{patient.blood_group}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Contact</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{patient.phone}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Emergency</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {patient.emergency_phone || 'None listed'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Demographic & General Details */}
          <Card className="lg:col-span-6">
            <CardHeader>
              <CardTitle>Demographics & Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Full Legal Name</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{patient.first_name} {patient.last_name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Phone Number</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{patient.phone}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Email Address</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{patient.email || 'Not specified'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Marital Status</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{patient.marital_status || 'Single'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Residential Address</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{patient.address || 'Metro City'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 py-2">
                <span className="text-slate-400 font-medium">Emergency Next of Kin</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {patient.emergency_contact || 'None registered'} ({patient.emergency_phone || '—'})
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Alerts, Allergies & Notes */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10">
              <CardHeader>
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <CardTitle>Known Allergies & Contraindications</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                  {patient.allergies || 'No known drug or environmental allergies listed on file.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clinical Notes & Chronic History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {patient.medical_notes || 'No active chronic pathology documented.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Vitals Tab */}
      {activeTab === 'vitals' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blood Pressure & Mean Arterial Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalsHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} domain={[60, 160]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        border: '1px solid #1e293b',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                    />
                    <Line type="monotone" dataKey="systolic" name="Systolic BP (mmHg)" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="diastolic" name="Diastolic BP (mmHg)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="hr" name="Heart Rate (bpm)" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <Card>
          <CardHeader>
            <CardTitle>Scheduled & Completed Consultations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {patientAppointments.length === 0 ? (
              <p className="p-6 text-xs text-slate-400 text-center">No appointment logs recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium">Appt ID</th>
                      <th className="px-4 py-2.5 text-left font-medium">Doctor</th>
                      <th className="px-4 py-2.5 text-left font-medium">Date & Time</th>
                      <th className="px-4 py-2.5 text-left font-medium">Reason</th>
                      <th className="px-4 py-2.5 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {patientAppointments.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono font-medium text-sky-600">{a.appointment_number}</td>
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{a.doctor_name}</td>
                        <td className="px-4 py-3 tabular-nums">{formatDate(a.appointment_date)} at {a.appointment_time}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{a.reason}</td>
                        <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Prescriptions Tab */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          {patientPrescriptions.length === 0 ? (
            <Card className="p-6 text-center text-xs text-slate-400">
              No signed prescriptions on record for this patient.
            </Card>
          ) : (
            patientPrescriptions.map((rx) => (
              <Card key={rx.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div>
                    <span className="font-mono font-bold text-sky-600 text-xs">{rx.prescription_number}</span>
                    <p className="text-[11px] text-slate-400">Prescribed by {rx.doctor_name} · {formatDate(rx.date)}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.print()} className="h-7 text-xs">
                    Print Rx
                  </Button>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  <strong>Diagnosis:</strong> {rx.diagnosis}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500">
                      <tr>
                        <th className="px-3 py-1.5 text-left font-medium">Medicine</th>
                        <th className="px-3 py-1.5 text-left font-medium">Dosage</th>
                        <th className="px-3 py-1.5 text-left font-medium">Frequency</th>
                        <th className="px-3 py-1.5 text-left font-medium">Duration</th>
                        <th className="px-3 py-1.5 text-left font-medium">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {rx.medicines.map((m) => (
                        <tr key={m.id}>
                          <td className="px-3 py-2 font-semibold text-slate-800 dark:text-slate-200">{m.medicine_name}</td>
                          <td className="px-3 py-2">{m.dosage}</td>
                          <td className="px-3 py-2">{m.frequency}</td>
                          <td className="px-3 py-2">{m.duration}</td>
                          <td className="px-3 py-2 text-slate-500">{m.instructions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Inpatient Admissions Tab */}
      {activeTab === 'admissions' && (
        <Card>
          <CardHeader>
            <CardTitle>Inpatient Stay History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {patientAdmissions.length === 0 ? (
              <p className="p-6 text-xs text-slate-400 text-center">No inpatient admission events found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium">Admission #</th>
                      <th className="px-4 py-2.5 text-left font-medium">Ward & Bed</th>
                      <th className="px-4 py-2.5 text-left font-medium">Attending Doctor</th>
                      <th className="px-4 py-2.5 text-left font-medium">Admitted Date</th>
                      <th className="px-4 py-2.5 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {patientAdmissions.map((adm) => (
                      <tr key={adm.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono font-medium text-sky-600">{adm.admission_number}</td>
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{adm.ward} · Bed {adm.bed}</td>
                        <td className="px-4 py-3">{adm.doctor_name}</td>
                        <td className="px-4 py-3 tabular-nums">{formatDate(adm.admission_date)}</td>
                        <td className="px-4 py-3"><StatusBadge status={adm.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <Card>
          <CardHeader>
            <CardTitle>Billing Ledger & Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {patientInvoices.length === 0 ? (
              <p className="p-6 text-xs text-slate-400 text-center">No invoices generated for this patient.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium">Invoice #</th>
                      <th className="px-4 py-2.5 text-left font-medium">Issue Date</th>
                      <th className="px-4 py-2.5 text-right font-medium">Total Amount</th>
                      <th className="px-4 py-2.5 text-right font-medium">Paid</th>
                      <th className="px-4 py-2.5 text-right font-medium">Balance</th>
                      <th className="px-4 py-2.5 text-center font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {patientInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono font-medium text-sky-600">{inv.invoice_number}</td>
                        <td className="px-4 py-3 tabular-nums">{formatDate(inv.date)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                          {formatCurrency(inv.total)}
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 tabular-nums font-medium">
                          {formatCurrency(inv.paid)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                          {formatCurrency(inv.balance)}
                        </td>
                        <td className="px-4 py-3 text-center"><StatusBadge status={inv.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Patient Dialog */}
      {editModalOpen && (
        <PatientModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          patientToEdit={patient}
        />
      )}
    </div>
  );
};
