import React, { useState } from 'react';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useCreateInvoice, usePatients } from '../../hooks/useHospitalQueries';
import { InvoiceItem } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import { Plus, Trash2 } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose }) => {
  const createMutation = useCreateInvoice();
  const { data: patients = [] } = usePatients();

  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 86400 * 1000).toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit Card' | 'Insurance' | 'Bank Transfer'>('Credit Card');

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'inv_item_1',
      description: 'Specialist Clinical Consultation Fee',
      category: 'Consultation',
      quantity: 1,
      unit_price: 150.0,
      total: 150.0,
      amount: 150.0,
    },
  ]);

  const [taxRate, setTaxRate] = useState(5); // 5%
  const [discountAmount, setDiscountAmount] = useState(0);
  const [initialPaid, setInitialPaid] = useState(0);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: 'inv_item_' + Date.now(),
        description: 'Diagnostic / Hospital Service',
        category: 'Consultation',
        quantity: 1,
        unit_price: 75.0,
        total: 75.0,
        amount: 75.0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: string, val: any) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const updated = { ...i, [field]: val };
        if (field === 'quantity' || field === 'unit_price') {
          const calc = Number(updated.quantity) * Number(updated.unit_price);
          updated.total = calc;
          updated.amount = calc;
        }
        return updated;
      })
    );
  };

  const subtotal = items.reduce((sum, item) => sum + (item.total || item.amount || 0), 0);
  const tax = (subtotal * taxRate) / 100;
  const total = Math.max(0, subtotal + tax - discountAmount);
  const balance = Math.max(0, total - initialPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = patients.find((pat) => pat.id === patientId) || patients[0];

    let mappedStatus: 'Paid' | 'Partial' | 'Pending' = 'Pending';
    if (initialPaid >= total) {
      mappedStatus = 'Paid';
    } else if (initialPaid > 0) {
      mappedStatus = 'Partial';
    }

    await createMutation.mutateAsync({
      patient_id: p.id,
      patient_name: `${p.first_name} ${p.last_name}`,
      patient_phone: p.phone,
      date,
      due_date: dueDate,
      items,
      subtotal,
      tax,
      discount: discountAmount,
      total,
      paid: initialPaid,
      balance,
      status: mappedStatus,
      payment_method: paymentMethod,
    });
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create Itemized Patient Invoice"
      description="Generate healthcare statement for outpatient, ward, or pharmacy charges."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Patient"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.first_name} {p.last_name} ({p.patient_id})
              </option>
            ))}
          </Select>

          <Input
            label="Billing Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <Input
            label="Payment Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        {/* Itemized Charge Lines */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Billable Clinical Items
            </span>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-7 text-xs gap-1">
              <Plus className="w-3 h-3" />
              <span>Add Line Item</span>
            </Button>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-sky-600">Charge #{idx + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-3">
                    <Select
                      label="Service Category"
                      value={item.category}
                      onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                      className="h-8 text-xs"
                    >
                      <option value="Consultation">Consultation</option>
                      <option value="Room Charge">Room Charge</option>
                      <option value="Medicine">Medicine / Pharmacy</option>
                      <option value="Lab Test">Lab Test</option>
                      <option value="Surgery">Surgery / OR</option>
                      <option value="Nursing">Nursing / Care</option>
                      <option value="Other">Other Ancillary</option>
                    </Select>
                  </div>

                  <div className="sm:col-span-4">
                    <Input
                      label="Description"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="h-8 text-xs"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Input
                      label="Qty"
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <Input
                      label="Rate ($)"
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(item.id, 'unit_price', Number(e.target.value))}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calculation & Tax Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <Input
            label="Tax Rate (%)"
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            className="h-8 text-xs"
          />
          <Input
            label="Discount ($)"
            type="number"
            value={discountAmount}
            onChange={(e) => setDiscountAmount(Number(e.target.value))}
            className="h-8 text-xs"
          />
          <Input
            label="Initial Payment ($)"
            type="number"
            value={initialPaid}
            onChange={(e) => setInitialPaid(Number(e.target.value))}
            className="h-8 text-xs"
          />
        </div>

        <div className="flex justify-between items-center text-xs p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-slate-400">Net Total:</span>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {formatCurrency(total)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-slate-400">Balance Due:</span>
            <p className="text-lg font-bold text-rose-600 dark:text-rose-400 tabular-nums">
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={createMutation.isPending}>
            Generate & Issue Invoice
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
