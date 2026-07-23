const SESSION_KEY = 'managementSession';
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
      const stored = localStorage.getItem(SESSION_KEY);
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

  setSession(data: SessionData): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  },

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
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
