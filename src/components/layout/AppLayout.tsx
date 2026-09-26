import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';

export function AppLayout() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const canUseWebData = session?.role === 'ROLE_ADMIN' || session?.role === 'ROLE_MANAGER' || session?.role === 'ROLE_SUPER_ADMIN';
  const canManageShops = session?.role === 'ROLE_MANAGER' || session?.role === 'ROLE_SUPER_ADMIN';
  const canManageUsers = session?.role === 'ROLE_ADMIN' || session?.role === 'ROLE_MANAGER' || session?.role === 'ROLE_SUPER_ADMIN';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand">Bar Scan</NavLink>
        <nav className="nav-links" aria-label="Primary navigation">
          {session ? (
            <>
              {canUseWebData && <NavLink to="/products">Products</NavLink>}
              {canUseWebData && <NavLink to="/scan-session">Scan session</NavLink>}
              {canManageShops && <NavLink to="/shops">Shops</NavLink>}
              {canManageUsers && <NavLink to="/users">Users</NavLink>}
              <button className="text-button" type="button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/signup">Signup</NavLink>
            </>
          )}
        </nav>
      </header>
      <main className="page-frame">
        <Outlet />
      </main>
    </div>
  );
}
