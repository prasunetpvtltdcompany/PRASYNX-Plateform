'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Shield, AlertCircle, Eye, EyeOff, Loader2, ArrowRight, Lock } from 'lucide-react';
import apiClient from '../lib/apiClient';
import { createClient } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function ManagementLoginPage() {
  const { session, isLoading, login: authLogin } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && session) {
      window.location.href = '/management';
    }
  }, [isLoading, session]);

  const handleSubmit = async () => {
    setError(null); setLoading(true);
    if (!form.email || !form.password) {
      setError('Please enter Email and Password.');
      setLoading(false);
      return;
    }
    try {
      const res = await apiClient.login(form.email, form.password);
      if (res.success && res.data) {
        try {
          const supabase = createClient();
          await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password
          });
        } catch (sbErr) {
          console.error("Supabase login warning:", sbErr);
        }
        authLogin(res.data.token, res.data.user, res.data.organisation, rememberMe);
        window.location.href = '/management';
      } else {
        setError(res.error || 'Login failed');
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-96 -left-96 h-[800px] w-[800px] rounded-full bg-purple-500/5 blur-[150px]" />
        <div className="absolute -bottom-96 -right-96 h-[800px] w-[800px] rounded-full bg-purple-500/5 blur-[150px]" />
        <div className="absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-500/3 blur-[120px]" />
      </div>

      <div className="relative flex w-full flex-col justify-center overflow-y-auto px-4 py-8 lg:w-1/2 lg:px-12">
        <div className="mx-auto w-full max-w-sm sm:max-w-md">
          <Link
            href="/auth/login"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] transition hover:text-[#7C3AED]"
          >
            <ChevronLeft size={14} />
            Back to role selection
          </Link>

          <div className="mb-6 text-center lg:text-left">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#EDE9FE] bg-purple-50 px-3 py-1">
              <Shield size={11} className="text-purple-600" />
              <span className="text-[10px] font-bold text-purple-600">Management Portal</span>
            </div>
            <h1 className="text-2xl font-black text-[#0F172A] sm:text-3xl">Welcome Back</h1>
            <p className="mt-1.5 text-sm text-[#64748B]">Sign in to your management account to oversee school operations</p>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
                <AlertCircle size={14} /> {error}
              </motion.div>
            )}
            <form className="space-y-3.5" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <div>
                <label className="mb-1 block text-xs font-bold text-[#475569]">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-[#475569]">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 pr-10 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)}
                    className="h-4 w-4 rounded border-[#CBD5E1] text-purple-600 focus:ring-purple-500" />
                  <span className="text-xs font-semibold text-[#475569]">Remember me</span>
                </label>
                <Link href="/auth/reset-password" className="text-xs font-bold text-purple-600 transition hover:text-purple-700 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <motion.button type="submit" disabled={loading}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition hover:from-purple-700 hover:to-purple-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> Sign In</>}
              </motion.button>
            </form>
          </div>

          <div className="mt-4 text-center">
            <button type="button" onClick={() => window.location.href = 'mailto:support@prasunet.com'}
              className="text-xs font-semibold text-[#64748B] transition hover:text-purple-600">
              Need help? Contact Support
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-[#94A3B8]">
            <span className="flex items-center gap-1"><Lock size={11} /> SSL Secured</span>
            <span className="flex items-center gap-1"><Shield size={11} /> 256-bit Encrypted</span>
          </div>

          <div className="mt-6 text-center">
            <span className="text-[9px] font-medium tracking-wider text-[#CBD5E1] uppercase">Powered by Prerana AI</span>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative hidden lg:flex lg:w-1/2 items-center justify-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5" />
        <img src="/adminlogin.png" alt="Management Portal" className="h-full w-full object-contain p-8" />
      </motion.div>
    </div>
  );
}
