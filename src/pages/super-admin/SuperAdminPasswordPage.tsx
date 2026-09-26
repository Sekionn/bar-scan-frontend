import { useState } from 'react';
import { setInitialAdminPassword } from '../../api/client';
import { useAuth } from '../../auth/useAuth';
import { StatusMessage } from '../../components/feedback/StatusMessage';
import type { CreatedUser } from '../../types';

export function SuperAdminPasswordPage() {
  const { session } = useAuth();
  const [adminUserId, setAdminUserId] = useState('');
  const [password, setPassword] = useState('');
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSetPassword() {
    if (!session) {
      return;
    }

    if (!adminUserId) {
      setError('Admin activation reference is required.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setError('');
    setCreatedUser(null);
    setIsSubmitting(true);

    try {
      const user = await setInitialAdminPassword(session.token, adminUserId, password);
      setCreatedUser(user);
      setAdminUserId('');
      setPassword('');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not set password.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="management-grid">
      <div>
        <p className="eyebrow">Super admin</p>
        <h1>Activate admin login</h1>
        <p className="lede">Set the initial password after contacting the customer and arranging manual payment.</p>
      </div>
      <div className="control-panel">
        <label>
          Admin activation reference
          <input value={adminUserId} onChange={(event) => setAdminUserId(event.target.value)} required />
        </label>
        <label>
          Initial password
          <input value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} type="password" autoComplete="new-password" />
        </label>
        {error && <StatusMessage type="error">{error}</StatusMessage>}
        {createdUser && <StatusMessage type="success">{`Password set for ${createdUser.username}.`}</StatusMessage>}
        <button className="primary-action" disabled={isSubmitting} type="button" onClick={() => void handleSetPassword()}>
          {isSubmitting ? 'Setting password...' : 'Set initial password'}
        </button>
      </div>
    </section>
  );
}
