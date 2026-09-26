import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { exportProducts, getProducts } from '../../api/client';
import { useAuth } from '../../auth/useAuth';
import { StatusMessage } from '../../components/feedback/StatusMessage';
import type { Product } from '../../types';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function ProductListPage() {
  const { session } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [quarter, setQuarter] = useState('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'txt'>('csv');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

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
      setError(caughtError instanceof Error ? caughtError.message : 'Could not load products.');
    } finally {
      setIsLoading(false);
    }
  }, [quarter, session]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  async function handleExport() {
    if (!session) {
      return;
    }

    setError('');
    setIsExporting(true);

    try {
      const blob = await exportProducts(session.token, quarter || undefined, exportFormat);
      const quarterName = quarter || 'all';
      downloadBlob(blob, `bar-scan-products-${quarterName}.${exportFormat}`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not export products.');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className="list-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">Company inventory</p>
          <h1>Products</h1>
        </div>
        <div className="row-actions">
          <Link className="primary-action" to="/scan-session">Scan session</Link>
        </div>
      </div>

      <section className="toolbar-panel">
        <label>
          Quarter
          <input value={quarter} onChange={(event) => setQuarter(event.target.value)} placeholder="2026-Q3" />
        </label>
        <label>
          Export format
          <select value={exportFormat} onChange={(event) => setExportFormat(event.target.value as 'csv' | 'txt')}>
            <option value="csv">CSV</option>
            <option value="txt">TXT</option>
          </select>
        </label>
        <button className="secondary-action" type="button" onClick={() => void loadProducts()}>
          Refresh
        </button>
        <button className="primary-action" disabled={isExporting} type="button" onClick={() => void handleExport()}>
          {isExporting ? 'Exporting...' : 'Export'}
        </button>
      </section>

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
                <td colSpan={6}>No products found.</td>
              </tr>
            )}
            {isLoading && (
              <tr>
                <td colSpan={6}>Loading products...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
