'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getSession, setSession, clearSession, type ProviderSession } from '../lib/auth';

interface AuthContextValue {
  session: ProviderSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, provider: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<ProviderSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSessionState(getSession());
    setIsLoading(false);
  }, []);

  const login = (token: string, provider: any) => {
    const data: ProviderSession = { token, provider };
    setSession(data);
    setSessionState(data);
  };

  const logout = () => {
    clearSession();
    setSessionState(null);
  };

  return (
    <AuthContext.Provider value={{ session, isAuthenticated: !!session, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);