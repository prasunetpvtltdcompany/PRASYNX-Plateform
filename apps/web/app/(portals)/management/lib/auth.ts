const PERSISTED_KEY = 'managementSession'; // localStorage (remember me)
const TABS_SESSION_KEY = 'managementSession:tab'; // sessionStorage (don't remember)
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface SessionData {
  token: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    status: string;
  };
  organisation: {
    id: string;
    name: string;
    email?: string;
    status?: string;
  };
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
      const stored =
        sessionStorage.getItem(TABS_SESSION_KEY) || localStorage.getItem(PERSISTED_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.token && parsed.organisation?.id && !isTokenExpired(parsed.token)) {
          return parsed;
        }
      }
    } catch {
      this.clearSession();
    }
    this.clearSession();
    return null;
  },

  setSession(data: SessionData, remember = true): void {
    const raw = JSON.stringify(data);
    sessionStorage.removeItem(TABS_SESSION_KEY);
    if (remember) {
      localStorage.setItem(PERSISTED_KEY, raw);
    } else {
      sessionStorage.setItem(TABS_SESSION_KEY, raw);
      localStorage.removeItem(PERSISTED_KEY);
    }
  },

  clearSession(): void {
    localStorage.removeItem(PERSISTED_KEY);
    if (typeof window !== 'undefined') sessionStorage.removeItem(TABS_SESSION_KEY);
  },

  getToken(): string | null {
    const session = this.getSession();
    return session?.token || null;
  },

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },

  getOrganisationId(): string | null {
    const session = this.getSession();
    return session?.organisation?.id || null;
  }
};
