'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

interface SessionData {
  token: string;
  user: any;
  teacher: any;
}

interface AuthContextType {
  session: SessionData | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (token: string, user: any, teacher: any) => void;
  logout: () => void;
  organisationId: string | null;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isAuthenticated: false,
  isReady: false,
  login: () => {},
  logout: () => {},
  organisationId: null
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('staffSession');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.token && !isTokenExpired(parsed.token)) {
          setSession(parsed);
        } else {
          localStorage.removeItem('staffSession');
        }
      } catch {}
    }
    setIsReady(true);
  }, []);

  const login = (token: string, user: any, teacher: any) => {
    const data: SessionData = { token, user, teacher };
    localStorage.setItem('staffSession', JSON.stringify(data));
    setSession(data);
  };

  const logout = async () => {
    localStorage.removeItem('staffSession');
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session,
        isReady,
        login,
        logout,
        organisationId: session?.user?.organisation_id || session?.teacher?.organisation_id || null
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
