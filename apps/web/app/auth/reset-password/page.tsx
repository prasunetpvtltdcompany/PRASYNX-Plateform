"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { I18nProvider, useI18n } from "@/lib/i18n";

export default function ResetPasswordPage() {
  return (
    <I18nProvider>
      <ResetPassword />
    </I18nProvider>
  );
}

function ResetPassword() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setDone(false);
    try {
      await apiClient<{ message: string }>("/api/v1/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[#EEEBFE] via-[#EFF4FF] to-[#FCF0F7]">
      {/* Ambient light background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-32 -left-32 h-[560px] w-[560px] rounded-full bg-violet-300/40 blur-[130px]" />
        <div className="absolute -bottom-40 -right-32 h-[600px] w-[600px] rounded-full bg-sky-300/40 blur-[140px]" />
        <div className="absolute top-1/3 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-rose-200/40 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.6),transparent_60%)]" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-3"
        >
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-indigo-600"
          >
            <ChevronLeft size={14} />
            {t("auth.backToSignIn", "Back to sign in")}
          </Link>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="flex justify-center"
        >
          <div className="relative">
            <div
              className="absolute inset-0 scale-150 rounded-full bg-gradient-to-tr from-violet-400/40 via-indigo-300/30 to-sky-400/40 blur-2xl"
              aria-hidden
            />
            <img
              src="/logo.png"
              alt="Prasynx Logo"
              className="relative h-24 w-auto object-contain drop-shadow-[0_16px_40px_rgba(99,102,241,0.35)]"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="mt-5 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/80 px-4 py-1.5 shadow-sm backdrop-blur-sm">
            <ShieldCheck size={13} className="text-violet-600" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-700">
              {t("auth.secureRecovery", "Secure account recovery")}
            </span>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18, ease: "easeOut" }}
          className="mt-7"
        >
          <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/90 p-7 shadow-2xl shadow-slate-300/40 backdrop-blur-sm sm:p-9">
            {/* Top accent line */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-500" aria-hidden />

            <AnimatePresence mode="wait">
              {done ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col items-center py-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 240, damping: 16, delay: 0.1 }}
                    className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                  >
                    <Check size={32} strokeWidth={3} />
                  </motion.div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {t("auth.requestSentTitle", "Check your inbox")}
                  </h2>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                    {t(
                      "auth.resetSentNote",
                      "If that email exists, a reset link has been sent. Follow the link to choose a new password.",
                    )}
                  </p>
                  <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-700">
                    <Mail size={14} />
                    <span className="break-all">{email}</span>
                  </div>
                  <Link
                    href="/auth/login"
                    className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700 active:scale-[0.98]"
                  >
                    {t("auth.backToSignIn", "Back to sign in")}
                    <ArrowRight size={16} />
                  </Link>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={onSubmit}
                  className="space-y-5"
                >
                  <div className="text-center">
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[1.7rem]">
                      {t("auth.resetTitle", "Forgot your password?")}
                    </h1>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                      {t(
                        "auth.resetSubtitle",
                        "Enter the email linked to your account and we'll send you a secure link to reset your password.",
                      )}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-xs font-bold text-slate-600">
                      {t("auth.email", "Email address")}
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {error ? (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-600"
                      >
                        {error}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileTap={{ scale: submitting ? 1 : 0.98 }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {t("auth.sending", "Sending…")}
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        {t("auth.sendReset", "Send recovery link")}
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5"
        >
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <ShieldCheck size={13} className="text-emerald-500" /> SSL Secured
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <Lock size={13} className="text-sky-500" /> 256-bit Encrypted
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <Sparkles size={13} className="text-amber-500" /> Powered by Prerana AI
          </span>
        </motion.div>
      </main>
    </div>
  );
}