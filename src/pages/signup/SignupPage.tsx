import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestContactSignup } from '../../api/client';
import { StatusMessage } from '../../components/feedback/StatusMessage';

export function SignupPage() {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [allowedUserCount, setAllowedUserCount] = useState(1);
  const [adminEmail, setAdminEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignupRequest() {
    setError('');

    if (!companyName || !locationName || !adminEmail) {
      setError('Company name, location name, and admin email are required.');
      return;
    }

    if (allowedUserCount < 1) {
      setError('Allowed user count must be at least 1.');
      return;
    }

    setIsSubmitting(true);

    try {
      const signup = await requestContactSignup({
        companyName,
        locationName,
        allowedUserCount,
        adminEmail,
        message,
      });

      navigate('/signup-submitted', { state: signup });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Signup failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="split-page">
      <div>
        <p className="eyebrow">Contact request</p>
        <h1>Signup</h1>
        <p className="lede">Tell us what you need. We will create the company/admin setup and contact the admin email to arrange payment manually.</p>
      </div>
      <div className="control-panel">
        <label>
          Company name
          <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} required />
        </label>
        <label>
          Location name
          <input value={locationName} onChange={(event) => setLocationName(event.target.value)} required />
        </label>
        <label>
          Monthly users
          <input min={1} type="number" value={allowedUserCount} onChange={(event) => setAllowedUserCount(Number(event.target.value))} required />
        </label>
        <label>
          Admin email
          <input value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} required type="email" autoComplete="email" />
        </label>
        <label>
          Message
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={4} placeholder="Anything we should know before contacting you?" />
        </label>
        {error && <StatusMessage type="error">{error}</StatusMessage>}
        <button className="primary-action" disabled={isSubmitting} type="button" onClick={() => void handleSignupRequest()}>
          {isSubmitting ? 'Sending request...' : 'Request company setup'}
        </button>
      </div>
    </section>
  );
}
