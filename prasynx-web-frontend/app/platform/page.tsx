"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, BookOpen, BookOpenText, Bot, BarChart3, Briefcase, Building2,
  Calendar, CheckCircle, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Cloud,
  Database, FileText, Globe, GraduationCap, Layers, Lock, Mail, MessageCircle,
  Monitor, PieChart, Quote, Server, Shield, Smartphone, Sparkles, Star,
  TrendingUp, Users, UserCheck, Zap,   Activity, Award, Bell, Clock, Cog,
  Play,
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

const platformFeatures = [
  { icon: GraduationCap, title: 'Student Management', desc: 'Complete academic records, enrollment, attendance, grades, and progress tracking in one place.', color: '#6C4CF1' },
  { icon: UserCheck, title: 'Teacher Workspace', desc: 'Lesson planning, grade books, attendance, and student performance analytics for educators.', color: '#8B5CF6' },
  { icon: Users, title: 'Parent Portal', desc: 'Real-time updates on progress, attendance, fees, and direct teacher communication.', color: '#A855F7' },
  { icon: Clock, title: 'Attendance Automation', desc: 'Biometric integration, auto-marking, instant alerts, and comprehensive attendance reports.', color: '#10B981' },
  { icon: Bot, title: 'AI Learning Assistant', desc: 'Prerana AI delivers personalized study plans, recommendations, and instant academic support.', color: '#6C4CF1' },
  { icon: BookOpen, title: 'Assessment Engine', desc: 'Create, distribute, and auto-grade assessments with detailed analytics and insights.', color: '#8B5CF6' },
  { icon: MessageCircle, title: 'Communication Hub', desc: 'Centralized messaging, announcements, alerts, and notifications across all stakeholders.', color: '#A855F7' },
  { icon: TrendingUp, title: 'Analytics Dashboard', desc: 'Real-time KPIs, trends, reports, and data-driven insights for informed decision-making.', color: '#6C4CF1' },
];

const aiFeatures = [
  { icon: Bot, title: 'AI Teacher', desc: 'Intelligent tutoring that adapts to each students learning pace and style.', color: '#6C4CF1' },
  { icon: Briefcase, title: 'AI Career Coach', desc: 'Personalized career paths, resume optimization, and interview preparation guidance.', color: '#8B5CF6' },
  { icon: BookOpenText, title: 'AI Study Planner', desc: 'Smart scheduling that optimizes study time based on goals and performance gaps.', color: '#A855F7' },
  { icon: Zap, title: 'AI Content Generator', desc: 'Create quizzes, assignments, and learning materials instantly with AI.', color: '#10B981' },
  { icon: BarChart3, title: 'AI Assessment Engine', desc: 'Auto-generate and grade assessments with detailed performance analytics.', color: '#6C4CF1' },
  { icon: PieChart, title: 'AI Analytics', desc: 'Predictive analytics that identify at-risk students and improvement opportunities.', color: '#8B5CF6' },
];

const securityFeatures = [
  { icon: Lock, title: 'Data Encryption', desc: 'AES-256 at rest, TLS 1.3 in transit — your data is always protected.' },
  { icon: Shield, title: 'Role Based Access', desc: 'Granular permissions for students, teachers, admins, and parents.' },
  { icon: Award, title: 'Single Sign On', desc: 'Seamless SAML/SSO integration with Google Workspace, Azure AD, and more.' },
  { icon: FileText, title: 'Audit Logs', desc: 'Complete activity trails for every action across the platform.' },
  { icon: Cloud, title: 'Cloud Backup', desc: 'Automated daily backups with point-in-time recovery and geo-redundancy.' },
  { icon: CheckCircle, title: 'Compliance', desc: 'SOC 2 Type II, GDPR, ISO 27001 certified infrastructure.' },
];

const testimonials = [
  { name: 'Dr. Neha Gupta', role: 'Principal, DPS Group', avatar: 'https://i.pravatar.cc/150?u=neha', rating: 5, content: 'Prasynx transformed our multi-campus operations. The AI analytics alone saved us 30 hours of administrative work per week.' },
  { name: 'Mr. Arjun Patel', role: 'Director, IIT Prep Institute', avatar: 'https://i.pravatar.cc/150?u=arjun', rating: 5, content: 'The platform unified our student management, communication, and analytics in one seamless ecosystem. A game-changer for EdTech.' },
  { name: 'Mrs. Kavita Reddy', role: 'Principal, Sunshine School', avatar: 'https://i.pravatar.cc/150?u=kavita', rating: 5, content: 'Parent engagement improved by 70% after implementing Prasynx. The real-time updates and AI insights are incredible.' },
  { name: 'Dr. Suresh Verma', role: 'CEO, LearnWell Group', avatar: 'https://i.pravatar.cc/150?u=suresh', rating: 5, content: 'Enterprise-grade security, white-label capabilities, and dedicated support made Prasynx the clear choice for our organization.' },
];

