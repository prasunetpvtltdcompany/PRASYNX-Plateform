"use client";
import {
  ArrowRight, Sparkles, Users, Building2, Star, Bot, Shield, CheckCircle,
  MessageCircle, Quote, GraduationCap, BookOpen, Briefcase, BarChart3,
  TrendingUp, Award, Heart, Gift, Zap, Layers, Smartphone,
  Clock, ChevronDown, Globe, Target, Lightbulb, Rocket, Infinity as InfinityIcon
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SiteShell from '../components/SiteShell';
import { PageMain } from '../components/MarketingSections';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
};

const stagger = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-30px' },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
};

const roles = [
  {
    icon: GraduationCap, title: 'Student', color: '#7C3AED', benefits: ['Personalized learning paths', 'AI course recommendations', 'Internship matching', 'Career guidance'],
    desc: 'Access courses, track grades, get AI-powered recommendations, and discover career opportunities tailored to you.',
  },
  {
    icon: Users, title: 'Parent', color: '#8B5CF6', benefits: ['Real-time progress tracking', 'Teacher communication', 'Fee management', 'Attendance alerts'],
    desc: 'Stay connected to your child\'s education journey with real-time updates on performance, attendance, and school activities.',
  },
  {
    icon: BookOpen, title: 'Teacher', color: '#A855F7', benefits: ['Automated attendance', 'Grade management', 'Lesson planning', 'Performance analytics'],
    desc: 'Streamline your workflow with automated attendance, digital gradebooks, lesson planning tools, and student insights.',
  },
  {
    icon: Building2, title: 'Institution', color: '#6D28D9', benefits: ['Complete ERP system', 'Multi-campus management', 'Compliance tools', 'Analytics dashboard'],
    desc: 'Manage your entire institution with a unified platform covering admissions, academics, HR, payroll, and compliance.',
  },
  {
    icon: Briefcase, title: 'Recruiter', color: '#7C3AED', benefits: ['AI-matched candidates', 'Skill verification', 'Interview scheduling', 'Talent analytics'],
    desc: 'Find top talent with AI-powered matching, verify skills, schedule interviews, and build your dream team.',
  },
  {
    icon: Building2, title: 'Organization', color: '#8B5CF6', benefits: ['Corporate training', 'Employee development', 'Certification tracking', 'Performance metrics'],
    desc: 'Upskill your workforce with corporate training programs, certification tracking, and employee development analytics.',
  },
];

const features = [
  { icon: Bot, title: 'AI Learning Assistant', desc: 'Get personalized recommendations, automated feedback, and intelligent tutoring powered by Prerana AI.', color: '#7C3AED' },
  { icon: TrendingUp, title: 'Career Guidance', desc: 'Discover career paths, skill assessments, internship opportunities, and job matching tailored to your goals.', color: '#8B5CF6' },
  { icon: Briefcase, title: 'Internship & Job Opportunities', desc: 'Access curated opportunities from top employers with AI-powered matching and application tracking.', color: '#A855F7' },
  { icon: Building2, title: 'Institution Management', desc: 'Complete ERP with admissions, academics, HR, payroll, exams, and compliance — all in one platform.', color: '#6D28D9' },
  { icon: Target, title: 'Recruitment Tools', desc: 'Find, verify, and hire top talent with AI matching, skill assessments, and streamlined interview workflows.', color: '#7C3AED' },
  { icon: BarChart3, title: 'Performance Analytics', desc: 'Real-time dashboards with predictive insights, custom reports, and data visualization for informed decisions.', color: '#8B5CF6' },
  { icon: MessageCircle, title: 'Communication Hub', desc: 'Integrated messaging, notifications, announcements, and video conferencing connecting all stakeholders.', color: '#A855F7' },
  { icon: Award, title: 'Certification Tracking', desc: 'Issue, verify, and manage digital certificates, badges, and credentials with blockchain-backed security.', color: '#6D28D9' },
];

