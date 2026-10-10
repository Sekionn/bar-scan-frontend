import { useState } from 'react';
import { apiPut } from '../../api/client';
import { useAuth } from '../../auth/useAuth';
import { StatusMessage } from '../../components/feedback/StatusMessage';
import { useTranslation } from '../../i18n/useTranslation';
import type { CreatedUser } from '../../types';

export function SuperAdminPasswordPage() {
  const { session } = useAuth();
  const { t } = useTranslation();
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
      setError(t('super.referenceRequired'));
      return;
    }

    if (password.length < 8) {
      setError(t('super.passwordLength'));
      return;
    }

    setError('');
    setCreatedUser(null);
    setIsSubmitting(true);

    try {
      const user = await apiPut<CreatedUser>(`/super/users/${adminUserId}/password`, { password });
      setCreatedUser(user);
      setAdminUserId('');
      setPassword('');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : t('super.error'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="form-page">
      <div className="control-panel">
        <label>
          {t('super.reference')}
          <input value={adminUserId} onChange={(event) => setAdminUserId(event.target.value)} required />
        </label>
        <label>
          {t('super.initialPassword')}
          <input value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} type="password" autoComplete="new-password" />
        </label>
        {error && <StatusMessage type="error">{error}</StatusMessage>}
        {createdUser && <StatusMessage type="success">{t('super.success', { username: createdUser.username })}</StatusMessage>}
        <button className="primary-action" disabled={isSubmitting} type="button" onClick={() => void handleSetPassword()}>
          {isSubmitting ? t('super.setting') : t('super.setPassword')}
        </button>
      </div>
    </section>
  );
}
