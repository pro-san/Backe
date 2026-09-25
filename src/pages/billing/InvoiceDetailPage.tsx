import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoices } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PaymentModal } from './PaymentModal';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { ArrowLeft, Printer, DollarSign, Activity, CheckCircle2 } from 'lucide-react';

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: invoices = [] } = useInvoices();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const invoice = invoices.find((inv) => inv.id === id);

  if (!invoice) {
    return (
      <div className="p-8 text-center">
        <p className="text-xs text-rose-600">Invoice not found.</p>
        <Button size="sm" onClick={() => navigate('/billing/invoices')} className="mt-2">
          Back to Invoices
        </Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div className="no-print">
        <PageHeader
          title={`Hospital Invoice — ${invoice.invoice_number}`}
          description={`Patient: ${invoice.patient_name} · Due ${formatDate(invoice.due_date)}`}
          breadcrumbs={[
            { label: 'Home', href: '/dashboard' },
            { label: 'Billing Invoices', href: '/billing/invoices' },
            { label: invoice.invoice_number },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/billing/invoices')} className="gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Button>
              {invoice.balance > 0 && (
                <Button
                  size="sm"
                  onClick={() => setPaymentModalOpen(true)}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Record Payment</span>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </Button>
            </div>
          }
        />
      </div>

      {/* Official Medical Bill Document */}
      <Card className="bg-white text-slate-900 shadow-lg border border-slate-200 p-8 sm:p-12 print:border-none print:shadow-none print:p-0">
        {/* Letterhead */}
        <div className="border-b-2 border-slate-900 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Activity className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-950">
                  St. Jude Apex Medical Center
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  500 Hospital Blvd, Suite 400 · Metro City · Tel: (555) 349-8000
                </p>
                <p className="text-[11px] text-slate-500">
                  Accounts & Revenue Service Unit · Tax ID: US-EIN-9482019
                </p>
              </div>
            </div>

            <div className="sm:text-right text-xs">
              <h2 className="text-lg font-black text-slate-900 font-mono tracking-tight">
                {invoice.invoice_number}
              </h2>
              <p className="text-slate-500">Date: {formatDate(invoice.date)}</p>
              <p className="text-slate-500">Due: {formatDate(invoice.due_date)}</p>
              <div className="mt-1">
                <StatusBadge status={invoice.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Patient Billing Meta */}
        <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs my-4 bg-slate-50/70 p-4 rounded-lg">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Billed To Patient</span>
            <p className="font-bold text-slate-900 text-sm">{invoice.patient_name}</p>
            <p className="text-slate-500">Contact: {invoice.patient_phone || 'On file'}</p>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Payment Instrument</span>
            <p className="font-semibold text-slate-800">{invoice.payment_method || 'Insurance / Direct'}</p>
            <p className="text-slate-500">Status: {invoice.status}</p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="space-y-3 my-6">
          <table className="w-full text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 text-left w-12">#</th>
                <th className="px-4 py-2.5 text-left">Description</th>
                <th className="px-4 py-2.5 text-left">Category</th>
                <th className="px-4 py-2.5 text-right w-20">Qty</th>
                <th className="px-4 py-2.5 text-right w-28">Unit Price</th>
                <th className="px-4 py-2.5 text-right w-28">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500 font-mono">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{item.description}</td>
                  <td className="px-4 py-3 text-slate-600">{item.category}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{item.quantity}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-700">{formatCurrency(item.unit_price)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-slate-900">
                    {formatCurrency(item.total ?? item.amount ?? (item.unit_price * item.quantity))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Totals Breakdown */}
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Gross Subtotal:</span>
              <span className="font-semibold tabular-nums text-slate-900">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Healthcare Tax:</span>
              <span className="font-semibold tabular-nums text-slate-900">{formatCurrency(invoice.tax)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount / Concession:</span>
                <span className="font-semibold tabular-nums">-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold border-t border-slate-200 pt-2 text-slate-950">
              <span>Total Payable:</span>
              <span className="tabular-nums">{formatCurrency(invoice.total)}</span>
            </div>
            <div className="flex justify-between text-emerald-700">
              <span>Amount Paid:</span>
              <span className="font-semibold tabular-nums">{formatCurrency(invoice.paid)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-slate-200 pt-2 text-rose-600">
              <span>Net Balance Due:</span>
              <span className="tabular-nums">{formatCurrency(invoice.balance)}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="pt-12 mt-8 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between items-end">
          <div>
            <p className="font-semibold text-slate-700">Payment Instructions</p>
            <p>Please make checks or bank wires payable to St. Jude Apex Medical Center.</p>
            <p>Direct electronic billing queries to billing@hospital.org.</p>
          </div>
          <div className="text-right">
            <p className="font-mono">Authorized Cashier: Finance Office</p>
          </div>
        </div>
      </Card>

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        invoice={invoice}
      />
    </div>
  );
};