const faqs = [
  { q: 'How long does it take to set up?', a: 'Most institutions go live within 24-48 hours. Our onboarding team handles data migration, configuration, and staff training.' },
  { q: 'Can I customize the platform?', a: 'Enterprise plans include white-label customization, custom branding, and tailored feature development.' },
  { q: 'Is my data secure?', a: 'We use AES-256 encryption, SOC 2 compliant infrastructure, RBAC, and regular security audits.' },
  { q: 'Do you provide training?', a: 'Every plan includes onboarding support. Institution and Enterprise plans include dedicated training sessions.' },
  { q: 'Can I integrate with existing tools?', a: 'Yes, we offer REST APIs, webhooks, and pre-built integrations with Google Workspace, Microsoft 365, and more.' },
  { q: 'What kind of support do you offer?', a: '24/7 AI support via Prerana AI, plus email and phone support for all plans. Enterprise includes a dedicated account manager.' },
  { q: 'Is the platform mobile-friendly?', a: 'Fully responsive design works seamlessly across desktop, tablet, and mobile devices with dedicated mobile apps.' },
  { q: 'Can I migrate data from another platform?', a: 'Yes, our migration team handles data transfer from any existing system with zero downtime.' },
];

export default function PlatformPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [testimonialActive, setTestimonialActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialActive((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <SiteShell>
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24 px-4 sm:px-6 lg:px-8">

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E8E0FF] bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4 text-[#A855F7]" />
                <span className="text-xs font-extrabold" style={{ color: '#4F2DB8' }}> Next Generation Education Infrastructure</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
                className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold leading-[1.06] tracking-tight" style={{ color: '#0F172A' }}>
                The Operating System<br />
                Powering Modern<br />
                <span className="bg-gradient-to-r from-[#6C4CF1] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">Education Ecosystems</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-5 max-w-xl text-lg leading-relaxed" style={{ color: '#475569' }}>
                Prasynx unifies students, parents, teachers, administrators, recruiters, institutions, and organizations into one intelligent AI-powered platform.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}
                className="mt-8 flex flex-wrap gap-4">
                <a href="/book-demo" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6C4CF1] to-[#8B5CF6] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#6C4CF1]/25 transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]">
                  Get Started <ArrowRight size={16} />
                </a>
                <a href="/book-demo" className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-bold text-[#475569] transition-all hover:border-[#6C4CF1]/30 hover:text-[#6C4CF1] hover:shadow-md">
                  Book Live Demo
                </a>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-8 flex flex-wrap gap-5 text-sm" style={{ color: '#64748B' }}>
                {['AI Powered', 'Enterprise Ready', 'Multi Tenant', 'Secure Platform'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> {item}</span>
                ))}
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
              className="relative hidden lg:flex items-center justify-center min-h-[500px]">

              {/* Center platform logo */}
              <img
                src="/logo.png"
                alt="Prasynx Logo"
                className="relative z-10 h-20 w-auto object-contain select-none pointer-events-none"
              />

              {/* Orbiting cards */}
              {[
                { angle: 0, label: 'AI Assistant', icon: Bot, color: '#6C4CF1' },
                { angle: 45, label: 'Analytics', icon: BarChart3, color: '#8B5CF6' },
                { angle: 90, label: 'Attendance', icon: Clock, color: '#10B981' },
                { angle: 135, label: 'Communication', icon: MessageCircle, color: '#A855F7' },
                { angle: 180, label: 'Recruitment', icon: Briefcase, color: '#6C4CF1' },
                { angle: 225, label: 'LMS', icon: BookOpen, color: '#8B5CF6' },
                { angle: 270, label: 'Parent Portal', icon: Users, color: '#A855F7' },
                { angle: 315, label: 'Reports', icon: FileText, color: '#10B981' },
              ].map((item, i) => {
                const rad = (item.angle * Math.PI) / 180;
                const r = 150;
                const cx = 72 + r * Math.cos(rad);
                const cy = 72 + r * Math.sin(rad);
                const Icon = item.icon;
                return (
                  <motion.div key={item.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.08 }}
                    className="absolute z-20 flex items-center gap-1.5 rounded-xl border border-white/80 bg-white/90 px-2.5 py-1.5 shadow-lg shadow-black/5 backdrop-blur-xl pointer-events-none text-xs font-semibold"
                    style={{ left: `calc(50% + ${cx - 72}px)`, top: `calc(50% + ${cy - 72}px)`, transform: 'translate(-50%, -50%)', color: item.color }}>
                    <Icon size={12} /> {item.label}
                  </motion.div>
                );
              })}

              {/* Connection lines */}
              <svg className="absolute inset-0 h-full w-full pointer-events-none z-10" viewBox="0 0 600 500">
                {[...Array(8)].map((_, i) => {
                  const angle = i * 45;
                  const rad = (angle * Math.PI) / 180;
                  const r = 148;
                  const x = 300 + r * Math.cos(rad);
                  const y = 250 + r * Math.sin(rad);
                  return (
                    <line key={i} x1="300" y1="250" x2={x} y2={y} stroke="#6C4CF1" strokeOpacity="0.15" strokeWidth="1.5" strokeDasharray="4 3">
                      <animate attributeName="stroke-dashoffset" values="0;-14" dur="3s" repeatCount="indefinite" />
                    </line>
                  );
                })}
              </svg>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== TRUSTED BY / STATS ===== */}
      <section className="relative -mt-8 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="rounded-2xl border border-[#E2E8F0] bg-white/80 p-6 backdrop-blur-sm shadow-sm sm:p-8">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-[#94A3B8]">Trusted By</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-bold" style={{ color: '#94A3B8' }}>
              {['Schools', 'Universities', 'Coaching Institutes', 'NGOs', 'Training Orgs', 'Government'].map((item) => (
                <span key={item} className="opacity-60 hover:opacity-100 transition-opacity">{item}</span>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#E2E8F0] pt-6 sm:grid-cols-4">
              {[
                { value: 50000, suffix: '+', label: 'Students', color: '#6C4CF1' },
                { value: 500, suffix: '+', label: 'Institutions', color: '#8B5CF6' },
                { value: 10000000, suffix: '+', label: 'Learning Sessions', color: '#10B981', custom: '10M' },
                { value: 999, suffix: '%', label: 'Uptime', color: '#A855F7' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-black" style={{ color: s.color }}>{s.custom || <AnimatedCounter value={s.value} suffix={s.suffix} />}</div>
                  <div className="text-xs font-semibold text-[#64748B]">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== PLATFORM OVERVIEW ===== */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mx-auto mb-14 max-w-2xl text-center">
            <span className="eyebrow mb-4">Platform Overview</span>
            <h2 className="section-title mt-3">Everything You Need<br />In One Platform</h2>
            <p className="section-subtitle mx-auto mt-3">Designed to simplify operations and improve outcomes.</p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {platformFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="group relative rounded-2xl border border-[#E2E8F0] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#6C4CF1]/30 hover:shadow-lg hover:shadow-[#6C4CF1]/5">
                  <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-[#6C4CF1]/0 to-[#8B5CF6]/0 opacity-0 transition-opacity duration-300 group-hover:from-[#6C4CF1]/3 group-hover:to-[#8B5CF6]/3 group-hover:opacity-100" />
                  <div className="relative mb-4 grid h-12 w-12 place-items-center rounded-xl bg-[#F3F0FF] text-[#6C4CF1] transition-all group-hover:bg-[#6C4CF1] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#6C4CF1]/30">
                    <Icon size={22} />
                  </div>
                  <h3 className="relative text-base font-extrabold" style={{ color: '#0F172A' }}>{f.title}</h3>
                  <p className="relative mt-1.5 text-sm leading-relaxed" style={{ color: '#64748B' }}>{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== INTERACTIVE DASHBOARD SHOWCASE ===== */}
      <section className="px-4 py-20 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 100%)' }}>
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mx-auto mb-14 max-w-2xl text-center">
            <span className="eyebrow mb-4">Dashboard</span>
            <h2 className="section-title mt-3">One Platform. Unlimited Possibilities.</h2>
          </motion.div>

          {[
            { id: 0, title: 'Student Information System', desc: 'Complete student lifecycle management from enrollment to graduation with AI-powered insights.', features: ['Student Records', 'Enrollment Management', 'Attendance Tracking', 'Progress Monitoring', 'Certificate Generation', 'Analytics Reports'], icon: GraduationCap, color: '#6C4CF1', reverse: false },
            { id: 1, title: 'AI Learning Intelligence', desc: 'Personalized learning paths powered by Prerana AI that adapt to each students unique needs.', features: ['AI Tutor', 'Personalized Learning', 'Smart Recommendations', 'Career Guidance', 'Predictive Analytics', 'Performance Reports'], icon: Bot, color: '#8B5CF6', reverse: true },
            { id: 2, title: 'Institution Operations', desc: 'Streamline staff, finance, scheduling, compliance, and communication across your organization.', features: ['Staff Management', 'Finance & Billing', 'Scheduling', 'Communication Hub', 'Compliance Reports', 'Workflow Automation'], icon: Building2, color: '#A855F7', reverse: false },
          ].map((section, i) => (
            <motion.div key={section.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`mb-12 flex flex-col items-center gap-8 lg:flex-row ${section.reverse ? 'lg:flex-row-reverse' : ''}`}>
              <div className="flex-1">
                {section.id === 0 && (
                  <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-lg sm:p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                        </div>
                        <span className="ml-2 rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[9px] font-bold text-[#64748B]">sis.prasynx.com</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[8px] font-bold text-[#64748B]">YEAR 2025-26</span>
                        <div className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: `${section.color}15` }}>
                          <Bell size={12} style={{ color: section.color }} />
                        </div>
                      </div>
                    </div>
                    <div className="mb-3 flex items-center justify-between rounded-lg border border-[#E2E8F0] p-2">
                      <div className="flex items-center gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${section.color}15` }}><Users size={14} style={{ color: section.color }} /></span>
                        <div>
                          <div className="text-[8px] font-semibold text-[#94A3B8]">Total Students</div>
                          <div className="text-sm font-black" style={{ color: section.color }}>2,450</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${section.color}15` }}><BookOpen size={14} style={{ color: section.color }} /></span>
                        <div>
                          <div className="text-[8px] font-semibold text-[#94A3B8]">Avg Grade</div>
                          <div className="text-sm font-black" style={{ color: section.color }}>B+</div>
                        </div>
                      </div>
                      <div className="rounded-full px-2.5 py-1 text-[8px] font-bold text-white" style={{ background: section.color }}>Today: 92% present</div>
                    </div>
                    <table className="w-full text-left text-[9px]">
                      <thead>
                        <tr className="border-b border-[#F1F5F9] text-[#94A3B8]">
                          <th className="pb-1.5 font-semibold">Name</th>
                          <th className="pb-1.5 font-semibold">Class</th>
                          <th className="pb-1.5 font-semibold">Attendance</th>
                          <th className="pb-1.5 font-semibold">Grade</th>
                          <th className="pb-1.5 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Aanya Sharma', cls: '10-A', att: '95%', grade: 'A', ok: true },
                          { name: 'Rohan Verma', cls: '10-A', att: '88%', grade: 'B+', ok: true },
                          { name: 'Priya Patel', cls: '10-B', att: '72%', grade: 'C+', ok: false },
                          { name: 'Arjun Singh', cls: '10-A', att: '98%', grade: 'A+', ok: true },
                        ].map((r) => (
                          <tr key={r.name} className="border-b border-[#F8FAFF]">
                            <td className="py-1.5 font-semibold text-[#0F172A]">{r.name}</td>
                            <td className="py-1.5 text-[#64748B]">{r.cls}</td>
                            <td className="py-1.5 text-[#64748B]">{r.att}</td>
                            <td className="py-1.5" style={{ color: section.color }}>{r.grade}</td>
                            <td className="py-1.5">
                              <span className={`rounded-full px-1.5 py-0.5 text-[7px] font-bold ${r.ok ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {r.ok ? 'Active' : 'At Risk'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-2 flex items-center justify-between rounded-lg p-2" style={{ background: `${section.color}08` }}>
                      <span className="text-[8px] font-semibold text-[#64748B]">AI Insight: 3 students need intervention</span>
                      <span className="text-[8px] font-bold" style={{ color: section.color }}>View Report →</span>
                    </div>
                  </div>
                )}
                {section.id === 1 && (
                  <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-lg sm:p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                        </div>
                        <span className="ml-2 rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[9px] font-bold text-[#64748B]">ai.prasynx.com</span>
                      </div>
                      <div className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: `${section.color}15` }}>
                        <Bot size={12} style={{ color: section.color }} />
                      </div>
                    </div>
                    <div className="mb-3 grid grid-cols-3 gap-2">
                      <div className="rounded-lg border border-[#E2E8F0] p-2">
                        <div className="text-[8px] font-semibold text-[#94A3B8]">Learning Pace</div>
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 flex-1 rounded-full bg-[#E2E8F0]">
                            <div className="h-1.5 rounded-full" style={{ width: '78%', background: section.color }} />
                          </div>
                          <span className="text-[10px] font-black" style={{ color: section.color }}>78%</span>
                        </div>
                      </div>
                      <div className="rounded-lg border border-[#E2E8F0] p-2">
                        <div className="text-[8px] font-semibold text-[#94A3B8]">Mastery Score</div>
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 flex-1 rounded-full bg-[#E2E8F0]">
                            <div className="h-1.5 rounded-full" style={{ width: '92%', background: section.color }} />
                          </div>
                          <span className="text-[10px] font-black" style={{ color: section.color }}>92%</span>
                        </div>
                      </div>
                      <div className="rounded-lg border border-[#E2E8F0] p-2">
                        <div className="text-[8px] font-semibold text-[#94A3B8]">Engagement</div>
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 flex-1 rounded-full bg-[#E2E8F0]">
                            <div className="h-1.5 rounded-full" style={{ width: '65%', background: section.color }} />
                          </div>
                          <span className="text-[10px] font-black" style={{ color: section.color }}>65%</span>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3 space-y-1.5">
                      {[
                        { label: 'Mathematics', progress: 85, status: 'On Track' },
                        { label: 'Physics', progress: 62, status: 'Needs Focus' },
                        { label: 'Chemistry', progress: 78, status: 'On Track' },
                        { label: 'English', progress: 91, status: 'Advanced' },
                      ].map((subj) => (
                        <div key={subj.label} className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] px-2.5 py-1.5">
                          <span className="w-16 text-[9px] font-semibold text-[#0F172A]">{subj.label}</span>
                          <div className="h-1.5 flex-1 rounded-full bg-[#E2E8F0]">
                            <div className="h-1.5 rounded-full" style={{ width: `${subj.progress}%`, background: section.color }} />
                          </div>
                          <span className="w-12 text-right text-[8px] font-bold" style={{ color: section.color }}>{subj.progress}%</span>
                          <span className={`rounded-full px-1.5 py-0.5 text-[7px] font-bold ${
                            subj.status === 'On Track' ? 'bg-green-100 text-green-700' : subj.status === 'Advanced' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                          }`}>{subj.status}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg p-2 text-center" style={{ background: `${section.color}08` }}>
                      <span className="text-[8px] font-bold" style={{ color: section.color }}>✨ AI Recommendation: Focus on Physics — 3 students at risk of falling behind</span>
                    </div>
                  </div>
                )}
                {section.id === 2 && (
                  <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-lg sm:p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                        </div>
                        <span className="ml-2 rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[9px] font-bold text-[#64748B]">ops.prasynx.com</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full px-2 py-0.5 text-[8px] font-bold text-white" style={{ background: `${section.color}` }}>LIVE</span>
                        <div className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: `${section.color}15` }}>
                          <Cog size={12} style={{ color: section.color }} />
                        </div>
                      </div>
                    </div>
                    <div className="mb-3 grid grid-cols-3 gap-2">
                      <div className="rounded-lg p-2 text-center" style={{ background: `${section.color}08` }}>
                        <div className="text-[8px] font-semibold text-[#94A3B8]">Staff</div>
                        <div className="text-sm font-black" style={{ color: section.color }}>48</div>
                      </div>
                      <div className="rounded-lg p-2 text-center" style={{ background: `${section.color}08` }}>
                        <div className="text-[8px] font-semibold text-[#94A3B8]">Revenue</div>
                        <div className="text-sm font-black" style={{ color: section.color }}>₹18.2L</div>
                      </div>
                      <div className="rounded-lg p-2 text-center" style={{ background: `${section.color}08` }}>
                        <div className="text-[8px] font-semibold text-[#94A3B8]">Expenses</div>
                        <div className="text-sm font-black" style={{ color: section.color }}>₹11.5L</div>
                      </div>
                    </div>
                    <div className="mb-3 flex items-center justify-between rounded-lg border border-[#E2E8F0] px-3 py-2">
                      <span className="text-[9px] font-semibold text-[#0F172A]">Today's Schedule</span>
                      <span className="text-[8px] font-semibold text-[#94A3B8]">5 classes · 4 meetings</span>
                    </div>
                    <div className="space-y-1">
                      {[
                        { time: '08:00', event: 'Staff Meeting', type: 'Meeting', color: '#6C4CF1' },
                        { time: '09:30', event: 'Class 10-A Mathematics', type: 'Class', color: '#10B981' },
                        { time: '11:00', event: 'Parent-Teacher Conference', type: 'Meeting', color: '#A855F7' },
                        { time: '12:30', event: 'Lunch Break', type: 'Break', color: '#94A3B8' },
                        { time: '14:00', event: 'Finance Review', type: 'Meeting', color: '#6C4CF1' },
                      ].map((ev) => (
                        <div key={ev.time} className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-2.5 py-1.5">
                          <span className="w-10 text-[8px] font-bold text-[#94A3B8]">{ev.time}</span>
                          <span className="h-5 w-0.5 rounded-full" style={{ background: ev.color }} />
                          <span className="flex-1 text-[9px] font-semibold text-[#0F172A]">{ev.event}</span>
                          <span className="rounded-full px-1.5 py-0.5 text-[7px] font-bold" style={{ background: `${ev.color}15`, color: ev.color }}>{ev.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${section.color}15`, color: section.color }}><section.icon size={20} /></span>
                  <h3 className="text-2xl font-extrabold" style={{ color: '#0F172A' }}>{section.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: '#64748B' }}>{section.desc}</p>
                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  {section.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#475569' }}>
                      <CheckCircle2 size={14} style={{ color: section.color }} /> {feat}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== AI CAPABILITIES ===== */}
      <section className="px-4 py-20 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(180deg, #F4F1FF 0%, #F8FAFF 50%, #FFFFFF 100%)' }}>
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mx-auto mb-14 max-w-2xl text-center">
            <span className="eyebrow mb-4">
              <Sparkles className="h-4 w-4" /> AI Platform
            </span>
            <h2 className="section-title mt-3">Powered By Prerana AI</h2>
            <p className="section-subtitle mx-auto mt-3">Intelligent AI that learns, adapts, and empowers every stakeholder.</p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {aiFeatures.map((ai, i) => {
              const AIcon = ai.icon;
              return (
                <motion.div key={ai.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="group relative rounded-2xl border border-[#6C4CF1]/10 bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#6C4CF1]/30 hover:shadow-lg hover:shadow-[#6C4CF1]/10">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#6C4CF1]/10 to-[#8B5CF6]/10 text-[#6C4CF1] transition-all group-hover:from-[#6C4CF1] group-hover:to-[#8B5CF6] group-hover:text-white">
                      <AIcon size={20} />
                    </span>
                    <span className="rounded-full bg-[#6C4CF1]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#6C4CF1]">AI</span>
                  </div>
                  <h3 className="text-base font-extrabold" style={{ color: '#0F172A' }}>{ai.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: '#64748B' }}>{ai.desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* AI illustration */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="relative mt-10 overflow-hidden rounded-3xl bg-gradient-to-br from-[#6C4CF1]/5 via-[#8B5CF6]/5 to-[#A855F7]/5 p-8 text-center sm:p-12">
            <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImRvdHMiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0iIzhCNUNGNiIgZmlsbC1vcGFjaXR5PSIwLjE1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2RvdHMpIi8+PC9zdmc+')] opacity-40" />
            <div className="relative">
              <img src="/prerana-ai.png" alt="Prerana AI" className="mx-auto h-32 w-32 object-contain" />
              <h3 className="-mt-5 text-2xl font-extrabold" style={{ color: '#0F172A' }}>Intelligence That Powers Every Portal</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm" style={{ color: '#64748B' }}>Prerana AI is embedded across the entire platform — from personalized learning paths to predictive analytics and automated workflows.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== SECURITY ===== */}
      <section className="px-4 py-24 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F8FAFF 0%, #F4F1FF 50%, #FFFFFF 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#6C4CF1]/8 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[#8B5CF6]/8 blur-[100px]" />
        </div>
        <div className="mx-auto max-w-7xl relative">
          <motion.div {...fadeUp} className="mx-auto mb-14 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-4 py-1.5 text-[11px] font-bold tracking-wide text-[#7C3AED] mb-4"><Shield size={14} /> Enterprise Security</span>
            <h2 className="text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold leading-[1.15] tracking-tight" style={{ color: '#0F172A' }}>Enterprise-Grade Security</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm" style={{ color: '#64748B' }}>Your data is protected by the highest industry standards.</p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {securityFeatures.map((s, i) => {
              const SI = s.icon;
              return (
                <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="group rounded-2xl border border-[#E2E8F0] bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-[#6C4CF1]/20 hover:shadow-lg hover:shadow-[#6C4CF1]/5">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#F3F0FF] text-[#6C4CF1] transition-all group-hover:bg-[#6C4CF1] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#6C4CF1]/25">
                    <SI size={20} />
                  </span>
                  <h3 className="mt-4 text-base font-extrabold" style={{ color: '#0F172A' }}>{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: '#64748B' }}>{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== WHY PRASYNX ===== */}
      <section className="px-4 py-24 sm:px-6 lg:px-8 relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 -left-40 h-[500px] w-[500px] rounded-full bg-[#6C4CF1]/[0.03] blur-[120px]" />
          <div className="absolute bottom-1/4 -right-40 h-[500px] w-[500px] rounded-full bg-[#8B5CF6]/[0.03] blur-[120px]" />
        </div>
        <div className="mx-auto max-w-7xl relative">
          <motion.div {...fadeUp} className="mx-auto mb-16 max-w-2xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#6C4CF1]/10 bg-[#6C4CF1]/5 px-4 py-1.5 text-[11px] font-bold tracking-wide text-[#6C4CF1]">Why Prasynx</span>
            <h2 className="text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold leading-[1.15] tracking-tight" style={{ color: '#0F172A' }}>Why Institutions Choose Prasynx</h2>
            <p className="mt-4 text-base leading-relaxed" style={{ color: '#64748B' }}>Trusted by schools, universities, and educational organizations worldwide.</p>
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-4 mb-16">
            {[
              { icon: Bot, stat: '60%', title: 'Less Admin Work', desc: 'Prerana AI automates grading, attendance, reports, and communication — cutting administrative overhead by over half.', color: '#6C4CF1' },
              { icon: Zap, stat: '48h', title: 'Go Live Fast', desc: 'Most institutions go from sign-up to full deployment in under 48 hours with our dedicated migration and onboarding team.', color: '#8B5CF6' },
              { icon: Cloud, stat: '99.9%', title: 'Reliable Uptime', desc: 'Enterprise infrastructure with auto-scaling, multi-region redundancy, and real-time monitoring ensures zero downtime.', color: '#6C4CF1' },
              { icon: Users, stat: '24/7', title: 'Dedicated Support', desc: 'Priority support with a dedicated success manager, training sessions, and 24/7 access to Prerana AI assistance.', color: '#8B5CF6' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="group relative rounded-2xl border border-[#E2E8F0] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#6C4CF1]/5 hover:border-[#6C4CF1]/15">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#F3F0FF] text-[#6C4CF1] transition-all duration-300 group-hover:bg-[#6C4CF1] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#6C4CF1]/25">
                      <Icon size={20} />
                    </span>
                    <span className="text-2xl font-black" style={{ color: item.color }}>{item.stat}</span>
                  </div>
                  <h3 className="text-base font-extrabold" style={{ color: '#0F172A' }}>{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: '#64748B' }}>{item.desc}</p>
                  <div className="mt-4 h-0.5 w-0 rounded-full bg-gradient-to-r from-[#6C4CF1] to-[#8B5CF6] transition-all duration-300 group-hover:w-full" />
                </motion.div>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl border border-[#6C4CF1]/10 bg-gradient-to-r from-[#6C4CF1]/5 via-[#8B5CF6]/5 to-[#A855F7]/5 px-8 py-8 text-center">
            <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:justify-between sm:text-left">
              <div>
                <h3 className="text-xl font-extrabold" style={{ color: '#0F172A' }}>Ready to transform your institution?</h3>
                <p className="mt-1 text-sm" style={{ color: '#64748B' }}>Join 500+ institutions already using Prasynx.</p>
              </div>
              <div className="flex gap-3">
                <a href="/book-demo" className="inline-flex items-center gap-2 rounded-xl bg-[#6C4CF1] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#6C4CF1]/25 transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]">
                  Get Started <ArrowRight size={15} />
                </a>
                <a href="/book-demo" className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-bold transition-all hover:border-[#6C4CF1]/30" style={{ color: '#475569' }}>
                  Book Demo
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CASE STUDIES ===== */}
      <section className="px-4 py-24 sm:px-6 lg:px-8" style={{ background: '#F8FAFF' }}>
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mx-auto mb-16 max-w-2xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#6C4CF1]/10 bg-[#6C4CF1]/5 px-4 py-1.5 text-[11px] font-bold tracking-wide text-[#6C4CF1]">Case Studies</span>
            <h2 className="text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold leading-[1.15] tracking-tight" style={{ color: '#0F172A' }}>Success Stories</h2>
            <p className="mt-4 text-base leading-relaxed" style={{ color: '#64748B' }}>Real results from real institutions powered by Prasynx.</p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            {[
              { name: 'Delhi Public School', type: 'Multi-Campus School', initials: 'DP', results: ['70% less admin time', '95% parent satisfaction', 'Real-time insights'], color: '#6C4CF1' },
              { name: 'IITian Academy', type: 'Coaching Institute', initials: 'IA', results: ['40% better scores', '3x student engagement', 'AI-driven insights'], color: '#8B5CF6' },
              { name: 'Global Edu Group', type: 'University Chain', initials: 'GE', results: ['500+ campuses', '99.9% uptime', 'Full compliance'], color: '#A855F7' },
            ].map((cs, i) => (
              <motion.div key={cs.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#6C4CF1]/5">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6C4CF1] via-[#8B5CF6] to-[#A855F7] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="p-7">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-base font-black text-white shadow-md" style={{ background: `linear-gradient(135deg, ${cs.color}, ${cs.color}bb)` }}>{cs.initials}</div>
                    <div>
                      <div className="text-base font-extrabold" style={{ color: '#0F172A' }}>{cs.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-semibold" style={{ color: '#94A3B8' }}>{cs.type}</span>
                        <span className="h-1 w-1 rounded-full bg-[#CBD5E1]" />
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-[9px] font-bold text-green-600">Active Client</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#E2E8F0] p-4 mb-4">
                    <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>
                      <span className="font-bold" style={{ color: '#0F172A' }}>"</span>
                      Prasynx transformed our operations. The platform unified everything under one roof — from attendance to analytics.
                      <span className="font-bold" style={{ color: '#0F172A' }}>"</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {cs.results.map((r, ri) => (
                      <div key={r} className="rounded-xl py-3 px-2 text-center border" style={{ borderColor: `${cs.color}20`, background: `linear-gradient(180deg, ${cs.color}06, transparent)` }}>
                        <div className="text-[10px] font-bold leading-tight" style={{ color: cs.color }}>{r}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#F1F5F9]">
                    <a href="/book-demo" className="group/link inline-flex items-center gap-1.5 text-xs font-bold transition-colors" style={{ color: cs.color }}>
                      Read full case study
                      <ArrowRight size={12} className="transition-transform group-hover/link:translate-x-0.5" />
                    </a>
                  </div>
                </div>
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
            <h2 className="section-title mt-3">Trusted By Educational Leaders</h2>
          </motion.div>

          <div className="relative mx-auto max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div key={testimonialActive} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}
                className="rounded-3xl border border-[#E2E8F0] bg-white p-8 shadow-xl sm:p-12">
                <Quote size={28} className="mb-4 text-[#6C4CF1]/20" />
                <p className="text-lg leading-relaxed italic" style={{ color: '#0F172A' }}>&ldquo;{testimonials[testimonialActive].content}&rdquo;</p>
                <div className="mt-8 flex items-center gap-4">
                  <img src={testimonials[testimonialActive].avatar} alt={testimonials[testimonialActive].name}
                    className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white shadow-md" />
                  <div>
                    <div className="text-sm font-extrabold" style={{ color: '#0F172A' }}>{testimonials[testimonialActive].name}</div>
                    <div className="text-xs font-semibold" style={{ color: '#64748B' }}>{testimonials[testimonialActive].role}</div>
                    <div className="mt-1 flex gap-0.5">
                      {Array.from({ length: testimonials[testimonialActive].rating }).map((_, ri) => (
                        <Star key={ri} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="mt-6 flex items-center justify-center gap-2">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setTestimonialActive(i)}
                  className={`h-2 rounded-full transition-all ${i === testimonialActive ? 'w-8 bg-[#6C4CF1]' : 'w-2 bg-[#E2E8F0]'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <motion.div {...fadeUp} className="mx-auto mb-12 max-w-2xl text-center">
            <span className="eyebrow mb-4">FAQ</span>
            <h2 className="section-title mt-3">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
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

      {/* ===== CTA ===== */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl px-8 py-14 sm:px-14 sm:py-16 shadow-xl border border-[#E2E8F0]"
            style={{ background: 'linear-gradient(90deg, #6C4CF1 0%, #8B5CF6 30%, #F8FAFF 70%, #FFFFFF 100%)' }}>
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#6C4CF1]/5 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-[#8B5CF6]/5 blur-3xl" />

            <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:text-left">
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl text-white">Ready To Transform Education?</h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80 lg:mx-0">Join thousands of institutions already growing with Prasynx.</p>
                <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
                  <a href="/book-demo" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl" style={{ color: '#6C4CF1' }}>
                    Get Started <ArrowRight className="h-5 w-5" />
                  </a>
                  <a href="/book-demo" className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-lg">
                    Book Demo
                  </a>
                </div>
              </div>
              <div className="relative shrink-0 grid h-48 w-48 place-items-center sm:h-56 sm:w-56">
                <img src="/logo.png" alt="Prasynx" className="h-20 w-auto object-contain" />
                  {['AI Powered', 'Smart Learning', 'Analytics', 'Automation', 'Growth', 'Results', 'Secure', 'Insights'].map((badge, bi) => (
                    <motion.div key={badge} className="absolute rounded-xl px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm border"
                      style={{
                        background: 'white',
                        color: '#6C4CF1',
                        borderColor: '#E8E0FF',
                        top: bi === 0 ? '-10px' : bi === 1 ? '10%' : bi === 2 ? '35%' : bi === 3 ? '60%' : bi === 4 ? '10%' : bi === 5 ? '60%' : 'auto',
                        right: bi === 0 ? '-10px' : bi === 1 ? '-28px' : bi === 2 ? '-24px' : bi === 3 ? '-28px' : 'auto',
                        left: bi === 4 ? '-28px' : bi === 5 ? '-24px' : bi === 6 ? '-16px' : 'auto',
                        bottom: bi === 6 ? '10%' : bi === 7 ? '-10px' : 'auto',
                      }}
                      animate={{ y: [0, bi % 2 === 0 ? -5 : 5, 0] }}
                      transition={{ duration: 3 + (bi % 3), repeat: Infinity, ease: 'easeInOut' }}>
                      ✨ {badge}
                    </motion.div>
                  ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </SiteShell>
  );
}
