"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Bot, BarChart3, BookOpen, Briefcase, Calendar,
  CheckCircle2, ChevronDown, Clock, GraduationCap, Quote, Sparkles, Star,
  Target, TrendingUp, Trophy, Users, Zap, Award, Bell,
} from 'lucide-react';
import Link from 'next/link';
import SiteShell from '../components/SiteShell';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
};

const features = [
  { icon: Bot, title: 'AI Learning Assistant', desc: 'Prerana AI tutors you with personalized study plans, instant doubt solving, and adaptive learning paths tailored to your pace.', color: '#7C3AED' },
  { icon: Clock, title: 'Smart Attendance', desc: 'Biometric integration, real-time attendance tracking, instant alerts, and comprehensive attendance reports with analytics.', color: '#7C3AED' },
  { icon: BookOpen, title: 'Exam Preparation', desc: 'Practice tests, mock exams, performance analytics, and AI-powered recommendations to boost your scores.', color: '#7C3AED' },
  { icon: Briefcase, title: 'Career Guidance', desc: 'AI career counseling, resume building, internship matching, and personalized roadmaps for your future.', color: '#7C3AED' },
  { icon: Trophy, title: 'Scholarship Finder', desc: 'Discover scholarships, grants, and financial aid opportunities matched to your profile and achievements.', color: '#7C3AED' },
  { icon: TrendingUp, title: 'Progress Tracking', desc: 'Real-time grade monitoring, skill development tracking, and visual progress dashboards.', color: '#7C3AED' },
];

const scholarships = [
  { name: 'Merit Excellence Scholarship', amount: '₹1,00,000', eligibility: '95%+ in Class 12', icon: Star, color: '#7C3AED' },
  { name: 'STEM Innovation Grant', amount: '₹75,000', eligibility: 'Science stream with 90%+', icon: Zap, color: '#7C3AED' },
  { name: 'Sports Achievement Award', amount: '₹50,000', eligibility: 'National/State level athletes', icon: Trophy, color: '#7C3AED' },
  { name: 'Need-Based Financial Aid', amount: '₹2,00,000', eligibility: 'Family income < ₹5L/year', icon: Award, color: '#7C3AED' },
];

const testimonials = [
  { name: 'Ananya Sharma', role: 'Class 12, DPS School', content: 'Prerana AI helped me improve my Physics grade from C to A in just 3 months. The personalized study plan was a game-changer!', rating: 5, initials: 'AS' },
  { name: 'Rohan Verma', role: 'Engineering Aspirant', content: 'The career guidance feature helped me discover my passion for AI engineering. The roadmap is incredibly detailed and practical.', rating: 5, initials: 'RV' },
  { name: 'Priya Patel', role: 'Medical Entrance Student', content: 'Tracking my progress in real-time and getting AI recommendations for weak areas made my NEET prep 10x more effective.', rating: 5, initials: 'PP' },
];

const faqs = [
  { q: 'How do I access Prerana AI Learning Assistant?', a: 'Once you log in to your student portal, Prerana AI is available 24/7 from the AI Assistant tab. You can ask questions, get study recommendations, and track your learning progress.' },
  { q: 'Can I track my attendance in real-time?', a: 'Yes! Your attendance is updated in real-time as teachers mark it. You can view daily, weekly, and monthly attendance reports with detailed analytics.' },
  { q: 'How are scholarships awarded?', a: 'Scholarships are awarded based on academic performance, extracurricular achievements, and financial need. The AI system matches you with relevant opportunities automatically.' },
  { q: 'Is the portal accessible on mobile?', a: 'Absolutely. The student portal is fully responsive and works seamlessly on smartphones, tablets, and desktops.' },
  { q: 'How does the career guidance feature work?', a: 'Our AI analyzes your academic performance, interests, and aptitude to create a personalized career roadmap with milestones, recommended courses, and internship opportunities.' },
];

const careerMilestones = [
  { year: 'Class 10', title: 'Foundation', desc: 'Build strong fundamentals', icon: BookOpen, color: '#7C3AED' },
  { year: 'Class 11-12', title: 'Exploration', desc: 'Identify interests & streams', icon: Target, color: '#7C3AED' },
  { year: 'UG Degree', title: 'Specialization', desc: 'Deep dive into chosen field', icon: GraduationCap, color: '#7C3AED' },
  { year: 'Internships', title: 'Experience', desc: 'Real-world industry exposure', icon: Briefcase, color: '#7C3AED' },
  { year: 'Placement', title: 'Career Launch', desc: 'Start your dream career', icon: TrendingUp, color: '#7C3AED' },
];

