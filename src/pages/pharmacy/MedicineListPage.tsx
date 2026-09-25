import React, { useState } from 'react';
import { useMedicines } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { MedicineModal } from './MedicineModal';
import { Medicine } from '../../types';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { useNavigate } from 'react-router-dom';
import { Pill, AlertCircle, ShoppingBag, Plus, Edit2 } from 'lucide-react';

export const MedicineListPage: React.FC = () => {
  const { data: medicines = [], isLoading, isError } = useMedicines();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  const lowStockCount = medicines.filter(
    (m) => (m.stock ?? m.quantity ?? 0) <= (m.reorder_level ?? m.minimum_stock ?? 20)
  ).length;

  const columns: Column<Medicine>[] = [
    {
      key: 'code',
      header: 'Drug Code',
      sortable: true,
      className: 'w-28 font-mono font-medium text-sky-600 dark:text-sky-400',
      render: (m) => m.code || m.batch_number || 'MED',
    },
    {
      key: 'name',
      header: 'Medication & Generic',
      sortable: true,
      render: (m) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{m.name}</span>
          <p className="text-[11px] text-slate-400 italic">{m.generic_name}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Therapeutic Class',
      sortable: true,
      render: (m) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {m.category}
        </span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock / Reorder',
      sortable: true,
      render: (m) => {
        const stock = m.stock ?? m.quantity ?? 0;
        const reorder = m.reorder_level ?? m.minimum_stock ?? 20;
        return (
          <div>
            <span
              className={`font-bold tabular-nums text-xs ${
                stock <= reorder
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {stock} units
            </span>
            <p className="text-[10px] text-slate-400">Reorder at {reorder}</p>
          </div>
        );
      },
    },
    {
      key: 'unit_price',
      header: 'Retail Price',
      sortable: true,
      render: (m) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
          {formatCurrency(m.unit_price ?? m.selling_price ?? 0)}
        </span>
      ),
    },
    {
      key: 'expiry_date',
      header: 'Expiry Date',
      sortable: true,
      render: (m) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 tabular-nums">
          {formatDate(m.expiry_date)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Stock Status',
      sortable: true,
      render: (m) => <StatusBadge status={m.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (m) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedMedicine(m);
              setModalOpen(true);
            }}
            title="Edit Stock or Pricing"
            className="h-7 w-7 text-slate-500 hover:text-amber-600"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Pharmacy Inventory Management"
        description="Prescription drug catalogue, batch tracking, unit pricing, and automated reorder threshold monitoring."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Pharmacy Inventory' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/pharmacy/dispense')}
              className="gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Dispense Drugs</span>
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setSelectedMedicine(null);
                setModalOpen(true);
              }}
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Drug</span>
            </Button>
          </div>
        }
      />

      {/* Low stock alert banner if any item is below reorder */}
      {lowStockCount > 0 && (
        <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/20 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Inventory Warning:</strong> {lowStockCount} medications are approaching or below their reorder threshold level.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs bg-white dark:bg-slate-900 border-amber-300 text-amber-900 dark:text-amber-200 hover:bg-amber-100"
            onClick={() => navigate('/pharmacy/dispense')}
          >
            Review Stock
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={medicines}
        isLoading={isLoading}
        isError={isError}
        searchPlaceholder="Search medications by brand name, generic name, category..."
        searchField={(m) => `${m.code || m.batch_number} ${m.name} ${m.generic_name} ${m.category} ${m.manufacturer}`}
        onAdd={() => {
          setSelectedMedicine(null);
          setModalOpen(true);
        }}
        addLabel="Add Drug"
        emptyTitle="Pharmacy catalog is empty"
        emptyDescription="Add pharmaceutical medications to enable prescription dispensing."
      />

      <MedicineModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedMedicine(null);
        }}
        medicineToEdit={selectedMedicine}
      />
    </div>
  );
};
