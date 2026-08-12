"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Users, CheckCircle, ArrowRight, Star, Shield, Sparkles,
  Building2, GraduationCap, BookOpen, Briefcase, BarChart3, Lock, Target,
  Play, ChevronDown, Phone, Mail, MapPin, Quote, MessageCircle, Zap,
  Bot, Globe, Smartphone, Layers, Cloud, Server, TrendingUp, Award,
  ChevronRight, X, Plus, Minus, ExternalLink, PlayCircle, ChevronLeft,
} from 'lucide-react';
import SiteShell from '../components/SiteShell';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' as const },
  transition: { duration: 0.5, ease: 'easeOut' as const },
};

const stagger = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-30px' as const },
  transition: { duration: 0.4, ease: 'easeOut' as const },
};

const institutionTypes = ['School', 'College', 'University', 'Training Institute', 'Corporate Organization'];
const roles = ['Principal', 'Director', 'Administrator', 'Teacher', 'IT Manager', 'HR Manager', 'Recruiter'];
const sizes = ['1-100', '100-500', '500-1000', '1000+'];
const interestChips = [
  'Student Management', 'Parent Engagement', 'Attendance', 'Examinations',
  'Analytics', 'Recruitment', 'AI Automation', 'ERP', 'Prerana AI',
];

const testimonials = [
  { quote: 'Prasynx transformed how we manage 12,000+ students across three countries. The AI-powered analytics alone saved us months of manual work.', author: 'Dr. Sarah Chen', role: 'Director of Operations', institution: 'Oakridge International Schools', rating: 5 },
  { quote: 'The unified platform eliminated our fragmented systems. Parents love the real-time updates, and our staff productivity increased by 65%.', author: 'Rajesh Kumar', role: 'Principal', institution: 'Delhi Public School Group', rating: 5 },
  { quote: 'From admissions to alumni, Prasynx handles everything. The implementation was smooth and the support team was exceptional.', author: 'Prof. Meera Patel', role: 'Dean of Academics', institution: 'Mumbai University College of Engineering', rating: 5 },
];

const faqs = [
  { q: 'How long is the demo?', a: 'Our demo is approximately 30 minutes, designed to give you a comprehensive overview of the Prasynx platform tailored to your institution\'s needs. We can extend it based on your requirements.' },
  { q: 'Do I need technical knowledge?', a: 'Not at all. Our demos are designed for educational leaders, administrators, and decision-makers. No technical background is required to understand the platform\'s value.' },
  { q: 'Can multiple team members join?', a: 'Absolutely. We encourage you to invite colleagues from different departments. The more perspectives, the better we can demonstrate how Prasynx serves your entire institution.' },
  { q: 'Is there a free trial?', a: 'Yes, after the demo we offer a 14-day free trial with full access to the platform, including onboarding support and sample data to help you evaluate.' },
  { q: 'Can the demo be customized?', a: 'Yes! When you book, you can select your areas of interest. We tailor every demo to focus on the modules and features most relevant to your institution.' },
  { q: 'How quickly can we get started?', a: 'Most institutions go live within 2-4 weeks. Our implementation team provides step-by-step guidance, data migration support, and staff training included.' },
];

const benefits = [
  { icon: Clock, title: 'Save Administrative Time', desc: 'Automate attendance, grading, reports, and routine tasks — cutting administrative overhead by up to 60%.' },
  { icon: Users, title: 'Improve Parent Engagement', desc: 'Real-time updates, instant messaging, fee tracking, and parent-teacher communication in one unified portal.' },
  { icon: Award, title: 'Increase Student Success', desc: 'AI-powered early warning systems identify at-risk students months in advance for timely intervention.' },
  { icon: Bot, title: 'Automate Operations', desc: 'From admissions to alumni management, automate every workflow with intelligent process automation.' },
  { icon: Briefcase, title: 'Simplify Recruitment', desc: 'AI-driven recruitment platform connecting students with job opportunities through smart matching.' },
  { icon: Layers, title: 'Centralize Management', desc: 'Multi-campus control, role-based access, and real-time analytics across your entire institution.' },
];

