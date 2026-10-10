import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';

export function HomePage() {
  const { session } = useAuth();

  if (session) {
    return <Navigate to="/product-archive" replace />;
  }

  return <Navigate to="/login" replace />;
}
