"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, ChevronLeft, ChevronRight, GraduationCap, Users, BookOpen, Building2, Briefcase, Bot, Sparkles, Star, Shield, Zap, BarChart3, Globe, Layers, Lock, Headphones, Network, MoveRight } from 'lucide-react';
import SiteShell from '../components/SiteShell';

const primary = '#7C3AED';
const secondary = '#8B5CF6';

const fadeUp = { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
const fadeIn = { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true }, transition: { duration: 0.6 } };
const stagger = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, staggerChildren: 0.1 } };

const roles = [
  { id: 'student', label: 'Student', icon: GraduationCap, color: '#7C3AED', desc: 'Personalized learning, AI tutoring, career guidance & progress tracking.', benefits: ['AI Learning Assistant', 'Career Guidance', 'Skill Development', 'Digital Certificates'] },
  { id: 'parent', label: 'Parent', icon: Users, color: '#EC4899', desc: 'Real-time insights into your child\'s academic journey & school communication.', benefits: ['Attendance Tracking', 'Performance Monitoring', 'Fee Management', 'Instant Alerts'] },
  { id: 'teacher', label: 'Teacher', icon: BookOpen, color: '#10B981', desc: 'Smart lesson planning, AI content creation & comprehensive assessment tools.', benefits: ['Lesson Planning', 'AI Content Creation', 'Assessment Tools', 'Class Management'] },
  { id: 'institution', label: 'Institution', icon: Building2, color: '#F59E0B', desc: 'Complete ERP with SIS, finance, examinations & administration modules.', benefits: ['Student Information System', 'Finance Management', 'Examinations', 'Analytics'] },
  { id: 'recruiter', label: 'Recruiter', icon: Briefcase, color: '#3B82F6', desc: 'Discover top talent, manage campus hiring & build internship programs.', benefits: ['Candidate Discovery', 'Campus Hiring', 'AI Candidate Matching', 'Recruitment Analytics'] },
  { id: 'organization', label: 'Organization', icon: Building2, color: '#8B5CF6', desc: 'Upskill your workforce with training programs & learning management.', benefits: ['Training Programs', 'Learning Management', 'Certification Tracking', 'Reporting'] },
];

const stakeholders = [
  { title: 'For Students', role: 'student', color: '#7C3AED', img: 'S' },
  { title: 'For Parents', role: 'parent', color: '#EC4899', img: 'P' },
  { title: 'For Teachers', role: 'teacher', color: '#10B981', img: 'T' },
  { title: 'For Institutions', role: 'institution', color: '#F59E0B', img: 'I' },
  { title: 'For Recruiters', role: 'recruiter', color: '#3B82F6', img: 'R' },
  { title: 'For Organizations', role: 'organization', color: '#8B5CF6', img: 'O' },
];

const testimonials = [
  { name: 'Ananya Sharma', role: 'Student', text: 'Prerana AI has completely transformed how I study. My grades have improved significantly!', avatar: 'AS', color: '#7C3AED' },
  { name: 'Rajesh Kumar', role: 'Parent', text: 'I can now track my daughter\'s progress in real-time. The peace of mind is invaluable.', avatar: 'RK', color: '#EC4899' },
  { name: 'Priya Singh', role: 'Teacher', text: 'Lesson planning used to take hours. Now with AI assistance, I focus on what matters — teaching.', avatar: 'PS', color: '#10B981' },
  { name: 'Dr. Amit Verma', role: 'Principal', text: 'Prasynx has streamlined our entire institution. A game-changer for education management.', avatar: 'AV', color: '#F59E0B' },
  { name: 'Neha Patel', role: 'Recruiter', text: 'Finding the right talent has never been easier. The AI matching is incredibly accurate.', avatar: 'NP', color: '#3B82F6' },
];

