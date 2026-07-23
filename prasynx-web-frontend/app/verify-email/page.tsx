"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, Sparkles, Bot, Building2, GraduationCap, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createBrowserClient } from '@/lib/supabase/browser';
import type { UserRole } from '@/types';

export default function VerifyEmail() {
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient();

    supabase.auth.onAuthStateChange((event: string, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        setVerified(true);
        setChecking(false);
      }
    });

    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { email_confirmed_at?: string } | null } }) => {
      if (user?.email_confirmed_at) {
        setVerified(true);
      }
      setChecking(false);
    });
  }, []);

  const handleContinue = async () => {
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email_confirmed_at) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const dashboardMap: Record<string, string> = {
        student: '/student/dashboard',
        parent: '/parent/dashboard',
        teacher: '/staff/dashboard',
        institution: '/management/dashboard',
        recruiter: '/job-provider/dashboard',
        organization: '/organization/dashboard',
        admin: '/admin/dashboard',
      };

      router.push(dashboardMap[profile?.role || 'student'] || '/student/dashboard');
    } else {
      router.push('/');
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-12">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#F8FAFF] via-white to-[#F3F0FF]" />
        <div className="relative mx-auto w-full max-w-md text-center">
          <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
            <img src="/logo.png" alt="Prasynx" className="h-10 w-auto" />
          </Link>

          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            <span className={`mx-auto grid h-20 w-20 place-items-center rounded-full shadow-lg ${
              verified
                ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-green-200'
                : 'bg-amber-100 shadow-amber-200'
            }`}>
              <CheckCircle size={36} className={verified ? 'text-white' : 'text-amber-500'} />
            </span>
          </motion.div>

          <h1 className="mt-6 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
            {verified ? 'Email Verified!' : 'Verify Your Email'}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {verified
              ? 'Your email has been successfully verified. Your account is now active and you can access all Prasynx features.'
              : 'We have sent a verification link to your email. Please check your inbox and click the link to verify your account.'}
          </p>

          {verified && (
            <div className="mt-8 space-y-3 text-left">
              {[
                { icon: Sparkles, text: 'Personalized AI-powered dashboard' },
                { icon: GraduationCap, text: 'Access to courses, grades & career tools' },
                { icon: Bot, text: 'Prerana AI learning assistant ready' },
                { icon: Building2, text: 'Connect with institutions & recruiters' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="flex items-center gap-3 rounded-xl border border-[#E8E0FF] bg-[#F3F0FF] px-4 py-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-[#7C3AED] shadow-sm">
                      <Icon size={15} />
                    </span>
                    <span className="text-xs font-bold text-slate-700">{item.text}</span>
                  </div>
                );
              })}
            </div>
          )}

          {!verified && (
            <div className="mt-8 rounded-2xl border border-[#E8E0FF] bg-[#F3F0FF] p-4 text-xs text-slate-600">
              <p className="font-semibold">Didn&apos;t receive the email?</p>
              <p className="mt-1">Check your spam folder or request a new verification email.</p>
            </div>
          )}

          {verified && (
            <button onClick={handleContinue}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#7C3AED]/25 transition hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]">
              Continue to Dashboard <ArrowRight size={16} />
            </button>
          )}

          {!verified && (
            <Link href="/"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#7C3AED] hover:shadow-md hover:-translate-y-0.5">
              Back to Sign In
            </Link>
          )}
        </div>
      </div>

      <div className="relative hidden lg:flex lg:w-1/2">
        <div className={`absolute inset-0 bg-gradient-to-br ${verified ? 'from-green-500 via-emerald-600 to-teal-700' : 'from-amber-500 via-orange-500 to-red-500'}`} />
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-size-[24px_24px]" />
        </div>
        <div className="relative flex w-full flex-col items-center justify-center px-12 text-center">
          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-8 max-w-sm">
            {verified ? (
              <>
                <CheckCircle size={32} className="mx-auto text-white mb-3" />
                <h2 className="text-xl font-black text-white">Account Activated</h2>
                <p className="mt-2 text-sm text-white/70">You now have full access to the Prasynx Education OS.</p>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  {['Student Portal', 'Parent Portal', 'Teacher Workspace', 'Institution Manager'].map((item) => (
                    <div key={item} className="rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-[10px] font-bold text-white">
                      {item}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <Mail size={32} className="mx-auto text-white mb-3" />
                <h2 className="text-xl font-black text-white">Verification Required</h2>
                <p className="mt-2 text-sm text-white/70">Please verify your email address to activate your account and access all features.</p>
                <div className="mt-6 space-y-2 text-left">
                  {['Check your inbox', 'Click the verification link', 'Access your dashboard', 'Start learning'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-white/70">
                      <CheckCircle size={12} className="text-green-300 shrink-0" /> {item}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


