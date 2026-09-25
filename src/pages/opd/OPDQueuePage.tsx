import React from 'react';
import { useOPDQueue } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, BellRing, PlayCircle, Activity, Heart, Clock } from 'lucide-react';
import { toast } from '../../stores/toastStore';

export const OPDQueuePage: React.FC = () => {
  const { data: queue = [], isLoading } = useOPDQueue();
  const navigate = useNavigate();

  const handleCallPatient = (q: any) => {
    toast.info(`Calling Queue #${q.queue_number}: ${q.patient_name} to Consultation Room.`);
  };

  const handleStartConsultation = (q: any) => {
    navigate(`/opd/consultation/${q.patient_id}?opd_id=${q.id}`);
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Outpatient Department (OPD) Triage Queue"
        description="Active patient queue, nurse vitals check-in, priority triage, and direct physician consultation access."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'OPD Queue' }]}
      />

      {/* Queue Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-sky-50/50 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-800 dark:text-sky-300">Currently Waiting</span>
            <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-sky-900 dark:text-sky-100 mt-2 tabular-nums">
            {queue.filter((q) => q.status === 'Waiting').length} Patients
          </p>
        </Card>

        <Card className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">In Active Consultation</span>
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-2 tabular-nums">
            {queue.filter((q) => q.status === 'In Consultation').length} In Session
          </p>
        </Card>

        <Card className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-800 dark:text-purple-300">Completed Sessions</span>
            <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-2 tabular-nums">
            {queue.filter((q) => q.status === 'Completed').length} Checked Out
          </p>
        </Card>
      </div>

      {/* OPD Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Waiting Room Triage</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Token #</th>
                  <th className="px-4 py-3 text-left font-medium">Patient</th>
                  <th className="px-4 py-3 text-left font-medium">Attending Doctor</th>
                  <th className="px-4 py-3 text-left font-medium">Time Slot</th>
                  <th className="px-4 py-3 text-left font-medium">Recorded Vitals</th>
                  <th className="px-4 py-3 text-left font-medium">Priority</th>
                  <th className="px-4 py-3 text-left font-medium">Queue Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {queue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold font-mono text-xs">
                        #{item.queue_number}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.patient_name}</span>
                      <p className="text-[11px] text-slate-400">Symptoms: {item.symptoms || 'General visit'}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                      {item.doctor_name}
                      <p className="text-[11px] text-slate-400">{item.department_name}</p>
                    </td>
                    <td className="px-4 py-3 tabular-nums font-semibold text-slate-600 dark:text-slate-400">
                      {item.appointment_time}
                    </td>
                    <td className="px-4 py-3">
                      {item.vitals ? (
                        <div className="text-[11px] space-y-0.5">
                          <span className="text-slate-800 dark:text-slate-200 font-medium">
                            BP: {item.vitals.blood_pressure} · HR: {item.vitals.heart_rate} bpm
                          </span>
                          <p className="text-slate-400">
                            Temp: {item.vitals.temperature}°F · SpO2: {item.vitals.oxygen_saturation}%
                          </p>
                        </div>
                      ) : (
                        <span className="text-amber-600 italic">Vitals pending nurse check-in</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          item.priority === 'Emergency'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : item.priority === 'Urgent'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCallPatient(item)}
                          className="h-7 text-xs gap-1"
                        >
                          <BellRing className="w-3 h-3 text-amber-500" />
                          <span>Call</span>
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStartConsultation(item)}
                          className="h-7 text-xs gap-1"
                        >
                          <Stethoscope className="w-3 h-3" />
                          <span>Consult</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
