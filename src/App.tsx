import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LocalOnlyRoute } from './components/routing/LocalOnlyRoute';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { NotAuthorizedPage } from './pages/errors/NotAuthorizedPage';
import { HomePage } from './pages/home/HomePage';
import { ProductArchiveTree } from './pages/inventory/ProductArchiveTree';
import { ProductListPage } from './pages/inventory/ProductListPage';
import { LegalPage } from './pages/legal/LegalPage';
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
        <Route path="/privacy" element={<LegalPage kind="privacy" />} />
        <Route path="/terms" element={<LegalPage kind="terms" />} />
        <Route path="/support" element={<LegalPage kind="support" />} />

        <Route element={<LocalOnlyRoute />}>
          <Route path="/payment-pending/:signupId" element={<PaymentPendingPage />} />
        </Route>

        <Route element={<ProtectedRoute requiredCapability="canUseWebData" />}>
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/product-archive" element={<ProductArchiveTree />} />
          <Route path="/scan-session" element={<Navigate to="/product-archive" replace />} />
        </Route>

        <Route element={<ProtectedRoute requiredCapability="canManageUsers" />}>
          <Route path="/users" element={<UserManagementPage />} />
        </Route>

        <Route element={<ProtectedRoute requiredCapability="canManageShops" />}>
          <Route path="/shops" element={<ShopsPage />} />
        </Route>

        <Route element={<ProtectedRoute requiredCapability="canAccessSuperUserPassword" />}>
          <Route path="/super/users/password" element={<SuperAdminPasswordPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
