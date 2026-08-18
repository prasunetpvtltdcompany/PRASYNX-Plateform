'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Briefcase,
  AlertCircle,
  EyeOff,
  Eye,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../lib/apiClient';

export default function JobProviderLoginPage() {
  const router = useRouter();
  const { session, isAuthenticated, isLoading, login } = useAuth();
  const [page, setPage] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', company_name: '', contact_name: '', phone: '', website: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/jobprovider');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-white">
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#6D4CFF]" />
      </div>
    );
  }

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (page === 'login') {
        const res = await apiClient.post<{ token: string; provider: any }>('/job-provider/login', {
          email: form.email,
          password: form.password,
        });
        if (!res.success || !res.data) {
          setError(res.error || 'Invalid email or password');
          return;
        }
        login(res.data.token, res.data.provider);
        router.push('/jobprovider');
      } else {
        const res = await apiClient.post<{ token: string; provider: any }>('/job-provider/register', {
          company_name: form.company_name,
          contact_name: form.contact_name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          website: form.website,
        });
        if (!res.success || !res.data) {
          setError(res.error || 'Registration failed');
          return;
        }
        login(res.data.token, res.data.provider);
        router.push('/jobprovider');
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-96 -left-96 h-[800px] w-[800px] rounded-full bg-indigo-500/5 blur-[150px]" />
        <div className="absolute -bottom-96 -right-96 h-[800px] w-[800px] rounded-full bg-purple-500/5 blur-[150px]" />
        <div className="absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/3 blur-[120px]" />
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
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E0E7FF] bg-indigo-50 px-3 py-1">
              <Briefcase size={11} className="text-indigo-600" />
              <span className="text-[10px] font-bold text-indigo-600">Job Provider Portal</span>
            </div>
            <h1 className="text-2xl font-black text-[#0F172A] sm:text-3xl">Welcome Back</h1>
            <p className="mt-1.5 text-sm text-[#64748B]">Sign in to your employer account to manage jobs and candidates</p>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
                <AlertCircle size={14} /> {error}
              </motion.div>
            )}
            <div className="flex items-center gap-2 mb-6">
              <button onClick={() => setPage('login')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${page === 'login' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-[#F1F5F9] text-[#64748B]'}`}>Login</button>
              <button onClick={() => setPage('register')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${page === 'register' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-[#F1F5F9] text-[#64748B]'}`}>Register</button>
            </div>
            <form className="space-y-3.5" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              {page === 'register' && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#475569]">Company Name</label>
                    <input className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                      placeholder="Company Name *" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#475569]">Contact Name</label>
                    <input className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                      placeholder="Contact Name *" value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} />
                  </div>
                </>
              )}
              <div>
                <label className="mb-1 block text-xs font-bold text-[#475569]">Company Email</label>
                <input type="email" className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                  placeholder="Enter your company email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-[#475569]">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 pr-10 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] transition hover:text-[#475569]">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              {page === 'register' && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#475569]">Phone</label>
                    <input className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                      placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#475569]">Website</label>
                    <input className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                      placeholder="Website" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)}
                    className="h-4 w-4 rounded border-[#CBD5E1] text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-xs font-semibold text-[#64748B]">Remember me</span>
                </label>
                <Link href="/auth/reset-password"
                  className="text-xs font-bold text-indigo-600 transition hover:text-indigo-700">Forgot Password?</Link>
              </div>

              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                type="submit" disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> {page === 'login' ? 'Sign In' : 'Create Account'}</>}
              </motion.button>
            </form>

            <div className="mt-5 space-y-3">
              <div className="text-center">
                <p className="text-xs text-[#94A3B8]">Having trouble signing in?</p>
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
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />
        <img src="/jobprovider/jobproviderloginimg.png" alt="Job Provider Portal" className="h-full w-full object-contain p-8" />
      </motion.div>
    </div>
  );
}