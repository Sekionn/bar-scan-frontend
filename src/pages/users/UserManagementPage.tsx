import { useCallback, useEffect, useState } from 'react';
import { getShops, registerUser } from '../../api/client';
import { useAuth } from '../../auth/useAuth';
import { StatusMessage } from '../../components/feedback/StatusMessage';
import type { CreatedUser, Role, Shop } from '../../types';

type CreateableRole = Extract<Role, 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_MANAGER'>;

export function UserManagementPage() {
  const { session } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<CreateableRole>('ROLE_USER');
  const [shopId, setShopId] = useState('');
  const [shops, setShops] = useState<Shop[]>([]);
  const [createdUsers, setCreatedUsers] = useState<CreatedUser[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canAssignShopAndRole = session?.role === 'ROLE_MANAGER' || session?.role === 'ROLE_SUPER_ADMIN';

  function getShopName(targetShopId?: string) {
    if (!targetShopId) {
      return 'None';
    }

    return shops.find((shop) => shop.id === targetShopId)?.name ?? 'Assigned shop';
  }

  const loadShops = useCallback(async () => {
    if (!session || !canAssignShopAndRole) {
      return;
    }

    try {
      const nextShops = await getShops(session.token);
      setShops(nextShops);
      setShopId((currentShopId) => currentShopId || nextShops[0]?.id || '');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not load shops.');
    }
  }, [canAssignShopAndRole, session]);

  useEffect(() => {
    void loadShops();
  }, [loadShops]);

  async function handleCreateUser() {
    if (!session) {
      return;
    }

    setError('');

    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = canAssignShopAndRole
        ? { username, password, role, shopId: shopId || undefined }
        : { username, password };
      const createdUser = await registerUser(session.token, payload);
      setCreatedUsers((users) => [createdUser, ...users]);
      setUsername('');
      setPassword('');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not create user.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="management-grid">
      <div>
        <p className="eyebrow">Users</p>
        <h1>User management</h1>
        <p className="lede">Create phone scanner users, shop admins, or company managers based on your role.</p>
      </div>
      <div className="control-panel">
        <label>
          Username
          <input value={username} onChange={(event) => setUsername(event.target.value)} required autoComplete="off" />
        </label>
        <label>
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} type="password" autoComplete="new-password" />
        </label>
        {canAssignShopAndRole && (
          <>
            <label>
              Role
              <select value={role} onChange={(event) => setRole(event.target.value as CreateableRole)}>
                <option value="ROLE_USER">Scanner user</option>
                <option value="ROLE_ADMIN">Shop admin</option>
                <option value="ROLE_MANAGER">Company manager</option>
              </select>
            </label>
            <label>
              Shop
              <select value={shopId} onChange={(event) => setShopId(event.target.value)}>
                <option value="">No shop</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>{shop.name}</option>
                ))}
              </select>
            </label>
          </>
        )}
        {error && <StatusMessage type="error">{error}</StatusMessage>}
        <button className="primary-action" disabled={isSubmitting} type="button" onClick={() => void handleCreateUser()}>
          {isSubmitting ? 'Creating...' : 'Create user'}
        </button>
      </div>

      <section className="table-section">
        <h2>Created this session</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Shop</th>
              </tr>
            </thead>
            <tbody>
              {createdUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>{getShopName(user.shopId)}</td>
                </tr>
              ))}
              {createdUsers.length === 0 && (
                <tr>
                  <td colSpan={3}>No users created yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
