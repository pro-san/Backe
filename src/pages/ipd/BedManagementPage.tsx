import React, { useState } from 'react';
import { useBeds, useWards, useUpdateBed } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Bed } from '../../types';
import { BedDouble, ArrowLeft, Plus, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdmissionModal } from './AdmissionModal';
import { Dialog } from '../../components/ui/Dialog';
import { toast } from '../../stores/toastStore';

export const BedManagementPage: React.FC = () => {
  const { data: beds = [], isLoading, isError } = useBeds();
  const { data: wards = [] } = useWards();
  const updateBedMutation = useUpdateBed();
  const navigate = useNavigate();

  const [wardFilter, setWardFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [bedDetailOpen, setBedDetailOpen] = useState(false);
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);

  const filteredBeds = beds.filter((b) => {
    if (wardFilter !== 'ALL' && b.ward_id !== wardFilter) return false;
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    return true;
  });

  const totalBeds = beds.length;
  const availableBeds = beds.filter((b) => b.status === 'Available').length;
  const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
  const maintenanceBeds = beds.filter((b) => b.status === 'Maintenance').length;

  const handleBedClick = (bed: Bed) => {
    setSelectedBed(bed);
    setBedDetailOpen(true);
  };

  const handleToggleMaintenance = async (bed: Bed) => {
    const newStatus = bed.status === 'Maintenance' ? 'Available' : 'Maintenance';
    await updateBedMutation.mutateAsync({
      id: bed.id,
      data: { status: newStatus },
    });
    setBedDetailOpen(false);
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Inpatient Bed Occupancy Matrix"
        description="Interactive visual ward grid with real-time bed telemetry, occupant status, and maintenance toggles."
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'IPD Admissions', href: '/ipd/admissions' },
          { label: 'Bed Board' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/ipd/admissions')} className="gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Admissions List</span>
            </Button>
            <Button size="sm" onClick={() => setAdmissionModalOpen(true)} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Admit Patient</span>
            </Button>
          </div>
        }
      />

      {/* Bed Telemetry KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Hospital Beds</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 tabular-nums">{totalBeds}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs">
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Available Now
          </span>
          <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mt-1 tabular-nums">{availableBeds}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 shadow-xs">
          <span className="text-xs text-rose-700 dark:text-rose-400 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Occupied
          </span>
          <p className="text-2xl font-bold text-rose-800 dark:text-rose-200 mt-1 tabular-nums">{occupiedBeds}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs">
          <span className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Sanitizing / Maint.
          </span>
          <p className="text-2xl font-bold text-amber-800 dark:text-amber-200 mt-1 tabular-nums">{maintenanceBeds}</p>
        </div>
      </div>

      {/* Ward & Status Filter Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="w-52">
          <Select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="h-8 text-xs"
          >
            <option value="ALL">All Clinical Wards</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-40">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 text-xs"
          >
            <option value="ALL">All Bed Statuses</option>
            <option value="Available">Available (Green)</option>
            <option value="Occupied">Occupied (Red)</option>
            <option value="Maintenance">Maintenance (Yellow)</option>
          </Select>
        </div>
      </div>

      {/* Interactive Visual Bed Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredBeds.map((bed) => {
          const isOccupied = bed.status === 'Occupied';
          const isMaintenance = bed.status === 'Maintenance';
          const isAvailable = bed.status === 'Available';

          return (
            <div
              key={bed.id}
              onClick={() => handleBedClick(bed)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none space-y-2 relative shadow-xs hover:scale-[1.02] ${
                isOccupied
                  ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30'
                  : isMaintenance
                  ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30'
                  : 'border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-100">
                  {bed.bed_number}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOccupied ? 'bg-rose-500' : isMaintenance ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
              </div>

              <div className="space-y-0.5">
                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {bed.ward_name}
                </p>
                <p className="text-[10px] text-slate-500">Room {bed.room || bed.room_number} · {bed.type}</p>
              </div>

              <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px]">
                {isOccupied ? (
                  <p className="text-rose-700 dark:text-rose-400 font-bold truncate">
                    {bed.current_patient_name || bed.patient_name || 'Patient Admitted'}
                  </p>
                ) : isMaintenance ? (
                  <p className="text-amber-700 dark:text-amber-400 font-medium">Under Sterilization</p>
                ) : (
                  <p className="text-emerald-700 dark:text-emerald-400 font-semibold">${bed.daily_rate}/night</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bed Details Dialog */}
      {selectedBed && (
        <Dialog
          isOpen={bedDetailOpen}
          onClose={() => setBedDetailOpen(false)}
          title={`Bed Telemetry — ${selectedBed.bed_number}`}
          description={`${selectedBed.ward_name} · Room ${selectedBed.room || selectedBed.room_number}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-left">
            <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500">Classification</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedBed.type} Bed</span>
              <span className="text-slate-500">Daily Ward Tariff</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">${selectedBed.daily_rate}.00 / day</span>
              <span className="text-slate-500">Status</span>
              <span className="font-bold">{selectedBed.status}</span>
            </div>

            {selectedBed.status === 'Occupied' && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 space-y-1">
                <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300">
                  Current Inpatient
                </span>
                <p className="text-sm font-bold text-rose-900 dark:text-rose-100">{selectedBed.current_patient_name || selectedBed.patient_name}</p>
                <p className="text-slate-500">Admitted under internal medicine protocol.</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              {selectedBed.status === 'Available' ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setBedDetailOpen(false);
                    setAdmissionModalOpen(true);
                  }}
                  className="gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Admit to this Bed</span>
                </Button>
              ) : null}

              {selectedBed.status !== 'Occupied' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleMaintenance(selectedBed)}
                  className="gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>
                    {selectedBed.status === 'Maintenance' ? 'Mark Available' : 'Mark Maintenance'}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </Dialog>
      )}

      <AdmissionModal isOpen={admissionModalOpen} onClose={() => setAdmissionModalOpen(false)} />
    </div>
  );
};
