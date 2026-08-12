import type { LoginResult } from "@prasynx/types";
import { saveSession, type Session } from "./session";

/**
 * Single source of truth for talking to the PRASYNX monolith.
 * All requests go to the Next rewrites proxy (/api/v1/*) which forwards to the
 * API server, so the browser never talks to Supabase or any other origin.
 *
 * - Attaches the current access token.
 * - On 401, silently refreshes once (uses the stored refresh token) and retries.
 * - On refresh failure, clears the session.
 */

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

interface TokenSource {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onTokensRefreshed: (tokens: { accessToken: string; refreshToken: string; expiresIn: number }) => void;
  onSessionExpired: () => void;
}

let tokenSource: TokenSource | null = null;

/** AuthProvider registers itself so apiClient can rotate tokens without circular imports. */
export function registerTokenSource(source: TokenSource): void {
  tokenSource = source;
}

async function handle<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new ApiError(response.status, `Unexpected response (${response.status})`);
  }
  const body = await response.json();
  if (!response.ok) {
    throw new ApiError(
      response.status,
      (body as { error?: string }).error ?? "Request failed",
      (body as { code?: string }).code,
      (body as { details?: unknown }).details,
    );
  }
  return body as T;
}

async function rawFetch(path: string, token: string | null, options: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...options.headers,
  };
  if (token) headers.authorization = `Bearer ${token}`;
  return fetch(path, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });
}

export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!tokenSource) throw new ApiError(500, "auth is not initialised");
  const accessToken = tokenSource.getAccessToken();

  const first = await rawFetch(path, accessToken, options);
  if (first.status !== 401 || options.method === "POST" && isAuthEndpoint(path)) {
    return handle<T>(first);
  }

  const refreshToken = tokenSource.getRefreshToken();
  if (!refreshToken) {
    tokenSource.onSessionExpired();
    throw new ApiError(401, "Session expired");
  }

  let refreshed: Session;
  try {
    const login = await apiClientUnauthed<LoginResult>("/api/v1/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });
    refreshed = {
      accessToken: login.accessToken,
      refreshToken: login.refreshToken,
      expiresAt: Date.now() + login.expiresIn * 1000,
      user: login.user,
    };
  } catch {
    tokenSource.onSessionExpired();
    throw new ApiError(401, "Session expired");
  }

  saveSession(refreshed);
  tokenSource.onTokensRefreshed({ ...refreshed, expiresIn: 0 });
  const retry = await rawFetch(path, refreshed.accessToken, options);
  return handle<T>(retry);
}

function isAuthEndpoint(path: string): boolean {
  return /\/api\/v1\/auth\/(login|refresh|logout|change-password)/.test(path);
}

/** No-token request (login/refresh only). The refresh loop must never recurse. */
async function apiClientUnauthed<T>(path: string, options: RequestOptions): Promise<T> {
  const response = await rawFetch(path, null, options);
  return handle<T>(response);
}

export function apiLogin<T = LoginResult>(body: { email: string; password: string }): Promise<T> {
  return apiClientUnauthed<T>("/api/v1/auth/login", { method: "POST", body });
}