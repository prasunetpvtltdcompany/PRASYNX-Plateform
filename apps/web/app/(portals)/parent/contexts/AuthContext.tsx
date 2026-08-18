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

interface ParentSessionData {
  token: string;
  parent: any;
  user: any;
  students: any[];
}

interface AuthCtx {
  session: ParentSessionData | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (token: string, parent: any, user: any, students: any[]) => void;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({
  session: null, isAuthenticated: false, isReady: false, login: () => {}, logout: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ParentSessionData | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('parentSession');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.token && !isTokenExpired(parsed.token)) {
          setSession(parsed);
        } else {
          localStorage.removeItem('parentSession');
        }
      } catch {}
    }
    setIsReady(true);
  }, []);

  const login = (token: string, parent: any, user: any, students: any[]) => {
    const d: ParentSessionData = { token, parent, user, students };
    localStorage.setItem('parentSession', JSON.stringify(d));
    setSession(d);
  };

  const logout = async () => {
    localStorage.removeItem('parentSession');
    setSession(null);
  };

  return (
    <Ctx.Provider value={{ session, isAuthenticated: !!session, isReady, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
