import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset } from '../../api/client';
import { StatusMessage } from '../../components/feedback/StatusMessage';
import { useTranslation } from '../../i18n/useTranslation';

export function SetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const token = searchParams.get('token') ?? '';

  async function handleSetPassword() {
    setError('');

    if (!token) {
      setError(t('setPassword.invalidLink'));
      return;
    }

    if (password.length < 8) {
      setError(t('setPassword.passwordLength'));
      return;
    }

    if (password !== confirmation) {
      setError(t('setPassword.passwordMismatch'));
      return;
    }

    setIsSubmitting(true);

    try {
      await confirmPasswordReset({ token, password });
      setIsComplete(true);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : t('setPassword.failed'));
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
        <p className="inline-note">{t('setPassword.copy')}</p>
        <label>
          {t('setPassword.password')}
          <input
            autoComplete="new-password"
            disabled={isComplete || isSubmitting}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>
        <label>
          {t('setPassword.confirmPassword')}
          <input
            autoComplete="new-password"
            disabled={isComplete || isSubmitting}
            onChange={(event) => setConfirmation(event.target.value)}
            type="password"
            value={confirmation}
          />
        </label>
        {error && <StatusMessage type="error">{error}</StatusMessage>}
        {isComplete && <StatusMessage type="success">{t('setPassword.complete')}</StatusMessage>}
        {!isComplete && (
          <button className="primary-action" disabled={isSubmitting} type="button" onClick={() => void handleSetPassword()}>
            {isSubmitting ? t('setPassword.saving') : t('setPassword.submit')}
          </button>
        )}
        <p className="inline-note"><Link to="/login">{t('setPassword.backToLogin')}</Link></p>
      </div>
    </section>
  );
}
