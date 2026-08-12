"use client";

import type { LoginResult, UserDTO } from "@prasynx/types";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { registerTokenSource, apiClient, apiLogin } from "./api";
import { clearSession, loadSession, saveSession, type Session } from "./session";

interface AuthContextValue {
  user: UserDTO | null;
  login: (email: string, password: string) => Promise<UserDTO>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(() => {
    // Hydrate synchronously from the persisted session - no async restore effect needed.
    const session = loadSession();
    return session?.user ?? null;
  });

  const setSession = useCallback((session: Session) => {
    saveSession(session);
    setUser(session.user);
  }, []);

  const clear = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const source = useMemo<TokenSourceLike>(() => {
    return {
      getAccessToken: () => loadSession()?.accessToken ?? null,
      getRefreshToken: () => loadSession()?.refreshToken ?? null,
      onTokensRefreshed: (tokens) => {
        const current = loadSession();
        if (!current) return;
        setSession({
          ...current,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: Date.now() + tokens.expiresIn * 1000,
        });
      },
      onSessionExpired: clear,
    };
  }, [setSession, clear]);

  registerTokenSource(source);

  const login = useCallback(
    async (email: string, password: string): Promise<UserDTO> => {
      const result = await apiLogin<LoginResult>({ email, password });
      setSession({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresAt: Date.now() + result.expiresIn * 1000,
        user: result.user,
      });
      return result.user;
    },
    [setSession],
  );

  const logout = useCallback(async (): Promise<void> => {
    const session = loadSession();
    try {
      if (session) {
        await apiClient<void>("/api/v1/auth/logout", {
          method: "POST",
          body: { refreshToken: session.refreshToken },
        });
      }
    } catch {
      // Best-effort: local logout must still happen.
    }
    clear();
  }, [clear]);

  const value = useMemo(
    () => ({ user, login, logout }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

interface TokenSourceLike {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onTokensRefreshed: (tokens: { accessToken: string; refreshToken: string; expiresIn: number }) => void;
  onSessionExpired: () => void;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}