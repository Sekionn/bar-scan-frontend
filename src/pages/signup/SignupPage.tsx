import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestContactSignup } from '../../api/client';
import { StatusMessage } from '../../components/feedback/StatusMessage';
import { useTranslation } from '../../i18n/useTranslation';

export function SignupPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [companyName, setCompanyName] = useState('');
  const [allowedUserCount, setAllowedUserCount] = useState(1);
  const [adminEmail, setAdminEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignupRequest() {
    setError('');

    if (!companyName || !adminEmail) {
      setError(t('signup.required'));
      return;
    }

    if (allowedUserCount < 1) {
      setError(t('signup.userCount'));
      return;
    }

    setIsSubmitting(true);

    try {
      const signup = await requestContactSignup({
        companyName,
        allowedUserCount,
        adminEmail,
        message,
      });

      navigate('/signup-submitted', { state: signup });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : t('signup.failed'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="form-page signup-page">
      <div className="control-panel">
        <label>
          {t('signup.companyName')}
          <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} required />
        </label>
        <label>
          {t('signup.monthlyUsers')}
          <input min={1} type="number" value={allowedUserCount} onChange={(event) => setAllowedUserCount(Number(event.target.value))} required />
        </label>
        <label>
          {t('signup.adminEmail')}
          <input value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} required type="email" autoComplete="email" />
        </label>
        <label>
          {t('signup.message')}
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} placeholder={t('signup.messagePlaceholder')} />
        </label>
        {error && <StatusMessage type="error">{error}</StatusMessage>}
        <button className="primary-action" disabled={isSubmitting} type="button" onClick={() => void handleSignupRequest()}>
          {isSubmitting ? t('signup.sending') : t('signup.request')}
        </button>
      </div>
    </section>
  );
}
