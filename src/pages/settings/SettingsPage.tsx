import React, { useState } from 'react';
import { useSettings, useUpdateSettings } from '../../hooks/useHospitalQueries';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Building2, Save, DollarSign, Shield, Receipt } from 'lucide-react';
import { toast } from '../../stores/toastStore';

export const SettingsPage: React.FC = () => {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const [hospitalName, setHospitalName] = useState(settings?.hospital_name || settings?.name || 'St. Jude Apex Medical Center');
  const [address, setAddress] = useState(settings?.address || '500 Hospital Blvd, Suite 400');
  const [phone, setPhone] = useState(settings?.phone || '+1 (555) 349-8000');
  const [email, setEmail] = useState(settings?.email || 'contact@hospital.org');
  const [currency, setCurrency] = useState(settings?.currency || 'USD');
  const [taxRate, setTaxRate] = useState(settings?.tax_rate || 5);
  const [invoicePrefix, setInvoicePrefix] = useState(settings?.invoice_prefix || 'INV-');
  const [appointmentInterval, setAppointmentInterval] = useState(settings?.appointment_interval || 30);

  React.useEffect(() => {
    if (settings) {
      setHospitalName(settings.hospital_name || settings.name || 'St. Jude Apex Medical Center');
      setAddress(settings.address || '');
      setPhone(settings.phone || '');
      setEmail(settings.email || '');
      setCurrency(settings.currency || 'USD');
      setTaxRate(settings.tax_rate ?? 5);
      setInvoicePrefix(settings.invoice_prefix || 'INV-');
      setAppointmentInterval(settings.appointment_interval ?? 30);
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({
      name: hospitalName,
      hospital_name: hospitalName,
      address,
      phone,
      email,
      currency,
      tax_rate: Number(taxRate),
      invoice_prefix: invoicePrefix,
      appointment_interval: Number(appointmentInterval),
    });
    toast.success('Hospital system configurations updated.');
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <PageHeader
        title="Hospital System Settings"
        description="Configure institution metadata, tax compliance, appointment intervals, and clinical billing defaults."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Settings' }]}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hospital Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <CardTitle>Medical Facility Identification</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Hospital Legal Entity Name"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                required
              />
              <Input
                label="Primary Support Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Switchboard Telephone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Input
                label="Campus Physical Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Clinical Operations & Scheduling */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <CardTitle>Billing & Appointment Scheduling Parameters</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Base Operating Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD ($) — United States Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
                <option value="CAD">CAD ($) — Canadian Dollar</option>
              </Select>
              <Input
                label="Healthcare Sales Tax Rate (%)"
                type="number"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Invoice Numbering Prefix"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                required
              />
              <Select
                label="OPD Consultation Slot Duration"
                value={appointmentInterval}
                onChange={(e) => setAppointmentInterval(Number(e.target.value))}
              >
                <option value={15}>15 Minutes (High Turnover)</option>
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes (Standard Clinic)</option>
                <option value={45}>45 Minutes (Specialist Comprehensive)</option>
                <option value={60}>60 Minutes</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" size="sm" isLoading={updateMutation.isPending} className="gap-1.5">
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
