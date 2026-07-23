'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Eye, EyeOff, CheckCircle2, Sparkles, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginWithBackend, storeSession } from '../../../services/backend-auth';

export default function ParentLogin() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ parentId: '', password: '', schoolCode: '' });
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="flex h-dvh overflow-hidden bg-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-96 -left-96 h-[800px] w-[800px] rounded-full bg-green-500/5 blur-[150px]" />
        <div className="absolute -bottom-96 -right-96 h-[800px] w-[800px] rounded-full bg-emerald-500/5 blur-[150px]" />
        <div className="absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-green-500/3 blur-[120px]" />
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

          <div className="mb-6 text-center lg:text-left">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#DCFCE7] bg-green-50 px-3 py-1">
              <Sparkles size={11} className="text-green-600" />
              <span className="text-[10px] font-bold text-green-600">Parent Portal</span>
            </div>
            <h1 className="text-2xl font-black text-[#0F172A] sm:text-3xl">Welcome Back</h1>
            <p className="mt-1.5 text-sm text-[#64748B]">
              Sign in to stay connected with your child&apos;s education journey.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
                <AlertCircle size={14} /> {error}
              </motion.div>
            )}
            <form className="space-y-3.5" onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              if (!form.parentId || !form.password) {
                setError('Please enter Parent ID and Password.');
                return;
              }
              setLoading(true);
              const { error: authError, data: authData } = await loginWithBackend('parent', form.parentId, form.password);
              setLoading(false);
              if (authError) {
                setError(authError);
                return;
              }
              if (authData) {
                storeSession(authData.token, authData.user);
                router.push('/parent/dashboard');
              }
            }}>
              <div>
                <label className="mb-1 block text-xs font-bold text-[#475569]">Parent ID</label>
                <input
                  type="text"
                  value={form.parentId}
                  onChange={update('parentId')}
                  placeholder="Enter your Parent ID"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-green-500 focus:ring-2 focus:ring-green-500/15"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#475569]">Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={update('password')}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 pr-10 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-green-500 focus:ring-2 focus:ring-green-500/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] transition hover:text-[#475569]"
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#475569]">School Code</label>
                <input
                  type="text"
                  value={form.schoolCode}
                  onChange={update('schoolCode')}
                  placeholder="Enter your school code"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-green-500 focus:ring-2 focus:ring-green-500/15"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={() => setRemember(!remember)}
                    className="h-4 w-4 rounded border-[#CBD5E1] text-green-600 focus:ring-green-500"
                  />
                  <span className="text-xs font-semibold text-[#64748B]">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-green-600 transition hover:text-green-700"
                >
                  Forgot Password?
                </Link>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> Sign In</>}
              </motion.button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-xs font-semibold text-[#94A3B8]">
                Having trouble signing in?{' '}
                <Link href="/contact" className="font-bold text-green-600 transition hover:text-green-700">
                  Contact Support
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold text-[#94A3B8]">
            <span className="flex items-center gap-1"><CheckCircle2 size={11} className="text-green-500" /> SSL Secured</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={11} className="text-green-500" /> End-to-End Encrypted</span>
            <span className="flex items-center gap-1"><Users size={11} className="text-green-500" /> 10K+ Parents</span>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#94A3B8]">
            <Sparkles size={10} className="text-[#7C3AED]" />
            <span>Powered by <span className="font-semibold text-[#7C3AED]">Prerana AI</span></span>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-green-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-green-500/8 blur-3xl" />
        </div>
        <img src="/parentportalhero.png" alt="Parent Portal" className="h-full w-full object-contain p-8" />
      </motion.div>
    </div>
  );
}
