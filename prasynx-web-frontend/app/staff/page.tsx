"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, CheckCircle2, ChevronDown, Star, Sparkles, BookOpen,
  Clock, Target, FileText, Brain, Zap, ClipboardList, PenTool,
  Presentation, Calendar, PieChart, Quote, Shield, Bot, HelpCircle,
  Layers, Award, Monitor, BookMarked, Mail, MapPin, Phone, Play, Globe,
} from 'lucide-react';
import Link from 'next/link';
import SiteShell from '../components/SiteShell';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-30px' },
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
};

const O = '#7C3AED';
const A = '#8B5CF6';

export default function StaffPortal() {
  const [testimonialActive, setTestimonialActive] = useState(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialActive((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const teachingTools = [
    { icon: BookOpen, title: 'Lesson Planning', description: 'Build dynamic lesson plans with AI-suggested content, learning objectives, and outcome tracking.' },
    { icon: PenTool, title: 'Content Creation', description: 'Create worksheets, presentations, and quizzes with built-in templates and rich media support.' },
    { icon: Presentation, title: 'Classroom Management', description: 'Seamless attendance, behavior tracking, seating charts, and smart group formations.' },
    { icon: FileText, title: 'Assignment Builder', description: 'Design, distribute, and grade assignments with auto-evaluation for objective questions.' },
    { icon: Calendar, title: 'Schedule Manager', description: 'Auto-generated timetables with conflict detection and substitute management.' },
    { icon: ClipboardList, title: 'Progress Tracking', description: 'Monitor individual and class progress against curriculum benchmarks in real time.' },
  ];

  const aiFeatures = [
    { icon: Brain, title: 'Question Generator', description: 'Generate customized question papers from your syllabus with adjustable difficulty and Bloom&apos;s taxonomy levels.' },
    { icon: Zap, title: 'Auto-Grading', description: 'AI evaluates objective and subjective answers, providing consistent and instant grading with feedback.' },
    { icon: Bot, title: 'Content Creation Demo', description: 'Describe your topic and get a ready-to-use lesson plan, presentation, and assessment in seconds.' },
  ];

  const examQuestionTypes = [
    { label: 'Multiple Choice', color: O },
    { label: 'True / False', color: A },
    { label: 'Short Answer', color: O },
    { label: 'Essay', color: A },
    { label: 'Fill in Blanks', color: O },
    { label: 'Match the Pairs', color: A },
  ];

  const testimonials = [
    { name: 'Dr. Meera Sharma', role: 'Head of Academics, Delhi Public School', avatar: 'https://i.pravatar.cc/150?u=meera', content: 'The teaching tools and AI assistant have cut my lesson preparation time in half. My students are more engaged than ever.', rating: 5 },
    { name: 'Mr. Rohan Verma', role: 'Senior Teacher, Sunshine Academy', avatar: 'https://i.pravatar.cc/150?u=rohan', content: 'The examination system is incredibly intuitive. Creating and grading exams used to take days; now it takes hours.', rating: 5 },
    { name: 'Mrs. Anjali Kapoor', role: 'Science Department Head, Nav Bharat School', avatar: 'https://i.pravatar.cc/150?u=anjali', content: 'Attendance analytics and performance dashboards give me insights I never had before. Every educator needs this.', rating: 5 },
  ];

  const faqs = [
    { q: 'How do I get started with the Staff Portal?', a: 'Your school administrator will provide you with login credentials. Once logged in, you can access all teaching tools, classroom management, and analytics features immediately.' },
    { q: 'Can I import my existing lesson plans?', a: 'Yes. The platform supports bulk import from common formats like Word, PDF, and Google Docs. Our AI can also help convert your existing materials into structured lesson plans.' },
    { q: 'Is there a mobile app for teachers?', a: 'Absolutely. The Prasynx Staff Portal is fully responsive on mobile and tablet devices. Dedicated iOS and Android apps are available for download.' },
    { q: 'How does auto-grading work?', a: 'AI evaluates objective questions instantly. For subjective answers, the AI provides a suggested grade based on rubrics you define; you can review and override anytime.' },
    { q: 'Can I collaborate with other teachers?', a: 'Yes. You can share lesson plans, co-create assessments, and discuss student progress with colleagues through the built-in collaboration tools.' },
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const timeSlots = ['9:00', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00'];
  const schedule = [
    ['Math 10A', 'Physics 12B', 'Chem 11C', null, 'English 9D', 'Bio 10E', null],
    ['English 9D', 'Math 10A', null, 'Physics 12B', 'Chem 11C', null, 'History 10F'],
    [null, 'Chem 11C', 'Math 10A', 'English 9D', null, 'Physics 12B', 'Free'],
    ['Physics 12B', null, 'English 9D', 'Chem 11C', 'Math 10A', null, 'Duty'],
    ['Chem 11C', 'English 9D', null, 'Math 10A', 'Physics 12B', 'History 10F', null],
    [null, 'Physics 12B', 'Chem 11C', null, 'English 9D', 'Math 10A', 'Free'],
  ];

  return (
    <SiteShell>
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24"
        style={{ background: 'linear-gradient(90deg, #F3F0FF 0%, #F3F0FF 30%, #FFFFFF 50%, #FFFFFF 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[15%] top-0 h-[500px] w-[450px] -translate-x-1/2 rounded-full bg-[#7C3AED]/10 blur-[120px]" />
          <div className="absolute bottom-0 left-[20%] h-[300px] w-[300px] rounded-full bg-[#8B5CF6]/8 blur-[80px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(124,58,237,0.10)_1px,transparent_0)] bg-[length:36px_36px] opacity-30" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#DDD6FE] bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4 text-[#7C3AED]" />
                <span className="text-xs font-extrabold" style={{ color: '#4F2DB8' }}>Built by Educators, Powered by AI</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
                className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold leading-[1.06] tracking-tight" style={{ color: '#0F172A' }}>
                Empowering Modern{' '}
                <span className="bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#5B21B6] bg-clip-text text-transparent">Educators</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-5 max-w-xl text-lg leading-relaxed" style={{ color: '#475569' }}>
                Everything you need to teach, assess, analyze, and grow — all in one intelligent platform designed for modern classrooms.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}
                className="mt-8 flex flex-wrap gap-4">
                <Link href="/staff/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-[#7C3AED]/25 transition-all hover:-translate-y-1 hover:shadow-xl">
                  Access Staff Portal <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="#tools"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-[#DDD6FE] px-8 py-3.5 text-base font-bold transition-all hover:-translate-y-0.5 hover:bg-[#F3F0FF] hover:shadow-lg" style={{ color: '#4F2DB8' }}>
                  <Play className="h-5 w-5" /> Explore Tools
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-8 flex flex-wrap gap-5 text-sm" style={{ color: '#64748B' }}>
                {['AI Teaching Assistant', 'Smart Grading', 'Analytics Dashboard', 'Exam Builder'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#7C3AED]" /> {item}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right Hero Illustration */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
              className="relative hidden lg:flex items-end justify-end min-h-[520px] lg:-mr-16 xl:-mr-28 lg:-mb-24">
              
              {/* Soft purple radial glow behind illustration */}
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#7C3AED]/10 via-[#8B5CF6]/5 to-transparent rounded-full blur-[100px] opacity-80 pointer-events-none" />
              
              <div className="relative z-10 flex items-end justify-end w-full">
                <motion.img
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  src="/staffportalhero.png"
                  alt="Prasynx Staff Portal Ecosystem"
                  className="relative max-h-[480px] w-auto object-contain object-right object-bottom select-none pointer-events-none drop-shadow-[0_20px_50px_rgba(124,58,237,0.12)]"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== TEACHING TOOLS ===== */}
      <section id="tools" className="border-t border-[#DDD6FE]/30 bg-white/50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mx-auto mb-14 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#DDD6FE] bg-[#F3F0FF] px-4 py-1.5 text-xs font-bold text-[#4F2DB8] shadow-sm mb-4">
              <Layers size={12} /> Teaching Tools
            </span>
            <h2 className="section-title mt-3" style={{ color: '#0F172A' }}>Everything You Need to Teach</h2>
            <p className="section-subtitle mx-auto mt-4" style={{ color: '#475569' }}>
              Comprehensive tools designed to streamline your teaching workflow from planning to assessment.
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teachingTools.map((t, i) => {
              const Icon = t.icon;
              return (
                <motion.div key={t.title} {...stagger} transition={{ ...stagger.transition, delay: i * 0.05 }}
                  className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#DDD6FE] hover:shadow-xl hover:shadow-[#7C3AED]/5">
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#7C3AED]/60 to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#F3F0FF] text-[#7C3AED] transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#7C3AED] group-hover:to-[#8B5CF6] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#7C3AED]/30">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-lg font-extrabold" style={{ color: '#0F172A' }}>{t.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed" style={{ color: '#64748B' }}>{t.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== AI ASSISTANT ===== */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(180deg, #F3F0FF 0%, #FFFFFF 50%, #F3F0FF 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/3 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#7C3AED]/8 blur-[120px]" />
          <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-[#8B5CF6]/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mx-auto mb-16 max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#DDD6FE] bg-[#F3F0FF] px-4 py-1.5 text-xs font-bold text-[#4F2DB8] shadow-sm mb-4">
              <Sparkles size={12} /> AI Assistant
            </span>
            <h2 className="section-title mt-4 text-[clamp(2rem,3.5vw,3rem)] font-extrabold leading-tight tracking-tight" style={{ color: '#0F172A' }}>
              Your AI-Powered{' '}
              <span className="bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#5B21B6] bg-clip-text text-transparent">Teaching Companion</span>
            </h2>
            <p className="section-subtitle mx-auto mt-4 max-w-2xl text-base sm:text-lg" style={{ color: '#475569' }}>
              Let AI handle the heavy lifting — generate questions, grade assignments, and create content in seconds.
            </p>
          </motion.div>

          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
            {/* Left - AI visual */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="relative mx-auto flex h-[420px] w-[420px] items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7C3AED]/15 via-[#8B5CF6]/10 to-transparent blur-3xl" />
              <div className="absolute -inset-14 rounded-full border-2 border-[#8B5CF6]/20" />
              <div className="absolute -inset-8 rounded-full border border-dashed border-[#7C3AED]/25" />
              <div className="absolute inset-6 rounded-full border border-[#7C3AED]/15" />
              <div className="absolute inset-12 rounded-full border border-[#8B5CF6]/12" />

              {[
                { top: '10%', left: '15%', size: 3, delay: 0 },
                { top: '20%', right: '10%', size: 4, delay: 0.8 },
                { top: '50%', left: '5%', size: 2, delay: 1.6 },
                { bottom: '15%', left: '20%', size: 3, delay: 0.4 },
                { bottom: '25%', right: '8%', size: 2, delay: 2 },
                { top: '35%', right: '5%', size: 3, delay: 1.2 },
              ].map((p, i) => (
                <motion.div key={`ap-${i}`} className="absolute rounded-full bg-[#7C3AED] pointer-events-none"
                  style={{ top: p.top, left: p.left, right: p.right, bottom: p.bottom, width: p.size, height: p.size, opacity: 0.3 }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
                />
              ))}

              <motion.div className="absolute top-6 left-8 h-12 w-12 rounded-2xl border border-[#7C3AED]/15 bg-gradient-to-br from-[#7C3AED]/8 to-transparent pointer-events-none rotate-12"
                animate={{ y: [0, -8, 0], rotate: [12, 18, 12] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
              <motion.div className="absolute top-16 right-12 h-8 w-8 rounded-full border border-[#8B5CF6]/15 bg-gradient-to-tr from-[#8B5CF6]/8 to-transparent pointer-events-none"
                animate={{ y: [0, 10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />

              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="relative z-10">
                <div className="absolute inset-0 rounded-full bg-[#7C3AED]/20 blur-[40px] scale-150" />
                <div className="relative z-10 grid h-44 w-44 place-items-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] shadow-2xl shadow-[#7C3AED]/40">
                  <Brain size={72} className="text-white" />
                </div>
              </motion.div>
            </motion.div>

            {/* Right - AI features */}
            <div className="space-y-4">
              {aiFeatures.map((ai, i) => {
                const Icon = ai.icon;
                return (
                  <motion.div key={ai.title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="group flex items-center gap-4 rounded-2xl border border-[#E2E8F0]/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-x-1 hover:border-[#DDD6FE] hover:bg-white hover:shadow-lg hover:shadow-[#7C3AED]/5">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#F3F0FF] to-[#F3F0FF] text-[#7C3AED] shadow-inner transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#7C3AED] group-hover:to-[#8B5CF6] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#7C3AED]/30">
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-extrabold" style={{ color: '#0F172A' }}>{ai.title}</div>
                      <div className="mt-0.5 text-xs leading-relaxed" style={{ color: '#64748B' }}>{ai.description}</div>
                    </div>
                    <ChevronDown size={14} className="shrink-0 -rotate-90 text-[#CBD5E1] transition-all group-hover:translate-x-0.5 group-hover:text-[#7C3AED]" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===== EXAMINATION SYSTEM ===== */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mx-auto mb-14 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#DDD6FE] bg-[#F3F0FF] px-4 py-1.5 text-xs font-bold text-[#4F2DB8] shadow-sm mb-4">
              <FileText size={12} /> Examination System
            </span>
            <h2 className="section-title mt-3" style={{ color: '#0F172A' }}>Create & Manage Exams with Ease</h2>
            <p className="section-subtitle mx-auto mt-4" style={{ color: '#475569' }}>
              Build comprehensive assessments with multiple question types, auto-grading, and detailed analytics.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="overflow-hidden rounded-2xl border border-[#DDD6FE]/50 bg-white shadow-xl shadow-[#7C3AED]/5">
            {/* Mac-style title bar */}
            <div className="flex items-center gap-2 border-b border-[#DDD6FE]/20 bg-[#F3F0FF] px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
              </div>
              <div className="mx-auto rounded-md bg-white px-3 py-1 text-[10px] font-semibold text-[#64748B] shadow-sm border border-[#E2E8F0]/50">
                Exam Creator — Mid-Term Assessment
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Left - Exam Form Mockup */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1.5">Exam Title</label>
                    <div className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#0F172A]">
                      Mid-Term Assessment — Mathematics Grade 10
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#475569] mb-1.5">Duration</label>
                      <div className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#0F172A]">
                        90 minutes
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#475569] mb-1.5">Total Marks</label>
                      <div className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#0F172A]">
                        100
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1.5">Question Types</label>
                    <div className="flex flex-wrap gap-2">
                      {examQuestionTypes.map((qt) => (
                        <span key={qt.label} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border"
                          style={{ borderColor: `${qt.color}30`, background: `${qt.color}10`, color: qt.color }}>
                          <CheckCircle2 size={11} /> {qt.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#475569]">Questions Added</span>
                      <span className="text-xs font-bold text-[#7C3AED]">25 / 40</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#E2E8F0]">
                      <div className="h-full w-[62.5%] rounded-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6]" />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-[#64748B]">
                      <span>• MCQ: 10 questions</span>
                      <span>• True/False: 5 questions</span>
                      <span>• Short Answer: 5 questions</span>
                      <span>• Essay: 3 questions</span>
                      <span>• Fill Blanks: 2 questions</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-5 py-2 text-xs font-bold text-white shadow-md shadow-[#7C3AED]/20">
                      <Zap size={13} /> Generate with AI
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] px-5 py-2 text-xs font-bold text-[#475569]">
                      Preview Exam
                    </span>
                  </div>
                </div>

                {/* Right - Preview Mockup */}
                <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-[#7C3AED]">QUESTION PREVIEW</span>
                    <span className="text-[10px] text-[#64748B]">Q1 of 25</span>
                  </div>
                  <div className="mb-4 rounded-lg bg-[#F3F0FF] p-4 border border-[#DDD6FE]/30">
                    <p className="text-sm font-bold text-[#0F172A]">Solve the quadratic equation: x² - 5x + 6 = 0</p>
                    <div className="mt-3 space-y-2">
                      {['x = 2, 3', 'x = -2, -3', 'x = 1, 6', 'x = -1, -6'].map((opt, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#475569]">
                          <div className={`h-4 w-4 rounded-full border-2 ${i === 0 ? 'border-[#7C3AED] bg-[#7C3AED]/10' : 'border-[#E2E8F0]'}`} />
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                    <span>Difficulty: Medium</span>
                    <span>Type: MCQ</span>
                    <span>Marks: 4</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== ATTENDANCE MANAGEMENT ===== */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(180deg, #F3F0FF 0%, #FFFFFF 100%)' }}>
        <div className="relative mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mx-auto mb-14 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#DDD6FE] bg-[#F3F0FF] px-4 py-1.5 text-xs font-bold text-[#4F2DB8] shadow-sm mb-4">
              <Calendar size={12} /> Attendance Management
            </span>
            <h2 className="section-title mt-3" style={{ color: '#0F172A' }}>Track Attendance in Real Time</h2>
            <p className="section-subtitle mx-auto mt-4" style={{ color: '#475569' }}>
              Mark, monitor, and analyze attendance with smart insights and automated notifications.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="overflow-hidden rounded-2xl border border-[#DDD6FE]/50 bg-white shadow-xl shadow-[#7C3AED]/5">
            <div className="flex items-center justify-between border-b border-[#DDD6FE]/20 bg-[#F3F0FF] px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#4F2DB8]">Class 10A — This Week</span>
                <span className="rounded-full bg-[#7C3AED]/10 px-2 py-0.5 text-[10px] font-bold text-[#7C3AED]">42 students</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#22C55E]/10 px-2 py-0.5 text-[10px] font-bold text-[#22C55E]">Present: 92%</span>
                <span className="rounded-full bg-[#EF4444]/10 px-2 py-0.5 text-[10px] font-bold text-[#EF4444]">Absent: 8%</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#DDD6FE]/10 bg-[#F3F0FF]/50">
                    <th className="px-4 py-3 font-bold text-[#475569]">Student</th>
                    {weekDays.map((d) => (
                      <th key={d} className="px-3 py-3 font-bold text-[#475569] text-center">{d}</th>
                    ))}
                    <th className="px-3 py-3 font-bold text-[#475569] text-center">%</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Aarav Sharma', status: ['P', 'P', 'P', 'P', 'P', 'P'], pct: 100 },
                    { name: 'Priya Patel', status: ['P', 'P', 'L', 'P', 'P', 'P'], pct: 83 },
                    { name: 'Rohan Verma', status: ['P', 'P', 'P', 'A', 'P', 'P'], pct: 83 },
                    { name: 'Sneha Gupta', status: ['P', 'P', 'P', 'P', 'P', 'P'], pct: 100 },
                    { name: 'Arjun Singh', status: ['P', 'L', 'P', 'P', 'A', 'P'], pct: 67 },
                    { name: 'Ananya Reddy', status: ['A', 'P', 'P', 'P', 'P', 'P'], pct: 83 },
                    { name: 'Vikram Joshi', status: ['P', 'P', 'P', 'P', 'P', 'L'], pct: 83 },
                    { name: 'Isha Kapoor', status: ['P', 'A', 'P', 'P', 'P', 'P'], pct: 83 },
                  ].map((row, i) => (
                    <tr key={row.name} className="border-b border-[#DDD6FE]/5 transition hover:bg-[#F3F0FF]/50">
                      <td className="px-4 py-2.5 font-semibold text-[#0F172A]">{row.name}</td>
                      {row.status.map((s, j) => (
                        <td key={j} className="px-3 py-2.5 text-center">
                          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                            s === 'P' ? 'bg-[#22C55E]/10 text-[#22C55E]' : s === 'L' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' : 'bg-[#EF4444]/10 text-[#EF4444]'
                          }`}>{s}</span>
                        </td>
                      ))}
                      <td className="px-3 py-2.5 text-center font-bold" style={{ color: row.pct >= 80 ? '#22C55E' : row.pct >= 70 ? '#8B5CF6' : '#EF4444' }}>{row.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== ANALYTICS DASHBOARD ===== */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mx-auto mb-14 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#DDD6FE] bg-[#F3F0FF] px-4 py-1.5 text-xs font-bold text-[#4F2DB8] shadow-sm mb-4">
              <PieChart size={12} /> Analytics Dashboard
            </span>
            <h2 className="section-title mt-3" style={{ color: '#0F172A' }}>Data-Driven Teaching Insights</h2>
            <p className="section-subtitle mx-auto mt-4" style={{ color: '#475569' }}>
              Understand class performance, identify trends, and make informed decisions with visual analytics.
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Chart 1 - Class Performance Bar */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="rounded-2xl border border-[#DDD6FE]/30 bg-white p-6 shadow-lg shadow-[#7C3AED]/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-extrabold text-[#0F172A]">Class Performance by Subject</h3>
                <span className="rounded-full bg-[#F3F0FF] px-2 py-0.5 text-[10px] font-bold text-[#7C3AED]">This Term</span>
              </div>
              <div className="space-y-4">
                {[
                  { subject: 'Mathematics', pct: 82, color: O },
                  { subject: 'Physics', pct: 76, color: A },
                  { subject: 'Chemistry', pct: 79, color: O },
                  { subject: 'English', pct: 88, color: A },
                  { subject: 'History', pct: 85, color: O },
                ].map((s) => (
                  <div key={s.subject}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#0F172A]">{s.subject}</span>
                      <span className="text-xs font-bold" style={{ color: s.color }}>{s.pct}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${s.pct}%` }} viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                        className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${s.color}, ${s.color}cc)` }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Chart 2 - Weekly Trend & Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="rounded-2xl border border-[#DDD6FE]/30 bg-white p-6 shadow-lg shadow-[#7C3AED]/5">
              <h3 className="text-sm font-extrabold text-[#0F172A] mb-4">Weekly Performance Trend</h3>
              <div className="flex items-end gap-3 h-32 mb-4">
                {[65, 72, 68, 80, 78, 85, 82].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div initial={{ height: 0 }} whileInView={{ height: `${v}%` }} viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      className="w-full rounded-t-lg" style={{ background: `linear-gradient(to top, ${O}88, ${O})`, height: `${v}%` }} />
                    <span className="text-[9px] font-semibold text-[#64748B]">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Class Average', value: '82%', color: O },
                  { label: 'Top Performer', value: '96%', color: '#22C55E' },
                  { label: 'Improvement', value: '+7%', color: A },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-[#F3F0FF] p-3 text-center border border-[#DDD6FE]/20">
                    <div className="text-lg font-black" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-[10px] font-semibold text-[#64748B]">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="border-t border-[#DDD6FE]/30 bg-white/50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mx-auto mb-14 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#DDD6FE] bg-[#F3F0FF] px-4 py-1.5 text-xs font-bold text-[#4F2DB8] shadow-sm mb-4">
              <Quote size={12} /> Testimonials
            </span>
            <h2 className="section-title mt-3" style={{ color: '#0F172A' }}>What Educators Say</h2>
            <p className="section-subtitle mx-auto mt-4" style={{ color: '#475569' }}>Hear from teachers who transformed their classrooms with Prasynx.</p>
          </motion.div>

          <div className="relative mx-auto max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div key={testimonialActive} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}
                className="rounded-3xl border border-[#DDD6FE]/30 bg-white p-8 shadow-xl sm:p-12">
                <Quote size={32} className="mb-4 text-[#7C3AED]/20" />
                <p className="text-lg leading-relaxed italic" style={{ color: '#0F172A' }}>&ldquo;{testimonials[testimonialActive].content}&rdquo;</p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl ring-2 ring-white shadow-md">
                    <img src={testimonials[testimonialActive].avatar} alt={testimonials[testimonialActive].name}
                      className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold" style={{ color: '#0F172A' }}>{testimonials[testimonialActive].name}</div>
                    <div className="text-xs font-semibold" style={{ color: '#64748B' }}>{testimonials[testimonialActive].role}</div>
                    <div className="mt-1 flex gap-0.5">
                      {Array.from({ length: testimonials[testimonialActive].rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-[#8B5CF6] text-[#8B5CF6]" />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-center gap-3">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setTestimonialActive(i)}
                  className={`h-2 rounded-full transition-all ${i === testimonialActive ? 'w-8 bg-[#7C3AED]' : 'w-2 bg-[#E2E8F0] hover:bg-[#CBD5E1]'}`} />
              ))}
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => setTestimonialActive((p) => (p - 1 + testimonials.length) % testimonials.length)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] transition hover:border-[#7C3AED] hover:text-[#7C3AED]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button onClick={() => setTestimonialActive((p) => (p + 1) % testimonials.length)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] transition hover:border-[#7C3AED] hover:text-[#7C3AED]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <motion.div {...fadeUp} className="mx-auto mb-12 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#DDD6FE] bg-[#F3F0FF] px-4 py-1.5 text-xs font-bold text-[#4F2DB8] shadow-sm mb-4">
              <HelpCircle size={12} /> FAQ
            </span>
            <h2 className="section-title mt-3" style={{ color: '#0F172A' }}>Frequently Asked Questions</h2>
            <p className="section-subtitle mx-auto mt-3" style={{ color: '#475569' }}>Everything you need to know about the Staff Portal.</p>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={faq.q} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className={`overflow-hidden rounded-2xl border transition-all ${faqOpen === i ? 'border-[#7C3AED] shadow-md' : 'border-[#E2E8F0] bg-white'}`}>
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left font-bold transition hover:bg-[#F3F0FF]"
                  style={{ color: '#0F172A' }}>
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown size={18} className={`shrink-0 transition-transform duration-200 ${faqOpen === i ? 'rotate-180 text-[#7C3AED]' : ''}`} style={{ color: '#94A3B8' }} />
                </button>
                <AnimatePresence initial={false}>
                  {faqOpen === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-[#DDD6FE]/20">
                      <div className="px-6 py-5 text-sm leading-relaxed" style={{ color: '#475569' }}>{faq.a}</div>
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
            className="relative overflow-hidden rounded-3xl px-8 py-14 sm:px-14 sm:py-16 text-white shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 40%, #5B21B6 100%)' }}>
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-[#4F2DB8]/20 blur-3xl" />

            <div className="relative text-center">
              <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">Ready to Transform Your Classroom?</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed sm:text-lg text-white/80">
                Join thousands of educators already using Prasynx to teach smarter, save time, and drive better student outcomes.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link href="/staff/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
                  style={{ color: '#7C3AED' }}>
                  Access Staff Portal <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/book-demo"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-lg">
                  Book a Demo
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-white/70">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-300" /> Free for teachers</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-300" /> No credit card required</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-300" /> Lifetime school access</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </SiteShell>
  );
}
