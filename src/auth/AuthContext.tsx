import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from './auth-context';
import { createSessionFromToken } from './jwt';
import type { AuthSession } from '../types';

const storageKey = 'bar-scan-session';
const authExpiredEventName = 'bar-scan-auth-expired';
const authRefreshedEventName = 'bar-scan-auth-refreshed';

function getStoredSession() {
  const storedValue = localStorage.getItem(storageKey);

  if (!storedValue) {
    return null;
  }

  try {
    const token = storedValue.startsWith('{')
      ? (JSON.parse(storedValue) as Partial<AuthSession>).token
      : storedValue;

    if (!token) {
      localStorage.removeItem(storageKey);
      return null;
    }

    localStorage.setItem(storageKey, token);
    return createSessionFromToken(token);
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(() => getStoredSession());

  useEffect(() => {
    function handleAuthExpired() {
      localStorage.removeItem(storageKey);
      setSessionState(null);
    }

    window.addEventListener(authExpiredEventName, handleAuthExpired);
    return () => window.removeEventListener(authExpiredEventName, handleAuthExpired);
  }, []);

  useEffect(() => {
    function handleAuthRefreshed(event: Event) {
      const token = (event as CustomEvent<{ token?: string }>).detail?.token;
      if (!token) {
        return;
      }
      try {
        setSessionState(createSessionFromToken(token));
      } catch {
        localStorage.removeItem(storageKey);
        setSessionState(null);
      }
    }

    window.addEventListener(authRefreshedEventName, handleAuthRefreshed);
    return () => window.removeEventListener(authRefreshedEventName, handleAuthRefreshed);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    setSession(nextSession) {
      localStorage.setItem(storageKey, nextSession.token);
      setSessionState(nextSession);
    },
    logout() {
      localStorage.removeItem(storageKey);
      setSessionState(null);
    },
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
