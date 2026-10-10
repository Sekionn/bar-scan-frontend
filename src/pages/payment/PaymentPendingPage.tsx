import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { completeDevPayment, getSignupStatus } from '../../api/client';
import { StatusMessage } from '../../components/feedback/StatusMessage';
import { useTranslation } from '../../i18n/useTranslation';
import type { SignupStatus } from '../../types';

export function PaymentPendingPage() {
  const { t } = useTranslation();
  const { signupId = '' } = useParams();
  const location = useLocation();
  const initialSignup = location.state as SignupStatus | null;
  const [status, setStatus] = useState<SignupStatus | null>(initialSignup);
  const [error, setError] = useState('');
  const [isCompletingPayment, setIsCompletingPayment] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  const isCompleted = status?.onboardingStatus === 'COMPLETED';
  const paymentUrl = status?.paymentUrl;

  const storedSignup = useMemo(() => {
    const rawSignup = sessionStorage.getItem('bar-scan-signup');

    if (!rawSignup) {
      return null;
    }

    try {
      return JSON.parse(rawSignup) as { signupId: string; paymentSessionId: string };
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!signupId || isCompleted) {
      return undefined;
    }

    const timer = window.setInterval(async () => {
      try {
        const nextStatus = await getSignupStatus(signupId);
        setStatus(nextStatus);
        setPollCount((value) => value + 1);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : t('payment.statusError'));
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [signupId, isCompleted, t]);

  async function handleDevCompletePayment() {
    const paymentSessionId = status?.paymentSessionId ?? storedSignup?.paymentSessionId;

    if (!paymentSessionId) {
      setError(t('payment.missingSession'));
      return;
    }

    setError('');
    setIsCompletingPayment(true);

    try {
      const nextStatus = await completeDevPayment(paymentSessionId);
      setStatus(nextStatus);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : t('payment.completeError'));
    } finally {
      setIsCompletingPayment(false);
    }
  }

  return (
    <section className="status-page">
      <div className="status-strip">
        <span>{t('payment.payment', { status: status?.paymentStatus ?? t('common.unknown') })}</span>
        <span>{t('payment.onboarding', { status: status?.onboardingStatus ?? t('common.unknown') })}</span>
      </div>

      {paymentUrl && !isCompleted && (
        <a className="primary-action" href={paymentUrl} target="_blank" rel="noreferrer">
          {t('payment.open')}
        </a>
      )}

      {!isCompleted && (
        <button className="secondary-action" disabled={isCompletingPayment} type="button" onClick={handleDevCompletePayment}>
          {isCompletingPayment ? t('payment.completing') : t('payment.completeDev')}
        </button>
      )}

      {pollCount > 30 && !isCompleted && (
        <StatusMessage type="info">{t('payment.stillPending')}</StatusMessage>
      )}
      {error && <StatusMessage type="error">{error}</StatusMessage>}
      {isCompleted && <Link className="primary-action" to="/login">{t('payment.loginAsAdmin')}</Link>}
    </section>
  );
}
