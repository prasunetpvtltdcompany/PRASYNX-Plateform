'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Eye, EyeOff, Lock, CheckCircle2, Sparkles, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginWithBackend, storeSession } from '../../../services/backend-auth';

export default function StaffLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!staffId || !password) {
      setError('Please enter Staff ID and Password.');
      return;
    }
    setLoading(true);
    const { error: authError, data: authData } = await loginWithBackend('teacher', staffId, password);
    setLoading(false);
    if (authError) {
      setError(authError);
      return;
    }
    if (authData) {
      storeSession(authData.token, authData.user);
      router.push('/staff/dashboard');
    }
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-96 -left-96 h-[800px] w-[800px] rounded-full bg-orange-500/5 blur-[150px]" />
        <div className="absolute -bottom-96 -right-96 h-[800px] w-[800px] rounded-full bg-amber-500/5 blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/3 blur-[120px]" />
      </div>

      <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center">
        <img src="/teacherloginimg.png" alt="Staff Portal" className="h-full w-full object-contain p-8" />
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

          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
              <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-orange-500/5 blur-[60px]" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-orange-500/5 blur-[60px]" />

              <div className="relative">
                <div className="mb-5 text-center">
                  <div className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full border border-[#FFEDD5] bg-orange-50 px-3 py-1">
                    <Sparkles size={11} className="text-orange-600" />
                    <span className="text-[10px] font-bold text-orange-600">Staff Portal</span>
                  </div>
                  <h2 className="text-xl font-black text-[#0F172A]">Staff Login</h2>
                  <p className="mt-1 text-xs text-[#64748B]">Sign in with your staff credentials</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
                      <AlertCircle size={14} /> {error}
                    </motion.div>
                  )}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#475569]">Staff ID</label>
                    <input
                      type="text"
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      placeholder="Enter your staff ID"
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#475569]">Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 pl-9 pr-10 text-sm font-semibold text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] transition hover:text-[#475569]"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#475569]">School Code</label>
                    <input
                      type="text"
                      value={schoolCode}
                      onChange={(e) => setSchoolCode(e.target.value)}
                      placeholder="Enter your school code"
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={() => setRemember(!remember)}
                        className="h-4 w-4 rounded border-[#CBD5E1] text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-xs font-semibold text-[#64748B]">Remember me</span>
                    </label>
                    <Link
                      href="/staff/forgot-password"
                      className="text-xs font-bold text-orange-600 transition hover:text-orange-700"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> Sign In</>}
                  </motion.button>
                </form>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[10px] font-semibold text-[#94A3B8]">
              <span className="flex items-center gap-1"><Lock size={10} /> SSL Secured</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={10} /> Encrypted</span>
              <span className="flex items-center gap-1"><BookOpen size={10} /> Staff Portal</span>
            </div>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#94A3B8]">
              <Sparkles size={10} className="text-[#7C3AED]" />
              <span>Powered by <span className="font-semibold text-[#7C3AED]">Prerana AI</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
