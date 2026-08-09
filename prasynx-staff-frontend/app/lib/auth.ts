const SESSION_KEY = 'staffSession';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface SessionData {
  token: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    organisation_id?: string;
    status?: string;
  };
  teacher?: {
    id: string;
    staff_unique_id: string;
    full_name: string;
    subject: string;
    organisation_id: string;
    status?: string;
  };
}

export const auth = {
  getSession(): SessionData | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.token && parsed.user?.id) {
          return parsed;
        }
      }
    } catch {
      this.clearSession();
    }
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
    const id = session?.user?.organisation_id || session?.teacher?.organisation_id || null;
    return id && UUID_RE.test(id) ? id : null;
  }
};