const onboardingSteps = [
  { step: '1', title: 'Create Account', desc: 'Sign up with your email or social login in under 60 seconds. No credit card required.', color: '#7C3AED' },
  { step: '2', title: 'Choose Your Role', desc: 'Select how you want to use Prasynx — as a student, parent, teacher, institution, recruiter, or organization.', color: '#8B5CF6' },
  { step: '3', title: 'Complete Profile', desc: 'Tell us about yourself so we can personalize your experience with AI-powered recommendations.', color: '#A855F7' },
  { step: '4', title: 'Access Your Dashboard', desc: 'Get instant access to your personalized dashboard with relevant tools, insights, and opportunities.', color: '#6D28D9' },
  { step: '5', title: 'Start Growing', desc: 'Explore courses, track progress, connect with opportunities, and achieve your goals with Prerana AI.', color: '#7C3AED' },
];

const whyUs = [
  { icon: Bot, title: 'AI Powered Platform', desc: 'Prerana AI powers personalized learning, predictive analytics, and intelligent automation across the entire ecosystem.', stat: '94% accuracy' },
  { icon: Globe, title: 'Unified Ecosystem', desc: 'One platform connecting students, parents, teachers, institutions, and recruiters in a seamless experience.', stat: '8+ portals' },
  { icon: TrendingUp, title: 'Career Growth Tools', desc: 'Skill assessments, AI job matching, internship placement, and career counseling to accelerate your future.', stat: '10K+ opportunities' },
  { icon: Shield, title: 'Enterprise Security', desc: 'Bank-grade encryption, GDPR compliance, and 99.97% uptime ensure your data is always safe and available.', stat: '99.97% uptime' },
  { icon: Target, title: 'Institution Solutions', desc: 'Complete ERP covering admissions, academics, HR, payroll, exams, compliance, and multi-campus management.', stat: '500+ institutions' },
  { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Live dashboards with predictive insights, custom reports, and data visualization for every stakeholder.', stat: '1M+ data points' },
];

const testimonials = [
  { text: 'Prasynx completely transformed how I manage my courses and track my career growth. The AI recommendations are incredibly accurate.', name: 'Rohan Mehta', role: 'Computer Science Student', type: 'Student', avatar: 'https://i.pravatar.cc/80?img=23' },
  { text: 'As a parent, the real-time updates on my child\'s progress and direct communication with teachers have been invaluable.', name: 'Anita Desai', role: 'Parent', type: 'Parent', avatar: 'https://i.pravatar.cc/80?img=22' },
  { text: 'The teacher workspace saved me 10+ hours per week. Automated attendance and grade management let me focus on teaching.', name: 'Rajiv Verma', role: 'Physics Teacher', type: 'Teacher', avatar: 'https://i.pravatar.cc/80?img=25' },
  { text: 'Implementing Prasynx across our 12 campuses was seamless. The multi-tenant architecture is exactly what we needed.', name: 'Dr. Suresh Kumar', role: 'Director, VIT University', type: 'Institution', avatar: 'https://i.pravatar.cc/80?img=21' },
  { text: 'We found exceptional candidates through Prasynx\'s AI matching. The quality and speed of hiring improved dramatically.', name: 'Meera Reddy', role: 'HR Director', type: 'Recruiter', avatar: 'https://i.pravatar.cc/80?img=26' },
];

const journeySteps = [
  { icon: Rocket, title: 'Discover Opportunities', desc: 'AI-powered matching surfaces courses, internships, jobs, and connections tailored to your goals.' },
  { icon: Users, title: 'Connect With Experts', desc: 'Engage with mentors, teachers, recruiters, and peers who can help you grow.' },
  { icon: Star, title: 'Learn Smarter', desc: 'Personalized learning paths adapt to your pace, style, and goals with Prerana AI guidance.' },
  { icon: Target, title: 'Track Progress', desc: 'Visual dashboards show your growth, achievements, and areas for improvement in real time.' },
  { icon: Briefcase, title: 'Build Career', desc: 'From internships to full-time roles, build your career with AI-matched opportunities.' },
  { icon: Award, title: 'Achieve Goals', desc: 'Earn certificates, badges, and recognition as you hit milestones and accomplish your objectives.' },
];

const faqs = [
  { q: 'Is Prasynx free to join?', a: 'Yes! Creating a Prasynx account is completely free. Students and parents can access core features at no cost. Institutions and organizations can choose from our flexible paid plans starting at ₹299/month.' },
  { q: 'Can institutions create accounts?', a: 'Absolutely. Institutions can sign up for a free demo or directly subscribe to our Institution plan. Our team will help you configure the platform for your specific needs, including multi-campus setup.' },
  { q: 'Can parents monitor student progress?', a: 'Yes, the Parent Portal provides real-time access to attendance records, grades, assignments, fee payments, and direct communication with teachers through our secure messaging system.' },
  { q: 'How does Prerana AI work?', a: 'Prerana AI is our intelligent education assistant that analyzes learning patterns, predicts outcomes, recommends personalized content, automates administrative tasks, and provides actionable insights for all users.' },
  { q: 'Can recruiters hire students through Prasynx?', a: 'Yes! Our Recruitment Platform connects employers with verified candidates. Post jobs, get AI-matched candidate recommendations, schedule interviews, and track hires — all within the platform.' },
  { q: 'Is my data secure on Prasynx?', a: 'Security is our top priority. Prasynx uses bank-grade AES-256 encryption, SOC 2 compliant infrastructure, GDPR compliance, multi-factor authentication, and regular security audits to protect your data.' },
];

const trustLogos = [
  'Google', 'Microsoft', 'LinkedIn', 'Slack', 'Notion', 'Figma',
];

export default function GetStarted() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [signupStep, setSignupStep] = useState(0);
  const [testFilter, setTestFilter] = useState('All');

  const testTypes = ['All', ...Array.from(new Set(testimonials.map(t => t.type)))];
  const filteredTests = testFilter === 'All' ? testimonials : testimonials.filter(t => t.type === testFilter);

  return (
    <SiteShell>
      <PageMain>
        {/* ===== SECTION 1 — HERO ===== */}
        <section className="relative overflow-hidden px-4 pt-20 pb-16 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#7C3AED]/8 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[#8B5CF6]/10 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(124,58,237,0.06)_1px,transparent_0)] bg-size-[36px_36px]" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E8E0FF] bg-white/80 px-4 py-2 text-sm font-extrabold text-[#4F2DB8] shadow-sm">
                  <Rocket className="h-4 w-4 text-[#7C3AED]" />
                  Welcome to Prasynx
                </div>
                <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl xl:text-7xl">
                  Start Your Journey With The{' '}
                  <span className="bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">
                    Future Of Education
                  </span>
                </h1>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  Join thousands of students, parents, teachers, institutions, recruiters, and organizations already growing with Prasynx.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a href="#signup"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#7C3AED]/25 transition hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]">
                    Create Free Account <ArrowRight size={16} />
                  </a>
                  <Link href="/book-demo"
                    className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white/80 px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#7C3AED] hover:text-[#7C3AED] hover:shadow-md">
                    Book Demo
                  </Link>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { value: '50K+', label: 'Students', icon: Users },
                    { value: '500+', label: 'Institutions', icon: Building2 },
                    { value: '95%', label: 'Success Rate', icon: Star },
                    { value: '24/7', label: 'AI Support', icon: Bot },
                  ].map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className="rounded-2xl border border-[#E2E8F0] bg-white/70 backdrop-blur-sm px-4 py-3 text-center shadow-sm">
                        <Icon size={16} className="mx-auto text-[#7C3AED]" />
                        <div className="mt-1 text-lg font-black text-[#7C3AED]">{s.value}</div>
                        <div className="text-[10px] font-bold text-slate-500">{s.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="relative hidden lg:col-span-2 lg:block">
                <div className="relative mx-auto h-[460px] w-[380px]">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#7C3AED]/20 via-[#8B5CF6]/10 to-[#A855F7]/20" />
                  <div className="absolute inset-2 rounded-2xl border border-[#E8E0FF] bg-white/60 backdrop-blur-sm overflow-hidden shadow-2xl">
                    <div className="p-5">
                      <div className="flex items-center justify-center gap-1 mb-4 text-xs font-bold text-slate-400">
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#7C3AED] text-white text-[10px]">P</span>
                        <span className="tracking-wider">PRASYNX ONBOARDING</span>
                      </div>
                      <div className="space-y-2.5">
                        {[
                          { emoji: '🎓', label: 'Students', desc: 'Personalized learning & career growth', color: '#7C3AED' },
                          { emoji: '👩‍🏫', label: 'Teachers', desc: 'Streamlined workflow & analytics', color: '#8B5CF6' },
                          { emoji: '👨‍👩‍👧', label: 'Parents', desc: 'Real-time progress & communication', color: '#A855F7' },
                          { emoji: '🏛️', label: 'Institutions', desc: 'Complete ERP & multi-campus', color: '#6D28D9' },
                          { emoji: '🤖', label: 'Prerana AI', desc: 'Intelligent education assistant', color: '#7C3AED' },
                          { emoji: '💼', label: 'Recruiters', desc: 'AI-matched talent pipeline', color: '#8B5CF6' },
                        ].map((item) => (
                          <div key={item.label}
                            className="flex items-center gap-3 rounded-xl p-2.5 border transition hover:shadow-sm"
                            style={{ background: `${item.color}08`, borderColor: `${item.color}15` }}>
                            <span className="text-lg">{item.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-950">{item.label}</p>
                              <p className="text-[9px] text-slate-400 truncate">{item.desc}</p>
                            </div>
                            <CheckCircle size={12} className="text-green-500 shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' } as any}
                    className="absolute -right-20 top-8 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl px-4 py-3 shadow-xl shadow-black/5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#7C3AED]/10 text-[#7C3AED]"><Bot size={16} /></span>
                    <div><p className="text-[10px] font-bold text-slate-400">AI Powered</p><p className="text-sm font-black text-slate-950">Prerana AI</p></div>
                  </motion.div>
                  <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' } as any}
                    className="absolute -left-20 bottom-20 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl px-4 py-3 shadow-xl shadow-black/5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6]"><GraduationCap size={16} /></span>
                    <div><p className="text-[10px] font-bold text-slate-400">Smart Learning</p><p className="text-sm font-black text-slate-950">Personalized</p></div>
                  </motion.div>
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' } as any}
                    className="absolute -right-16 bottom-14 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl px-4 py-3 shadow-xl shadow-black/5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#A855F7]/10 text-[#A855F7]"><Briefcase size={16} /></span>
                    <div><p className="text-[10px] font-bold text-slate-400">Career Growth</p><p className="text-sm font-black text-slate-950">10K+ Opportunities</p></div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 2 — SOCIAL LOGIN BAR ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-8 -mt-4">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white/80 backdrop-blur-sm px-6 py-4 shadow-sm">
              <span className="text-xs font-bold text-slate-400">Sign up with:</span>
              {['Google', 'Microsoft', 'LinkedIn', 'Apple'].map((provider) => (
                <button key={provider}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#7C3AED] hover:text-[#7C3AED] hover:shadow-md hover:-translate-y-0.5">
                  {provider}
                </button>
              ))}
              <span className="hidden sm:block h-5 w-px bg-[#E2E8F0]" />
              <span className="text-[10px] font-bold text-slate-400">Free · No credit card · 60 second setup</span>
            </div>
          </div>
        </section>

        {/* ===== SECTION 3 — CHOOSE YOUR ROLE ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-8 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <Users size={12} /> Who Are You?
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Select Your Role</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
                Choose how you want to use Prasynx and we will personalize your experience.
              </p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.title;
                return (
                  <motion.button key={role.title} {...stagger}
                    onClick={() => setSelectedRole(role.title)}
                    className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${
                      isSelected
                        ? 'border-[#7C3AED] bg-[#F3F0FF] shadow-lg shadow-[#7C3AED]/10 -translate-y-1'
                        : 'border-[#E2E8F0] bg-white hover:-translate-y-1.5 hover:shadow-xl'
                    }`}
                    style={{ hover: { borderColor: `${role.color}30` } } as any}>
                    <div className={`absolute inset-x-0 top-0 h-1 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      style={{ background: `linear-gradient(90deg, ${role.color}, ${role.color}88)` }} />
                    <div className="flex items-start justify-between mb-3">
                      <span className="grid h-11 w-11 place-items-center rounded-xl transition group-hover:scale-105"
                        style={{ background: `${role.color}12`, color: role.color }}>
                        <Icon size={20} />
                      </span>
                      {isSelected && <CheckCircle size={18} className="text-[#7C3AED] shrink-0" />}
                    </div>
                    <h3 className="text-base font-black text-slate-950">{role.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{role.desc}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {role.benefits.map((b) => (
                        <span key={b} className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[9px] font-bold text-slate-600">{b}</span>
                      ))}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== SECTION 4 — WHAT YOU'LL GET ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-8 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <Gift size={12} /> Everything You Need
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Everything You Need To Succeed</h2>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <motion.div key={f.title} {...stagger}
                    className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 transition-all hover:-translate-y-1.5 hover:shadow-xl"
                    style={{ hover: { borderColor: `${f.color}30` } } as any}>
                    <div className="absolute inset-x-0 top-0 h-1 opacity-0 transition group-hover:opacity-100" style={{ background: `linear-gradient(90deg, ${f.color}, ${f.color}88)` }} />
                    <span className="grid h-10 w-10 place-items-center rounded-xl transition group-hover:scale-105" style={{ background: `${f.color}12`, color: f.color }}>
                      <Icon size={18} />
                    </span>
                    <h3 className="mt-3 text-sm font-black text-slate-950">{f.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{f.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== SECTION 5 — HOW IT WORKS ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-10 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <Layers size={12} /> How It Works
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Get Started In Minutes</h2>
            </motion.div>
            <div className="relative mx-auto max-w-4xl">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hidden sm:block" />
              <div className="space-y-6">
                {onboardingSteps.map((step, i) => (
                  <motion.div key={step.step} {...stagger} transition={{ delay: i * 0.12 }}
                    className="relative sm:pl-20">
                    <div className="absolute left-0 top-0 hidden sm:grid h-16 w-16 place-items-center rounded-2xl text-white shadow-lg shadow-[#7C3AED]/20"
                      style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)` }}>
                      <span className="text-xl font-black">{step.step}</span>
                    </div>
                    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6 transition hover:shadow-lg hover:border-[#E8E0FF]">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#F3F0FF] text-[#7C3AED] text-xs font-black sm:hidden">{step.step}</span>
                        <h3 className="text-base font-black text-slate-950">{step.title}</h3>
                      </div>
                      <p className="text-sm text-slate-500">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 6 — WHY PRASYNX ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-8 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <Star size={12} /> Why Prasynx
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Why Thousands Choose Prasynx</h2>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {whyUs.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div key={item.title} {...stagger}
                    className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 transition hover:-translate-y-1.5 hover:shadow-xl hover:border-[#E8E0FF]">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F3F0FF] text-[#7C3AED] transition group-hover:bg-[#7C3AED] group-hover:text-white">
                        <Icon size={18} />
                      </span>
                      <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[9px] font-bold text-green-600">{item.stat}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-950">{item.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== SECTION 8 — ONBOARDING BENEFITS ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-8 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <Rocket size={12} /> Your Journey
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">What Happens After You Join?</h2>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {journeySteps.map((step) => {
                const Icon = step.icon;
                return (
                  <motion.div key={step.title} {...stagger}
                    className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 transition hover:-translate-y-1.5 hover:shadow-xl hover:border-[#E8E0FF]">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] text-white shadow-sm">
                      <Icon size={18} />
                    </span>
                    <h3 className="mt-3 text-sm font-bold text-slate-950">{step.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{step.desc}</p>
                    <div className="mt-3 h-1 w-0 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] transition-all duration-700 group-hover:w-full" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== SECTION 9 — SUCCESS STORIES ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-8 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <MessageCircle size={12} /> Success Stories
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Trusted By Learners & Institutions</h2>
            </motion.div>
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {testTypes.map((type) => (
                <button key={type} onClick={() => setTestFilter(type)}
                  className={`rounded-full px-4 py-2 text-[10px] font-bold transition ${
                    testFilter === type
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white shadow-sm'
                      : 'bg-white border border-[#E2E8F0] text-slate-600 hover:border-[#7C3AED] hover:text-[#7C3AED]'
                  }`}>
                  {type}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTests.map((t) => (
                <motion.div key={t.name} {...stagger}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#7C3AED]/5">
                  <Quote size={16} className="text-[#E8E0FF] mb-2" />
                  <p className="text-sm italic leading-relaxed text-slate-600">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-3 border-t border-[#F1F5F9] pt-4">
                    <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-bold text-slate-950">{t.name}</p>
                      <p className="text-[10px] font-bold text-[#7C3AED]">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SECTION 10 — PRICING ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-8 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <Star size={12} /> Pricing Plans
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Choose the Right Plan for Your School</h2>
              <p className="mt-3 text-sm text-slate-500 max-w-xl mx-auto">Plans starting at ₹10,000/month. Scalable solutions that empower your school to deliver world-class education.</p>
            </motion.div>
            <div className="grid gap-5 lg:grid-cols-4">
              {[
                {
                  name: 'Starter', price: '₹10,000', period: '/month', badge: null,
                  desc: 'Essential school management tools for small schools with up to 200 students.',
                  features: ['Student Database', 'Attendance Tracking', 'Basic Reports', 'Teacher Portal', 'Parent Communication', 'Email Support'],
                  cta: 'Get Started', popular: false, color: '#7C3AED',
                },
                {
                  name: 'Growth', price: '₹25,000', period: '/month', badge: '🔥 Most Popular',
                  desc: 'Advanced features for growing schools with up to 500 students and staff.',
                  features: ['Everything in Starter', 'Gradebook & Exams', 'AI Reports & Insights', 'LMS Access', 'Fee Management', 'Priority Support'],
                  cta: 'Start Free Trial', popular: true, color: '#8B5CF6',
                },
                {
                  name: 'Premium', price: '₹50,000', period: '/month', badge: null,
                  desc: 'Full ecosystem for large schools with up to 1,000+ students and multi-classroom management.',
                  features: ['Everything in Growth', 'Prerana AI Premium', 'HR & Payroll', 'Advanced Analytics', 'Custom Branding', 'Dedicated Support'],
                  cta: 'Contact Sales', popular: false, color: '#7C3AED',
                },
                {
                  name: 'Enterprise', price: 'Custom', period: '', badge: null,
                  desc: 'Custom solutions for multi-campus institutions, chains, and districts with unlimited scale.',
                  features: ['Everything in Premium', 'Multi-Campus Support', 'White Label Platform', 'API Access', 'Dedicated Manager', 'Custom Integrations'],
                  cta: 'Book Demo', popular: false, color: '#7C3AED',
                },
              ].map((plan) => (
                <motion.div key={plan.name} {...stagger}
                  className={`group relative rounded-2xl border p-6 text-center transition hover:-translate-y-1.5 ${
                    plan.popular
                      ? 'border-[#7C3AED]/30 bg-[#7C3AED] text-white shadow-xl hover:shadow-2xl'
                      : 'border-[#E2E8F0] bg-white hover:shadow-xl hover:border-[#E8E0FF]'
                  }`}>
                  {plan.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] px-3 py-1 text-[9px] font-bold text-white shadow-lg">
                      {plan.badge}
                    </span>
                  )}
                  <h3 className={`text-lg font-black ${plan.popular ? 'text-white' : 'text-slate-950'}`}>{plan.name}</h3>
                  <p className={`mt-1 text-[10px] leading-relaxed ${plan.popular ? 'text-white/70' : 'text-slate-500'}`}>{plan.desc}</p>
                  <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className={`text-3xl font-black ${plan.popular ? 'text-white' : 'text-slate-950'}`}>{plan.price}</span>
                    {plan.period && <span className={`text-xs font-bold ${plan.popular ? 'text-white/60' : 'text-slate-400'}`}>{plan.period}</span>}
                  </div>
                  <ul className="mt-5 space-y-2.5 text-left">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <CheckCircle size={12} className={plan.popular ? 'text-white/70' : 'text-[#7C3AED]'} />
                        <span className={`text-[11px] font-semibold ${plan.popular ? 'text-white/80' : 'text-slate-600'}`}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`mt-6 w-full rounded-xl py-3 text-xs font-black transition active:scale-[0.98] ${
                      plan.popular
                        ? 'bg-white text-[#7C3AED] hover:shadow-xl'
                        : 'border border-[#7C3AED]/20 bg-[#F3F0FF] text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white'
                    }`}>
                    {plan.cta}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SECTION 11 — FAQ ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-3xl">
            <motion.div {...fadeUp} className="mb-8 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <MessageCircle size={12} /> FAQ
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Frequently Asked Questions</h2>
            </motion.div>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <motion.div key={i} {...stagger} transition={{ delay: i * 0.05 }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between rounded-2xl border border-[#E2E8F0] bg-white px-6 py-4 text-left text-sm font-bold text-slate-950 transition hover:border-[#E8E0FF] hover:shadow-sm">
                    {faq.q}
                    <ChevronDown size={16} className={`shrink-0 text-slate-400 transition duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        className="overflow-hidden">
                        <div className="px-6 py-4 text-sm leading-relaxed text-slate-600">{faq.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SECTION 11 — FINAL SIGNUP CTA ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12" id="signup">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] p-8 sm:p-12 shadow-2xl">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-size-[24px_24px]" />
              </div>
              <div className="relative grid items-center gap-8 lg:grid-cols-5">
                <div className="lg:col-span-3">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-bold text-white/90 backdrop-blur-sm">
                    <Rocket size={12} /> Start Your Journey Today
                  </div>
                  <h2 className="text-3xl font-black text-white leading-tight sm:text-4xl lg:text-5xl">
                    Ready To Get Started?
                  </h2>
                  <p className="mt-4 max-w-lg text-base leading-relaxed text-white/80">
                    Create your account today and unlock the full power of AI-driven education, career growth, and institutional management.
                  </p>
                  <div className="mt-8 space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <div className="relative flex-1">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          className="w-full rounded-xl border border-white/20 bg-white/15 px-4 py-3.5 text-sm font-semibold text-white outline-none placeholder:text-white/50 transition focus:bg-white/20 focus:border-white/40 backdrop-blur-sm" />
                      </div>
                      <button
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-[#7C3AED] shadow-lg transition hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]">
                        Create Free Account <ArrowRight size={16} />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {['Google', 'Microsoft', 'LinkedIn', 'Apple'].map((provider) => (
                        <button key={provider}
                          className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-[10px] font-bold text-white backdrop-blur-sm transition hover:bg-white/20">
                          Sign up with {provider}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-white/50">Free · No credit card required · 60 second setup</p>
                  </div>
                </div>
                <div className="hidden lg:col-span-2 lg:block">
                  <div className="space-y-3">
                    {[
                      { icon: Bot, text: 'AI Powered' },
                      { icon: TrendingUp, text: 'Career Ready' },
                      { icon: Star, text: 'Smart Learning' },
                      { icon: Target, text: 'Future Ready' },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.text}
                          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/20 text-white">
                            <Icon size={15} />
                          </span>
                          <span className="text-sm font-bold text-white">{item.text}</span>
                          <CheckCircle size={14} className="ml-auto text-green-300" />
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-center gap-1 pt-2 text-xs font-bold text-white/60">
                      <InfinityIcon size={14} /> Join 50,000+ learners already on Prasynx
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </PageMain>
    </SiteShell>
  );
}