export default function StudentPortalPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <SiteShell>
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#7C3AED]/10 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[#7C3AED]/10 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#DBEAFE] bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4 text-[#7C3AED]" />
                <span className="text-xs font-extrabold text-[#1E40AF]">Student Portal</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
                className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold leading-[1.06] tracking-tight text-[#0F172A]">
                Learn Smarter.<br />
                Achieve<br />
                <span className="bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#7C3AED] bg-clip-text text-transparent">More.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-5 max-w-xl text-lg leading-relaxed text-[#475569]">
                Your all-in-one academic companion — AI-powered learning, attendance tracking, exam prep, career guidance, and scholarships, all in one place.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}
                className="mt-8 flex flex-wrap gap-4">
                <Link href="/student/login" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#7C3AED] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#7C3AED]/25 transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]">
                  Get Started Free <ArrowRight size={16} />
                </Link>
                <a href="#features" className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-bold text-[#475569] transition-all hover:border-[#7C3AED]/30 hover:text-[#7C3AED] hover:shadow-md">
                  Explore Features
                </a>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-8 flex flex-wrap gap-5 text-sm text-[#64748B]">
                {['AI Powered', 'Real-time Tracking', 'Career Ready', '24/7 Support'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> {item}</span>
                ))}
              </motion.div>
            </div>

            {/* Right Hero Illustration */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
              className="relative hidden lg:flex items-end justify-end min-h-[500px] lg:-mr-16 xl:-mr-28 lg:-mb-24">
              
              {/* Soft purple radial glow behind illustration */}
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#7C3AED]/10 via-[#6366F1]/5 to-transparent rounded-full blur-[100px] opacity-80 pointer-events-none" />
              
              <div className="relative z-10 flex items-end justify-end w-full">
                <motion.img
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  src="/studentportalhero.png"
                  alt="Prasynx Student Portal Ecosystem"
                  className="relative max-h-[480px] w-auto object-contain object-right object-bottom select-none pointer-events-none drop-shadow-[0_20px_50px_rgba(124,58,237,0.12)]"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="relative -mt-8 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="rounded-2xl border border-[#DBEAFE] bg-white/80 p-6 backdrop-blur-sm shadow-sm sm:p-8">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-[#94A3B8]">Trusted By Students Across India</p>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#E2E8F0] pt-6 sm:grid-cols-4">
              {[
                { value: '50K+', label: 'Active Students', color: '#7C3AED' },
                { value: '500+', label: 'Institutions', color: '#7C3AED' },
                { value: '10M+', label: 'Learning Sessions', color: '#7C3AED' },
                { value: '92%', label: 'Success Rate', color: '#7C3AED' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs font-semibold text-[#64748B]">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mx-auto mb-14 max-w-2xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-1.5 text-[11px] font-bold tracking-wide text-[#7C3AED]">Features</span>
            <h2 className="text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold leading-[1.15] tracking-tight text-[#0F172A]">Everything You Need<br />To Excel Academically</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-[#64748B]">AI-powered tools designed to make learning, tracking, and planning effortless.</p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="group relative rounded-2xl border border-[#E2E8F0] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#7C3AED]/30 hover:shadow-lg hover:shadow-[#7C3AED]/5">
                  <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-[#7C3AED]/0 to-[#7C3AED]/0 opacity-0 transition-opacity duration-300 group-hover:from-[#7C3AED]/3 group-hover:to-[#7C3AED]/3 group-hover:opacity-100" />
                  <div className="relative mb-4 grid h-12 w-12 place-items-center rounded-xl bg-[#EFF6FF] text-[#7C3AED] transition-all group-hover:bg-gradient-to-br group-hover:from-[#7C3AED] group-hover:to-[#7C3AED] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#7C3AED]/30">
                    <Icon size={22} />
                  </div>
                  <h3 className="relative text-base font-extrabold text-[#0F172A]">{f.title}</h3>
                  <p className="relative mt-1.5 text-sm leading-relaxed text-[#64748B]">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== DASHBOARD SCREENSHOTS ===== */}
      <section className="px-4 py-20 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%)' }}>
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mx-auto mb-14 max-w-2xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-1.5 text-[11px] font-bold tracking-wide text-[#7C3AED]">Dashboard</span>
            <h2 className="text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold leading-[1.15] tracking-tight text-[#0F172A]">Your Academic Hub</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-[#64748B]">Everything you need at a glance. Track grades, attendance, and progress in real-time.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-lg sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="h-2.5 w-2.5 rounded-full bg-yellow-400" /><span className="h-2.5 w-2.5 rounded-full bg-green-400" /></div>
                <span className="ml-2 rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[9px] font-bold text-[#64748B]">student.prasynx.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[8px] font-bold text-[#64748B]">TERM 2 - 2025-26</span>
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#EFF6FF] text-[#7C3AED]"><Bell size={12} /></span>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-4 gap-2">
              <div className="rounded-lg border border-[#E2E8F0] p-2">
                <div className="text-[8px] font-semibold text-[#94A3B8]">Current GPA</div>
                <div className="text-sm font-black text-[#7C3AED]">3.8</div>
              </div>
              <div className="rounded-lg border border-[#E2E8F0] p-2">
                <div className="text-[8px] font-semibold text-[#94A3B8]">Attendance</div>
                <div className="text-sm font-black text-[#7C3AED]">94%</div>
              </div>
              <div className="rounded-lg border border-[#E2E8F0] p-2">
                <div className="text-[8px] font-semibold text-[#94A3B8]">Assignments</div>
                <div className="text-sm font-black text-[#7C3AED]">5/6</div>
              </div>
              <div className="rounded-lg border border-[#E2E8F0] p-2">
                <div className="text-[8px] font-semibold text-[#94A3B8]">Rank</div>
                <div className="text-sm font-black text-[#7C3AED]">#12</div>
              </div>
            </div>

            <table className="w-full text-left text-[9px]">
              <thead>
                <tr className="border-b border-[#F1F5F9] text-[#94A3B8]">
                  <th className="pb-1.5 font-semibold">Subject</th>
                  <th className="pb-1.5 font-semibold">Grade</th>
                  <th className="pb-1.5 font-semibold">Score</th>
                  <th className="pb-1.5 font-semibold">Attendance</th>
                  <th className="pb-1.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { subject: 'Mathematics', grade: 'A', score: '92%', att: '96%', ok: true },
                  { subject: 'Physics', grade: 'B+', score: '85%', att: '88%', ok: true },
                  { subject: 'Chemistry', grade: 'A-', score: '88%', att: '91%', ok: true },
                  { subject: 'English', grade: 'A+', score: '97%', att: '99%', ok: true },
                ].map((r) => (
                  <tr key={r.subject} className="border-b border-[#F8FAFF]">
                    <td className="py-1.5 font-semibold text-[#0F172A]">{r.subject}</td>
                    <td className="py-1.5 text-[#7C3AED] font-bold">{r.grade}</td>
                    <td className="py-1.5 text-[#64748B]">{r.score}</td>
                    <td className="py-1.5 text-[#64748B]">{r.att}</td>
                    <td className="py-1.5"><span className={`rounded-full px-1.5 py-0.5 text-[7px] font-bold ${r.ok ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{r.ok ? 'On Track' : 'Needs Focus'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-2 flex items-center justify-between rounded-lg p-2 bg-[#EFF6FF]">
              <span className="text-[8px] font-semibold text-[#64748B]">AI Insight: Focus on Physics problem-solving to boost your grade</span>
              <span className="text-[8px] font-bold text-[#7C3AED]">View Details →</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== AI LEARNING ASSISTANT ===== */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-[#7C3AED]/8 blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-[#7C3AED]/8 blur-[100px]" />
        </div>
        <div className="mx-auto max-w-7xl relative">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            
            {/* Left Column: Mascot Image */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="lg:col-span-5 flex justify-center">
              <div className="relative">
                {/* Soft backdrop glow */}
                <div className="absolute inset-0 -m-4 rounded-full bg-gradient-to-tr from-[#7C3AED]/10 to-transparent blur-2xl opacity-80" />
                <motion.img
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  src="/preranatutor.png"
                  alt="Prerana AI Tutor Mascot"
                  className="relative max-w-full h-auto max-h-[380px] object-contain select-none pointer-events-none drop-shadow-[0_20px_40px_rgba(124,58,237,0.18)]"
                />
              </div>
            </motion.div>

            {/* Right Column: Header & Chat Component */}
            <div className="lg:col-span-7 space-y-6">
              <motion.div {...fadeUp} className="text-left">
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-1.5 text-[11px] font-bold tracking-wide text-[#7C3AED]">
                  <Bot size={14} /> AI Learning Assistant
                </span>
                <h2 className="text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold leading-[1.15] tracking-tight text-[#0F172A]">
                  Meet Prerana AI<br />Your Personal Tutor
                </h2>
                <p className="mt-3 max-w-lg text-sm text-[#64748B]">
                  Available 24/7 to answer questions, explain concepts, and guide your learning journey.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-lg sm:p-5">
                <div className="flex items-center gap-2 rounded-t-lg border-b border-[#F1F5F9] pb-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#7C3AED] text-white">
                    <Bot size={14} />
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-extrabold text-[#0F172A]">Prerana AI <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[7px] font-bold text-green-700 ml-1">Online</span></p>
                    <p className="text-[8px] font-semibold text-[#94A3B8]">AI Learning Assistant</p>
                  </div>
                </div>
                <div className="space-y-2 py-3">
                  {[
                    { from: 'ai', text: 'Hello! I\'m Prerana AI. How can I help you with your studies today?' },
                    { from: 'user', text: 'Can you help me understand the Pythagorean theorem?' },
                    { from: 'ai', text: 'Of course! The Pythagorean theorem states that a² + b² = c², where c is the hypotenuse. Let me explain with a simple example...' },
                    { from: 'ai', text: 'Would you like me to quiz you on this topic or provide practice problems?' },
                  ].map((msg, i) => (
                    <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`rounded-xl px-3 py-2 max-w-[80%] text-[11px] leading-relaxed ${msg.from === 'user' ? 'bg-gradient-to-r from-[#7C3AED] to-[#7C3AED] text-white' : 'bg-[#F1F5F9] text-[#475569]'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 rounded-b-lg border-t border-[#F1F5F9] pt-3">
                  <input type="text" placeholder="Ask Prerana AI anything..."
                    className="flex-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFF] px-3 py-2 text-[11px] outline-none transition placeholder:text-[#94A3B8] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15" />
                  <button className="rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#7C3AED] px-3 py-2 text-white">
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== CAREER GUIDANCE ===== */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-[#7C3AED]/5 blur-[120px]" />
          <div className="absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-[#8B5CF6]/5 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mx-auto mb-16 max-w-2xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#EDE9FE] bg-[#F5F3FF] px-4 py-1.5 text-[11px] font-bold tracking-wide text-[#7C3AED]"><Briefcase size={14} /> Career Guidance</span>
            <h2 className="text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold leading-[1.15] tracking-tight text-[#0F172A]">Map Your Career Journey</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-[#64748B]">AI-powered career roadmaps that adapt to your interests, strengths, and goals.</p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#7C3AED]/30 to-transparent lg:block" />
            <div className="space-y-8 lg:space-y-16">
              {careerMilestones.map((m, i) => {
                const Icon = m.icon;
                const isLeft = i % 2 === 0;
                return (
                  <motion.div key={m.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }}
                    className={`relative flex flex-col items-center gap-4 lg:flex-row ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} lg:gap-8`}>
                    <div className={`flex-1 ${isLeft ? 'lg:text-right' : 'lg:text-left'}`}>
                      <div className={`inline-block rounded-2xl border border-[#EDE9FE] bg-white p-5 shadow-lg shadow-[#7C3AED]/5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#7C3AED]/10 ${isLeft ? 'lg:mr-8' : 'lg:ml-8'}`}>
                        <div className={`mb-3 flex items-center gap-2 ${isLeft ? 'lg:flex-row-reverse' : ''}`}>
                          <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold text-white" style={{ background: `linear-gradient(135deg, ${m.color}, ${m.color}dd)` }}>
                            <Icon size={11} /> {m.year}
                          </span>
                          <h3 className="text-sm font-extrabold text-[#0F172A]">{m.title}</h3>
                        </div>
                        <p className="text-xs leading-relaxed text-[#64748B]">{m.desc}</p>
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-[#7C3AED]">
                          <span className="h-1 w-1 rounded-full bg-[#7C3AED]" />
                          {['Skills Assessment', 'AI Recommendations'].includes(m.title) ? '2 actionable steps' : `${i + 1} of ${careerMilestones.length}`}
                        </div>
                      </div>
                    </div>
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] shadow-lg shadow-[#7C3AED]/30">
                      <Icon size={15} className="text-white" />
                    </div>
                    <div className="flex-1 lg:invisible" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SCHOLARSHIP OPPORTUNITIES ===== */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mx-auto mb-14 max-w-2xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-1.5 text-[11px] font-bold tracking-wide text-[#7C3AED]"><Trophy size={14} /> Scholarships</span>
            <h2 className="text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold leading-[1.15] tracking-tight text-[#0F172A]">Unlock Scholarship Opportunities</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-[#64748B]">AI-matched scholarships based on your academic profile and achievements.</p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {scholarships.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="group relative rounded-2xl border border-[#E2E8F0] bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-[#7C3AED]/5">
                  <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-[#7C3AED]/5 to-[#7C3AED]/5 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative flex items-center gap-3 mb-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#EFF6FF]" style={{ color: s.color }}>
                      <Icon size={18} />
                    </span>
                    <div className="text-xl font-black" style={{ color: s.color }}>{s.amount}</div>
                  </div>
                  <h3 className="relative text-sm font-extrabold text-[#0F172A]">{s.name}</h3>
                  <p className="relative mt-1 text-[11px] text-[#64748B]">{s.eligibility}</p>
                  <div className="relative mt-3">
                    <span className="text-[10px] font-bold text-[#7C3AED] group-hover:underline">Apply Now →</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="px-4 py-20 sm:px-6 lg:px-8" style={{ background: '#F8FAFF' }}>
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mx-auto mb-12 max-w-2xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#EDE9FE] bg-[#F5F3FF] px-4 py-1.5 text-[11px] font-bold tracking-wide text-[#7C3AED]"><Users size={14} /> Testimonials</span>
            <h2 className="text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold leading-[1.15] tracking-tight text-[#0F172A]">What Students Say</h2>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}
                className="group relative rounded-2xl border border-[#E2E8F0] bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#7C3AED]/5">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => (<Star key={j} size={12} className="fill-amber-400 text-amber-400" />))}
                </div>
                <p className="text-sm leading-relaxed text-[#475569]">&ldquo;{t.content}&rdquo;</p>
                <div className="mt-4 flex items-center gap-3 pt-3 border-t border-[#F1F5F9]">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#7C3AED] text-[10px] font-black text-white">{t.initials}</div>
                  <div>
                    <p className="text-xs font-extrabold text-[#0F172A]">{t.name}</p>
                    <p className="text-[10px] font-semibold text-[#64748B]">{t.role}</p>
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
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-1.5 text-[11px] font-bold tracking-wide text-[#7C3AED]">FAQ</span>
            <h2 className="text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold leading-[1.15] tracking-tight text-[#0F172A]">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.3 }}
                className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden transition-all hover:border-[#7C3AED]/20">
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-[#F8FAFF]">
                  <span className="text-sm font-extrabold text-[#0F172A] pr-4">{faq.q}</span>
                  <ChevronDown size={16} className={`shrink-0 text-[#94A3B8] transition-transform duration-200 ${faqOpen === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {faqOpen === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <div className="border-t border-[#F1F5F9] px-5 py-4">
                        <p className="text-sm leading-relaxed text-[#64748B]">{faq.a}</p>
                      </div>
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
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#7C3AED] px-8 py-12 text-center shadow-2xl sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold leading-[1.15] text-white">Ready to Start Your<br />Learning Journey?</h2>
            <p className="mx-auto mt-4 max-w-md text-base text-blue-100">Join 50,000+ students already using Prasynx to learn smarter and achieve more.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/student/login" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#7C3AED] shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]">
                Get Started Free <ArrowRight size={16} />
              </Link>
              <a href="#features" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20">
                Learn More
              </a>
            </div>
          </div>
        </motion.div>
      </section>
    </SiteShell>
  );
}
