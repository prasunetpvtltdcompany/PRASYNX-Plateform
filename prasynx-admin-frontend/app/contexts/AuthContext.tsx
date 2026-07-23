'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { auth, adminLogin, SessionData } from '../lib/auth';

interface AuthContextType {
  session: SessionData | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null, isAuthenticated: false, login: async () => ({ success: false }), logout: () => {}, loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = auth.getSession();
    if (stored) setSession(stored);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await adminLogin(email, password);
    if (result.success && result.data) setSession(result.data);
    return { success: result.success, error: result.error };
  }, []);

  const logout = useCallback(() => {
    auth.clearSession();
    setSession(null);
    window.location.href = '/';
  }, []);

  return (
    <AuthContext.Provider value={{ session, isAuthenticated: !!session, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
