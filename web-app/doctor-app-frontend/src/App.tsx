import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AppThemeProvider } from './contexts/AppThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { DoctorProvider } from './contexts/DoctorContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PatientDashboard from './pages/PatientDashboard';
import PatientAppointmentsPage from './pages/PatientAppointmentsPage';
import PatientSettingsPage from './pages/PatientSettingsPage';
import PatientChatPage from './pages/PatientChatPage';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorProfilePage from './pages/doctor/DoctorProfilePage';
import DoctorSchedulePage from './pages/doctor/DoctorSchedulePage';
import DoctorClinicsPage from './pages/doctor/DoctorClinicsPage';
import DoctorChatPage from './pages/doctor/DoctorChatPage';
import DoctorAppointmentsPage from './pages/doctor/DoctorAppointmentsPage';
import DoctorAvailabilityPage from './pages/doctor/DoctorAvailabilityPage';
import DoctorSlotsPage from './pages/doctor/DoctorSlotsPage';

function DoctorRoutes() {
  return (
    <DoctorProvider>
      <Outlet />
    </DoctorProvider>
  );
}

export default function App() {
  return (
    <AppThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/dashboard"    element={<PatientDashboard />} />
            <Route path="/appointments" element={<PatientAppointmentsPage />} />
            <Route path="/settings"     element={<PatientSettingsPage />} />
            <Route path="/chat"         element={<PatientChatPage />} />

            {/* All doctor routes share the DoctorProvider context */}
            <Route element={<DoctorRoutes />}>
              <Route path="/doctor-dashboard"    element={<DoctorDashboard />} />
              <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
              <Route path="/doctor/profile"      element={<DoctorProfilePage />} />
              <Route path="/doctor/schedule"     element={<DoctorSchedulePage />} />
              <Route path="/doctor/availability" element={<DoctorAvailabilityPage />} />
              <Route path="/doctor/slots"        element={<DoctorSlotsPage />} />
              <Route path="/doctor/clinics"      element={<DoctorClinicsPage />} />
              <Route path="/doctor/chat"         element={<DoctorChatPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AppThemeProvider>
  );
}
