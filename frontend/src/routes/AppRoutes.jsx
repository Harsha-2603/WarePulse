import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { FullPageLoader } from '../components/ui/LoadingSpinner';

// Layouts
import DashboardLayout from '../components/layout/DashboardLayout';

// Lazy-loaded Pages
const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const InventoryPage = lazy(() => import('../pages/InventoryPage'));
const CustomersPage = lazy(() => import('../pages/CustomersPage'));
const VendorsPage = lazy(() => import('../pages/VendorsPage'));
const OrdersPage = lazy(() => import('../pages/OrdersPage'));
const BillingPage = lazy(() => import('../pages/BillingPage'));
const ReportsPage = lazy(() => import('../pages/ReportsPage'));
const AIAssistantPage = lazy(() => import('../pages/AIAssistantPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<FullPageLoader text="Loading interface..." />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="vendors" element={<VendorsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="ai-assistant" element={<AIAssistantPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
