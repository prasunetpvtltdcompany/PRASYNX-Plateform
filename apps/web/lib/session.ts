import type { UserDTO } from "@prasynx/types";

/**
 * Client-side session state (tokens + user).
 * The access token is kept in memory; the refresh token is persisted so the
 * user can return without re-entering credentials. Never log these values.
 */
export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: UserDTO;
}

const SESSION_KEY = "prasynx.web.session.v1";
/** Small, non-secret cookie mirroring the session role so edge middleware can gate routes. */
export const SESSION_COOKIE = "prasynx.session";
export const SESSION_COOKIE_DAYS = 30;

export function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.user) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  syncSessionCookie(session.user.role);
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; sameSite=lax`;
}

/** Keep the role cookie in sync so middleware can decide the right portal. */
function syncSessionCookie(role: string): void {
  const expires = new Date(Date.now() + SESSION_COOKIE_DAYS * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(role)}; path=/; expires=${expires}; sameSite=lax;`;
}

export function isSessionExpired(session: Session): boolean {
  return Date.now() >= session.expiresAt;
}