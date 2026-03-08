import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/auth/LoginPage';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { AppLayout } from '@/layout/AppLayout';

const OrdersListPage = lazy(() =>
  import('@/pages/orders/OrdersListPage').then((m) => ({
    default: m.OrdersListPage,
  })),
);
const CreateOrderPage = lazy(() =>
  import('@/pages/orders/CreateOrderPage').then((m) => ({
    default: m.CreateOrderPage,
  })),
);
const OrderDetailPage = lazy(() =>
  import('@/pages/orders/OrderDetailPage').then((m) => ({
    default: m.OrderDetailPage,
  })),
);
const ClientsPage = lazy(() =>
  import('@/pages/references/ClientsPage').then((m) => ({
    default: m.ClientsPage,
  })),
);
const NomenclaturePage = lazy(() =>
  import('@/pages/references/NomenclaturePage').then((m) => ({
    default: m.NomenclaturePage,
  })),
);
const EmployeesPage = lazy(() =>
  import('@/pages/references/EmployeesPage').then((m) => ({
    default: m.EmployeesPage,
  })),
);
const OrgUnitsPage = lazy(() =>
  import('@/pages/references/OrgUnitsPage').then((m) => ({
    default: m.OrgUnitsPage,
  })),
);
const SalesChannelsPage = lazy(() =>
  import('@/pages/references/SalesChannelsPage').then((m) => ({
    default: m.SalesChannelsPage,
  })),
);
const ReportsPage = lazy(() =>
  import('@/pages/reports/ReportsPage').then((m) => ({
    default: m.ReportsPage,
  })),
);
const SettingsPage = lazy(() =>
  import('@/pages/settings/SettingsPage').then((m) => ({
    default: m.SettingsPage,
  })),
);

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-12 text-muted-foreground">
      Loading...
    </div>
  );
}

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
          <Route
            path="orders"
            element={
              <Suspense fallback={<PageLoader />}>
                <OrdersListPage />
              </Suspense>
            }
          />
          <Route
            path="orders/new"
            element={
              <Suspense fallback={<PageLoader />}>
                <CreateOrderPage />
              </Suspense>
            }
          />
          <Route
            path="orders/:id"
            element={
              <Suspense fallback={<PageLoader />}>
                <OrderDetailPage />
              </Suspense>
            }
          />
          <Route
            path="clients"
            element={
              <Suspense fallback={<PageLoader />}>
                <ClientsPage />
              </Suspense>
            }
          />
          <Route
            path="nomenclature"
            element={
              <Suspense fallback={<PageLoader />}>
                <NomenclaturePage />
              </Suspense>
            }
          />
          <Route
            path="employees"
            element={
              <Suspense fallback={<PageLoader />}>
                <EmployeesPage />
              </Suspense>
            }
          />
          <Route
            path="org-units"
            element={
              <Suspense fallback={<PageLoader />}>
                <OrgUnitsPage />
              </Suspense>
            }
          />
          <Route
            path="sales-channels"
            element={
              <Suspense fallback={<PageLoader />}>
                <SalesChannelsPage />
              </Suspense>
            }
          />
          <Route
            path="order-statuses"
            element={<Navigate to="/settings" replace />}
          />
          <Route
            path="reports"
            element={
              <Suspense fallback={<PageLoader />}>
                <ReportsPage />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<PageLoader />}>
                <SettingsPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
