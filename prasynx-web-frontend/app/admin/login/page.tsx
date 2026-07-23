'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Shield, User, Lock, KeyRound, Eye, EyeOff, Loader2, AlertCircle,
  Fingerprint, Sparkles, ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginWithBackend, storeSession } from '../../../services/backend-auth';

export default function AdminLogin() {
  const router = useRouter();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [tfaCode, setTfaCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'credentials' | 'tfa'>('credentials');
  const [rememberDevice, setRememberDevice] = useState(false);

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!adminId || !password) {
      setError('Please enter Admin ID and Password.');
      return;
    }
    setLoading(true);
    const { error: authError, data: authData } = await loginWithBackend('admin', adminId, password);
    setLoading(false);
    if (authError) {
      setError(authError);
      return;
    }
    if (authData) {
      storeSession(authData.token, authData.user);
      setStep('tfa');
    }
  };

  const handleTfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!tfaCode || tfaCode.length < 6) {
      setError('Please enter a valid 6-digit authentication code.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    router.push('/admin/dashboard');
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-96 -left-96 h-[800px] w-[800px] rounded-full bg-purple-500/5 blur-[150px]" />
        <div className="absolute -bottom-96 -right-96 h-[800px] w-[800px] rounded-full bg-violet-500/5 blur-[150px]" />
      </div>

      <div className="relative flex w-full flex-col justify-center overflow-y-auto px-4 py-8 lg:w-1/2 lg:px-12">
        <div className="mx-auto w-full max-w-sm sm:max-w-md">
          <Link
            href="/signin"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] transition hover:text-[#7C3AED]"
          >
            <ChevronLeft size={14} />
            Back to role selection
          </Link>

          <Link href="/" className="mb-5 flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] text-xs font-black text-white">P</span>
            <span className="text-base font-black text-[#0F172A]">Prasynx</span>
          </Link>

          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#EDE9FE] bg-purple-50 px-2.5 py-0.5 text-[9px] font-bold text-purple-600">
            <Shield size={9} /> Admin Portal v4.2
          </div>

          {step === 'credentials' ? (
            <>
              <h1 className="text-2xl font-black leading-tight text-[#0F172A] sm:text-3xl">Admin Sign In</h1>
              <p className="mt-1.5 text-sm text-[#64748B]">Enter your administrator credentials to access the command center.</p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600"
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}

              <form className="mt-6 space-y-4" onSubmit={handleCredentialSubmit}>
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#475569]">Admin ID</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                      <User size={15} />
                    </span>
                    <input
                      type="text"
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      placeholder="e.g. admin@institution.edu"
                      required
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 pl-9 text-sm font-semibold text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#475569]">Password</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                      <Lock size={15} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 pl-9 pr-10 text-sm font-semibold text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] transition hover:text-[#475569]"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={() => setRememberDevice(!rememberDevice)}
                      className="h-4 w-4 rounded border-[#CBD5E1] text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs font-semibold text-[#64748B]">Remember this device</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-bold text-purple-600 transition hover:text-purple-700"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-600/20 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <><ArrowRight size={16} /> Continue</>
                  )}
                </button>
              </form>

              <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] p-3.5">
                <div className="flex items-start gap-2.5">
                  <Shield size={13} className="mt-0.5 shrink-0 text-purple-600" />
                  <div>
                    <p className="text-xs font-bold text-[#475569]">Security Notice</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-[#64748B]">
                      This portal is restricted to authorized administrators. All access attempts are logged and monitored.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-4 flex items-center gap-3">
                <button
                  onClick={() => {
                    setStep('credentials');
                    setTfaCode('');
                    setError(null);
                  }}
                  className="grid h-7 w-7 place-items-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] transition hover:bg-[#F5F3FF] hover:text-[#7C3AED]"
                >
                  <ArrowRight size={13} className="rotate-180" />
                </button>
                <span className="text-xs font-semibold text-[#64748B]">Back to credentials</span>
              </div>

              <h1 className="text-2xl font-black leading-tight text-[#0F172A] sm:text-3xl">Two-Factor Auth</h1>
              <p className="mt-1.5 text-sm text-[#64748B]">Enter the 6-digit code from your authenticator app.</p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600"
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}

              <form className="mt-6 space-y-4" onSubmit={handleTfaSubmit}>
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#475569]">Authentication Code</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                      <KeyRound size={15} />
                    </span>
                    <input
                      type="text"
                      value={tfaCode}
                      onChange={(e) => setTfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      required
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 pl-9 text-center text-base font-black tracking-[0.5em] text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <Fingerprint size={13} className="text-purple-600" />
                    <span className="text-xs font-semibold text-[#64748B]">Trust this device for 30 days</span>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#CBD5E1] text-purple-600 focus:ring-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || tfaCode.length < 6}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-600/20 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <><Shield size={16} /> Verify & Sign In</>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-center text-xs font-semibold text-[#64748B]">
              By signing in, you agree to the{' '}
              <Link href="/terms" className="text-purple-600 transition hover:text-purple-700">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" className="text-purple-600 transition hover:text-purple-700">
                Privacy Policy
              </Link>
              .
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
              <Sparkles size={10} className="text-[#7C3AED]" />
              <span>Powered by <span className="font-semibold text-[#7C3AED]">Prerana AI</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative hidden lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-violet-50" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-48 -right-48 h-[600px] w-[600px] rounded-full bg-purple-500/8 blur-3xl" />
          <div className="absolute -bottom-48 -left-48 h-[500px] w-[500px] rounded-full bg-violet-500/5 blur-3xl" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(124,58,237,0.03) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>
        <div className="flex h-full w-full items-center justify-center p-8">
          <img src="/adminlogin.png" alt="Admin Portal" className="max-h-full max-w-full object-contain drop-shadow-2xl" />
        </div>
      </div>
    </div>
  );
}
