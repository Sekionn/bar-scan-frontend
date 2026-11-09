import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../../api/client';
import { StatusMessage } from '../../components/feedback/StatusMessage';
import { useTranslation } from '../../i18n/useTranslation';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleRequest() {
    setError('');

    if (!email.trim()) {
      setError(t('forgotPassword.required'));
      return;
    }

    setIsSubmitting(true);

    try {
      await requestPasswordReset(email.trim());
      setIsSubmitted(true);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : t('forgotPassword.failed'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="form-page">
      <div className="control-panel">
        <div className="login-logo" aria-hidden="true">
          <img src="/barscan-logo.png" alt="" />
        </div>
        <p className="inline-note">{t('forgotPassword.copy')}</p>
        <label>
          {t('forgotPassword.email')}
          <input
            autoComplete="email"
            disabled={isSubmitted || isSubmitting}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </label>
        {error && <StatusMessage type="error">{error}</StatusMessage>}
        {isSubmitted && <StatusMessage type="success">{t('forgotPassword.sent')}</StatusMessage>}
        {!isSubmitted && (
          <button className="primary-action" disabled={isSubmitting} type="button" onClick={() => void handleRequest()}>
            {isSubmitting ? t('forgotPassword.sending') : t('forgotPassword.submit')}
          </button>
        )}
        <p className="inline-note"><Link to="/login">{t('forgotPassword.backToLogin')}</Link></p>
      </div>
    </section>
  );
}
