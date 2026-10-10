import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import type { AuthCapabilities } from '../../types';

type ProtectedRouteProps = {
  requiredCapability?: keyof AuthCapabilities;
};

export function ProtectedRoute({ requiredCapability }: ProtectedRouteProps) {
  const { session } = useAuth();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requiredCapability && !session.capabilities[requiredCapability]) {
    return <Navigate to="/not-authorized" replace />;
  }

  return <Outlet />;
}
