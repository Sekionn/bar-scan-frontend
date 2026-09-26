import { createContext } from 'react';
import type { AuthSession } from '../types';

export type AuthContextValue = {
  session: AuthSession | null;
  setSession: (session: AuthSession) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
