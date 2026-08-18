import { createClient } from './supabase';

const SESSION_KEY = 'adminSession';

let inMemoryToken: string | null = null;

export interface SessionData {
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
  organisations: any[];
}

export const auth = {
  getSession(): SessionData | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (!parsed.user?.id) {
        this.clearSession();
        return null;
      }
      return parsed;
    } catch {
      this.clearSession();
      return null;
    }
  },
  setSession(data: SessionData): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  },
  clearSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSION_KEY);
    inMemoryToken = null;
  },
  setToken(token: string | null): void {
    inMemoryToken = token;
  },
  getToken(): string | null {
    return inMemoryToken;
  },
  isAuthenticated(): boolean {
    return !!this.getSession();
  },
};

/**
 * Exchanges the active Supabase session for an admin portal profile.
 * The returned access token is kept in memory only (never localStorage) and
 * mirrored to an httpOnly cookie by the backend so every API call is authorized.
 */
export async function finalizeAdminSession(): Promise<{ success: boolean; error?: string; needsMfa?: boolean }> {
  const supabase = createClient();
  const { data: supabaseSession, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !supabaseSession?.session?.access_token) {
    return { success: false, error: 'No active Supabase session' };
  }
  try {
    const response = await fetch('/api/v2/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: supabaseSession.session.access_token }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (payload.error === 'Multi-factor authentication verification required.') {
        return { success: false, needsMfa: true };
      }
      return { success: false, error: payload.error || 'Login failed' };
    }
    const data = payload.data || {};
    const profile: SessionData = {
      user: {
        id: data.user?.id,
        full_name: data.user?.full_name,
        email: data.user?.email,
        role: data.user?.role,
      },
      organisations: data.organisations || [],
    };
    auth.setSession(profile);
    auth.setToken(supabaseSession.session.access_token);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection failed' };
  }
}
