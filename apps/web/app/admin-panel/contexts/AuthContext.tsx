'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { auth, SessionData, finalizeAdminSession } from '../lib/auth';
import { createClient } from '../lib/supabase';

interface AuthContextType {
  session: SessionData | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsMfa?: boolean }>;
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
    let cancelled = false;
    (async () => {
      const stored = auth.getSession();
      try {
        if (!stored) throw new Error('No stored profile');
        // Recover the real Supabase session so we have a valid access token
        // (localStorage keeps the profile forever, but the httpOnly cookie and
        // in-memory token are lost after a reload / expiry).
        const supabase = createClient();
        let sessionData = (await supabase.auth.getSession()).data.session;
        if (!sessionData) throw new Error('No Supabase session');
        if (typeof sessionData.expires_at === 'number' && Date.now() >= sessionData.expires_at * 1000) {
          const { data: refreshed } = await supabase.auth.refreshSession();
          if (refreshed.session) sessionData = refreshed.session;
        }
        auth.setToken(sessionData.access_token);
        const result = await finalizeAdminSession();
        if (!result.success) throw new Error(result.error || 'Session restore failed');
        if (!cancelled) setSession(auth.getSession());
      } catch {
        auth.clearSession();
        auth.setToken(null);
        if (!cancelled) setSession(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      return { success: false, error: error?.message || 'Invalid credentials' };
    }
    auth.setToken(data.session.access_token);
    const result = await finalizeAdminSession();
    if (result.success) {
      setSession(auth.getSession());
      return { success: true };
    }
    if (result.needsMfa) {
      return { success: false, needsMfa: true };
    }
    await supabase.auth.signOut();
    auth.clearSession();
    return { success: false, error: result.error || 'Login failed' };
  }, []);

  const logout = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch { /* ignore */ }
    try {
      await fetch('/api/v2/admin/logout', { method: 'POST' });
    } catch { /* ignore */ }
    auth.clearSession();
    setSession(null);
    window.location.href = '/admin-panel';
  }, []);

  return (
    <AuthContext.Provider value={{ session, isAuthenticated: !!session, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
