import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import type { Role } from '../../types';

type ProtectedRouteProps = {
  requiredRole?: Role;
  allowedRoles?: Role[];
};

export function ProtectedRoute({ requiredRole, allowedRoles }: ProtectedRouteProps) {
  const { session } = useAuth();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const roles = allowedRoles ?? (requiredRole ? [requiredRole] : undefined);

  if (roles && !roles.includes(session.role)) {
    return <Navigate to="/not-authorized" replace />;
  }

  return <Outlet />;
}
