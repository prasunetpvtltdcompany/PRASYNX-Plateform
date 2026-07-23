'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Eye, EyeOff, Mail, Sparkles, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginWithBackend, storeSession } from '../../../services/backend-auth';

export default function JobProviderLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter Company Email and Password.');
      return;
    }
    setLoading(true);
    const { error: authError, data: authData } = await loginWithBackend('recruiter', email, password);
    setLoading(false);
    if (authError) {
      setError(authError);
      return;
    }
    if (authData) {
      storeSession(authData.token, authData.user);
      router.push('/job-provider/dashboard');
    }
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-96 -left-96 h-[800px] w-[800px] rounded-full bg-indigo-500/5 blur-[150px]" />
        <div className="absolute -bottom-96 -right-96 h-[800px] w-[800px] rounded-full bg-indigo-500/5 blur-[150px]" />
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

          <Link href="/" className="mb-6 flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] text-xs font-black text-white">P</span>
            <span className="text-base font-black text-[#0F172A]">Prasynx</span>
          </Link>

          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#E0E7FF] bg-indigo-50 px-2.5 py-0.5 text-[9px] font-bold text-indigo-600">
            <Sparkles size={9} /> Job Provider Portal
          </div>

          <h1 className="text-2xl font-black leading-tight text-[#0F172A] sm:text-3xl">Welcome Back</h1>
          <p className="mt-1.5 text-sm text-[#64748B]">Sign in to your employer account to manage jobs and candidates.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
                <AlertCircle size={14} /> {error}
              </motion.div>
            )}
            <div>
              <label className="mb-1 block text-xs font-bold text-[#475569]">Company Email</label>
              <div className="group relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors group-focus-within:text-indigo-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your company email"
                  required
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 pl-9 text-sm font-semibold text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#475569]">Password</label>
              <div className="group relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors group-focus-within:text-indigo-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 pl-9 pr-10 text-sm font-semibold text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
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
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-[#CBD5E1] text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-[#64748B]">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-indigo-600 transition hover:text-indigo-700"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> Sign In</>}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#E2E8F0]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-[10px] font-bold text-[#94A3B8]">New employer?</span>
              </div>
            </div>
            <Link
              href="/get-started"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-bold text-[#64748B] shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg"
            >
              Create Employer Account
            </Link>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 text-[10px] font-semibold text-[#94A3B8]">
              <Link href="/terms" className="transition hover:text-[#7C3AED]">Terms</Link>
              <span>&middot;</span>
              <Link href="/privacy-policy" className="transition hover:text-[#7C3AED]">Privacy</Link>
              <span>&middot;</span>
              <Link href="/contact" className="transition hover:text-[#7C3AED]">Support</Link>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
              <Sparkles size={10} className="text-[#7C3AED]" />
              <span>Powered by <span className="font-semibold text-[#7C3AED]">Prerana AI</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF, #C7D2FE)' }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />
        </div>
        <img
          src="/jobproviderloginimg.png"
          alt="Job Provider Portal"
          className="relative z-10 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
