import { useCallback, useEffect, useState } from 'react';
import { createShop, getShops } from '../../api/client';
import { useAuth } from '../../auth/useAuth';
import { StatusMessage } from '../../components/feedback/StatusMessage';
import type { Shop } from '../../types';

export function ShopsPage() {
  const { session } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadShops = useCallback(async () => {
    if (!session) {
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const nextShops = await getShops(session.token);
      setShops(nextShops);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not load shops.');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void loadShops();
  }, [loadShops]);

  async function handleCreateShop() {
    if (!session) {
      return;
    }

    setError('');

    if (!name) {
      setError('Shop name is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const shop = await createShop(session.token, { name });
      setShops((currentShops) => [shop, ...currentShops]);
      setName('');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not create shop.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="management-grid">
      <div>
        <p className="eyebrow">Company structure</p>
        <h1>Shops</h1>
        <p className="lede">Create and review shops owned by the current company.</p>
      </div>
      <div className="control-panel">
        <label>
          Shop name
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        {error && <StatusMessage type="error">{error}</StatusMessage>}
        <button className="primary-action" disabled={isSubmitting} type="button" onClick={() => void handleCreateShop()}>
          {isSubmitting ? 'Creating...' : 'Create shop'}
        </button>
      </div>

      <section className="table-section">
        <h2>Company shops</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => (
                <tr key={shop.id}>
                  <td>{shop.name}</td>
                </tr>
              ))}
              {!isLoading && shops.length === 0 && (
                <tr>
                  <td>No shops found.</td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td>Loading shops...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
