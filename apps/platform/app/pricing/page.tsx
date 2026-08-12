"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, CheckCircle2, ChevronDown, Star, Sparkles, Shield,
  GraduationCap, Users, Building2, Bot, BookOpen, BarChart3, Zap,
  Globe, Lock, Award, TrendingUp, Server, Cloud, Activity, Quote,
  ChevronRight, Check,
} from 'lucide-react';
import Link from 'next/link';
import SiteShell from '../components/SiteShell';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
};

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); return; }
      setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, value]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const plans = [
  {
    name: 'Starter',
    icon: Star,
    priceMonthly: 10000,
    priceYearly: 8500,
    description: 'Essential school management tools for small schools with up to 200 students.',
    features: ['Student Database', 'Attendance Tracking', 'Basic Reports', 'Teacher Portal', 'Parent Communication', 'Email Support'],
    cta: 'Get Started',
    popular: false,
    color: '#6C4CF1',
  },
  {
    name: 'Growth',
    icon: TrendingUp,
    priceMonthly: 25000,
    priceYearly: 21000,
    description: 'Advanced features for growing schools with up to 500 students and staff.',
    features: ['Everything in Starter', 'Gradebook & Exams', 'AI Reports & Insights', 'LMS Access', 'Fee Management', 'Priority Support'],
    cta: 'Start Free Trial',
    popular: true,
    color: '#8B5CF6',
  },
  {
    name: 'Premium',
    icon: Award,
    priceMonthly: 50000,
    priceYearly: 42000,
    description: 'Full ecosystem for large schools with up to 1,000+ students and multi-classroom management.',
    features: ['Everything in Growth', 'Prerana AI Premium', 'HR & Payroll', 'Advanced Analytics', 'Custom Branding', 'Dedicated Support'],
    cta: 'Contact Sales',
    popular: false,
    color: '#6C4CF1',
  },
  {
    name: 'Enterprise',
    icon: Shield,
    priceMonthly: null,
    priceYearly: null,
    description: 'Custom solutions for multi-campus institutions, chains, and districts with unlimited scale.',
    features: ['Everything in Premium', 'Multi-Campus Support', 'White Label Platform', 'API Access', 'Dedicated Manager', 'Custom Integrations'],
    cta: 'Book Demo',
    popular: false,
    color: '#A855F7',
  },
];

const compareFeatures = [
  { name: 'Student Database', starter: true, growth: true, premium: true, enterprise: true },
  { name: 'Attendance Tracking', starter: true, growth: true, premium: true, enterprise: true },
  { name: 'Teacher Portal', starter: true, growth: true, premium: true, enterprise: true },
  { name: 'Parent Communication', starter: true, growth: true, premium: true, enterprise: true },
  { name: 'Gradebook & Exams', starter: false, growth: true, premium: true, enterprise: true },
  { name: 'LMS Access', starter: false, growth: true, premium: true, enterprise: true },
  { name: 'AI Reports & Insights', starter: false, growth: true, premium: true, enterprise: true },
  { name: 'Fee Management', starter: false, growth: true, premium: true, enterprise: true },
  { name: 'HR & Payroll', starter: false, growth: false, premium: true, enterprise: true },
  { name: 'Advanced Analytics', starter: false, growth: false, premium: true, enterprise: true },
  { name: 'API Access', starter: false, growth: false, premium: false, enterprise: true },
  { name: 'White Label Platform', starter: false, growth: false, premium: false, enterprise: true },
  { name: 'Multi-Campus Support', starter: false, growth: false, premium: false, enterprise: true },
  { name: 'Custom Integrations', starter: false, growth: false, premium: false, enterprise: true },
];

const testimonials = [
  {
    name: 'Mr. Vikram Singh', role: 'Principal, St. Mary\'s School', avatar: 'https://i.pravatar.cc/150?u=vikram', rating: 5,
    content: 'The Growth plan gave us everything we needed — attendance, gradebook, parent communication — at a price that fit our budget perfectly.',
    color: '#8B5CF6',
  },
  {
    name: 'Dr. Anjali Mehta', role: 'Director, Sunshine Academy Chain', avatar: 'https://i.pravatar.cc/150?u=anjali', rating: 5,
    content: 'Enterprise-grade security with white-label branding allowed us to scale across 5 campuses seamlessly.',
    color: '#A855F7',
  },
  {
    name: 'Rajesh Kumar', role: 'Admin Head, Bright Future School', avatar: 'https://i.pravatar.cc/150?u=rajesh', rating: 5,
    content: 'Switching to Prasynx Premium transformed how we manage HR, academics, and analytics. Dedicated support made the transition smooth.',
    color: '#6C4CF1',
  },
];

