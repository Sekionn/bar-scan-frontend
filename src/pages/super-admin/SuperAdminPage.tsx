import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../api/client';
import { StatusMessage } from '../../components/feedback/StatusMessage';
import { useTranslation } from '../../i18n/useTranslation';
import type { PendingSignupRequestPage } from '../../types';

const pageSize = 25;

export function SuperAdminPage() {
  const { language, t } = useTranslation();
  const [requests, setRequests] = useState<PendingSignupRequestPage | null>(null);
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const loadRequests = useCallback(async (requestedPage: number) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await apiGet<PendingSignupRequestPage>(
        `/super/signup-requests?page=${requestedPage}&size=${pageSize}`,
      );
      setRequests(response);
      setPage(response.page);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : t('admin.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadRequests(page);
  }, [loadRequests, page]);

  async function approveRequest(signupId: string) {
    setError('');
    setApprovingId(signupId);

    try {
      await apiPost(`/super/signup-requests/${signupId}/approve`);
      await loadRequests(page);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : t('admin.approveError'));
    } finally {
      setApprovingId(null);
    }
  }

  function formatRequestedAt(value: string) {
    return new Intl.DateTimeFormat(language === 'da' ? 'da-DK' : 'en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  return (
    <section className="stack-page">
      <section className="table-section">
        <div className="page-actions-row">
          <button className="secondary-action" disabled={isLoading} type="button" onClick={() => void loadRequests(page)}>
            {t('common.refresh')}
          </button>
        </div>
        {error && <StatusMessage type="error">{error}</StatusMessage>}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('admin.company')}</th>
                <th>{t('admin.adminEmail')}</th>
                <th>{t('admin.allowedUsers')}</th>
                <th>{t('admin.message')}</th>
                <th>{t('admin.requestedAt')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {requests?.requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.companyName}</td>
                  <td>{request.adminEmail}</td>
                  <td>{request.allowedUserCount}</td>
                  <td>{request.message}</td>
                  <td>{formatRequestedAt(request.requestedAt)}</td>
                  <td>
                    <button
                      className="primary-action small-action"
                      disabled={approvingId !== null}
                      type="button"
                      onClick={() => void approveRequest(request.id)}
                    >
                      {approvingId === request.id ? t('admin.approving') : t('admin.approve')}
                    </button>
                  </td>
                </tr>
              ))}
              {isLoading && (
                <tr>
                  <td colSpan={6}>{t('admin.loading')}</td>
                </tr>
              )}
              {!isLoading && requests?.totalElements === 0 && (
                <tr>
                  <td colSpan={6}>{t('admin.empty')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {requests && requests.totalPages > 1 && (
          <div className="page-actions-row">
            <button
              className="secondary-action"
              disabled={isLoading || requests.page === 0}
              type="button"
              onClick={() => setPage(requests.page - 1)}
            >
              {t('admin.previous')}
            </button>
            <span>{t('admin.page', { page: requests.page + 1, totalPages: requests.totalPages })}</span>
            <button
              className="secondary-action"
              disabled={isLoading || requests.page + 1 >= requests.totalPages}
              type="button"
              onClick={() => setPage(requests.page + 1)}
            >
              {t('admin.next')}
            </button>
          </div>
        )}
      </section>
    </section>
  );
}
