import { Link, useLocation } from 'react-router-dom';
import type { ContactSignupResponse } from '../../types';

export function SignupSubmittedPage() {
  const location = useLocation();
  const response = location.state as ContactSignupResponse | null;

  return (
    <section className="status-page">
      <p className="eyebrow">Contact requested</p>
      <h1>Signup received</h1>
      <p className="lede">
        Your company and admin login request has been sent. We will contact the admin email to handle payment and activate the login manually.
      </p>
      {response?.username && (
        <div className="status-strip">
          <span>Admin login: {response.username}</span>
          <span>Status: {response.contactStatus}</span>
        </div>
      )}
      <Link className="primary-action" to="/login">Go to login</Link>
    </section>
  );
}
