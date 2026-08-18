'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Heart, Mail, KeyRound, Eye, EyeOff, Loader2, ArrowRight, Sparkles,
  Shield, Lock, BellRing, BookOpen, Bus, Wallet, CheckCircle2, AlertCircle,
  ChevronLeft, GraduationCap, Users,
} from 'lucide-react';
import apiClient from '../lib/apiClient';
import { createClient } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const item = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as any } },
};

const features = [
  { icon: BookOpen, label: 'Real-time academic progress & report cards' },
  { icon: BellRing, label: 'Instant attendance, homework & exam alerts' },
  { icon: Wallet, label: 'Transparent fee tracking & easy payments' },
  { icon: Bus, label: 'Transport, health & school updates in one place' },
];

export default function ParentLoginPage() {
  const { session, isReady, login: authLogin } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [spot, setSpot] = useState({ x: 50, y: 50 });
  const [mounted, setMounted] = useState(false);

  const particles = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 16 + 10,
        delay: Math.random() * 9,
        drift: Math.random() * 40 - 20,
        heart: Math.random() > 0.75,
      })),
    []
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isReady && session) {
      window.location.href = '/parent';
    }
  }, [isReady, session]);

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
        const { token, parent, user, students } = res.data as any;
        if (!user || user.role !== 'parent') {
          setError('Invalid portal. Please use the correct login portal.');
          setLoading(false);
          return;
        }
        try {
          const supabase = createClient();
          await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
          });
        } catch (sbErr) {
          console.error('Supabase login warning:', sbErr);
        }
        authLogin(token, parent || {}, user, students || []);
        window.location.href = '/parent';
      } else {
        setError(res.error || 'Login failed');
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 pl-11 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/30 backdrop-blur-sm focus:border-[#34D399]/60 focus:bg-white/[0.07] focus:shadow-[0_0_0_4px_rgba(52,211,153,0.15),0_0_30px_rgba(52,211,153,0.25)]';

  return (
    <div className="relative flex min-h-dvh overflow-hidden bg-[#040a08] text-white">
      {/* ====== Background FX ====== */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ x: [0, 60, -40, 0], y: [0, -40, 30, 0], scale: [1, 1.15, 0.95, 1] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-1/4 -left-1/4 h-[60vw] w-[60vw] rounded-full bg-[#10B981]/25 blur-[130px]"
        />
        <motion.div
          animate={{ x: [0, -50, 40, 0], y: [0, 50, -30, 0], scale: [1, 0.9, 1.1, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-1/4 top-1/4 h-[55vw] w-[55vw] rounded-full bg-[#F59E0B]/12 blur-[130px]"
        />
        <motion.div
          animate={{ x: [0, 40, -30, 0], y: [0, -30, 40, 0], scale: [1, 1.2, 1, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[-20%] left-1/3 h-[45vw] w-[45vw] rounded-full bg-[#22D3EE]/12 blur-[130px]"
        />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(16,185,129,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.07) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 90% 80% at 50% 40%, black 30%, transparent 75%)',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#040a08_90%)]" />
      </div>

      {/* Floating particles / hearts */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {mounted && particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute"
            style={{ left: `${p.left}%`, bottom: '-2%' }}
            animate={{ y: [0, -900], x: [0, p.drift], opacity: [0, 0.9, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
          >
            {p.heart ? (
              <Heart size={p.size * 4 + 4} fill="currentColor" className="text-[#F59E0B]/50" style={{ boxShadow: '0 0 8px rgba(245,158,11,0.5)' }} />
            ) : (
              <span
                className="block rounded-full bg-white/40"
                style={{ width: p.size, height: p.size, boxShadow: '0 0 8px rgba(255,255,255,0.5)' }}
              />
            )}
          </motion.span>
        ))}
      </div>

      <div className="relative z-10 grid min-h-dvh w-full lg:grid-cols-2">
        {/* ====== LEFT SHOWCASE ====== */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative hidden flex-col justify-between overflow-hidden p-12 xl:p-16 lg:flex"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: 'linear-gradient(135deg, rgba(16,185,129,0.10), transparent 40%, rgba(34,211,238,0.06))' }}
          />

          <motion.div variants={item} className="relative flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10B981] to-[#22D3EE] shadow-lg shadow-[#10B981]/40"
            >
              <GraduationCap size={22} className="text-white" />
            </motion.div>
            <div>
              <p className="text-lg font-black tracking-tight">
                Prasynx<span className="text-[#34D399]"> Parents</span>
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-white/40">Family Portal</p>
            </div>
          </motion.div>

          <div className="relative max-w-lg">
            <motion.div variants={item} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-sm">
              <Sparkles size={13} className="text-[#34D399]" />
              <span className="text-[11px] font-semibold tracking-wide text-white/70">Your Child&apos;s Journey, One View</span>
            </motion.div>
            <motion.h1 variants={item} className="text-5xl font-black leading-[1.05] tracking-tight xl:text-6xl">
              Stay close to{' '}
              <span className="bg-gradient-to-r from-[#6EE7B7] via-[#34D399] to-[#22D3EE] bg-clip-text text-transparent">
                every milestone
              </span>{' '}
              of learning.
            </motion.h1>
            <motion.p variants={item} className="mt-5 max-w-md text-sm leading-relaxed text-white/50">
              Grades, attendance, fees, and school updates — delivered in real time so you never miss a moment.
            </motion.p>

            <div className="mt-9 space-y-4">
              {features.map((f) => (
                <motion.div key={f.label} variants={item} className="group flex items-center gap-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition-all duration-300 group-hover:border-[#34D399]/50 group-hover:bg-[#10B981]/15 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                    <f.icon size={16} className="text-[#6EE7B7]" />
                  </div>
                  <span className="text-sm text-white/75">{f.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ====== RIGHT FORM ====== */}
        <div className="relative flex items-center justify-center px-5 py-10 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setSpot({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
            }}
            className="relative w-full max-w-md"
          >
            <div
              className="pointer-events-none absolute -inset-px rounded-[28px] opacity-70"
              style={{ background: `radial-gradient(500px circle at ${spot.x}% ${spot.y}%, rgba(16,185,129,0.35), transparent 45%)` }}
            />
            <div className="relative rounded-[28px] border border-white/10 bg-[#071310]/70 p-7 shadow-[0_0_80px_rgba(16,185,129,0.15)] backdrop-blur-2xl sm:p-9">
              <motion.div
                className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#34D399] to-transparent"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              <div className="mb-7 text-center lg:hidden">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10B981] to-[#22D3EE] shadow-lg shadow-[#10B981]/40">
                  <GraduationCap size={24} className="text-white" />
                </div>
                <p className="text-lg font-black tracking-tight">
                  Prasynx<span className="text-[#34D399]"> Parents</span>
                </p>
              </div>

              <div className="mb-7 text-center">
                <motion.div
                  animate={{ boxShadow: ['0 0 0px rgba(16,185,129,0.2)', '0 0 28px rgba(16,185,129,0.45)', '0 0 0px rgba(16,185,129,0.2)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#10B981]/30 to-[#22D3EE]/15 backdrop-blur-sm"
                >
                  <Heart size={26} className="text-[#6EE7B7]" />
                </motion.div>
                <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Welcome{' '}
                  <span className="bg-gradient-to-r from-[#6EE7B7] to-[#22D3EE] bg-clip-text text-transparent">Parents</span>
                </h2>
                <p className="mt-2 text-sm text-white/45">Sign in to stay connected with your child&apos;s education</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="mb-5 flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300 backdrop-blur-sm"
                >
                  <AlertCircle size={15} className="shrink-0" /> {error}
                </motion.div>
              )}

              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div className="group">
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/50">Email</label>
                  <div className="relative">
                    <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 transition-colors duration-300 group-focus-within:text-[#6EE7B7]" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@family.com"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/50">Password</label>
                  <div className="relative">
                    <KeyRound size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 transition-colors duration-300 group-focus-within:text-[#6EE7B7]" />
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 transition-colors hover:text-white/80"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex cursor-pointer items-center gap-2.5 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="peer h-4 w-4 appearance-none rounded-md border border-white/20 bg-white/5 transition-all checked:border-transparent checked:bg-gradient-to-br checked:from-[#10B981] checked:to-[#22D3EE]"
                    />
                    <span className="relative flex h-4 w-4 items-center justify-center">
                      <CheckCircle2 size={13} className="pointer-events-none absolute hidden text-white peer-checked:block" />
                    </span>
                    <span className="text-xs font-semibold text-white/60">Remember me</span>
                  </label>
                  <Link href="/auth/reset-password" className="text-xs font-bold text-[#6EE7B7] transition hover:text-[#22D3EE] hover:underline">
                    Forgot Password?
                  </Link>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                  className="group/btn relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#10B981] via-[#10B981] to-[#22D3EE] px-4 py-3.5 text-sm font-black tracking-wide text-white shadow-[0_8px_30px_rgba(16,185,129,0.35)] transition-all duration-300 hover:shadow-[0_8px_45px_rgba(16,185,129,0.55)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <span className="relative">Login Now</span>
                      <ArrowRight size={16} className="relative transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-4 text-[10px] text-white/35">
                <span className="flex items-center gap-1.5"><Shield size={11} /> SSL Secured</span>
                <span className="h-3 w-px bg-white/15" />
                <span className="flex items-center gap-1.5"><Lock size={11} /> 256-bit Encrypted</span>
                <span className="h-3 w-px bg-white/15" />
                <span className="flex items-center gap-1.5"><Users size={11} /> Family Safe</span>
              </div>

              <div className="mt-6 border-t border-white/5 pt-5 text-center">
                <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/45 transition hover:text-[#6EE7B7]">
                  <ChevronLeft size={13} /> Back to role selection
                </Link>
                <p className="mt-3 text-[9px] font-medium uppercase tracking-[0.3em] text-white/25">
                  Powered by <span className="text-[#22D3EE]">Prerana AI</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}