import { useMemo, useState, type ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from './auth-context';
import type { AuthSession } from '../types';

const storageKey = 'bar-scan-session';

function getStoredSession() {
  const rawSession = localStorage.getItem(storageKey);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(() => getStoredSession());

  const value = useMemo<AuthContextValue>(() => ({
    session,
    setSession(nextSession) {
      localStorage.setItem(storageKey, JSON.stringify(nextSession));
      setSessionState(nextSession);
    },
    logout() {
      localStorage.removeItem(storageKey);
      setSessionState(null);
    },
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