const whyCards = [
  { icon: Bot, title: 'AI Powered', desc: 'Advanced AI drives personalized learning, smart recommendations, and automation across the platform.' },
  { icon: Layers, title: 'Scalable', desc: 'From a single classroom to thousands of institutions, Prasynx scales with your needs.' },
  { icon: Shield, title: 'Secure', desc: 'Enterprise-grade security with encryption, access controls, and compliance certifications.' },
  { icon: Globe, title: 'Unified Ecosystem', desc: 'One platform connecting every stakeholder in the education journey seamlessly.' },
  { icon: Zap, title: 'Easy Integration', desc: 'Integrate with existing tools via APIs, SSO, and pre-built connectors.' },
  { icon: Headphones, title: 'Dedicated Support', desc: '24/7 support with dedicated account managers and implementation specialists.' },
];

function SectionHeading({ badge, title, subtitle, light }: { badge: string; title: string; subtitle?: string; light?: boolean }) {
  return (
    <motion.div {...fadeUp} className="mx-auto mb-16 max-w-3xl text-center">
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold ${light ? 'border-white/20 text-white/80' : 'border-[#E8E0FF] bg-[#F3F0FF] text-[#7C3AED]'}`}>
        <Sparkles size={12} /> {badge}
      </span>
      <h2 className={`mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl ${light ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
      {subtitle && <p className={`mt-4 text-base leading-relaxed ${light ? 'text-white/60' : 'text-slate-500'}`}>{subtitle}</p>}
    </motion.div>
  );
}

function SolutionCard({ icon: Icon, title, desc, benefits, color, index }: { icon: any; title: string; desc: string; benefits: string[]; color: string; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#7C3AED]/10">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 transition-all duration-500 group-hover:opacity-10" style={{ background: `radial-gradient(circle, ${color}, transparent)` }} />
      <span className="grid h-14 w-14 place-items-center rounded-2xl text-white text-xl font-black transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl" style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}><Icon size={24} /></span>
      <h3 className="mt-6 text-xl font-black text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">{desc}</p>
      <ul className="mt-6 space-y-2.5">
        {benefits.map(b => (
          <li key={b} className="flex items-center gap-2.5 text-sm font-semibold text-slate-700"><CheckCircle size={14} className="shrink-0" style={{ color }} />{b}</li>
        ))}
      </ul>
      <Link href={`/solutions/${roles.find(r => title?.includes(r.label))?.id || 'student'}`}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-black transition hover:gap-2.5" style={{ color }}>
        Learn More <ArrowRight size={14} />
      </Link>
    </motion.div>
  );
}

