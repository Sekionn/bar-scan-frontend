import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../../api/client';
import { createSessionFromToken } from '../../auth/jwt';
import { useAuth } from '../../auth/useAuth';
import { StatusMessage } from '../../components/feedback/StatusMessage';
import { useTranslation } from '../../i18n/useTranslation';

type LocationState = {
  from?: string;
};

export function LoginPage() {
  const { setSession } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    setError('');

    if (!username || !password) {
      setError(t('login.required'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login({ username, password });
      const session = createSessionFromToken(response.token);
      setSession(session);
      navigate(state?.from ?? '/product-archive', { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : t('login.failed'));
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
        <label>
          {t('login.username')}
          <input value={username} onChange={(event) => setUsername(event.target.value)} required autoComplete="username" />
        </label>
        <label>
          {t('login.password')}
          <input value={password} onChange={(event) => setPassword(event.target.value)} required type="password" autoComplete="current-password" />
        </label>
        {error && <StatusMessage type="error">{error}</StatusMessage>}
        <button className="primary-action" disabled={isSubmitting} type="button" onClick={() => void handleLogin()}>
          {isSubmitting ? t('login.submitting') : t('login.submit')}
        </button>
        <p className="inline-note">{t('login.newCompany')} <Link to="/signup">{t('login.startSignup')}</Link></p>
      </div>
    </section>
  );
}