const faqs = [
  { q: 'Is there a free trial?', a: 'Yes! We offer a 14-day free trial on all plans with no credit card required. Experience the full power of Prasynx risk-free.' },
  { q: 'Can I switch plans later?', a: 'Absolutely. You can upgrade or downgrade your plan anytime. Changes take effect immediately and we prorate the difference.' },
  { q: 'Do institutions receive onboarding support?', a: 'Yes, every Institution and Enterprise plan includes dedicated onboarding support, training sessions, and a success manager.' },
  { q: 'Is my data secure with Prasynx?', a: 'Absolutely. We use enterprise-grade encryption, SOC 2 compliant infrastructure, and strict RBAC to keep your data safe.' },
  { q: 'Do you offer discounts for institutions?', a: 'Yes, we offer volume discounts for multi-campus institutions and long-term commitments. Contact our sales team for a custom quote.' },
  { q: 'Can I customize the platform?', a: 'Enterprise plans include white-label customization, custom integrations, and dedicated development support for your specific needs.' },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <SiteShell>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 60%, #F4F1FF 100%)' }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-[#6C4CF1]/10 blur-[120px]" />
          <div className="absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-[#A855F7]/8 blur-[100px]" />
          <div className="absolute top-1/3 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDUwIDAgTCAwIDAgMCA1MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNkM0Q0YxIiBzdHJva2Utd2lkdGg9IjAuNSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDYiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E8E0FF] bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-[#A855F7]" />
            <span className="text-xs font-extrabold" style={{ color: '#4F2DB8' }}>Simple Pricing. Powerful Impact.</span>
          </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
              className="text-[clamp(2.2rem,4.5vw,3.5rem)] font-extrabold leading-[1.1] tracking-tight" style={{ color: '#0F172A' }}>
              Simple, Transparent Pricing For{' '}
              <span className="bg-gradient-to-r from-[#6C4CF1] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">Every School</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed" style={{ color: '#475569' }}>
              Plans starting at ₹10,000/month. Empower your school with AI-powered tools for students, teachers, and parents — all on one unified platform.
            </motion.p>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-10 flex items-center justify-center gap-4">
            <span className={`text-sm font-semibold transition-colors ${!annual ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>Monthly</span>
            <button type="button" onClick={() => setAnnual(!annual)}
              className={`relative h-7 w-12 rounded-full transition-colors ${annual ? 'bg-[#6C4CF1]' : 'bg-[#E2E8F0]'}`}>
              <span className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${annual ? 'translate-x-5' : ''}`} />
            </button>
            <span className={`text-sm font-semibold transition-colors ${annual ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>Annual</span>
            <span className="rounded-full bg-[#6C4CF1]/10 px-3 py-1 text-[11px] font-bold text-[#6C4CF1]">Save 20%</span>
          </motion.div>
        </div>
      </section>

      {/* ===== PRICING CARDS ===== */}
      <section className="relative -mt-8 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-4">
            {plans.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`group relative rounded-3xl border transition-all duration-300 ${plan.popular
                  ? 'border-[#6C4CF1]/30 bg-gradient-to-b from-[#6C4CF1] to-[#7C3AED] text-white shadow-2xl shadow-[#6C4CF1]/25 scale-[1.02] lg:scale-105'
                  : 'border-[#E2E8F0] bg-white hover:-translate-y-1 hover:border-[#6C4CF1]/20 hover:shadow-xl hover:shadow-[#6C4CF1]/5'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#A855F7] to-[#D946EF] px-4 py-1 text-[10px] font-bold text-white shadow-lg">
                    🔥 Most Popular
                  </div>
                )}
                <div className="p-6 sm:p-7">
                  <div className={`grid h-12 w-12 place-items-center rounded-xl ${plan.popular ? 'bg-white/20 text-white' : 'bg-[#F3F0FF] text-[#6C4CF1]'} transition-all group-hover:scale-105`}>
                    <plan.icon size={24} />
                  </div>
                  <h3 className={`mt-5 text-xl font-extrabold ${plan.popular ? 'text-white' : ''}`} style={{ color: plan.popular ? undefined : '#0F172A' }}>{plan.name}</h3>
                  <p className={`mt-1.5 text-sm leading-relaxed ${plan.popular ? 'text-white/70' : ''}`} style={{ color: plan.popular ? undefined : '#64748B' }}>{plan.description}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    {plan.priceMonthly ? (
                      <>
                        <span className={`text-4xl font-black ${plan.popular ? 'text-white' : ''}`} style={{ color: plan.popular ? undefined : '#0F172A' }}>
                          ₹{annual ? plan.priceYearly.toLocaleString() : plan.priceMonthly.toLocaleString()}
                        </span>
                        <span className={`text-sm font-semibold ${plan.popular ? 'text-white/60' : ''}`} style={{ color: plan.popular ? undefined : '#94A3B8' }}>/month</span>
                      </>
                    ) : (
                      <span className={`text-4xl font-black ${plan.popular ? 'text-white' : ''}`} style={{ color: plan.popular ? undefined : '#0F172A' }}>Custom</span>
                    )}
                  </div>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 size={16} className={`mt-0.5 shrink-0 ${plan.popular ? 'text-green-300' : 'text-green-500'}`} />
                        <span className={plan.popular ? 'text-white/80' : ''} style={{ color: plan.popular ? undefined : '#475569' }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.name === 'Enterprise' ? '/book-demo' : '/book-demo'}
                    className={`mt-8 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${plan.popular
                      ? 'bg-white text-[#6C4CF1] shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]'
                      : 'border border-[#E2E8F0] text-[#475569] hover:border-[#6C4CF1]/30 hover:text-[#6C4CF1] hover:shadow-md'}`}>
                    {plan.cta}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMPARE PLANS ===== */}
      <section className="px-4 py-20 sm:px-6 lg:px-8" style={{ background: '#F8FAFF' }}>
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp} className="mx-auto mb-12 max-w-2xl text-center">
            <span className="eyebrow mb-4">Compare Plans</span>
            <h2 className="section-title mt-3">Find the Perfect Plan That Fits Your Needs</h2>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Features</th>
                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Starter</th>
                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#6C4CF1] bg-[#F3F0FF]">Growth</th>
                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Premium</th>
                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {compareFeatures.map((feat, i) => (
                    <tr key={feat.name} className={`border-b border-[#F1F5F9] transition hover:bg-[#F8FAFF] ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                      <td className="px-5 py-3.5 text-sm font-semibold text-[#0F172A]">{feat.name}</td>
                      {['starter', 'growth', 'premium', 'enterprise'].map((tier) => (
                          <td key={tier} className={`px-5 py-3.5 text-center ${tier === 'growth' ? 'bg-[#F3F0FF]/50' : ''}`}>
                          {feat[tier as keyof typeof feat] ? (
                            <Check size={16} className="mx-auto text-green-500" />
                          ) : (
                            <span className="text-[#CBD5E1]">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: 50000, suffix: '+', label: 'Students', icon: Users, color: '#6C4CF1' },
              { value: 500, suffix: '+', label: 'Institutions', icon: Building2, color: '#8B5CF6' },
              { value: 95, suffix: '%', label: 'Success Rate', icon: TrendingUp, color: '#10B981' },
              { value: 247, suffix: '', label: 'AI Support', icon: Bot, color: '#A855F7', custom: '24/7' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}
                className="group relative rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#6C4CF1]/5">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl" style={{ background: `${stat.color}12` }}>
                  <stat.icon size={22} style={{ color: stat.color }} />
                </div>
                <div className="mt-3 text-3xl font-black" style={{ color: stat.color }}>
                  {stat.custom || <AnimatedCounter value={stat.value} suffix={stat.suffix} />}
                </div>
                <p className="mt-1 text-sm font-semibold" style={{ color: '#64748B' }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="px-4 py-20 sm:px-6 lg:px-8" style={{ background: '#F8FAFF' }}>
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mx-auto mb-12 max-w-2xl text-center">
            <span className="eyebrow mb-4">Testimonials</span>
            <h2 className="section-title mt-3">What Our Users Say</h2>
            <p className="section-subtitle mx-auto mt-3">Real stories from real learners and educators.</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}
                className="group rounded-2xl border border-[#E2E8F0] bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#6C4CF1]/5">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, ri) => (
                    <Star key={ri} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed italic" style={{ color: '#475569' }}>&ldquo;{t.content}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-xl object-cover ring-2 ring-white shadow-sm" />
                  <div>
                    <div className="text-sm font-extrabold" style={{ color: '#0F172A' }}>{t.name}</div>
                    <div className="text-xs font-semibold" style={{ color: '#94A3B8' }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <motion.div {...fadeUp} className="mx-auto mb-12 max-w-2xl text-center">
            <span className="eyebrow mb-4">FAQ</span>
            <h2 className="section-title mt-3">Frequently Asked Questions</h2>
            <p className="section-subtitle mx-auto mt-3">Everything you need to know about Prasynx pricing.</p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-[#E2E8F0] bg-white transition-all hover:border-[#6C4CF1]/20 hover:shadow-md">
                <button type="button" onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left">
                  <span className="text-sm font-extrabold" style={{ color: '#0F172A' }}>{faq.q}</span>
                  <ChevronDown size={16} className={`shrink-0 text-[#94A3B8] transition-transform duration-200 ${faqOpen === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {faqOpen === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-hidden">
                      <p className="px-6 pb-4 text-sm leading-relaxed" style={{ color: '#64748B' }}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </SiteShell>
  );
}