function DashboardMockup({ label, items, color }: { label: string; items: Array<{ label: string; value: string; up?: boolean }>; color: string }) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-lg shadow-[#7C3AED]/5">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
        <span className="text-sm font-black text-slate-700">{label}</span>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live</span>
      </div>
      <div className="mt-4 space-y-4">
        {items.map(item => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{item.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900">{item.value}</span>
              {item.up !== undefined && (
                <span className={`text-[10px] font-bold ${item.up ? 'text-emerald-500' : 'text-red-400'}`}>{item.up ? '↑' : '↓'}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: '72%', background: `linear-gradient(90deg, ${color}, ${secondary})` }} />
      </div>
    </div>
  );
}

function EcosystemNode({ label, x, y, color, pulse }: { label: string; x: number; y: number; color: string; pulse?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
      className="absolute flex flex-col items-center" style={{ left: `${x}%`, top: `${y}%` }}>
      <motion.div animate={pulse ? { scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] } : {}} transition={{ duration: 3, repeat: Infinity }}
        className="grid h-14 w-14 place-items-center rounded-2xl text-white shadow-xl backdrop-blur-sm transition hover:scale-110" style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>
        <span className="text-lg font-black">{label.charAt(0)}</span>
      </motion.div>
      <span className="mt-2 whitespace-nowrap text-[11px] font-bold text-slate-700">{label}</span>
    </motion.div>
  );
}

function TestimonialCard({ t, active }: { t: typeof testimonials[0]; active: boolean }) {
  return (
    <motion.div initial={false} animate={{ opacity: active ? 1 : 0.4, scale: active ? 1 : 0.95 }} transition={{ duration: 0.4 }}
      className={`rounded-3xl border p-8 transition-shadow ${active ? 'border-[#E8E0FF] bg-white shadow-xl shadow-[#7C3AED]/10' : 'border-[#E2E8F0] bg-white/50'}`}>
      <div className="flex items-center gap-1 mb-4">{Array(5).fill(0).map((_, i) => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}</div>
      <p className="text-base leading-relaxed text-slate-600">&ldquo;{t.text}&rdquo;</p>
      <div className="mt-6 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full text-xs font-bold text-white" style={{ background: t.color }}>{t.avatar}</span>
        <div><p className="text-sm font-black text-slate-900">{t.name}</p><p className="text-xs font-semibold text-slate-500">{t.role}</p></div>
      </div>
    </motion.div>
  );
}

export default function Solutions() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeStakeholder, setActiveStakeholder] = useState<string | null>(null);

  useEffect(() => {
    if (testimonials.length === 0) return;
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 4000);
    return () => clearInterval(t);
  }, []);

  const stakeholderContent: Record<string, { title: string; features: string[]; mockup: { label: string; items: Array<{ label: string; value: string; up?: boolean }> } }> = {
    student: {
      title: 'Empowering Students To Learn & Grow',
      features: ['AI Learning Assistant — 24/7 personalized tutoring with Prerana AI', 'Career Guidance — Skill assessments and roadmap planning', 'Internship Opportunities — Connect with top recruiters', 'Skill Development — Interactive courses and certifications', 'Progress Tracking — Real-time academic performance insights', 'Digital Certifications — Blockchain-verified credentials'],
      mockup: { label: 'Student Dashboard', items: [{ label: 'Current GPA', value: '8.7/10', up: true }, { label: 'Courses Completed', value: '24' }, { label: 'Attendance', value: '94%', up: true }, { label: 'Rank', value: '#3' }] }
    },
    parent: {
      title: 'Stay Connected To Your Child\'s Success',
      features: ['Attendance Tracking — Real-time attendance with instant alerts', 'Performance Monitoring — Detailed academic reports and analytics', 'Communication Tools — Direct messaging with teachers', 'Fee Management — Easy fee payment and invoice tracking', 'Notifications — Instant updates on events and activities', 'Reports — Comprehensive progress reports and insights'],
      mockup: { label: 'Parent Portal', items: [{ label: 'Attendance This Month', value: '96%', up: true }, { label: 'Avg. Score', value: '85%', up: true }, { label: 'Pending Fees', value: '₹0' }, { label: 'Upcoming Events', value: '4' }] }
    },
    teacher: {
      title: 'Teaching Made Smarter',
      features: ['Lesson Planning — AI-assisted curriculum and lesson structuring', 'AI Content Creation — Generate quizzes, assignments & study materials', 'Assessment Tools — Automated grading and personalized feedback', 'Performance Analytics — Deep insights into student performance', 'Communication Hub — Connect with students and parents seamlessly', 'Class Management — Attendance, seating, and behavior tracking'],
      mockup: { label: 'Teacher Dashboard', items: [{ label: 'Active Classes', value: '6' }, { label: 'Students', value: '180' }, { label: 'Avg. Class Score', value: '82%', up: true }, { label: 'Assignments Due', value: '3' }] }
    },
    institution: {
      title: 'Run Your Institution Efficiently',
      features: ['Student Information System — Complete student lifecycle management', 'Attendance Management — Automated attendance across all classes', 'Finance Management — Fee collection, payroll, and budgeting', 'Examinations — Online exams, scheduling, and result publishing', 'Analytics — Institutional dashboards with actionable insights', 'Administration — Staff, timetable, and resource management'],
      mockup: { label: 'Admin Dashboard', items: [{ label: 'Total Students', value: '2,450' }, { label: 'Revenue (MTD)', value: '₹1.2Cr', up: true }, { label: 'Staff Count', value: '186' }, { label: 'Avg. Attendance', value: '91%', up: true }] }
    },
    recruiter: {
      title: 'Connect With Future Talent',
      features: ['Candidate Discovery — AI-powered search and filtering', 'Campus Hiring — Virtual recruitment drives and events', 'Internship Programs — Structured internship management', 'AI Candidate Matching — Smart matching based on skills & requirements', 'Interview Management — Schedule, conduct, and evaluate interviews', 'Recruitment Analytics — Track hiring metrics and pipeline'],
      mockup: { label: 'Recruiter Dashboard', items: [{ label: 'Active Jobs', value: '24' }, { label: 'Candidates', value: '1,890' }, { label: 'Interviews Scheduled', value: '45' }, { label: 'Hires This Month', value: '12', up: true }] }
    },
    organization: {
      title: 'Upskill & Grow Your Workforce',
      features: ['Training Programs — Design and deploy custom training modules', 'Learning Management — Track employee learning journeys', 'Employee Assessments — Skill gap analysis and evaluations', 'Certification Tracking — Manage certifications and renewals', 'Analytics — Workforce development insights and ROI tracking', 'Reporting — Comprehensive training and compliance reports'],
      mockup: { label: 'Organization Dashboard', items: [{ label: 'Active Learners', value: '1,240', up: true }, { label: 'Courses Completed', value: '3,892' }, { label: 'Certifications', value: '845', up: true }, { label: 'Avg. Completion', value: '87%', up: true }] }
    }
  };

  const currentStakeholder = activeStakeholder && stakeholderContent[activeStakeholder] ? activeStakeholder : 'student';

  return (
    <SiteShell>
      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden bg-white pb-32 pt-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-center">
            {/* Left */}
            <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex-1 max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-4 py-1.5 text-xs font-bold text-[#7C3AED]">
                <Sparkles size={12} /> Prasynx Solutions
              </span>
              <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl text-slate-950">
                One Intelligent Platform<br />
                For Every Education<br />
                <span className="bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">Journey</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-500 lg:text-lg">
                From students and parents to institutions, recruiters, and organizations, Prasynx delivers AI-powered solutions that simplify learning, management, communication, and career growth.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/solutions" className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-8 py-4 text-sm font-bold text-white shadow-xl shadow-[#7C3AED]/25 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#7C3AED]/35">
                  Explore Solutions <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </Link>
                <Link href="/book-demo" className="group inline-flex items-center gap-2 rounded-2xl border-2 border-[#E2E8F0] bg-white px-8 py-4 text-sm font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-1 hover:border-[#7C3AED]/30 hover:shadow-lg hover:shadow-[#7C3AED]/10">
                  Book Demo
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Right — Hero Image */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full flex items-center justify-center pointer-events-none">
          <motion.img
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            src="/solutionhero.png"
            alt="Prasynx Solutions Ecosystem"
            className="w-full max-w-[900px] h-auto object-contain -mt-24"
            style={{ maskImage: 'radial-gradient(ellipse 80% 70% at center, black 40%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at center, black 40%, transparent 80%)' }}
          />
        </motion.div>
      </section>

      {/* SECTION 2: WHO WE SERVE */}
      <section className="px-6 py-28 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading badge="Who We Serve" title="Built For Every Stakeholder" subtitle="Tailored solutions for every role in the education ecosystem, powered by AI and designed for impact." />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((r, i) => <SolutionCard key={r.id} icon={r.icon} title={`For ${r.label}s`} desc={r.desc} benefits={r.benefits} color={r.color} index={i} />)}
          </div>
        </div>
      </section>

      {/* SECTION 3-8: STAKEHOLDER SOLUTIONS */}
      {Object.entries(stakeholderContent).map(([key, content], idx) => (
        <section key={key} className={`px-6 py-24 lg:px-12 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFF]'}`}>
          <div className="mx-auto max-w-7xl">
            <div className={`flex flex-col items-center gap-16 lg:flex-row ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <motion.div {...fadeUp} className="flex-1">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-4 py-1.5 text-xs font-bold text-[#7C3AED]">
                  {roles.find(r => r.id === key)?.icon && <span className="flex">{(() => { const I = roles.find(r => r.id === key)?.icon; return I ? <I size={12} /> : null; })()}</span>}
                  {roles.find(r => r.id === key)?.label} Solutions
                </span>
                <h2 className="mt-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">{content.title}</h2>
                <div className="mt-8 space-y-4">
                  {content.features.map(f => (
                    <div key={f} className="flex items-start gap-3">
                      <CheckCircle size={16} className="mt-0.5 shrink-0 text-[#7C3AED]" />
                      <span className="text-sm font-semibold leading-relaxed text-slate-600">{f}</span>
                    </div>
                  ))}
                </div>
                <Link href={`/solutions/${key}`} className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#7C3AED]/20 transition hover:-translate-y-0.5 hover:shadow-xl">
                  Explore {roles.find(r => r.id === key)?.label} Features <ArrowRight size={14} />
                </Link>
              </motion.div>
              <motion.div {...fadeIn} className="flex-1 w-full max-w-lg">
                <DashboardMockup label={content.mockup.label} items={content.mockup.items} color={roles.find(r => r.id === key)?.color || primary} />
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* SECTION 9: PRERANA AI */}
      <section className="relative overflow-hidden px-6 py-28 lg:px-12" style={{ background: 'linear-gradient(135deg, #2D1B69, #4C1D95, #5B21B6, #6D28D9)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#8B5CF6]/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)] bg-size-[32px_32px]" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <SectionHeading badge="AI Platform" title="Powered By Prerana AI" subtitle="Intelligent AI that learns, adapts, and enhances every aspect of the education experience." light />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Bot, title: 'AI Tutor', desc: '24/7 personalized tutoring that adapts to each student\'s learning pace and style.', color: '#7C3AED' },
              { icon: Briefcase, title: 'AI Career Coach', desc: 'Smart career guidance with skill assessments and personalized roadmap planning.', color: '#8B5CF6' },
              { icon: BookOpen, title: 'AI Teacher Assistant', desc: 'Automates lesson planning, content creation, grading, and student insights.', color: '#A855F7' },
              { icon: BarChart3, title: 'AI Analytics', desc: 'Predictive analytics for student performance, dropout risk, and intervention recommendations.', color: '#C084FC' },
              { icon: Sparkles, title: 'AI Content Generator', desc: 'Generates quizzes, assignments, study materials, and exam papers instantly.', color: '#7C3AED' },
              { icon: Zap, title: 'AI Recommendations', desc: 'Personalized course, career, and extracurricular recommendations for every learner.', color: '#8B5CF6' },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/5 opacity-0 transition-all duration-500 group-hover:opacity-100" />
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-white text-xl font-black backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl" style={{ color: item.color }}>
                  <item.icon size={24} />
                </span>
                <h3 className="mt-5 text-lg font-black text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10: PLATFORM INTEGRATION */}
      <section className="px-6 py-28 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading badge="Integration" title="Everything Connected In One Ecosystem" subtitle="Seamless data flow between every stakeholder, powered by the Prasynx Core Platform." />
          <motion.div {...fadeUp} className="relative mx-auto mt-12 max-w-3xl">
            {/* Flow diagram */}
            <div className="space-y-0">
              {['Students', 'Teachers', 'Parents', 'Institutions', 'Recruiters', 'Organizations'].map((item, i) => (
                <div key={item} className="flex flex-col items-center">
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                    className="flex h-16 w-64 items-center justify-center rounded-2xl border-2 border-[#E8E0FF] bg-white font-black text-slate-900 shadow-lg shadow-[#7C3AED]/5 transition-all hover:-translate-y-0.5 hover:border-[#7C3AED]/30 hover:shadow-xl sm:w-80">
                    {item}
                  </motion.div>
                  {i < 6 && (
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.15 + 0.1 }}
                      className="flex flex-col items-center py-2">
                      <div className="h-6 w-0.5 bg-gradient-to-b from-[#7C3AED] to-[#8B5CF6]" />
                      <ArrowRight size={12} className="text-[#7C3AED]" />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
            {/* Core Platform */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.9 }}
              className="mx-auto mt-4 flex h-20 w-72 items-center justify-center rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] font-black text-white shadow-2xl shadow-[#7C3AED]/30 sm:w-96">
              <Bot size={20} className="mr-2" /> Prasynx Core Platform
            </motion.div>
            <p className="mt-6 text-center text-sm font-semibold text-slate-500">All connected through a unified, real-time data layer</p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 11: SUCCESS STORIES */}
      <section className="bg-[#F8FAFF] px-6 py-28 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading badge="Impact" title="Real Results. Real Impact." subtitle="Trusted by leading educational institutions and organizations worldwide." />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: '50,000+', label: 'Students', icon: Users },
              { value: '500+', label: 'Institutions', icon: Building2 },
              { value: '10M+', label: 'Learning Sessions', icon: BarChart3 },
              { value: '95%', label: 'Success Rate', icon: Star },
            ].map((m, i) => (
              <motion.div key={m.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group rounded-3xl border border-[#E2E8F0] bg-white p-8 text-center transition-all duration-500 hover:-translate-y-1 hover:border-[#7C3AED]/20 hover:shadow-2xl hover:shadow-[#7C3AED]/10">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#F3F0FF] text-[#7C3AED] transition-all duration-500 group-hover:scale-110 group-hover:bg-[#7C3AED] group-hover:text-white"><m.icon size={24} /></span>
                <p className="mt-4 text-3xl font-black text-slate-900">{m.value}</p>
                <p className="mt-1 text-sm font-bold text-slate-500">{m.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 12: WHY CHOOSE PRASYNX */}
      <section className="px-6 py-28 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading badge="Why Us" title="Why Leading Institutions Choose Prasynx" subtitle="Built for scale, security, and seamless integration across the education ecosystem." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyCards.map((c, i) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:border-[#7C3AED]/20 hover:shadow-2xl hover:shadow-[#7C3AED]/10">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F3F0FF] text-[#7C3AED] transition-all duration-500 group-hover:scale-110 group-hover:bg-[#7C3AED] group-hover:text-white"><c.icon size={22} /></span>
                <h3 className="mt-5 text-lg font-black text-slate-900">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 13: TESTIMONIALS */}
      <section className="bg-[#F8FAFF] px-6 py-28 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading badge="Testimonials" title="Trusted Across The Education Ecosystem" subtitle="Hear from the people who use Prasynx every day." />
          <div className="relative mx-auto max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div key={activeTestimonial} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                <TestimonialCard t={testimonials[activeTestimonial]} active />
              </motion.div>
            </AnimatePresence>
            <div className="mt-8 flex items-center justify-center gap-4">
              <button type="button" onClick={() => setActiveTestimonial(p => (p - 1 + testimonials.length) % testimonials.length)}
                className="grid h-10 w-10 place-items-center rounded-full border border-[#E2E8F0] bg-white text-slate-600 transition hover:border-[#7C3AED]/30 hover:text-[#7C3AED]">
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button key={i} type="button" onClick={() => setActiveTestimonial(i)} className={`h-2 rounded-full transition-all ${i === activeTestimonial ? 'w-8 bg-[#7C3AED]' : 'w-2 bg-[#CBD5E1]'}`} />
                ))}
              </div>
              <button type="button" onClick={() => setActiveTestimonial(p => (p + 1) % testimonials.length)}
                className="grid h-10 w-10 place-items-center rounded-full border border-[#E2E8F0] bg-white text-slate-600 transition hover:border-[#7C3AED]/30 hover:text-[#7C3AED]">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 14: FINAL CTA */}
      <section className="relative overflow-hidden px-6 py-28 lg:px-12" style={{ background: 'linear-gradient(135deg, #2D1B69, #4C1D95, #5B21B6, #6D28D9)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#8B5CF6]/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div {...fadeUp}>
            <Bot size={48} className="mx-auto text-white/60" />
            <h2 className="mt-6 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">Ready To Transform Education?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/60">Discover how Prasynx can help learners, educators, institutions, and recruiters achieve more with AI-powered solutions.</p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/get-started" className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-[#7C3AED] shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl">
                Get Started <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </Link>
              <Link href="/book-demo" className="group inline-flex items-center gap-2 rounded-2xl border-2 border-white/20 px-8 py-4 text-sm font-bold text-white transition-all hover:-translate-y-1 hover:border-white/40 hover:bg-white/5">
                Book Demo <MoveRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </SiteShell>
  );
}
