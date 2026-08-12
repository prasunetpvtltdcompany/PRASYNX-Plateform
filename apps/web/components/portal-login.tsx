"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { homeForRole, portalLabel, roleAllowedInGroup } from "@/lib/route-groups";
import { buttonClasses } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { PLATFORM_URL } from "@/lib/site-url";

/**
 * Portal-scoped sign-in form. Each portal (student, staff, management, ...)
 * renders its own migration of this with its own `portal` segment so the
 * product matches the CUIMS model: one dedicated login per portal.
 */
export function PortalLogin({ portal }: { portal: string }) {
  return (
    <I18nProvider>
      <PortalLoginForm portal={portal} />
    </I18nProvider>
  );
}

function PortalLoginForm({ portal }: { portal: string }) {
  const { login, logout, user } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const portalName = t(`portal.${portal}`, portalLabel(portal));

  // Already signed in as a member of this portal -> just go in.
  if (user && roleAllowedInGroup(user.role, portal)) {
    router.replace(`/${portal}`);
    return null;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const loggedIn = await login(email, password);
      if (roleAllowedInGroup(loggedIn.role, portal)) {
        router.replace(`/${portal}`);
        return;
      }
      // Signed in, but this account belongs to a different portal.
      const other = homeForRole(loggedIn.role).replace("/", "");
      await logout();
      setError(
        t("login.wrongPortal", "This is the {here}. Your account signs in through the {other} instead.")
          .replace("{here}", portalName)
          .replace("{other}", t(`portal.${other}`, portalLabel(other))),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("login.failed", "Sign in failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href={PLATFORM_URL} className="text-2xl font-bold text-indigo-600">
            PRASYNX
          </Link>
          <h1 className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{portalName}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {t("login.signInTo", `Sign in to your ${portalName.toLowerCase()}`).replace("{portal}", portalName)}
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("login.email", "Email")}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("login.password", "Password")}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {error ? (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          ) : null}

          <button type="submit" disabled={submitting} className={buttonClasses("primary", "w-full")}>
            {submitting ? t("login.signingIn", "Signing in…") : t("login.signIn", "Sign in")}
          </button>

          <div className="flex items-center justify-between text-sm">
            <Link
              href="/auth/login"
              className="text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            >
              {t("login.changePortal", "Choose a different portal")}
            </Link>
            <Link href="/auth/reset-password" className="text-indigo-600 hover:text-indigo-800">
              {t("login.forgotPassword", "Forgot password?")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}