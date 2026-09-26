import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { completeDevPayment, getSignupStatus } from '../../api/client';
import { StatusMessage } from '../../components/feedback/StatusMessage';
import type { SignupStatus } from '../../types';

export function PaymentPendingPage() {
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
        setError(caughtError instanceof Error ? caughtError.message : 'Could not check signup status.');
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [signupId, isCompleted]);

  async function handleDevCompletePayment() {
    const paymentSessionId = status?.paymentSessionId ?? storedSignup?.paymentSessionId;

    if (!paymentSessionId) {
      setError('Missing payment session reference.');
      return;
    }

    setError('');
    setIsCompletingPayment(true);

    try {
      const nextStatus = await completeDevPayment(paymentSessionId);
      setStatus(nextStatus);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Payment completion failed.');
    } finally {
      setIsCompletingPayment(false);
    }
  }

  return (
    <section className="status-page">
      <p className="eyebrow">Signup status</p>
      <h1>{isCompleted ? 'Subscription active' : 'Payment pending'}</h1>

      <div className="status-strip">
        <span>Payment: {status?.paymentStatus ?? 'Unknown'}</span>
        <span>Onboarding: {status?.onboardingStatus ?? 'Unknown'}</span>
      </div>

      {paymentUrl && !isCompleted && (
        <a className="primary-action" href={paymentUrl} target="_blank" rel="noreferrer">
          Open payment
        </a>
      )}

      {!isCompleted && (
        <button className="secondary-action" disabled={isCompletingPayment} type="button" onClick={handleDevCompletePayment}>
          {isCompletingPayment ? 'Completing...' : 'Complete dev payment'}
        </button>
      )}

      {pollCount > 30 && !isCompleted && (
        <StatusMessage type="info">Onboarding is still pending. You can keep this page open while the backend finishes.</StatusMessage>
      )}
      {error && <StatusMessage type="error">{error}</StatusMessage>}
      {isCompleted && <Link className="primary-action" to="/login">Login as admin</Link>}
    </section>
  );
}
