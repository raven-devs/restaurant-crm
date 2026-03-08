import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/auth/LoginPage';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { AppLayout } from '@/layout/AppLayout';
import { OrdersListPage } from '@/pages/orders/OrdersListPage';
import { CreateOrderPage } from '@/pages/orders/CreateOrderPage';
import { OrderDetailPage } from '@/pages/orders/OrderDetailPage';
import { ClientsPage } from '@/pages/references/ClientsPage';
import { NomenclaturePage } from '@/pages/references/NomenclaturePage';
import { EmployeesPage } from '@/pages/references/EmployeesPage';
import { OrgUnitsPage } from '@/pages/references/OrgUnitsPage';
import { SalesChannelsPage } from '@/pages/references/SalesChannelsPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/orders" replace />} />
          <Route path="orders" element={<OrdersListPage />} />
          <Route path="orders/new" element={<CreateOrderPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="nomenclature" element={<NomenclaturePage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="org-units" element={<OrgUnitsPage />} />
          <Route path="sales-channels" element={<SalesChannelsPage />} />
          <Route
            path="order-statuses"
            element={<Navigate to="/settings" replace />}
          />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
