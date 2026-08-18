const SESSION_KEY = 'jobProviderSession';

export interface ProviderSession {
  token: string;
  provider: any;
}

export function getSession(): ProviderSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token) return null;
    return parsed as ProviderSession;
  } catch {
    return null;
  }
}

export function setSession(session: ProviderSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

export const auth = {
  getToken: (): string | null => getSession()?.token || null,
};