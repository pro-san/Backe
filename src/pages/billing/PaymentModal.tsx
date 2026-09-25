import React, { useState } from 'react';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useRecordPayment } from '../../hooks/useHospitalQueries';
import { Invoice } from '../../types';
import { formatCurrency } from '../../lib/formatters';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  const recordPaymentMutation = useRecordPayment();

  const [amount, setAmount] = useState<number>(invoice?.balance || 0);
  const [method, setMethod] = useState<'Cash' | 'Credit Card' | 'Insurance' | 'Bank Transfer'>('Credit Card');
  const [refNumber, setRefNumber] = useState('TXN-' + Math.floor(100000 + Math.random() * 900000));
  const [notes, setNotes] = useState('Copay / patient settlement');

  if (!invoice) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await recordPaymentMutation.mutateAsync({
      invoiceId: invoice.id,
      paymentData: {
        amount: Number(amount),
        method,
        reference: refNumber,
        notes,
      },
    });
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Payment — ${invoice.invoice_number}`}
      description={`Outstanding Balance: ${formatCurrency(invoice.balance)}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <Input
          label="Payment Amount ($)"
          type="number"
          step="0.01"
          max={invoice.balance}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
        />

        <Select
          label="Payment Method"
          value={method}
          onChange={(e) => setMethod(e.target.value as any)}
        >
          <option value="Credit Card">Credit Card</option>
          <option value="Cash">Cash</option>
          <option value="Insurance">Insurance Claim Settlement</option>
          <option value="Bank Transfer">Bank Transfer / ACH</option>
        </Select>

        <Input
          label="Transaction / Reference #"
          value={refNumber}
          onChange={(e) => setRefNumber(e.target.value)}
          required
        />

        <Input
          label="Receipt Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={recordPaymentMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={recordPaymentMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
            Apply Payment
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
