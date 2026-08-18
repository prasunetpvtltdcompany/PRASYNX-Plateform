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
  student: any;
  teachers?: any[];
}

interface AuthContextType {
  session: SessionData | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (token: string, user: any, student: any, teachers?: any[]) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isAuthenticated: false,
  isReady: false,
  login: () => {},
  logout: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('studentSession');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.token && !isTokenExpired(parsed.token)) {
          setSession(parsed);
        } else {
          localStorage.removeItem('studentSession');
        }
      } catch {}
    }
    setIsReady(true);
  }, []);

  const login = (token: string, user: any, student: any, teachers?: any[]) => {
    const data: SessionData = { token, user, student, teachers };
    localStorage.setItem('studentSession', JSON.stringify(data));
    setSession(data);
  };

  const logout = async () => {
    localStorage.removeItem('studentSession');
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, isAuthenticated: !!session, isReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
