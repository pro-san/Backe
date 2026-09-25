import React, { useState } from 'react';
import { useRoles, useUpdateRolePermissions } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, ArrowLeft, Save, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../stores/toastStore';

export const RolesPage: React.FC = () => {
  const { data: roles = [], isLoading } = useRoles();
  const updatePermissionsMutation = useUpdateRolePermissions();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('Doctor');

  // Matrix modules
  const modules = [
    { key: 'patients', name: 'Patient Master Index' },
    { key: 'appointments', name: 'Appointment Scheduler' },
    { key: 'opd', name: 'Outpatient Triage (OPD)' },
    { key: 'ipd', name: 'Inpatient Admissions (IPD)' },
    { key: 'prescriptions', name: 'Electronic Prescriptions' },
    { key: 'pharmacy', name: 'Pharmacy Dispensary & Stock' },
    { key: 'laboratory', name: 'Diagnostic Laboratory' },
    { key: 'billing', name: 'Patient Billing & Ledger' },
    { key: 'staff', name: 'Staff Management' },
    { key: 'reports', name: 'Clinical & Financial Analytics' },
    { key: 'settings', name: 'System Settings' },
  ];

  const actions = ['view', 'create', 'edit', 'delete'];

  const currentRoleObj = roles.find((r) => r.name === selectedRole) || roles[0];
  const [activePermissions, setActivePermissions] = useState<string[]>(
    currentRoleObj?.permissions || []
  );

  React.useEffect(() => {
    const roleObj = roles.find((r) => r.name === selectedRole) || roles[0];
    if (roleObj) {
      setActivePermissions(roleObj.permissions || []);
    }
  }, [selectedRole, roles]);

  const togglePermission = (perm: string) => {
    setActivePermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = async () => {
    if (currentRoleObj) {
      await updatePermissionsMutation.mutateAsync({
        roleId: currentRoleObj.id,
        permissions: activePermissions,
      });
      toast.success(`Access control matrix saved for ${selectedRole}`);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Role-Based Access Control (RBAC) Matrix"
        description="Fine-grained module access policies across medical, nursing, and financial personnel."
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Users', href: '/settings/users' },
          { label: 'Roles & Permissions' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/settings/users')} className="gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Users</span>
            </Button>
            <Button size="sm" onClick={handleSave} isLoading={updatePermissionsMutation.isPending} className="gap-1.5">
              <Save className="w-3.5 h-3.5" />
              <span>Save Policy Changes</span>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Role Selector Column */}
        <div className="lg:col-span-4 space-y-2">
          <Card>
            <CardHeader>
              <CardTitle>System Roles</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r.name)}
                  className={`w-full text-left p-3 rounded-lg flex items-center justify-between text-xs font-semibold transition-colors ${
                    selectedRole === r.name
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{r.name}</span>
                  </div>
                  <span className="text-[11px] opacity-80">{r.permissions.length} perms</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Permissions Checkbox Matrix */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{selectedRole} Access Policy</CardTitle>
                <p className="text-xs text-slate-500">Configure read/write privileges for {selectedRole}.</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Hospital Module</th>
                      <th className="px-4 py-3 text-center font-semibold">View</th>
                      <th className="px-4 py-3 text-center font-semibold">Create</th>
                      <th className="px-4 py-3 text-center font-semibold">Edit</th>
                      <th className="px-4 py-3 text-center font-semibold">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {modules.map((mod) => (
                      <tr key={mod.key} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                          {mod.name}
                        </td>
                        {actions.map((act) => {
                          const permString = `${mod.key}.${act}`;
                          const isChecked = activePermissions.includes(permString);
                          return (
                            <td key={act} className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(permString)}
                                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
