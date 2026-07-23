"use client";

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Mail, Shield, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { sendPasswordResetEmail } from '@/services/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: sendError } = await sendPasswordResetEmail(email);
    if (sendError) {
      setError(sendError.message);
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-12">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#F8FAFF] via-white to-[#F3F0FF]" />
        <div className="relative mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2.5">
            <img src="/logo.png" alt="Prasynx" className="h-10 w-auto" />
          </Link>

          {!sent ? (
            <>
              <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-white/80 px-3 py-1 text-[10px] font-bold text-[#7C3AED] shadow-sm">
                <Shield size={10} /> Password Reset
              </div>
              <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">Reset Your Password</h1>
              <p className="mt-2 text-sm text-slate-500">
                Enter your email address and we will send you a link to reset your password.
              </p>

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#7C3AED] focus:ring-4 focus:ring-[#F3F0FF]" />
                </div>
                <button type="submit" disabled={loading || !email}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#7C3AED]/25 transition hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> Send Reset Link</>}
                </button>
              </form>
              <Link href="/"
                className="mt-6 flex items-center justify-center gap-1 text-xs font-bold text-slate-500 transition hover:text-[#7C3AED]">
                <ArrowLeft size={12} /> Back to Sign In
              </Link>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-green-100 text-green-600">
                <Mail size={28} />
              </span>
              <h1 className="mt-6 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">Check Your Email</h1>
              <p className="mt-2 text-sm text-slate-500">
                We have sent a password reset link to <strong className="text-slate-900">{email}</strong>. Please check your inbox and follow the instructions.
              </p>
              <div className="mt-6 rounded-2xl border border-[#E8E0FF] bg-[#F3F0FF] p-4 text-xs text-slate-600">
                <p className="font-semibold">Didn&apos;t receive the email?</p>
                <p className="mt-1">Check your spam folder or{' '}
                  <button onClick={() => { setSent(false); setError(null); }} className="font-bold text-[#7C3AED] hover:text-[#6D28D9] transition">
                    try again
                  </button>.
                </p>
              </div>
              <Link href="/"
                className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-[#7C3AED] transition hover:text-[#6D28D9]">
                <ArrowLeft size={12} /> Back to Sign In
              </Link>
            </motion.div>
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
          <Shield size={48} className="text-white/80 mb-4" />
          <h2 className="text-2xl font-black text-white">Secure Password Reset</h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            Your account security matters. We use encrypted, time-limited reset links to ensure only you can change your password.
          </p>
          <div className="mt-8 space-y-3 text-left w-full max-w-xs">
            {['Encrypted reset link', 'Time-limited (15 min)', 'Email verification required', 'Instant notification'].map((item) => (
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
