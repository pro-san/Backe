import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { formatCurrency } from '../../lib/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Download, FileText, TrendingUp, Calendar, DollarSign, Users, Activity } from 'lucide-react';
import { toast } from '../../stores/toastStore';

export const ReportsPage: React.FC = () => {
  const [reportRange, setReportRange] = useState('LAST_6_MONTHS');

  const monthlyFinancials = [
    { month: 'Oct', revenue: 98000, expenses: 54000, profit: 44000 },
    { month: 'Nov', revenue: 112000, expenses: 62000, profit: 50000 },
    { month: 'Dec', revenue: 125000, expenses: 68000, profit: 57000 },
    { month: 'Jan', revenue: 135000, expenses: 71000, profit: 64000 },
    { month: 'Feb', revenue: 142000, expenses: 73000, profit: 69000 },
    { month: 'Mar', revenue: 156000, expenses: 78000, profit: 78000 },
  ];

  const departmentVolume = [
    { dept: 'Cardiology', patients: 340, revenue: 68000 },
    { dept: 'Orthopedics', patients: 280, revenue: 54000 },
    { dept: 'Pediatrics', patients: 310, revenue: 38000 },
    { dept: 'Neurology', patients: 190, revenue: 47000 },
    { dept: 'General Surgery', patients: 230, revenue: 59000 },
    { dept: 'Emergency/Trauma', patients: 420, revenue: 72000 },
  ];

  const bedOccupancyRate = [
    { name: 'General Ward', occupied: 82, available: 18 },
    { name: 'Intensive Care (ICU)', occupied: 90, available: 10 },
    { name: 'Cardiology Care', occupied: 75, available: 25 },
    { name: 'Maternity Unit', occupied: 65, available: 35 },
    { name: 'Pediatric Ward', occupied: 70, available: 30 },
  ];

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'];

  const handleExport = (type: string) => {
    toast.success(`Exporting ${type} report to spreadsheet/PDF.`);
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Clinical & Financial Business Intelligence"
        description="Comprehensive healthcare analytics, hospital revenue trajectories, ward utilization, and departmental performance."
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Reports' }]}
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={reportRange}
              onChange={(e) => setReportRange(e.target.value)}
              className="h-8 text-xs w-44"
            >
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_3_MONTHS">Last Quarter (90d)</option>
              <option value="LAST_6_MONTHS">Last 6 Months</option>
              <option value="THIS_YEAR">Fiscal Year 2026</option>
            </Select>
            <Button variant="outline" size="sm" onClick={() => handleExport('PDF')} className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </Button>
            <Button size="sm" onClick={() => handleExport('Excel')} className="gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </Button>
          </div>
        }
      />

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Gross Period Collections</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 tabular-nums">
            {formatCurrency(768000)}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">+14.2% vs previous half-year</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Patient Encounters</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 tabular-nums">1,770</p>
          <span className="text-[11px] text-sky-600 font-medium">Inpatient & Ambulatory visits</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Average Bed Occupancy</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 tabular-nums">78.4%</p>
          <span className="text-[11px] text-purple-600 font-medium">Optimal bed turnaround rate</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Net Operating Margin</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 tabular-nums">49.2%</p>
          <span className="text-[11px] text-indigo-600 font-medium">After pharmaceutical overhead</span>
        </Card>
      </div>

      {/* Chart 1: Revenue vs Expenses vs Profit */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Performance Curve ($)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFinancials} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    border: '1px solid #1e293b',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" name="Gross Revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Operating Costs" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Net Margin" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row 2: Department Volumes & Bed Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Patient Volume by Clinical Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departmentVolume}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis type="category" dataKey="dept" stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: '1px solid #1e293b',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                  />
                  <Bar dataKey="patients" name="Consultations" fill="#38bdf8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Ward Bed Occupancy Rate (%)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bedOccupancyRate.map((b) => (
              <div key={b.name} className="space-y-1 text-xs">
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                  <span>{b.name}</span>
                  <span className="tabular-nums font-bold">{b.occupied}% Full</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      b.occupied >= 85 ? 'bg-rose-500' : b.occupied >= 75 ? 'bg-amber-500' : 'bg-sky-500'
                    }`}
                    style={{ width: `${b.occupied}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
