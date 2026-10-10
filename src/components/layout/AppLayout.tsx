import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { useTranslation } from '../../i18n/useTranslation';
import { LanguageSwitcher } from './LanguageSwitcher';

export function AppLayout() {
  const { session, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand" aria-label="Bar Scan">
          <img src="/barscan-logo.png" alt="" />
        </NavLink>
        <nav className="nav-links" aria-label={t('nav.primary')}>
          {session ? (
            <>
              {session.capabilities.canUseWebData && <NavLink to="/product-archive">{t('nav.fiscalArchive')}</NavLink>}
              {session.capabilities.canViewShops && <NavLink to="/shops">{t('nav.shops')}</NavLink>}
              {session.capabilities.canViewUsers && <NavLink to="/users">{t('nav.users')}</NavLink>}
              <button className="text-button" type="button" onClick={handleLogout}>{t('nav.logout')}</button>
            </>
          ) : (
            <>
              <NavLink to="/login">{t('nav.login')}</NavLink>
              <NavLink to="/signup">{t('nav.signup')}</NavLink>
              <NavLink to="/privacy">{t('nav.privacy')}</NavLink>
              <NavLink to="/terms">{t('nav.terms')}</NavLink>
              <NavLink to="/support">{t('nav.support')}</NavLink>
            </>
          )}
          <LanguageSwitcher />
        </nav>
      </header>
      <main className="page-frame">
        <Outlet />
      </main>
    </div>
  );
}
