const SESSION_KEY = 'studentSession';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface SessionData {
  user: any;
  student: any;
  teachers?: any[];
}

export const auth = {
  getSession(): SessionData | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user || parsed.student) return parsed;
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
  isAuthenticated(): boolean {
    return this.getSession() !== null;
  },
  getOrganisationId(): string | null {
    const session = this.getSession();
    const id = session?.student?.organisation_id || session?.user?.organisation_id || null;
    return id && UUID_RE.test(id) ? id : null;
  }
};
