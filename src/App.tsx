import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LocalOnlyRoute } from './components/routing/LocalOnlyRoute';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { NotAuthorizedPage } from './pages/errors/NotAuthorizedPage';
import { HomePage } from './pages/home/HomePage';
import { ProductListPage } from './pages/inventory/ProductListPage';
import { ScanSessionPage } from './pages/inventory/ScanSessionPage';
import { PaymentPendingPage } from './pages/payment/PaymentPendingPage';
import { ShopsPage } from './pages/shops/ShopsPage';
import { SignupPage } from './pages/signup/SignupPage';
import { SignupSubmittedPage } from './pages/signup/SignupSubmittedPage';
import { SuperAdminPasswordPage } from './pages/super-admin/SuperAdminPasswordPage';
import { UserManagementPage } from './pages/users/UserManagementPage';
import './App.css';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup-submitted" element={<SignupSubmittedPage />} />
        <Route path="/not-authorized" element={<NotAuthorizedPage />} />

        <Route element={<LocalOnlyRoute />}>
          <Route path="/payment-pending/:signupId" element={<PaymentPendingPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_SUPER_ADMIN']} />}>
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/scan-session" element={<ScanSessionPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_SUPER_ADMIN']} />}>
          <Route path="/users" element={<UserManagementPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ROLE_MANAGER', 'ROLE_SUPER_ADMIN']} />}>
          <Route path="/shops" element={<ShopsPage />} />
        </Route>

        <Route element={<ProtectedRoute requiredRole="ROLE_SUPER_ADMIN" />}>
          <Route path="/super/users/password" element={<SuperAdminPasswordPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
