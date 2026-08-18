const KEY = 'parentSession';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ParentSessionData {
  token: string;
  parent: any;
  user: any;
  students: any[];
}

export const auth = {
  getSession(): ParentSessionData | null {
    if (typeof window === 'undefined') return null;
    try {
      const s = localStorage.getItem(KEY);
      if (s) { const p = JSON.parse(s); if (p.token) return p; }
    } catch { this.clearSession(); }
    return null;
  },
  setSession(data: ParentSessionData) { localStorage.setItem(KEY, JSON.stringify(data)); },
  clearSession() { localStorage.removeItem(KEY); },
  getToken() { return this.getSession()?.token || null; },
  isAuthenticated() { return !!this.getToken(); },
  getOrganisationId(): string | null {
    const session = this.getSession();
    const id = session?.parent?.organisation_id || session?.user?.organisation_id || null;
    return id && UUID_RE.test(id) ? id : null;
  }
};
