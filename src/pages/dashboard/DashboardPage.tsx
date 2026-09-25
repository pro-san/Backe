import React, { useState } from 'react';
import { useDashboardStatistics } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { CardSkeleton, Spinner } from '../../components/ui/Skeleton';
import {
  Users,
  UserCheck,
  Calendar,
  BedDouble,
  FileText,
  DollarSign,
  FlaskConical,
  ArrowUpRight,
  Plus,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { PatientModal } from '../patients/PatientModal';
import { AppointmentModal } from '../appointments/AppointmentModal';
import { AdmissionModal } from '../ipd/AdmissionModal';
import { InvoiceModal } from '../billing/InvoiceModal';

export const DashboardPage: React.FC = () => {
  const { data: stats, isLoading, isError } = useDashboardStatistics();
  const navigate = useNavigate();

  // Modal action states
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Clinical Dashboard" description="Live hospital operations and patient triage metrics" />
        <CardSkeleton count={8} />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl">
        <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">Failed to load dashboard metrics.</p>
      </div>
    );
  }

  const PIE_COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Hospital Operations Command Center"
        description="Comprehensive real-time overview of bed occupancy, patient triage, and revenue."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" onClick={() => setPatientModalOpen(true)} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Register Patient</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAppointmentModalOpen(true)} className="gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAdmissionModalOpen(true)} className="gap-1.5">
              <BedDouble className="w-3.5 h-3.5" />
              <span>Admit Patient</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => setInvoiceModalOpen(true)} className="gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Create Invoice</span>
            </Button>
          </div>
        }
      />

      {/* 8 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Patients */}
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Patients</span>
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
              {stats.total_patients.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" />+{stats.patients_trend}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active electronic health records</p>
        </Card>

        {/* Card 2: Total Doctors */}
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Attending Doctors</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
              {stats.total_doctors}
            </span>
            <span className="text-xs text-slate-500">Across 6 departments</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Specialists on active roster</p>
        </Card>

        {/* Card 3: Today's Appointments */}
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Today's Appointments</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
              {stats.today_appointments}
            </span>
            <span className="text-xs font-medium text-sky-600 dark:text-sky-400">In OPD consultation</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Booked & walk-in patients</p>
        </Card>

        {/* Card 4: Available Beds */}
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Available Beds</span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
              {stats.available_beds}
            </span>
            <span className="text-xs text-slate-500">/ {stats.total_beds} total beds</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {Math.round(((stats.total_beds - stats.available_beds) / stats.total_beds) * 100)}% ward occupancy
          </p>
        </Card>

        {/* Card 5: Today's Admissions */}
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Today's Admissions</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
              {stats.today_admissions}
            </span>
            <span className="text-xs text-slate-500">Inpatients</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Admitted across ICU & General</p>
        </Card>

        {/* Card 6: Pending Bills */}
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Invoices</span>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
              {stats.pending_bills}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Awaiting clearance</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pending insurance & copay</p>
        </Card>

        {/* Card 7: Monthly Revenue */}
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Monthly Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
              {formatCurrency(stats.monthly_revenue)}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" />+{stats.revenue_trend}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Net collections this calendar month</p>
        </Card>

        {/* Card 8: Pending Lab Tests */}
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Lab Tests</span>
            <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
              {stats.pending_lab_tests}
            </span>
            <span className="text-xs font-medium text-sky-600 dark:text-sky-400">In pathology</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Hematology & Biochemistry</p>
        </Card>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Patient Flow */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <div>
              <CardTitle>Weekly Patient Volume Breakdown</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily comparison between Outpatient (OPD), Inpatient Admissions, and Discharges
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weekly_patients} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: '1px solid #1e293b',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="opd" name="OPD Visits" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="admitted" name="Admissions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="discharged" name="Discharged" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Status Distribution */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div>
              <CardTitle>Appointment Distribution</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">Breakdown by current visit phase</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.appointment_status_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.appointment_status_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: '1px solid #1e293b',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              {stats.appointment_status_distribution.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 ml-auto tabular-nums">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Expenses Area Chart */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Monthly Revenue vs Operating Expenses</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Six-month financial performance curve with pharmacy and inpatient billing
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthly_revenue_data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    border: '1px solid #1e293b',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Gross Revenue"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Operational Expenses"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tables Row: Today's Appointments & Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Appointments */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Today's Outpatient Appointments</CardTitle>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate('/appointments')}
              className="text-xs gap-1 text-sky-600 hover:text-sky-700"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium">Patient</th>
                    <th className="px-4 py-2.5 text-left font-medium">Doctor</th>
                    <th className="px-4 py-2.5 text-left font-medium">Time</th>
                    <th className="px-4 py-2.5 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.today_appointments_list.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{apt.patient_name}</p>
                        <p className="text-[11px] text-slate-400">{apt.patient_phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-700 dark:text-slate-300 font-medium">{apt.doctor_name}</p>
                        <p className="text-[11px] text-slate-400">{apt.department_name}</p>
                      </td>
                      <td className="px-4 py-3 tabular-nums font-medium text-slate-600 dark:text-slate-400">
                        {apt.appointment_time}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={apt.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Registered Patients */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Recent Patient Registrations</CardTitle>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate('/patients')}
              className="text-xs gap-1 text-sky-600 hover:text-sky-700"
            >
              <span>Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.recent_patients.map((p) => (
                <div key={p.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                      {p.first_name[0]}{p.last_name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {p.first_name} {p.last_name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {p.patient_id} · {p.gender} · {p.blood_group}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => navigate(`/patients/${p.id}`)}
                  >
                    EHR File
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reusable Modals Mounted for Instant Action */}
      {patientModalOpen && (
        <PatientModal isOpen={patientModalOpen} onClose={() => setPatientModalOpen(false)} />
      )}
      {appointmentModalOpen && (
        <AppointmentModal isOpen={appointmentModalOpen} onClose={() => setAppointmentModalOpen(false)} />
      )}
      {admissionModalOpen && (
        <AdmissionModal isOpen={admissionModalOpen} onClose={() => setAdmissionModalOpen(false)} />
      )}
      {invoiceModalOpen && (
        <InvoiceModal isOpen={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} />
      )}
    </div>
  );
};
