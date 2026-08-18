'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Mail, KeyRound, Eye, EyeOff, Loader2, ArrowRight,
  ChevronLeft, AlertCircle, Lock, Fingerprint,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createClient } from '../lib/supabase';
import { finalizeAdminSession } from '../lib/auth';

export default function AdminLoginPage() {
  const { session, loading, login: authLogin } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [mfaCode, setMfaCode] = useState('');

  const stars = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 1.8 + 0.4,
        duration: Math.random() * 4 + 2,
        delay: Math.random() * 5,
      })),
    []
  );

  useEffect(() => {
    if (!loading && session) {
      window.location.href = '/admin-panel';
    }
  }, [loading, session]);

  const handleLogin = async () => {
    setError(null); setSubmitting(true);
    if (!form.email || !form.password) {
      setError('Please enter Email and Password.');
      setSubmitting(false);
      return;
    }
    try {
      const result = await authLogin(form.email, form.password);
      if (result.success) {
        window.location.href = '/admin-panel';
      } else if (result.needsMfa) {
        setStep('mfa');
        setMfaCode('');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMfaVerify = async () => {
    setError(null); setSubmitting(true);
    if (mfaCode.trim().length < 6) {
      setError('Enter the 6-digit code from your authenticator app.');
      setSubmitting(false);
      return;
    }
    try {
      const supabase = createClient();
      const { data: mfaData, error: mfaListError } = await supabase.auth.mfa.listFactors();
      const totpFactor = mfaData?.totp?.find((f: { id: string; status: string }) => f.status === 'verified');
      if (mfaListError || !totpFactor) {
        setError('No verified authenticator factor found. Contact your administrator.');
        return;
      }
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
      if (challengeError || !challengeData) {
        setError(challengeError?.message || 'Failed to start 2FA verification.');
        return;
      }
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code: mfaCode.trim(),
      });
      if (verifyError) {
        setError(verifyError.message || 'Invalid 2FA code.');
        return;
      }
      const result = await finalizeAdminSession();
      if (result.success) {
        window.location.href = '/admin-panel';
      } else {
        setError(result.error || 'Login failed after 2FA.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetToCredentials = async () => {
    setError(null);
    setStep('credentials');
    setMfaCode('');
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch { /* ignore */ }
  };

  if (loading) {
    return null;
  }

  const inputCls =
    'w-full rounded-xl border border-[#10F2A0]/25 bg-[#020a09]/70 px-4 py-3 pl-11 font-mono text-sm text-[#d9fff2] outline-none transition-all duration-300 placeholder:text-[#10F2A0]/25 focus:border-[#10F2A0]/70 focus:bg-[#03130f]/80 focus:shadow-[0_0_0_3px_rgba(16,242,160,0.12),0_0_30px_rgba(16,242,160,0.12)]';

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#02040a] text-[#c9fbe9]">
      {/* Starfield */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {stars.map((s) => (
          <motion.span
            key={s.id}
            className="absolute rounded-full bg-[#10F2A0]"
            style={{ top: `${s.top}%`, left: `${s.left}%`, width: s.size, height: s.size, boxShadow: '0 0 6px rgba(16,242,160,0.8)' }}
            animate={{ opacity: [0.1, 0.9, 0.1] }}
            transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Radar sweep */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 7, ease: 'linear' }}
          className="h-[130vmin] w-[130vmin] rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, rgba(16,242,160,0.14), rgba(34,211,238,0.05) 70deg, transparent 120deg)',
            maskImage: 'radial-gradient(circle, black 0%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 70%)',
          }}
        />
        <div className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#10F2A0]/10" />
        <div className="absolute left-1/2 top-1/2 h-[40vmin] w-[40vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#10F2A0]/15" />
      </div>

      {/* Scanline grid + vignette */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(16,242,160,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16,242,160,0.05) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 80%)',
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#02040a_85%)]" />

      {/* Terminal card */}
      <motion.div
        initial={{ opacity: 0, y: 34, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="relative overflow-hidden rounded-3xl border border-[#123b2e] bg-[#050d12]/90 p-7 shadow-[0_0_90px_rgba(16,242,160,0.07)] backdrop-blur-xl sm:p-9">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#10F2A0]/70 to-transparent" />

          {/* Title bar */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#10F2A0]/70" />
            </div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-[#10F2A0]/50">prasynx-secure-console</p>
          </div>

          {/* Emblem */}
          <div className="relative mx-auto mb-6 h-20 w-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-dashed border-[#10F2A0]/30"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
              className="absolute -inset-2 rounded-full border border-transparent border-t-[#10F2A0]/60"
            />
            <div className="absolute inset-2 flex items-center justify-center rounded-full border border-[#10F2A0]/40 bg-[#06150f]/90">
              <ShieldCheck size={26} className="text-[#10F2A0]" />
            </div>
          </div>

          <div className="mb-7 text-center">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.35em] text-[#10F2A0]/60">
              &gt; authentication required
              <motion.span
                className="ml-1 inline-block h-3 w-[7px] translate-y-0.5 bg-[#10F2A0]"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </p>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Admin Panel</h1>
            <p className="mt-2 text-sm text-white/40">Authorized personnel only · every access is logged</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-mono text-xs font-semibold text-red-300"
            >
              <AlertCircle size={14} className="shrink-0" /> {error}
            </motion.div>
          )}

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); step === 'mfa' ? handleMfaVerify() : handleLogin(); }}>
            {step === 'mfa' ? (
              <>
                <div className="group">
                  <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[#10F2A0]/70">
                    [ 2fa code ]
                  </label>
                  <div className="relative">
                    <Fingerprint size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#10F2A0]/40 transition-colors duration-300 group-focus-within:text-[#10F2A0]" />
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      autoFocus
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000 000"
                      className={`${inputCls} text-center text-base tracking-[0.6em]`}
                    />
                  </div>
                  <p className="mt-2 font-mono text-[10px] leading-relaxed text-white/40">
                    Open your authenticator app and enter the 6-digit code to complete sign-in.
                  </p>
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileTap={{ scale: submitting ? 1 : 0.97 }}
                  className="group/btn relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#10F2A0] px-4 py-3.5 font-mono text-sm font-black uppercase tracking-[0.25em] text-[#02140c] shadow-[0_0_35px_rgba(16,242,160,0.35)] transition-all duration-300 hover:shadow-[0_0_55px_rgba(16,242,160,0.55)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                  {submitting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <>
                      <span className="relative">verify code</span>
                      <ArrowRight size={15} className="relative transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={resetToCredentials}
                  className="mx-auto mt-1 block font-mono text-xs font-semibold text-white/40 transition hover:text-[#10F2A0]"
                >
                  &lt; use another account
                </button>
              </>
            ) : (
              <>
            <div className="group">
              <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[#10F2A0]/70">
                [ email ]
              </label>
              <div className="relative">
                <Mail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#10F2A0]/40 transition-colors duration-300 group-focus-within:text-[#10F2A0]" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@prasynx.com"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="group">
              <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[#10F2A0]/70">
                [ password ]
              </label>
              <div className="relative">
                <KeyRound size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#10F2A0]/40 transition-colors duration-300 group-focus-within:text-[#10F2A0]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••••"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#10F2A0]/40 transition-colors hover:text-[#10F2A0]"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-2.5 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 rounded border border-[#10F2A0]/40 bg-black/40 text-[#10F2A0] focus:ring-[#10F2A0]/30"
                />
                <span className="text-xs font-semibold text-white/60">Keep session</span>
              </label>
              <Link href="/auth/reset-password" className="font-mono text-xs font-bold text-[#10F2A0]/80 transition hover:text-[#10F2A0] hover:underline">
                reset_access
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={submitting}
              whileTap={{ scale: submitting ? 1 : 0.97 }}
              className="group/btn relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#10F2A0] px-4 py-3.5 font-mono text-sm font-black uppercase tracking-[0.25em] text-[#02140c] shadow-[0_0_35px_rgba(16,242,160,0.35)] transition-all duration-300 hover:shadow-[0_0_55px_rgba(16,242,160,0.55)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
              {submitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  <span className="relative">Authenticate</span>
                  <ArrowRight size={15} className="relative transition-transform duration-300 group-hover/btn:translate-x-1" />
                </>
              )}
            </motion.button>
              </>
            )}
          </form>

          {/* Security status */}
          <div className="mt-6 flex items-center justify-center gap-4 font-mono text-[9px] tracking-[0.2em] text-[#10F2A0]/40">
            <span className="flex items-center gap-1.5"><Lock size={10} /> TLS 1.3</span>
            <span className="h-3 w-px bg-[#10F2A0]/15" />
            <span className="flex items-center gap-1.5"><Fingerprint size={10} /> RBAC</span>
            <span className="h-3 w-px bg-[#10F2A0]/15" />
            <span className="flex items-center gap-1.5">
              <motion.span className="h-1.5 w-1.5 rounded-full bg-[#10F2A0]" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
              ENCRYPTED
            </span>
          </div>

          <div className="mt-6 border-t border-[#0c1a16] pt-5 text-center">
            <Link href="/auth/login" className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-white/40 transition hover:text-[#10F2A0]">
              <ChevronLeft size={13} /> back_to_role_selection
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Bottom ticker */}
      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center px-4">
        <p className="truncate font-mono text-[9px] tracking-[0.25em] text-white/20">
          SYS.MONITOR · ALL PORTALS NOMINAL · PRERANA AI ONLINE
        </p>
      </div>
    </div>
  );
}