const demoFeatures = [
  { icon: Globe, title: 'Platform Overview', desc: 'Explore the complete Prasynx ecosystem — from student portals to admin dashboards.' },
  { icon: Users, title: 'Role-Based Portals', desc: 'See how students, parents, staff, recruiters, and admins each get a tailored experience.' },
  { icon: Bot, title: 'Prerana AI', desc: 'Watch intelligent automation in action — predictive analytics, smart recommendations, and AI chat.' },
  { icon: BarChart3, title: 'Analytics & Reporting', desc: 'Powerful institution-wide insights with customizable dashboards and exportable reports.' },
  { icon: Shield, title: 'Security & Compliance', desc: 'Enterprise-grade security controls — SOC 2, GDPR, ISO 27001 with RBAC and encryption.' },
  { icon: Target, title: 'Implementation Roadmap', desc: 'Step-by-step onboarding strategy from data migration to staff training and go-live.' },
];

const stats = [
  { value: '50,000+', label: 'Students' },
  { value: '5,000+', label: 'Teachers' },
  { value: '1,000+', label: 'Institutions' },
  { value: '100,000+', label: 'Users' },
  { value: '99.9%', label: 'Platform Uptime' },
];

export default function BookDemo() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const today = new Date();

  return (
    <SiteShell>
      <main className="overflow-hidden">
        {/* ===== HERO SECTION ===== */}
        <section className="relative overflow-hidden px-4 pt-24 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 40%, #F4F1FF 70%, #FFFFFF 100%)' }}>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#7C3AED]/8 blur-[150px]" />
            <div className="absolute -left-40 top-1/3 h-[500px] w-[500px] rounded-full bg-[#A855F7]/6 blur-[120px]" />
            <div className="absolute left-1/2 top-0 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-[#7C3AED]/20 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(108,76,241,0.06)_1px,transparent_0)] bg-[length:32px_32px]" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Left - Content */}
              <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                  className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#EDE9FE] bg-white/80 px-4 py-1.5 shadow-sm backdrop-blur-sm">
                  <Sparkles size={12} className="text-[#7C3AED]" />
                  <span className="text-xs font-bold text-[#7C3AED]">Personalized Product Demo</span>
                </motion.div>

                <h1 className="text-4xl font-black tracking-tight text-[#0F172A] sm:text-5xl lg:text-6xl">
                  See Prasynx Transform{' '}
                  <span className="bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">Your Institution</span>
                </h1>

                <p className="mt-3 text-2xl font-bold tracking-tight text-[#7C3AED] sm:text-3xl">
                  In Just 30 Minutes
                </p>

                <p className="mt-4 max-w-xl text-base leading-relaxed text-[#475569] sm:text-lg">
                  Discover how Prasynx helps schools, colleges, universities, training institutes, and organizations streamline operations, improve engagement, and unlock AI-powered productivity.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <motion.a href="#book" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#7C3AED]/25 transition-all hover:shadow-xl hover:shadow-[#7C3AED]/30">
                    Book Your Demo <ArrowRight size={15} />
                  </motion.a>
                  <motion.a href="#overview" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white/70 px-7 py-3.5 text-sm font-bold text-[#475569] shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md">
                    <PlayCircle size={15} /> Watch Platform Overview
                  </motion.a>
                </div>

                <div className="mt-6 flex items-center gap-2 text-sm text-[#64748B]">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-bold text-[#0F172A]">Trusted</span> by Institutions Worldwide
                </div>
              </motion.div>

              {/* Right - Enterprise Illustration */}
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
                className="relative flex items-center justify-center">
                <div className="relative h-[480px] w-[480px]">
                  {/* Concentric rings */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7C3AED]/10 via-[#A855F7]/8 to-transparent blur-2xl" />
                  <div className="absolute -inset-8 rounded-full border-2 border-[#7C3AED]/15" />
                  <div className="absolute -inset-4 rounded-full border border-dashed border-[#8B5CF6]/20" />
                  <div className="absolute inset-8 rounded-full border border-[#7C3AED]/10" />

                  {/* Center platform icon */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <img src="/logo.png" alt="Prasynx" className="h-40 w-40 object-contain" />
                  </div>

                  {/* Characters around platform */}
                  {[
                    { icon: GraduationCap, label: 'Student', top: '5%', left: '50%', delay: 0 },
                    { icon: Users, label: 'Parent', top: '25%', right: '5%', delay: 0.3 },
                    { icon: BookOpen, label: 'Teacher', bottom: '25%', right: '8%', delay: 0.6 },
                    { icon: Briefcase, label: 'Recruiter', bottom: '5%', left: '50%', delay: 0.9 },
                    { icon: Shield, label: 'Admin', top: '25%', left: '5%', delay: 1.2 },
                    { icon: Bot, label: 'Prerana AI', bottom: '28%', left: '5%', delay: 1.5 },
                  ].map(({ icon: Icon, label, delay, ...pos }) => (
                    <motion.div key={label}
                      className="absolute z-10 flex items-center gap-2 rounded-xl border border-white/60 bg-white/90 px-3 py-2 shadow-lg shadow-[#7C3AED]/8 backdrop-blur-sm"
                      style={{ ...pos }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + delay, duration: 0.4 }}>
                      <Icon size={12} className="text-[#7C3AED]" />
                      <span className="whitespace-nowrap text-[10px] font-bold text-[#0F172A]">{label}</span>
                    </motion.div>
                  ))}

                  {/* Portal badges floating */}
                  {[
                    { label: 'Student Portal', color: '#3B82F6', top: '15%', left: '38%' },
                    { label: 'Parent Portal', color: '#22C55E', top: '70%', right: '32%' },
                    { label: 'Staff Portal', color: '#F97316', top: '45%', left: '5%' },
                    { label: 'Job Provider Portal', color: '#6366F1', top: '42%', right: '5%' },
                    { label: 'Admin Portal', color: '#7C3AED', bottom: '18%', left: '36%' },
                  ].map(({ label, color, ...pos }) => (
                    <motion.div key={label}
                      className="absolute z-20 flex items-center gap-1.5 rounded-lg border border-white/40 bg-white/60 px-2 py-1 shadow-sm backdrop-blur-sm"
                      style={{ ...pos }}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' }}>
                      <div className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                      <span className="text-[8px] font-bold text-[#475569]">{label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== TRUST METRICS ===== */}
        <section className="relative px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {stats.map((stat) => (
                <div key={stat.label}
                  className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white/70 px-5 py-4 text-center shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-[#7C3AED]/20 hover:shadow-lg hover:shadow-[#7C3AED]/5">
                  <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-[#7C3AED]/0 to-[#8B5CF6]/0 opacity-0 transition-opacity group-hover:from-[#7C3AED]/5 group-hover:to-[#8B5CF6]/5 group-hover:opacity-100" />
                  <div className="relative">
                    <div className="text-2xl font-black text-[#0F172A]">{stat.value}</div>
                    <div className="mt-0.5 text-xs font-bold text-[#64748B]">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ===== DEMO BOOKING SECTION ===== */}
        <section id="book" className="relative px-4 py-20 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 100%)' }}>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/3 top-0 h-[400px] w-[400px] rounded-full bg-[#7C3AED]/5 blur-[100px]" />
            <div className="absolute right-1/4 bottom-0 h-[300px] w-[300px] rounded-full bg-[#A855F7]/6 blur-[80px]" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-12 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#EDE9FE] bg-white px-4 py-1.5 text-xs font-bold text-[#7C3AED] shadow-sm">
                <Calendar size={12} /> Schedule Your Demo
              </span>
              <h2 className="mt-4 text-3xl font-black text-[#0F172A] sm:text-4xl">Book Your Personalized Walkthrough</h2>
              <p className="mx-auto mt-3 max-w-xl text-[#64748B]">Fill in your details and we'll tailor the demo to your institution's needs.</p>
            </motion.div>

            <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
              {/* Left - Demo Image */}
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                className="relative flex items-stretch min-h-[520px]">
                <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-[#7C3AED]/15">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/10 via-[#A855F7]/8 to-transparent" />
                  <img src="/businessdemoimage1.png" alt="Prasynx Demo Preview"
                    className="w-full h-full object-contain relative z-10" />
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#7C3AED]/40 via-[#7C3AED]/15 to-transparent pointer-events-none z-20" />
                </div>
              </motion.div>

              {/* Right - Calendar + Form */}
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                {/* Form Card */}
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-lg sm:p-8">
                  <form className="grid gap-5">
                    <div className="grid gap-2">
                      <label className="text-xs font-bold text-[#475569]" htmlFor="institution">Institution Name</label>
                      <input className="rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10" type="text" id="institution" placeholder="Enter your institution name" />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-xs font-bold text-[#475569]" htmlFor="type">Institution Type</label>
                      <select className="rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#0F172A] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10" id="type">
                        <option value="">Select type</option>
                        {institutionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-xs font-bold text-[#475569]" htmlFor="role">Your Role</label>
                      <select className="rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#0F172A] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10" id="role">
                        <option value="">Select role</option>
                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-xs font-bold text-[#475569]" htmlFor="fname">First Name</label>
                        <input className="rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10" type="text" id="fname" placeholder="First name" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-xs font-bold text-[#475569]" htmlFor="lname">Last Name</label>
                        <input className="rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10" type="text" id="lname" placeholder="Last name" />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-xs font-bold text-[#475569]" htmlFor="email">Work Email</label>
                        <input className="rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10" type="email" id="email" placeholder="you@institution.edu" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-xs font-bold text-[#475569]" htmlFor="phone">Phone Number</label>
                        <input className="rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10" type="tel" id="phone" placeholder="+91 XXXXX XXXXX" />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-xs font-bold text-[#475569]" htmlFor="size">Institution Size</label>
                      <select className="rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#0F172A] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10" id="size">
                        <option value="">Select size</option>
                        {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div className="grid gap-3">
                      <label className="text-xs font-bold text-[#475569]">Areas of Interest</label>
                      <div className="flex flex-wrap gap-2">
                        {interestChips.map((chip) => (
                          <button key={chip} type="button" onClick={() => toggleInterest(chip)}
                            className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all ${selectedInterests.includes(chip)
                              ? 'border-[#7C3AED] bg-[#7C3AED] text-white shadow-sm'
                              : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#7C3AED]/30 hover:bg-[#F3F0FF]'
                              }`}>
                            {chip}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-xs font-bold text-[#475569]" htmlFor="notes">Additional Notes</label>
                      <textarea className="min-h-24 rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] px-4 py-3 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10" id="notes" placeholder="Tell us about your institution, specific requirements, or questions..." />
                    </div>

                    <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#7C3AED]/20 transition-all hover:shadow-xl hover:shadow-[#7C3AED]/30">
                      Schedule My Personalized Demo <ArrowRight size={15} />
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== WHAT YOU'LL SEE ===== */}
        <section id="overview" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-12 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#EDE9FE] bg-white px-4 py-1.5 text-xs font-bold text-[#7C3AED] shadow-sm">
                <PlayCircle size={12} /> Demo Experience
              </span>
              <h2 className="mt-4 text-3xl font-black text-[#0F172A] sm:text-4xl">What You'll Experience During The Demo</h2>
            </motion.div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {demoFeatures.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all hover:-translate-y-1.5 hover:border-[#7C3AED]/20 hover:shadow-xl hover:shadow-[#7C3AED]/5">
                    <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-[#7C3AED]/0 to-[#8B5CF6]/0 opacity-0 transition-opacity group-hover:from-[#7C3AED]/5 group-hover:to-[#8B5CF6]/5 group-hover:opacity-100" />
                    <div className="relative">
                      <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#7C3AED]/10 to-[#8B5CF6]/10 text-[#7C3AED] transition-all group-hover:from-[#7C3AED] group-hover:to-[#8B5CF6] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#7C3AED]/25">
                        <Icon size={22} />
                      </div>
                      <h3 className="text-base font-bold text-[#0F172A]">{f.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#64748B]">{f.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== WHY BOOK A DEMO ===== */}
        <section className="px-4 py-20 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 100%)' }}>
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#EDE9FE] bg-white px-4 py-1.5 text-xs font-bold text-[#7C3AED] shadow-sm">
                  <Target size={12} /> Why Prasynx
                </span>
                <h2 className="mt-4 text-3xl font-black text-[#0F172A] sm:text-4xl">Built For Modern Institutions</h2>
                <p className="mt-3 text-[#64748B] leading-relaxed">
                  Prasynx is designed from the ground up to meet the challenges of modern educational institutions — combining powerful management tools with AI-driven insights.
                </p>

                <div className="mt-8 grid gap-4">
                  {benefits.slice(0, 3).map((b) => {
                    const Icon = b.icon;
                    return (
                      <div key={b.title} className="flex items-start gap-3">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#7C3AED]/10 text-[#7C3AED]">
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0F172A]">{b.title}</p>
                          <p className="text-xs text-[#64748B]">{b.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <div className="grid gap-4">
                  {benefits.slice(3).map((b) => {
                    const Icon = b.icon;
                    return (
                      <div key={b.title} className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[#7C3AED]/20 hover:shadow-lg hover:shadow-[#7C3AED]/5">
                        <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-[#7C3AED]/0 to-[#8B5CF6]/0 opacity-0 transition-opacity group-hover:from-[#7C3AED]/5 group-hover:to-[#8B5CF6]/5 group-hover:opacity-100" />
                        <div className="relative flex items-start gap-4">
                          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#7C3AED]/10 to-[#8B5CF6]/10 text-[#7C3AED] transition-all group-hover:from-[#7C3AED] group-hover:to-[#8B5CF6] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#7C3AED]/25">
                            <Icon size={20} />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-[#0F172A]">{b.title}</h3>
                            <p className="mt-0.5 text-xs text-[#64748B]">{b.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== CUSTOMER SUCCESS ===== */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-12 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#EDE9FE] bg-white px-4 py-1.5 text-xs font-bold text-[#7C3AED] shadow-sm">
                <Quote size={12} /> Testimonials
              </span>
              <h2 className="mt-4 text-3xl font-black text-[#0F172A] sm:text-4xl">Trusted By Educational Leaders</h2>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t, i) => (
                <motion.div key={t.author} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[#7C3AED]/20 hover:shadow-xl hover:shadow-[#7C3AED]/5">
                  <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-[#7C3AED]/0 to-[#8B5CF6]/0 opacity-0 transition-opacity group-hover:from-[#7C3AED]/5 group-hover:to-[#8B5CF6]/5 group-hover:opacity-100" />
                  <div className="relative">
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed text-[#475569] italic">"{t.quote}"</p>
                    <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                      <p className="text-sm font-bold text-[#0F172A]">{t.author}</p>
                      <p className="text-xs text-[#64748B]">{t.role}, {t.institution}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== DEMO PROCESS ===== */}
        <section className="px-4 py-20 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 100%)' }}>
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-12 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#EDE9FE] bg-white px-4 py-1.5 text-xs font-bold text-[#7C3AED] shadow-sm">
                <Target size={12} /> Process
              </span>
              <h2 className="mt-4 text-3xl font-black text-[#0F172A] sm:text-4xl">How It Works</h2>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { step: '01', title: 'Book Your Slot', desc: 'Choose a time that works for you and tell us about your institution.', icon: Calendar },
                { step: '02', title: 'Meet Our Expert', desc: 'Connect with a product specialist who understands education workflows.', icon: Users },
                { step: '03', title: 'Personalized Walkthrough', desc: 'See Prasynx tailored to your institution type, size, and priorities.', icon: PlayCircle },
                { step: '04', title: 'Get Custom Proposal', desc: 'Receive a customized plan with pricing, timeline, and implementation support.', icon: Target },
              ].map(({ step, title, desc, icon: Icon }, i) => (
                <motion.div key={step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all hover:-translate-y-1.5 hover:border-[#7C3AED]/20 hover:shadow-xl hover:shadow-[#7C3AED]/5">
                  <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-[#7C3AED]/0 to-[#8B5CF6]/0 opacity-0 transition-opacity group-hover:from-[#7C3AED]/5 group-hover:to-[#8B5CF6]/5 group-hover:opacity-100" />
                  <div className="relative">
                    <span className="text-3xl font-black text-[#7C3AED]/20">{step}</span>
                    <div className="mt-2 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#7C3AED]/10 to-[#8B5CF6]/10 text-[#7C3AED] transition-all group-hover:from-[#7C3AED] group-hover:to-[#8B5CF6] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#7C3AED]/25">
                      <Icon size={18} />
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-[#0F172A]">{title}</h3>
                    <p className="mt-1 text-xs text-[#64748B]">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <motion.div {...fadeUp} className="mb-12 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#EDE9FE] bg-white px-4 py-1.5 text-xs font-bold text-[#7C3AED] shadow-sm">
                <MessageCircle size={12} /> FAQ
              </span>
              <h2 className="mt-4 text-3xl font-black text-[#0F172A] sm:text-4xl">Frequently Asked Questions</h2>
            </motion.div>

            <div className="grid gap-3">
              {faqs.map((faq, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm transition-all hover:border-[#7C3AED]/20">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left">
                    <span className="text-sm font-bold text-[#0F172A]">{faq.q}</span>
                    <ChevronDown size={16} className={`shrink-0 text-[#64748B] transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                        className="overflow-hidden">
                        <p className="px-5 pb-4 text-sm leading-relaxed text-[#64748B]">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white px-8 py-14 sm:px-14 sm:py-16 shadow-lg"
              style={{ color: '#0F172A' }}>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#7C3AED]/3 via-transparent to-[#8B5CF6]/3" />
              <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:text-left">
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl" style={{ color: '#0F172A' }}>Ready To Modernize Your Institution?</h2>
                  <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed lg:mx-0" style={{ color: '#64748B' }}>
                    Join thousands of institutions already transforming education and administration with Prasynx.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
                    <a href="#book" className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-bold shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl" style={{ background: 'linear-gradient(135deg, #6C4CF1 0%, #8B5CF6 40%, #A855F7 100%)', color: '#FFFFFF' }}>
                      Book Demo <ArrowRight size={18} />
                    </a>
                    <a href="/contact" className="inline-flex items-center gap-2 rounded-xl border-2 px-8 py-3.5 text-base font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ borderColor: '#CBD5E1', color: '#475569' }}>
                      Contact Sales
                    </a>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-3">
                  <a href="#" className="inline-flex items-center gap-3 rounded-xl px-5 py-3 transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ background: '#0F172A' }}>
                    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 fill-white"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                    <div className="text-left">
                      <p className="text-[9px] font-medium text-white/60">Download on the</p>
                      <p className="text-xs font-bold text-white">App Store</p>
                    </div>
                  </a>
                  <a href="#" className="inline-flex items-center gap-3 rounded-xl px-5 py-3 transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ background: '#0F172A' }}>
                    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 fill-white"><path d="M17.523 12.065c.013 3.057 2.676 4.073 2.706 4.087-.022.074-.423 1.448-1.395 2.87-.841 1.23-1.715 2.456-3.092 2.48-1.352.025-1.787-.803-3.333-.803s-2.028.778-3.307.828c-1.33.05-2.343-1.332-3.195-2.553-1.737-2.513-3.064-7.1-1.282-10.196.885-1.537 2.467-2.51 4.185-2.534 1.307-.025 2.54.88 3.34.88s2.29-1.088 3.861-.928c.652.026 2.482.263 3.658 1.982-.095.06-2.184 1.275-2.16 3.806zm-2.56-7.556c.699-.847 1.17-2.025 1.041-3.2-1.007.04-2.226.67-2.948 1.516-.648.75-1.215 1.948-1.062 3.098 1.123.087 2.268-.57 2.969-1.414z" /></svg>
                    <div className="text-left">
                      <p className="text-[9px] font-medium text-white/60">Get it on</p>
                      <p className="text-xs font-bold text-white">Google Play</p>
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
