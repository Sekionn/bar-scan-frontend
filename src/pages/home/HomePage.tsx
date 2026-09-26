import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';

export function HomePage() {
  const { session } = useAuth();

  if (session) {
    return <Navigate to="/products" replace />;
  }

  return (
    <section className="hero-panel">
      <div>
        <p className="eyebrow">Inventory counting</p>
        <h1>Bar Scan</h1>
        <p className="lede">Sign up a company, manage shops and users, and review scanned barcode counts by quarter.</p>
      </div>
      <div className="hero-actions">
        <Link className="primary-action" to="/signup">Create company</Link>
        <Link className="secondary-action" to="/login">Login</Link>
      </div>
    </section>
  );
}
