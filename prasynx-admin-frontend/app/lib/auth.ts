const SESSION_KEY = 'adminSession';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface SessionData {
  token: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
  organisations: any[];
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export const auth = {
  getSession(): SessionData | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user?.id && parsed.token && !isTokenExpired(parsed.token)) return parsed;
      }
    } catch { this.clearSession(); }
    this.clearSession();
    return null;
  },
  setSession(data: SessionData): void { localStorage.setItem(SESSION_KEY, JSON.stringify(data)); },
  clearSession(): void { localStorage.removeItem(SESSION_KEY); },
  getToken(): string | null { return this.getSession()?.token || null; },
  isAuthenticated(): boolean { return !!this.getSession(); },
};

export async function adminLogin(email: string, password: string): Promise<{ success: boolean; error?: string; data?: SessionData }> {
  try {
    const response = await fetch('http://localhost:4001/api/v2/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Login failed' }));
      return { success: false, error: err.error || 'Invalid admin credentials' };
    }
    const res = await response.json();
    const payload = res.data || res;
    const session: SessionData = {
      token: payload.token || 'admin-session',
      user: payload.user || { id: 'admin', full_name: 'Admin', email, role: 'admin' },
      organisations: payload.organisations || [],
    };
    auth.setSession(session);
    return { success: true, data: session };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection failed' };
  }
}


