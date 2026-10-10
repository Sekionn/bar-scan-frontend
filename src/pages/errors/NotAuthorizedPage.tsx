import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';

export function NotAuthorizedPage() {
  const { t } = useTranslation();

  return (
    <section className="status-page">
      <Link className="primary-action" to="/">{t('common.backToStart')}</Link>
    </section>
  );
}
