import { useCallback, useEffect, useMemo, useState } from 'react';
import { getProducts } from '../../api/client';
import { useAuth } from '../../auth/useAuth';
import { StatusMessage } from '../../components/feedback/StatusMessage';
import type { Product } from '../../types';

export function ScanSessionPage() {
  const { session } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [quarter, setQuarter] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const totalCount = useMemo(
    () => products.reduce((sum, product) => sum + product.amountCounted, 0),
    [products],
  );

  const loadProducts = useCallback(async () => {
    if (!session) {
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const nextProducts = await getProducts(session.token, quarter || undefined);
      setProducts(nextProducts);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not load scan data.');
    } finally {
      setIsLoading(false);
    }
  }, [quarter, session]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!autoRefresh) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      void loadProducts();
    }, 3000);

    return () => window.clearInterval(timer);
  }, [autoRefresh, loadProducts]);

  return (
    <section className="scan-layout">
      <div className="scan-main">
        <div className="page-title-row">
          <div>
            <p className="eyebrow">Scanner feed</p>
            <h1>Scan session</h1>
          </div>
          <div className="row-actions">
            <label>
              Quarter
              <input value={quarter} onChange={(event) => setQuarter(event.target.value)} placeholder="2026-Q3" />
            </label>
            <label className="toggle-label">
              <input checked={autoRefresh} type="checkbox" onChange={(event) => setAutoRefresh(event.target.checked)} />
              Auto refresh
            </label>
            <button className="secondary-action" type="button" onClick={() => void loadProducts()}>
              Refresh
            </button>
          </div>
        </div>

        {error && <StatusMessage type="error">{error}</StatusMessage>}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Barcode</th>
                <th>Segment</th>
                <th>Shelf</th>
                <th>Count</th>
                <th>Quarter</th>
                <th>Last counted</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.productId}>
                  <td>{product.barcode}</td>
                  <td>{product.storeSegment}</td>
                  <td>{product.shelfOfOrigin}</td>
                  <td>{product.amountCounted}</td>
                  <td>{product.countedQuarter}</td>
                  <td>{new Date(product.countedDate).toLocaleString()}</td>
                </tr>
              ))}
              {!isLoading && products.length === 0 && (
                <tr>
                  <td colSpan={6}>No scan data found.</td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td colSpan={6}>Loading scan data...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="session-panel">
        <h2>Session totals</h2>
        <dl className="metric-grid">
          <div>
            <dt>Barcodes</dt>
            <dd>{products.length}</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{totalCount}</dd>
          </div>
        </dl>
      </aside>
    </section>
  );
}
