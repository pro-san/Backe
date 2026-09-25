import React, { useState } from 'react';
import { useInvoices } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { InvoiceModal } from './InvoiceModal';
import { PaymentModal } from './PaymentModal';
import { Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { useNavigate } from 'react-router-dom';
import { Eye, Plus, CreditCard, DollarSign, Printer } from 'lucide-react';

export const InvoiceListPage: React.FC = () => {
  const { data: invoices = [], isLoading, isError } = useInvoices();
  const navigate = useNavigate();

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handleRecordPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPaymentModalOpen(true);
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'invoice_number',
      header: 'Invoice #',
      sortable: true,
      className: 'w-32 font-mono font-medium text-sky-600 dark:text-sky-400',
    },
    {
      key: 'patient_name',
      header: 'Patient Details',
      sortable: true,
      render: (i) => (
        <div>
          <button
            onClick={() => navigate(`/billing/invoices/${i.id}`)}
            className="font-semibold text-slate-900 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400 text-left"
          >
            {i.patient_name}
          </button>
          <p className="text-[11px] text-slate-400">{i.patient_phone || 'No phone'}</p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Invoice Date',
      sortable: true,
      render: (i) => <span className="tabular-nums text-xs">{formatDate(i.date)}</span>,
    },
    {
      key: 'total',
      header: 'Total Amount',
      sortable: true,
      render: (i) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
          {formatCurrency(i.total)}
        </span>
      ),
    },
    {
      key: 'paid',
      header: 'Paid',
      render: (i) => (
        <span className="text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">
          {formatCurrency(i.paid)}
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'Balance Due',
      sortable: true,
      render: (i) => (
        <span
          className={`font-bold tabular-nums ${
            i.balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
          }`}
        >
          {formatCurrency(i.balance)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Payment Status',
      sortable: true,
      render: (i) => <StatusBadge status={i.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (i) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/billing/invoices/${i.id}`)}
            title="View Statement"
            className="h-7 w-7 text-slate-500 hover:text-sky-600"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          {i.balance > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRecordPayment(i)}
              className="h-7 text-xs gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            >
              <DollarSign className="w-3 h-3" />
              <span>Pay</span>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Patient Billing & Accounts Receivable"
        description="Outpatient receipts, inpatient ward statements, copay payments, and revenue accounts."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Billing Invoices' }]}
        actions={
          <Button size="sm" onClick={() => setInvoiceModalOpen(true)} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Create Invoice</span>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        isError={isError}
        searchPlaceholder="Search invoices by patient, invoice #, status..."
        searchField={(i) => `${i.invoice_number} ${i.patient_name} ${i.status}`}
        onAdd={() => setInvoiceModalOpen(true)}
        addLabel="Create Invoice"
        emptyTitle="No invoices found"
        emptyDescription="Billing invoices generated for appointments, procedures, or prescriptions will appear here."
      />

      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
      />

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
      />
    </div>
  );
};
