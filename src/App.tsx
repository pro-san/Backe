import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { ToastContainer } from './components/ui/ToastContainer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Common Pages
import { NotFoundPage } from './pages/common/NotFoundPage';
import { UnauthorizedPage } from './pages/common/UnauthorizedPage';

// Core Domain Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { PatientListPage } from './pages/patients/PatientListPage';
import { PatientDetailPage } from './pages/patients/PatientDetailPage';
import { DoctorListPage } from './pages/doctors/DoctorListPage';
import { DepartmentListPage } from './pages/departments/DepartmentListPage';
import { AppointmentListPage } from './pages/appointments/AppointmentListPage';

// OPD & IPD
import { OPDQueuePage } from './pages/opd/OPDQueuePage';
import { ConsultationPage } from './pages/opd/ConsultationPage';
import { IPDAdmissionListPage } from './pages/ipd/IPDAdmissionListPage';
import { BedManagementPage } from './pages/ipd/BedManagementPage';

// Prescriptions
import { PrescriptionListPage } from './pages/prescriptions/PrescriptionListPage';
import { PrescriptionDetailPage } from './pages/prescriptions/PrescriptionDetailPage';

// Pharmacy
import { MedicineListPage } from './pages/pharmacy/MedicineListPage';
import { DispensePage } from './pages/pharmacy/DispensePage';

// Laboratory
import { LabTestListPage } from './pages/laboratory/LabTestListPage';
import { LabOrdersPage } from './pages/laboratory/LabOrdersPage';

// Billing & Accounts
import { InvoiceListPage } from './pages/billing/InvoiceListPage';
import { InvoiceDetailPage } from './pages/billing/InvoiceDetailPage';

// Staff, Reports, System & Settings
import { StaffListPage } from './pages/staff/StaffListPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { UsersPage } from './pages/settings/UsersPage';
import { RolesPage } from './pages/settings/RolesPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { ProfilePage } from './pages/settings/ProfilePage';
import { NotificationsPage } from './pages/system/NotificationsPage';
import { ActivityLogsPage } from './pages/system/ActivityLogsPage';

export function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Protected Dashboard Module Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Patients Master Index */}
            <Route path="/patients" element={<PatientListPage />} />
            <Route path="/patients/:id" element={<PatientDetailPage />} />

            {/* Doctors & Clinical Staff */}
            <Route path="/doctors" element={<DoctorListPage />} />
            <Route path="/departments" element={<DepartmentListPage />} />
            <Route path="/appointments" element={<AppointmentListPage />} />

            {/* OPD Triage & Clinical Consultation */}
            <Route path="/opd/queue" element={<OPDQueuePage />} />
            <Route path="/opd/consultation/:patientId" element={<ConsultationPage />} />

            {/* Inpatient IPD & Ward Management */}
            <Route path="/ipd/admissions" element={<IPDAdmissionListPage />} />
            <Route path="/ipd/beds" element={<BedManagementPage />} />

            {/* Prescriptions */}
            <Route path="/prescriptions" element={<PrescriptionListPage />} />
            <Route path="/prescriptions/:id" element={<PrescriptionDetailPage />} />

            {/* Pharmacy */}
            <Route path="/pharmacy/medicines" element={<MedicineListPage />} />
            <Route path="/pharmacy/dispense" element={<DispensePage />} />

            {/* Laboratory */}
            <Route path="/laboratory/tests" element={<LabTestListPage />} />
            <Route path="/laboratory/orders" element={<LabOrdersPage />} />

            {/* Billing & Accounts Receivable */}
            <Route path="/billing/invoices" element={<InvoiceListPage />} />
            <Route path="/billing/invoices/:id" element={<InvoiceDetailPage />} />

            {/* Staff, Reports, Analytics */}
            <Route path="/staff" element={<StaffListPage />} />
            <Route path="/reports" element={<ReportsPage />} />

            {/* Identity & Settings */}
            <Route path="/settings/users" element={<UsersPage />} />
            <Route path="/settings/roles" element={<RolesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/profile" element={<ProfilePage />} />

            {/* Notifications & Audit Logs */}
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/activity-logs" element={<ActivityLogsPage />} />
          </Route>

          {/* System & Fallback Routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </QueryProvider>
  );
}

export default App;
