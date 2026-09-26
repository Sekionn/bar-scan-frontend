import { Link } from 'react-router-dom';

export function NotAuthorizedPage() {
  return (
    <section className="status-page">
      <p className="eyebrow">Access</p>
      <h1>Not authorized</h1>
      <p className="lede">This account does not have access to that web section.</p>
      <Link className="primary-action" to="/">Back to start</Link>
    </section>
  );
}
