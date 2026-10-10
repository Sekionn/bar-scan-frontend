import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { useTranslation } from '../../i18n/useTranslation';

export function HomePage() {
  const { session } = useAuth();
  const { t } = useTranslation();

  if (session) {
    return <Navigate to="/product-archive" replace />;
  }

  return (
    <section className="entry-page">
      <div className="hero-actions">
        <Link className="primary-action" to="/signup">{t('home.createCompany')}</Link>
        <Link className="secondary-action" to="/login">{t('nav.login')}</Link>
      </div>
    </section>
  );
}
