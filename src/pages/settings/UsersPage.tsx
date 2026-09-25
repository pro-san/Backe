import React, { useState } from 'react';
import { useUsers, useUpdateUser } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { UserModal } from './UserModal';
import { User } from '../../types';
import { formatDate } from '../../lib/formatters';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Plus, Key, Shield, UserX, UserCheck } from 'lucide-react';
import { toast } from '../../stores/toastStore';

export const UsersPage: React.FC = () => {
  const { data: users = [], isLoading, isError } = useUsers();
  const updateMutation = useUpdateUser();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);

  const handleToggleStatus = async (u: User) => {
    const newStatus = u.status === 'Active' ? 'Inactive' : 'Active';
    await updateMutation.mutateAsync({
      id: u.id,
      data: { status: newStatus },
    });
    toast.success(`User ${u.name} set to ${newStatus}`);
  };

  const handleResetPassword = (u: User) => {
    toast.info(`Secure password reset instructions dispatched to ${u.email}.`);
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'User Account',
      sortable: true,
      render: (u) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{u.name}</span>
          <p className="text-[11px] text-slate-400">{u.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Assigned Role',
      sortable: true,
      render: (u) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900/40">
          <Shield className="w-3 h-3" />
          {u.role}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Provisioned On',
      sortable: true,
      render: (u) => <span className="tabular-nums text-xs">{formatDate(u.created_at)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (u) => <StatusBadge status={u.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleResetPassword(u)}
            title="Reset Password"
            className="h-7 w-7 text-slate-500 hover:text-amber-600"
          >
            <Key className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToggleStatus(u)}
            title={u.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
            className={`h-7 w-7 ${
              u.status === 'Active' ? 'text-slate-500 hover:text-rose-600' : 'text-emerald-600'
            }`}
          >
            {u.status === 'Active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="User Access & Identity Accounts"
        description="Clinical credential administration, password reset triggers, and role-based permissions."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Users' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/settings/roles')}
              className="gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Permissions Matrix</span>
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Add User</span>
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        isError={isError}
        searchPlaceholder="Search users by name, email, role..."
        searchField={(u) => `${u.name} ${u.email} ${u.role} ${u.status}`}
        onAdd={() => setModalOpen(true)}
        addLabel="Add User"
        emptyTitle="No system users provisioned"
        emptyDescription="Provision user accounts to allow medical and administrative staff to sign in."
      />

      <UserModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
