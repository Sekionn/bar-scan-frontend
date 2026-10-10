import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import type { ContactSignupResponse } from '../../types';

export function SignupSubmittedPage() {
  const location = useLocation();
  const { t } = useTranslation();
  const response = location.state as ContactSignupResponse | null;

  return (
    <section className="status-page">
      {response?.username && (
        <div className="status-strip">
          <span>{t('signupSubmitted.adminLogin', { username: response.username })}</span>
          <span>{t('signupSubmitted.status', { status: response.contactStatus })}</span>
        </div>
      )}
      <Link className="primary-action" to="/login">{t('signupSubmitted.goLogin')}</Link>
    </section>
  );
}
