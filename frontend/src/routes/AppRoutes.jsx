import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '../components/layout/AuthLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Client pages
import ClientDashboard from '../pages/client/ClientDashboard';
import BookingPage from '../pages/client/BookingPage';
import ClientAppointments from '../pages/client/ClientAppointments';
import ClientProfile from '../pages/client/ClientProfile';
import ClientNotifications from '../pages/client/ClientNotifications';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminAppointments from '../pages/admin/AdminAppointments';
import { AdminClients, AdminSlots, AdminSettings, AdminReports } from '../pages/admin/AdminStubs';
import AdminNotifications from '../pages/admin/AdminNotifications';
import AdminUsers from '../pages/admin/AdminUsers';

// Guards
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Client routes */}
      <Route element={<PrivateRoute><DashboardLayout role="client" /></PrivateRoute>}>
        <Route path="/dashboard" element={<ClientDashboard />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/appointments" element={<ClientAppointments />} />
        <Route path="/profile" element={<ClientProfile />} />
        <Route path="/notifications" element={<ClientNotifications />} />
      </Route>

      {/* Admin routes */}
      <Route element={<AdminRoute><DashboardLayout role="admin" /></AdminRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/appointments" element={<AdminAppointments />} />
        <Route path="/admin/clients" element={<AdminClients />} />
        <Route path="/admin/slots" element={<AdminSlots />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
