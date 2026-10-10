import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { apiGet, exportProductArchiveProducts, getProductArchiveProducts } from '../../api/client';
import { useAuth } from '../../auth/useAuth';
import { StatusMessage } from '../../components/feedback/StatusMessage';
import { useTranslation } from '../../i18n/useTranslation';
import type { ProductArchive, ProductArchiveItem, ProductArchiveQuarter } from '../../types';

const pageSizes = [25, 50, 100] as const;

function formatDateKey(dateKey: string, locale: string) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(locale);
}

function formatExportDate(dateKey: string) {
  const [year = '', month = '', day = ''] = dateKey.split('-');
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year.slice(-2)}`;
}

function productViewTitle(searchParams: URLSearchParams, products: ProductArchiveItem[], locale: string, fallbackStoreName: string, shopName?: string) {
  const resolvedShopName = products[0]?.shopName ?? shopName ?? fallbackStoreName;
  const mode = searchParams.get('mode');

  if (mode === 'date') {
    const date = searchParams.get('date') ?? '';
    return `${resolvedShopName} - ${formatDateKey(date, locale)}`;
  }

  return `${resolvedShopName} - ${searchParams.get('year')} ${searchParams.get('quarter')}`;
}

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
  const { language, t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [archive, setArchive] = useState<ProductArchive>({ shops: [] });
  const [products, setProducts] = useState<ProductArchiveItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [exportFormat, setExportFormat] = useState<'csv' | 'txt'>('csv');
  const [pageSize, setPageSize] = useState<(typeof pageSizes)[number]>(50);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const mode = searchParams.get('mode');
  const shopId = searchParams.get('shopId') ?? '';
  const year = searchParams.get('year');
  const quarter = searchParams.get('quarter') as ProductArchiveQuarter['quarter'] | null;
  const date = searchParams.get('date');
  const isTableView = Boolean(mode);

  const selectedShopName = useMemo(
    () => archive.shops.find((shop) => shop.shopId === shopId)?.shopName,
    [archive.shops, shopId],
  );
  const locale = language === 'da' ? 'da-DK' : 'en-GB';
  const tableTitle = productViewTitle(searchParams, products, locale, t('users.store'), selectedShopName);

  const loadArchive = useCallback(async () => {
    if (!session) {
      return;
    }

    setError('');
    try {
      setArchive(await apiGet<ProductArchive>('/products/archive'));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : t('archive.loadError'));
    }
  }, [session, t]);

  const loadProducts = useCallback(async () => {
    if (!session || !isTableView || !shopId) {
      setProducts([]);
      setTotalElements(0);
      setTotalPages(1);
      return;
    }

    setError('');
    setIsLoadingProducts(true);

    try {
      const response = await getProductArchiveProducts({
        shopId,
        year: year ? Number(year) : undefined,
        quarter: quarter ?? undefined,
        date: date ?? undefined,
        page,
        size: pageSize,
      });
      setProducts(response.products);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : t('products.loadError'));
    } finally {
      setIsLoadingProducts(false);
    }
  }, [date, isTableView, page, pageSize, quarter, session, shopId, t, year]);

  useEffect(() => {
    void loadArchive();
  }, [loadArchive]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, searchParams]);

  async function handleExport() {
    if (!session || !shopId) {
      return;
    }

    const title = tableTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    setError('');
    setIsExporting(true);
    try {
      const blob = await exportProductArchiveProducts({
        shopId,
        year: year ? Number(year) : undefined,
        quarter: quarter ?? undefined,
        date: date ?? undefined,
        format: exportFormat,
      });
      downloadBlob(blob, `bar-scan-${title}.${exportFormat}`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : t('products.exportError'));
    } finally {
      setIsExporting(false);
    }
  }

  if (!isTableView) {
    return <Navigate to="/product-archive" replace />;
  }

  return (
    <section className="list-page">
      <div className="page-actions-row">
        <div className="row-actions">
          {isTableView && <Link className="secondary-action" to="/product-archive">{t('products.backToArchive')}</Link>}
          <button className="secondary-action" type="button" onClick={() => void (isTableView ? loadProducts() : loadArchive())}>
            {t('common.refresh')}
          </button>
        </div>
      </div>

      {error && <StatusMessage type="error">{error}</StatusMessage>}

      <section className="toolbar-panel archive-toolbar">
        <div className="toolbar-field">
          <span>{t('products.rows')}</span>
          <select aria-label={t('products.rows')} value={pageSize} onChange={(event) => setPageSize(Number(event.target.value) as typeof pageSize)}>
            {pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </div>
        <div className="toolbar-field">
          <span>{t('products.exportFormat')}</span>
          <select aria-label={t('products.exportFormat')} value={exportFormat} onChange={(event) => setExportFormat(event.target.value as 'csv' | 'txt')}>
            <option value="csv">CSV</option>
            <option value="txt">TXT</option>
          </select>
        </div>
        <button className="primary-action" disabled={totalElements === 0 || isExporting} type="button" onClick={() => void handleExport()}>
          {isExporting ? t('products.exporting') : t('products.exportAll')}
        </button>
      </section>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t('products.storeSegment')}</th>
              <th>{t('products.barcode')}</th>
              <th>{t('products.amountCounted')}</th>
              <th>{t('products.date')}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={`${product.sessionId}-${product.barcode}-${product.countedDate}`}>
                <td>{product.storeSegment}</td>
                <td>{product.barcode}</td>
                <td>{product.amountCounted}</td>
                <td>{formatExportDate(product.date)}</td>
              </tr>
            ))}
            {!isLoadingProducts && products.length === 0 && (
              <tr>
                <td colSpan={4}>{t('products.empty')}</td>
              </tr>
            )}
            {isLoadingProducts && (
              <tr>
                <td colSpan={4}>{t('products.loading')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-row">
        <span>
          {t('products.showing', {
            from: totalElements === 0 ? 0 : ((page - 1) * pageSize) + 1,
            to: Math.min(page * pageSize, totalElements),
            total: totalElements,
          })}
        </span>
        <div className="row-actions">
          <button className="secondary-action" disabled={page <= 1} type="button" onClick={() => setPage((value) => Math.max(1, value - 1))}>
            {t('products.previous')}
          </button>
          <span>{t('products.page', { page, totalPages })}</span>
          <button className="secondary-action" disabled={page >= totalPages} type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
            {t('products.next')}
          </button>
        </div>
      </div>
    </section>
  );
}
