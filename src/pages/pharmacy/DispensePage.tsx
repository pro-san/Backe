import React, { useState } from 'react';
import { useMedicines, usePatients, useDispenseMedicines } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { formatCurrency } from '../../lib/formatters';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, Trash2, ArrowLeft, CheckCircle2, Receipt } from 'lucide-react';
import { toast } from '../../stores/toastStore';

interface DispenseItem {
  medicine_id: string;
  medicine_name: string;
  quantity: number;
  unit_price: number;
}

export const DispensePage: React.FC = () => {
  const { data: medicines = [] } = useMedicines();
  const { data: patients = [] } = usePatients();
  const dispenseMutation = useDispenseMedicines();
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [items, setItems] = useState<DispenseItem[]>([
    {
      medicine_id: medicines[0]?.id || '',
      medicine_name: medicines[0]?.name || '',
      quantity: 1,
      unit_price: medicines[0]?.unit_price || medicines[0]?.selling_price || 15.0,
    },
  ]);

  const handleAddItem = () => {
    const med = medicines[0];
    setItems((prev) => [
      ...prev,
      {
        medicine_id: med?.id || '',
        medicine_name: med?.name || '',
        quantity: 1,
        unit_price: med?.unit_price || med?.selling_price || 10,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMedicineChange = (index: number, medId: string) => {
    const med = medicines.find((m) => m.id === medId);
    if (!med) return;
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              medicine_id: med.id,
              medicine_name: med.name,
              unit_price: med.unit_price || med.selling_price || 15.0,
            }
          : item
      )
    );
  };

  const handleQuantityChange = (index: number, qty: number) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, quantity: Math.max(1, qty) } : item))
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleDispense = async () => {
    const patient = patients.find((p) => p.id === patientId);
    await dispenseMutation.mutateAsync({
      patient_id: patientId,
      patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Walk-in Patient',
      items: items,
      total_amount: total,
    });
    toast.success(`Medicines successfully dispensed. Stock deducted and pharmacy receipt created.`);
    navigate('/pharmacy/medicines');
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <PageHeader
        title="Pharmacy Dispensary POS"
        description="Fill medication orders, verify on-hand lot stock, and dispense directly to outpatients."
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Pharmacy', href: '/pharmacy/medicines' },
          { label: 'Dispense' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/pharmacy/medicines')} className="gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Stock</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dispense Configuration */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recipient & Patient Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                label="Select Patient"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name} ({p.patient_id}) — {p.phone}
                  </option>
                ))}
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medications to Dispense</CardTitle>
              <Button size="sm" variant="outline" onClick={handleAddItem} className="h-7 text-xs gap-1">
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item, idx) => {
                const med = medicines.find((m) => m.id === item.medicine_id);
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Line #{idx + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-6">
                        <Select
                          label="Drug"
                          value={item.medicine_id}
                          onChange={(e) => handleMedicineChange(idx, e.target.value)}
                          className="h-8 text-xs"
                        >
                          {medicines.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} (Stock: {m.stock ?? m.quantity ?? 0})
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="sm:col-span-3">
                        <Input
                          label="Qty"
                          type="number"
                          min="1"
                          max={med?.stock ?? med?.quantity ?? 100}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1.5 text-left">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                          Subtotal
                        </label>
                        <div className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-end text-xs font-bold tabular-nums">
                          {formatCurrency(item.quantity * item.unit_price)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary & Billing Checkout */}
        <div className="lg:col-span-4">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Dispensary Bill</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex justify-between text-slate-500">
                  <span>Gross Drugs Subtotal</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>State Pharma Tax (5%)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    {formatCurrency(tax)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-baseline text-sm pt-1">
                <span className="font-bold text-slate-900 dark:text-slate-100">Total Payable</span>
                <span className="text-xl font-bold text-sky-600 dark:text-sky-400 tabular-nums">
                  {formatCurrency(total)}
                </span>
              </div>

              <Button
                size="sm"
                onClick={handleDispense}
                isLoading={dispenseMutation.isPending}
                className="w-full h-10 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Dispense</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
