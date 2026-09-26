import { Navigate, Outlet } from 'react-router-dom';

const localHosts = new Set(['localhost', '127.0.0.1', '::1']);

export function LocalOnlyRoute() {
  if (!localHosts.has(window.location.hostname)) {
    return <Navigate to="/signup" replace />;
  }

  return <Outlet />;
}
