'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap, Eye, EyeOff, CheckCircle2, Sparkles, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginWithBackend, storeSession } from '../../../services/backend-auth';

export default function StudentLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ studentId: '', password: '', schoolCode: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex h-dvh overflow-hidden bg-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-96 -left-96 h-[800px] w-[800px] rounded-full bg-blue-500/5 blur-[150px]" />
        <div className="absolute -bottom-96 -right-96 h-[800px] w-[800px] rounded-full bg-purple-500/5 blur-[150px]" />
        <div className="absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/3 blur-[120px]" />
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
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#DBEAFE] bg-blue-50 px-3 py-1">
              <GraduationCap size={11} className="text-blue-600" />
              <span className="text-[10px] font-bold text-blue-600">Student Portal</span>
            </div>
            <h1 className="text-2xl font-black text-[#0F172A] sm:text-3xl">Welcome Back!</h1>
            <p className="mt-1.5 text-sm text-[#64748B]">Sign in to access your academic dashboard</p>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
                <AlertCircle size={14} /> {error}
              </motion.div>
            )}
            <form onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              if (!formData.studentId || !formData.password) {
                setError('Please enter Student ID and Password.');
                return;
              }
              setLoading(true);
              const { error: authError, data: authData } = await loginWithBackend('student', formData.studentId, formData.password);
              setLoading(false);
              if (authError) {
                setError(authError);
                return;
              }
              if (authData) {
                storeSession(authData.token, authData.user);
                router.push('/student/dashboard');
              }
            }} className="space-y-3.5">
              <div>
                <label className="mb-1 block text-xs font-bold text-[#475569]">Student ID</label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="Enter your student ID"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#475569]">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 pr-10 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] transition hover:text-[#475569]"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#475569]">School Code</label>
                <input
                  type="text"
                  value={formData.schoolCode}
                  onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
                  placeholder="Enter your school code"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="h-4 w-4 rounded border-[#CBD5E1] text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-[#64748B]">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-blue-600 transition hover:text-blue-700"
                >
                  Forgot Password?
                </Link>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> Sign In</>}
              </motion.button>
            </form>

            <div className="mt-5 space-y-3">
              <div className="text-center">
                <p className="text-xs text-[#94A3B8]">
                  Having trouble signing in?{' '}
                  <Link href="/contact" className="font-bold text-blue-600 transition hover:text-blue-700">
                    Contact Support
                  </Link>
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-[#94A3B8]">
                <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-green-500" /> SSL Secured</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-green-500" /> 256-bit Encrypted</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-[#94A3B8]">
            <Sparkles size={10} className="text-[#7C3AED]" />
            <span>Powered by <span className="font-semibold text-[#7C3AED]">Prerana AI</span></span>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative hidden lg:flex lg:w-1/2 items-center justify-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
        <img src="/studentloginimg.png" alt="Student Portal" className="h-full w-full object-contain p-8" />
      </motion.div>
    </div>
  );
}
