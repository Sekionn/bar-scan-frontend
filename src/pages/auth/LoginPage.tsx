import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../../api/client';
import { createSessionFromToken } from '../../auth/jwt';
import { useAuth } from '../../auth/useAuth';
import { StatusMessage } from '../../components/feedback/StatusMessage';

type LocationState = {
  from?: string;
};

export function LoginPage() {
  const { setSession } = useAuth();
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
      setError('Username and password are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login({ username, password });
      const session = createSessionFromToken(response.token);
      setSession(session);
      navigate(state?.from ?? '/products', { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-grid">
      <div className="auth-copy">
        <p className="eyebrow">Welcome back</p>
        <h1>Login</h1>
        <p>Use an admin or scanner account to continue.</p>
      </div>
      <div className="control-panel">
        <label>
          Username
          <input value={username} onChange={(event) => setUsername(event.target.value)} required autoComplete="username" />
        </label>
        <label>
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} required type="password" autoComplete="current-password" />
        </label>
        {error && <StatusMessage type="error">{error}</StatusMessage>}
        <button className="primary-action" disabled={isSubmitting} type="button" onClick={() => void handleLogin()}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
        <p className="inline-note">New company? <Link to="/signup">Start signup</Link></p>
      </div>
    </section>
  );
}
