'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, SessionData } from '../lib/auth';

interface AuthContextType {
  session: SessionData | null;
  isAuthenticated: boolean;
  login: (token: string, user: any, organisation: any) => void;
  logout: () => void;
  organisationId: string | null;
}

const AuthContext = createContext<AuthContextType>({
  session: null, isAuthenticated: false, login: () => {}, logout: () => {}, organisationId: null
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    const stored = auth.getSession();
    if (stored) setSession(stored);
  }, []);

  const login = (token: string, user: any, organisation: any) => {
    const data: SessionData = { token, user, organisation };
    auth.setSession(data);
    setSession(data);
  };

  const logout = () => {
    auth.clearSession();
    setSession(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ session, isAuthenticated: !!session, login, logout, organisationId: session?.organisation?.id || null }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
