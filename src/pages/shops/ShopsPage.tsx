import { useCallback, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPost } from '../../api/client';
import { useAuth } from '../../auth/useAuth';
import { StatusMessage } from '../../components/feedback/StatusMessage';
import { useTranslation } from '../../i18n/useTranslation';
import type { Shop } from '../../types';

export function ShopsPage() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const [shops, setShops] = useState<Shop[]>([]);
  const [name, setName] = useState('');
  const [pageError, setPageError] = useState('');
  const [createError, setCreateError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [removeShop, setRemoveShop] = useState<Shop | null>(null);
  const [removeError, setRemoveError] = useState('');
  const [isRemoving, setIsRemoving] = useState(false);

  const loadShops = useCallback(async () => {
    if (!session) {
      return;
    }

    setPageError('');
    setIsLoading(true);

    try {
      const nextShops = await apiGet<Shop[]>('/shops');
      setShops(nextShops);
    } catch (caughtError) {
      setPageError(caughtError instanceof Error ? caughtError.message : t('shops.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [session, t]);

  useEffect(() => {
    void loadShops();
  }, [loadShops]);

  async function handleCreateShop() {
    if (!session) {
      return;
    }

    setCreateError('');

    if (!name) {
      setCreateError(t('shops.required'));
      return;
    }

    setIsSubmitting(true);

    try {
      const shop = await apiPost<Shop>('/shops', { name });
      setShops((currentShops) => [shop, ...currentShops]);
      setName('');
      setIsCreateModalOpen(false);
    } catch (caughtError) {
      setCreateError(caughtError instanceof Error ? caughtError.message : t('shops.createError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  function openCreateModal() {
    setCreateError('');
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    if (!isSubmitting) {
      setCreateError('');
      setIsCreateModalOpen(false);
    }
  }

  async function handleRemoveShop() {
    if (!removeShop) {
      return;
    }

    setRemoveError('');
    setIsRemoving(true);
    try {
      await apiDelete(`/shops/${removeShop.id}`);
      setRemoveShop(null);
      await loadShops();
    } catch (caughtError) {
      setRemoveError(caughtError instanceof Error ? caughtError.message : t('shops.removeError'));
    } finally {
      setIsRemoving(false);
    }
  }

  function openRemoveModal(shop: Shop) {
    setRemoveError('');
    setRemoveShop(shop);
  }

  function closeRemoveModal() {
    if (!isRemoving) {
      setRemoveError('');
      setRemoveShop(null);
    }
  }

  return (
    <section className="stack-page">
      <section className="table-section">
        <div className="page-actions-row">
          <button className="primary-action" type="button" onClick={openCreateModal}>
            {t('shops.create')}
          </button>
          <button className="secondary-action" type="button" onClick={() => void loadShops()}>
            {t('common.refresh')}
          </button>
        </div>
        {pageError && <StatusMessage type="error">{pageError}</StatusMessage>}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('shops.nameColumn')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => (
                <tr key={shop.id}>
                  <td>{shop.name}</td>
                  <td>
                    <button className="secondary-action danger-action small-action" type="button" onClick={() => openRemoveModal(shop)}>
                      {t('shops.remove')}
                    </button>
                  </td>
                </tr>
              ))}
              {isLoading && (
                <tr>
                  <td colSpan={2}>{t('shops.loading')}</td>
                </tr>
              )}
              {!isLoading && shops.length === 0 && (
                <tr>
                  <td colSpan={2}>{t('shops.empty')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isCreateModalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeCreateModal}>
          <section className="modal-panel" role="dialog" aria-modal="true" aria-label={t('shops.create')} onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" aria-label={t('common.cancel')} disabled={isSubmitting} type="button" onClick={closeCreateModal}>
              x
            </button>
            <div className="control-panel modal-form">
              <label>
                {t('shops.name')}
                <input value={name} onChange={(event) => setName(event.target.value)} required />
              </label>
              {createError && <StatusMessage type="error">{createError}</StatusMessage>}
              <div className="modal-actions">
                <button className="secondary-action" disabled={isSubmitting} type="button" onClick={closeCreateModal}>
                  {t('common.cancel')}
                </button>
                <button className="primary-action" disabled={isSubmitting} type="button" onClick={() => void handleCreateShop()}>
                  {isSubmitting ? t('shops.creating') : t('shops.create')}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {removeShop && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeRemoveModal}>
          <section className="modal-panel" role="dialog" aria-modal="true" aria-label={t('shops.remove')} onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" aria-label={t('common.cancel')} disabled={isRemoving} type="button" onClick={closeRemoveModal}>
              x
            </button>
            <div className="control-panel modal-form">
              <p className="inline-note">{t('shops.removeConfirm', { shopName: removeShop.name })}</p>
              {removeError && <StatusMessage type="error">{removeError}</StatusMessage>}
              <div className="modal-actions">
                <button className="secondary-action" disabled={isRemoving} type="button" onClick={closeRemoveModal}>
                  {t('common.cancel')}
                </button>
                <button className="primary-action danger-primary-action" disabled={isRemoving} type="button" onClick={() => void handleRemoveShop()}>
                  {isRemoving ? t('shops.removing') : t('shops.remove')}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
