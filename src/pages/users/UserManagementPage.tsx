import { useCallback, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPost, apiPut } from '../../api/client';
import { useAuth } from '../../auth/useAuth';
import { StatusMessage } from '../../components/feedback/StatusMessage';
import { useTranslation } from '../../i18n/useTranslation';
import type { CreatedUser, Shop } from '../../types';

export function UserManagementPage() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [shopId, setShopId] = useState('');
  const [shops, setShops] = useState<Shop[]>([]);
  const [users, setUsers] = useState<CreatedUser[]>([]);
  const [pageError, setPageError] = useState('');
  const [createError, setCreateError] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState<CreatedUser | null>(null);
  const [removeUser, setRemoveUser] = useState<CreatedUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  const canManageUsers = session?.capabilities.canManageUsers ?? false;
  const canViewShops = session?.capabilities.canViewShops ?? false;
  const canAssignShopAndRole = session?.capabilities.canAssignShopAndRole ?? false;
  const assignableRoles = session?.assignableRoles ?? [];
  const selectedRole = assignableRoles.find((option) => option.value === role);
  const shouldAssignShop = canAssignShopAndRole && selectedRole?.requiresShop;

  function userTypeLabel(value: string, fallback: string) {
    if (value === 'mobile_user') {
      return t('users.userType.mobileUser');
    }
    if (value === 'data_analyst') {
      return t('users.userType.dataAnalyst');
    }
    return fallback;
  }

  function getShopName(targetShopId?: string) {
    if (!targetShopId) {
      return t('users.companyUsers');
    }

    if (targetShopId === session?.shopId) {
      return shops.find((shop) => shop.id === targetShopId)?.name ?? t('users.yourStore');
    }

    return shops.find((shop) => shop.id === targetShopId)?.name ?? t('users.store');
  }

  const loadUsers = useCallback(async () => {
    if (!session) {
      return;
    }

    setIsLoadingUsers(true);

    try {
      const nextUsers = await apiGet<CreatedUser[]>('/auth/users');
      setUsers(nextUsers);
    } catch (caughtError) {
      setPageError(caughtError instanceof Error ? caughtError.message : t('users.loadError'));
    } finally {
      setIsLoadingUsers(false);
    }
  }, [session, t]);

  const loadPageData = useCallback(async () => {
    if (!session) {
      return;
    }

    setPageError('');

    try {
      if (canViewShops) {
        const nextShops = await apiGet<Shop[]>('/shops');
        setShops(nextShops);
        setShopId((currentShopId) => currentShopId || nextShops[0]?.id || '');
      }
      await loadUsers();
    } catch (caughtError) {
      setPageError(caughtError instanceof Error ? caughtError.message : t('users.loadDataError'));
    }
  }, [canViewShops, loadUsers, session, t]);

  function userCountLabel(count: number) {
    return count === 1 ? t('users.userSingular') : t('users.userPlural');
  }

  useEffect(() => {
    void loadPageData();
  }, [loadPageData]);

  useEffect(() => {
    if (canAssignShopAndRole && assignableRoles.length > 0 && !selectedRole) {
      setRole(assignableRoles[0].value);
    }
  }, [assignableRoles, canAssignShopAndRole, selectedRole]);

  const usersByShop = users.reduce<Record<string, CreatedUser[]>>((groups, user) => {
    const key = user.shopId ?? 'company';
    return {
      ...groups,
      [key]: [...(groups[key] ?? []), user],
    };
  }, {});
  const ownShopId = session?.shopId ?? users.find((user) => user.shopId)?.shopId;

  const shopFolders = canViewShops
    ? shops.map((shop) => ({
        id: shop.id,
        name: shop.name,
        users: usersByShop[shop.id] ?? [],
      }))
    : [{
        id: ownShopId ?? 'own-shop',
        name: getShopName(ownShopId),
        users: users.filter((user) => user.shopId === ownShopId),
      }];

  const companyUsers = usersByShop.company ?? [];

  async function handleCreateUser() {
    if (!session || !canManageUsers) {
      return;
    }

    setCreateError('');

    if (!password) {
      setCreateError(t('users.required'));
      return;
    }

    if (password.length < 8) {
      setCreateError(t('users.passwordLength'));
      return;
    }

    if (shouldAssignShop && !shopId) {
      setCreateError(t('users.shopRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = canAssignShopAndRole
        ? { password, role, shopId: shouldAssignShop ? shopId : undefined }
        : { password };
      await apiPost<CreatedUser>('/auth/register', payload);
      await loadUsers();
      setPassword('');
      setIsCreateModalOpen(false);
    } catch (caughtError) {
      setCreateError(caughtError instanceof Error ? caughtError.message : t('users.createError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword() {
    if (!passwordUser || !canManageUsers) {
      return;
    }

    setActionError('');
    if (!newPassword) {
      setActionError(t('users.newPasswordRequired'));
      return;
    }
    if (newPassword.length < 8) {
      setActionError(t('users.passwordLength'));
      return;
    }

    setIsActionSubmitting(true);
    try {
      await apiPut<CreatedUser>(`/auth/users/${passwordUser.id}/password`, { password: newPassword });
      setNewPassword('');
      setPasswordUser(null);
      await loadUsers();
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : t('users.passwordResetError'));
    } finally {
      setIsActionSubmitting(false);
    }
  }

  async function handleRemoveUser() {
    if (!removeUser || !canManageUsers) {
      return;
    }

    setActionError('');
    setIsActionSubmitting(true);
    try {
      await apiDelete(`/auth/users/${removeUser.id}`);
      setRemoveUser(null);
      await loadUsers();
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : t('users.removeError'));
    } finally {
      setIsActionSubmitting(false);
    }
  }

  function openCreateModal() {
    if (!canManageUsers) {
      return;
    }
    setCreateError('');
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    if (!isSubmitting) {
      setCreateError('');
      setIsCreateModalOpen(false);
    }
  }

  function openPasswordModal(user: CreatedUser) {
    if (!canManageUsers) {
      return;
    }
    setActionError('');
    setNewPassword('');
    setPasswordUser(user);
  }

  function openRemoveModal(user: CreatedUser) {
    if (!canManageUsers) {
      return;
    }
    setActionError('');
    setRemoveUser(user);
  }

  function closeActionModal() {
    if (!isActionSubmitting) {
      setActionError('');
      setNewPassword('');
      setPasswordUser(null);
      setRemoveUser(null);
    }
  }

  function renderUserRow(user: CreatedUser) {
    const canManageTarget = canManageUsers && user.id !== session?.userId;

    return (
      <div className="user-row" key={user.id}>
        <div className="user-row-main">
          <strong>{user.username}</strong>
          <span>{user.roleLabel}</span>
        </div>
        {canManageTarget && (
          <div className="row-actions compact-actions">
            <button className="secondary-action small-action" type="button" onClick={() => openPasswordModal(user)}>
              {t('users.resetPassword')}
            </button>
            <button className="secondary-action danger-action small-action" type="button" onClick={() => openRemoveModal(user)}>
              {t('users.remove')}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="stack-page">
      <section className="table-section">
        <div className="page-actions-row">
          {canManageUsers && (
            <button className="primary-action" type="button" onClick={openCreateModal}>
              {t('users.create')}
            </button>
          )}
          <button className="secondary-action" type="button" onClick={() => void loadPageData()}>
            {t('common.refresh')}
          </button>
        </div>
        {pageError && <StatusMessage type="error">{pageError}</StatusMessage>}
        <div className="user-folder-list">
          {shopFolders.map((shop) => (
            <section className="user-folder" key={shop.id}>
              <div className="user-folder-header">
                <span className="folder-icon" aria-hidden="true">&gt;</span>
                <h3>{shop.name}</h3>
                <span>{shop.users.length} {userCountLabel(shop.users.length)}</span>
              </div>
              <div className="user-list">
                {shop.users.map(renderUserRow)}
                {!isLoadingUsers && shop.users.length === 0 && <p className="inline-note">{t('users.noAssigned')}</p>}
              </div>
            </section>
          ))}

          {companyUsers.length > 0 && (
            <section className="user-folder">
              <div className="user-folder-header">
                <span className="folder-icon" aria-hidden="true">&gt;</span>
                <h3>{t('users.companyUsersFolder')}</h3>
                <span>{companyUsers.length} {userCountLabel(companyUsers.length)}</span>
              </div>
              <div className="user-list">
                {companyUsers.map(renderUserRow)}
              </div>
            </section>
          )}

          {isLoadingUsers && <p className="inline-note">{t('users.loading')}</p>}
          {!isLoadingUsers && users.length === 0 && <p className="inline-note">{t('users.empty')}</p>}
        </div>
      </section>

      {canManageUsers && isCreateModalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeCreateModal}>
          <section className="modal-panel" role="dialog" aria-modal="true" aria-label={t('users.create')} onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" aria-label={t('common.cancel')} disabled={isSubmitting} type="button" onClick={closeCreateModal}>
              x
            </button>
            <div className="control-panel modal-form">
              <p className="inline-note">{t('users.generatedUsername')}</p>
              <label>
                {t('users.password')}
                <input value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} type="password" autoComplete="new-password" />
              </label>
              {canAssignShopAndRole && (
                <>
                  <label>
                    {t('users.userType')}
                    <select value={role} onChange={(event) => setRole(event.target.value)}>
                      {assignableRoles.map((option) => (
                        <option key={option.value} value={option.value}>{userTypeLabel(option.value, option.label)}</option>
                      ))}
                    </select>
                  </label>
                  {shouldAssignShop ? (
                    <label>
                      {t('users.shop')}
                      <select value={shopId} onChange={(event) => setShopId(event.target.value)}>
                        {shops.map((shop) => (
                          <option key={shop.id} value={shop.id}>{shop.name}</option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <p className="inline-note">{t('users.companyLevelUser')}</p>
                  )}
                </>
              )}
              {createError && <StatusMessage type="error">{createError}</StatusMessage>}
              <div className="modal-actions">
                <button className="secondary-action" disabled={isSubmitting} type="button" onClick={closeCreateModal}>
                  {t('common.cancel')}
                </button>
                <button className="primary-action" disabled={isSubmitting} type="button" onClick={() => void handleCreateUser()}>
                  {isSubmitting ? t('users.creating') : t('users.create')}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {canManageUsers && passwordUser && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeActionModal}>
          <section className="modal-panel" role="dialog" aria-modal="true" aria-label={t('users.resetPassword')} onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" aria-label={t('common.cancel')} disabled={isActionSubmitting} type="button" onClick={closeActionModal}>
              x
            </button>
            <div className="control-panel modal-form">
              <p className="inline-note">{t('users.resetPasswordFor', { username: passwordUser.username })}</p>
              <label>
                {t('users.newPassword')}
                <input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required minLength={8} type="password" autoComplete="new-password" />
              </label>
              {actionError && <StatusMessage type="error">{actionError}</StatusMessage>}
              <div className="modal-actions">
                <button className="secondary-action" disabled={isActionSubmitting} type="button" onClick={closeActionModal}>
                  {t('common.cancel')}
                </button>
                <button className="primary-action" disabled={isActionSubmitting} type="button" onClick={() => void handleResetPassword()}>
                  {isActionSubmitting ? t('users.savingPassword') : t('users.savePassword')}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {canManageUsers && removeUser && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeActionModal}>
          <section className="modal-panel" role="dialog" aria-modal="true" aria-label={t('users.remove')} onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" aria-label={t('common.cancel')} disabled={isActionSubmitting} type="button" onClick={closeActionModal}>
              x
            </button>
            <div className="control-panel modal-form">
              <p className="inline-note">{t('users.removeConfirm', { username: removeUser.username })}</p>
              {actionError && <StatusMessage type="error">{actionError}</StatusMessage>}
              <div className="modal-actions">
                <button className="secondary-action" disabled={isActionSubmitting} type="button" onClick={closeActionModal}>
                  {t('common.cancel')}
                </button>
                <button className="primary-action danger-primary-action" disabled={isActionSubmitting} type="button" onClick={() => void handleRemoveUser()}>
                  {isActionSubmitting ? t('users.removing') : t('users.remove')}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
