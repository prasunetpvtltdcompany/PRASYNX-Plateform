"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, Shield, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createBrowserClient } from '@/lib/supabase/browser';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: unknown } }) => {
      if (session) setValidSession(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push('/'), 3000);
  };

  if (!validSession && !success) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle size={32} className="mx-auto mb-4 text-red-400" />
          <h1 className="text-xl font-black text-slate-900">Invalid Reset Link</h1>
          <p className="mt-2 text-sm text-slate-500">This password reset link is invalid or has expired.</p>
          <Link href="/forgot-password"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-6 py-3 text-sm font-bold text-white">
            Request New Link <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-12">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#F8FAFF] via-white to-[#F3F0FF]" />
        <div className="relative mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2.5">
            <img src="/logo.png" alt="Prasynx" className="h-10 w-auto" />
          </Link>

          {success ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-green-100 text-green-600">
                <CheckCircle size={28} />
              </span>
              <h1 className="mt-6 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">Password Updated</h1>
              <p className="mt-2 text-sm text-slate-500">Your password has been successfully reset. Redirecting to sign in...</p>
            </motion.div>
          ) : (
            <>
              <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-white/80 px-3 py-1 text-[10px] font-bold text-[#7C3AED] shadow-sm">
                <Shield size={10} /> Set New Password
              </div>
              <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">Create New Password</h1>
              <p className="mt-2 text-sm text-slate-500">Enter your new password below.</p>

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">New Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type={showPassword ? 'text' : 'password'} value={password}
                      onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters"
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white py-3 pl-10 pr-10 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#7C3AED] focus:ring-4 focus:ring-[#F3F0FF]" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password"
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white py-3 pl-10 pr-10 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#7C3AED] focus:ring-4 focus:ring-[#F3F0FF]" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading || !password || !confirmPassword}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#7C3AED]/25 transition hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> Reset Password</>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="relative hidden lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#A855F7]" />
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-size-[24px_24px]" />
        </div>
        <div className="relative flex w-full flex-col items-center justify-center px-12 text-center">
          <Lock size={48} className="text-white/80 mb-4" />
          <h2 className="text-2xl font-black text-white">Choose a Strong Password</h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            Use a unique password with at least 8 characters, including letters, numbers, and symbols.
          </p>
          <div className="mt-8 space-y-2 text-left w-full max-w-xs">
            {['At least 8 characters', 'Mix of letters & numbers', 'Unique to this account', 'Avoid common phrases'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-white/70">
                <CheckCircle size={14} className="text-green-300 shrink-0" /> {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#7C3AED]" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
