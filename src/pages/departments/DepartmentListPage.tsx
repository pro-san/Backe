import React, { useState } from 'react';
import { useDepartments } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DepartmentModal } from './DepartmentModal';
import { Building2, Users, BedDouble, Phone, Plus } from 'lucide-react';
import { TableSkeleton } from '../../components/ui/Skeleton';

export const DepartmentListPage: React.FC = () => {
  const { data: departments = [], isLoading, isError } = useDepartments();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Hospital Departments"
        description="Clinical services, medical director leadership, bed allocations, and staff counts."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Departments' }]}
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Department</span>
          </Button>
        }
      />

      {isLoading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : isError ? (
        <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-xl">
          <p className="text-xs text-rose-700">Failed to load department records.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Card key={dept.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle>{dept.name}</CardTitle>
                      <span className="text-[11px] font-mono text-sky-600 dark:text-sky-400 font-semibold">
                        {dept.code}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={dept.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0 text-xs">
                <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 min-h-[32px]">
                  {dept.description || 'General specialized inpatient and ambulatory care unit.'}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Head of Dept:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{dept.head_doctor}</span>
                  </div>
                  {dept.phone && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Ext:
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{dept.phone}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Doctors</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{dept.total_doctors}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Beds</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{dept.total_beds}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DepartmentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
