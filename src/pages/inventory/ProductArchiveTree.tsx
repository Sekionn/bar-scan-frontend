import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../../api/client';
import { useAuth } from '../../auth/useAuth';
import { StatusMessage } from '../../components/feedback/StatusMessage';
import { useTranslation } from '../../i18n/useTranslation';
import type { ProductArchive, ProductArchiveQuarter, QueueStatus } from '../../types';

const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

function formatDateKey(dateKey: string, locale: string) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(locale);
}

export function ProductArchiveTree() {
  const { session } = useAuth();
  const { language, t } = useTranslation();
  const [archive, setArchive] = useState<ProductArchive>({ shops: [] });
  const [queueStatuses, setQueueStatuses] = useState<QueueStatus[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadArchive = useCallback(async () => {
    if (!session) {
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const [nextArchive, nextQueueStatuses] = await Promise.all([
        apiGet<ProductArchive>('/products/archive'),
        apiGet<QueueStatus[]>('/queue-status/shops'),
      ]);
      setArchive(nextArchive);
      setQueueStatuses(nextQueueStatuses);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : t('archive.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [session, t]);

  function scannedProductLabel(count: number) {
    return count === 1 ? t('common.scannedProduct') : t('common.scannedProducts');
  }

  function queueStatus(shopId: string): QueueStatus {
    return queueStatuses.find((status) => status.shopId === shopId) ?? {
      companyId: session?.companyId ?? '',
      shopId,
      pendingMessages: 0,
      processedMessages: 0,
      pendingPercentage: 0,
      upToDate: true,
    };
  }

  useEffect(() => {
    void loadArchive();
  }, [loadArchive]);

  return (
    <section className="list-page">
      <div className="page-actions-row">
        <button className="secondary-action" type="button" onClick={() => void loadArchive()}>
          {t('archive.refresh')}
        </button>
      </div>

      {error && <StatusMessage type="error">{error}</StatusMessage>}

      <div className="archive-tree">
        {archive.shops.map((shop) => (
          <section className="archive-shop" key={shop.shopId}>
            <div className="archive-header">
              <h2>{shop.shopName}</h2>
              <div className="archive-header-metrics">
                <span>{shop.productCount} {scannedProductLabel(shop.productCount)}</span>
                <ShopQueueProgress status={queueStatus(shop.shopId)} />
              </div>
            </div>

            <div className="archive-folder-list">
              {shop.years.map((archiveYear) => (
                <details className="archive-folder" key={archiveYear.year}>
                  <summary>
                    <span>{archiveYear.year}</span>
                    <small>{archiveYear.productCount} {scannedProductLabel(archiveYear.productCount)}</small>
                  </summary>
                  <div className="archive-folder-children">
                    {quarterNames.map((quarterName) => archiveYear.quarters.find((item) => item.quarter === quarterName))
                      .filter((item): item is ProductArchiveQuarter => Boolean(item))
                      .map((archiveQuarter) => (
                        <details className="archive-folder nested" key={archiveQuarter.quarter}>
                          <summary>
                            <span>{archiveQuarter.quarter}</span>
                            <small>{archiveQuarter.productCount} {scannedProductLabel(archiveQuarter.productCount)}</small>
                          </summary>
                          <div className="archive-folder-children">
                            <Link className="folder-page-link" to={`/products?mode=quarter&shopId=${shop.shopId}&year=${archiveYear.year}&quarter=${archiveQuarter.quarter}`}>
                              {t('archive.openQuarter', { year: archiveYear.year, quarter: archiveQuarter.quarter })}
                            </Link>
                            {archiveQuarter.dates.map((archiveDate) => (
                              <div className="archive-date-row" key={archiveDate.date}>
                                <span>{formatDateKey(archiveDate.date, language === 'da' ? 'da-DK' : 'en-GB')}</span>
                                <small>{archiveDate.productCount} {scannedProductLabel(archiveDate.productCount)}</small>
                                <Link to={`/products?mode=date&shopId=${shop.shopId}&date=${archiveDate.date}`}>{t('common.open')}</Link>
                              </div>
                            ))}
                          </div>
                        </details>
                      ))}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}

        {!isLoading && archive.shops.length === 0 && <p className="inline-note">{t('archive.empty')}</p>}
        {isLoading && <p className="inline-note">{t('archive.loading')}</p>}
      </div>
    </section>
  );
}

function ShopQueueProgress({ status }: { status: QueueStatus }) {
  const { t } = useTranslation();

  if (status.upToDate) {
    return (
      <span className="queue-progress-complete">
        <span className="queue-progress-check" aria-hidden="true">✓</span>
        {t('archive.upToDate')}
      </span>
    );
  }

  return (
    <span className="queue-progress" aria-label={t('archive.pendingProgressLabel', { percent: status.pendingPercentage })}>
      <span className="queue-progress-track">
        <span className="queue-progress-bar" style={{ width: `${status.pendingPercentage}%` }} />
      </span>
      <span>{t('archive.pendingProgress', { percent: status.pendingPercentage })}</span>
    </span>
  );
}
