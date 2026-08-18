"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, ChevronDown, Star, Sparkles, Shield,
  GraduationCap, Users, UserCheck, Briefcase, Globe, Building2, Bot, MessageCircle,
  BookOpen, BarChart3, Clock, Award, TrendingUp, Lock, Cloud, Zap, Target,
  Search, Bell, Database, Server, Smartphone, Layout, Activity, Heart, FileText,
  Download, Quote, Mail, MapPin, Phone, Play, Calendar,
} from 'lucide-react';
import SiteShell from './components/SiteShell';

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

export default function Home() {
  const [testimonialActive, setTestimonialActive] = useState(0);
  const [activePortal, setActivePortal] = useState(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialActive((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const testimonials = [
    { name: 'Dr. Sarah Johnson', role: 'Principal, Delhi Public School', initials: 'SJ', avatar: 'https://i.pravatar.cc/150?u=sarah', content: 'Prasynx has transformed how we manage our institution. The AI-powered automation saved us 40% of administrative time while improving parent satisfaction scores by 35%.', rating: 5, color: '#6C4CF1' },
    { name: 'Mr. Amit Sharma', role: 'Director, Sunshine Academy', initials: 'AS', avatar: 'https://i.pravatar.cc/150?u=amit', content: 'The unified platform is a game-changer. Having students, parents, teachers, and recruiters on one system eliminated all our data silos and reduced IT costs by 60%.', rating: 5, color: '#8B5CF6' },
    { name: 'Mrs. Priya Patel', role: 'Headmistress, Nav Bharat School', initials: 'PP', avatar: 'https://i.pravatar.cc/150?u=priya', content: 'Prerana AI assistant is incredible. Our teachers love the intuitive interface and the AI-powered insights have helped identify at-risk students 3 weeks earlier than before.', rating: 5, color: '#A855F7' },
    { name: 'Dr. Rajesh Kumar', role: 'CEO, Global Education Group', initials: 'RK', avatar: 'https://i.pravatar.cc/150?u=rajesh', content: 'We evaluated 12 platforms before choosing Prasynx. The multi-tenant architecture, enterprise security, and real-time analytics were unmatched. Implementation took just 5 days.', rating: 5, color: '#6C4CF1' },
  ];

  const features = [
    { icon: Globe, title: 'Unified Platform', description: 'Single integrated ecosystem connecting students, parents, teachers, administrators, and recruiters on one seamless platform.' },
    { icon: Bot, title: 'AI Learning Assistant', description: 'Prerana AI provides intelligent academic guidance, career recommendations, and personalized learning paths for every student.' },
    { icon: TrendingUp, title: 'Real-Time Analytics', description: 'Comprehensive dashboards with live updates on attendance, grades, performance trends, and institutional KPIs.' },
    { icon: Clock, title: 'Attendance Management', description: 'Automated attendance tracking with biometric integration, real-time alerts, and comprehensive reporting.' },
    { icon: Briefcase, title: 'Career & Job Portal', description: 'Integrated recruitment platform connecting students and alumni with top employers and job opportunities.' },
    { icon: Shield, title: 'Enterprise Security', description: 'SOC 2, GDPR, and ISO 27001 compliant with end-to-end encryption, RBAC, and multi-tenant isolation.' },
  ];

  const portals = [
    { name: 'Student Portal', icon: GraduationCap, users: '45,200+', color: '#6C4CF1', description: 'Empower students with AI-driven learning, real-time progress tracking, and seamless academic management.', features: ['Personalized Learning Dashboard', 'AI Assignment Assistant', 'Attendance & Grade Tracking', 'Career Guidance & Scholarships', 'Communication Hub', 'Mobile-First Experience'], },
    { name: 'Parent Portal', icon: Users, users: '38,500+', color: '#6C4CF1', description: 'Stay connected with your child\'s academic journey through real-time updates, transparent communication, and easy fee management.', features: ['Real-Time Progress Dashboard', 'Fee Management & Payments', 'Teacher Communication', 'Attendance & Exam Alerts', 'Performance Reports', 'Event Calendar'], },
    { name: 'Staff Portal', icon: UserCheck, users: '8,900+', color: '#6C4CF1', description: 'Comprehensive tools for educators to manage classes, track student performance, and collaborate with colleagues.', features: ['Class & Timetable Management', 'Automated Attendance', 'Grade Book & Assessments', 'Student Performance Analytics', 'Leave & Schedule Management', 'Professional Development'], },
    { name: 'Job Provider Portal', icon: Briefcase, users: '3,200+', color: '#6C4CF1', description: 'AI-powered recruitment platform connecting employers with top talent from across institutions.', features: ['AI-Powered Candidate Matching', 'Application Tracking System', 'Interview Scheduling', 'Hiring Analytics Dashboard', 'Talent Pool Management', 'Smart Job Postings'], },
    { name: 'Organization Portal', icon: Building2, users: '1,248+', color: '#6C4CF1', description: 'Multi-campus management platform with role-based access, subscription control, and compliance reporting.', features: ['Multi-Campus Management', 'Role-Based Access Control', 'Subscription & Billing', 'Custom Branding', 'Compliance Reporting', 'Bulk Operations'], },
  ];

  const trustItems = [
    { icon: Lock, label: 'Data Encryption', desc: 'AES-256 at rest and TLS 1.3 in transit' },
    { icon: Cloud, label: 'Cloud Infrastructure', desc: 'AWS with auto-scaling and multi-region' },
    { icon: Server, label: '99.9% Uptime', desc: 'Guaranteed SLA with 24/7 monitoring' },
    { icon: Bot, label: 'AI Intelligence', desc: 'Machine learning models trained on 1M+ data points' },
    { icon: Building2, label: 'Multi-Tenant SaaS', desc: 'Logical isolation with shared infrastructure' },
    { icon: Shield, label: 'Enterprise Compliance', desc: 'SOC 2, GDPR, ISO 27001 certified' },
  ];

  const faqs = [
    { q: 'How long does implementation take?', a: 'Most institutions are fully operational within 1-2 weeks. Our dedicated onboarding team handles data migration, configuration, and staff training.' },
    { q: 'Is my data secure and private?', a: 'Absolutely. We use AES-256 encryption, TLS 1.3, SOC 2 Type II certified infrastructure, and comply with GDPR and ISO 27001 standards. Your data never leaves your tenant.' },
    { q: 'Can we integrate with existing systems?', a: 'Yes. Prasynx offers a robust REST API, bulk import/export tools, and pre-built integrations with popular SIS, LMS, and HR platforms.' },
    { q: 'What kind of support do you provide?', a: '24/7 priority support with dedicated account manager, comprehensive documentation, video tutorials, and an active community forum.' },
    { q: 'How does pricing work?', a: 'Transparent per-user per-month pricing with volume discounts. No hidden fees, no long-term contracts. Free migration assistance included.' },
  ];

  function PortalDashboard({ portal }: { portal: typeof portals[0] }) {
    const p = portal;
    const name = p.name;
    const clr = p.color;

    // Reusable mini chart components using pure SVG
    const MiniBar = ({ data, color }: { data: number[]; color: string }) => (
      <div className="flex items-end gap-[3px] h-12">
        {data.map((v, i) => (
          <div key={i} className="w-2 rounded-t-sm transition-all" style={{ height: `${v}%`, background: `linear-gradient(to top, ${color}88, ${color})` }} />
        ))}
      </div>
    );

    const MiniLine = ({ color }: { color: string }) => (
      <svg viewBox="0 0 60 24" className="w-full h-8">
        <path d="M0,20 Q10,15 20,18 T40,10 T60,8" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M0,20 Q10,15 20,18 T40,10 T60,8" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" opacity="0.12" />
      </svg>
    );

    const MiniDonut = ({ pct, color }: { pct: number; color: string }) => (
      <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F1F5F9" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.5" fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
      </svg>
    );

    switch (name) {
      case 'Student Portal':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#64748B]">Attendance</span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#22C55E]">92%</div>
                </div>
                <div className="h-1.5 rounded-full bg-[#E2E8F0]"><div className="h-full w-[92%] rounded-full bg-[#22C55E]" /></div>
              </div>
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#64748B]">Grades</span>
                  <span className="text-[10px] font-bold text-[#6C4CF1]">A-</span>
                </div>
                <MiniBar data={[40, 60, 75, 50, 80, 70]} color="#6C4CF1" />
              </div>
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#64748B]">Progress</span>
                  <span className="text-[10px] font-bold text-[#3B82F6]">78%</span>
                </div>
                <MiniDonut pct={78} color="#3B82F6" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gradient-to-br from-[#6C4CF1]/5 to-[#A855F7]/5 p-3 border border-[#E8E0FF]">
                <div className="mb-2 flex items-center gap-2">
                  <Bot size={12} className="text-[#6C4CF1]" />
                  <span className="text-[10px] font-bold text-[#6C4CF1]">Prerana AI</span>
                </div>
                <p className="text-[10px] text-[#475569] leading-relaxed">"Your Physics grades improved 15% this month. Review Ch.7 for tomorrow's quiz."</p>
              </div>
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
                <span className="text-[10px] font-semibold text-[#64748B]">Assignments</span>
                <div className="mt-1 space-y-1.5">
                  {['Math HW', 'Chem Lab', 'Essay'].map((a) => (
                    <div key={a} className="flex items-center gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${['bg-[#22C55E]', 'bg-[#F59E0B]', 'bg-[#EF4444]'][Math.floor(Math.random() * 3)]}`} />
                      <span className="text-[10px] text-[#475569]">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[#F8FAFC] px-3 py-2 border border-[#E2E8F0]/50">
              <div className="flex items-center gap-2">
                <div className="grid h-6 w-6 place-items-center rounded-lg bg-[#22C55E]/10"><GraduationCap size={12} className="text-[#22C55E]" /></div>
                <span className="text-[10px] font-semibold text-[#64748B]">Learning Streak</span>
              </div>
              <span className="text-xs font-extrabold" style={{ color: '#22C55E' }}>12 days 🔥</span>
            </div>
          </div>
        );
      case 'Parent Portal':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
                <span className="text-[10px] font-semibold text-[#64748B]">Child Performance</span>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-lg font-black" style={{ color: '#3B82F6' }}>87%</span>
                  <span className="text-[9px] font-bold text-[#22C55E]">↑ 5%</span>
                </div>
                <MiniLine color="#3B82F6" />
              </div>
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
                <span className="text-[10px] font-semibold text-[#64748B]">Attendance</span>
                <div className="mt-1 flex items-center justify-between">
                  <MiniDonut pct={95} color="#22C55E" />
                  <span className="text-lg font-black text-[#22C55E]">95%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
                <span className="text-[10px] font-semibold text-[#64748B]">Fee Status</span>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#22C55E]">Paid</span>
                  <span className="text-[10px] text-[#64748B]">Due: 30 Jun</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-[#E2E8F0]"><div className="h-full w-full rounded-full bg-[#22C55E]" /></div>
              </div>
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
                <span className="text-[10px] font-semibold text-[#64748B]">Messages</span>
                <div className="mt-1 space-y-1">
                  <div className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]" /><span className="text-[10px] text-[#475569]">PTM on Saturday</span></div>
                  <div className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" /><span className="text-[10px] text-[#475569]">Fee reminder</span></div>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#3B82F6]/5 to-[#2563EB]/5 p-3 border border-[#3B82F6]/15">
              <div className="flex items-center gap-2 mb-1"><Calendar size={12} style={{ color: '#3B82F6' }} /><span className="text-[10px] font-bold text-[#3B82F6]">Upcoming Events</span></div>
              <div className="text-[10px] text-[#475569] flex items-center justify-between"><span>Annual Day - 15 Jun</span><span className="text-[#3B82F6]">→</span></div>
              <div className="text-[10px] text-[#475569] flex items-center justify-between"><span>Science Fair - 22 Jun</span><span className="text-[#3B82F6]">→</span></div>
            </div>
          </div>
        );
      case 'Staff Portal':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
                <span className="text-[10px] font-semibold text-[#64748B]">My Classes</span>
                <div className="mt-1 text-lg font-black" style={{ color: '#6C4CF1' }}>6</div>
                <div className="text-[9px] text-[#64748B]">Today: 4 active</div>
              </div>
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
                <span className="text-[10px] font-semibold text-[#64748B]">Students</span>
                <div className="mt-1 text-lg font-black" style={{ color: '#22C55E' }}>168</div>
                <div className="text-[9px] text-[#22C55E]">92% present</div>
              </div>
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
                <span className="text-[10px] font-semibold text-[#64748B]">Tasks</span>
                <div className="mt-1 text-lg font-black" style={{ color: '#F59E0B' }}>8</div>
                <div className="text-[9px] text-[#F59E0B]">3 pending</div>
              </div>
            </div>
            <MiniLine color="#6C4CF1" />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
                <span className="text-[10px] font-semibold text-[#64748B]">Schedule</span>
                <div className="mt-1 space-y-1 text-[10px] text-[#475569]">
                  <div className="flex justify-between"><span>Math 10A</span><span>09:00</span></div>
                  <div className="flex justify-between"><span>Physics 12</span><span>11:00</span></div>
                  <div className="flex justify-between"><span>Chem Lab</span><span>14:00</span></div>
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-[#6C4CF1]/5 to-[#A855F7]/5 p-3 border border-[#E8E0FF]">
                <div className="flex items-center gap-1.5 mb-1"><Bot size={11} className="text-[#6C4CF1]" /><span className="text-[9px] font-bold text-[#6C4CF1]">AI Insights</span></div>
                <p className="text-[10px] text-[#475569]">3 students falling behind in Calculus. Recommended: extra practice sheets.</p>
              </div>
            </div>
          </div>
        );
      case 'Job Provider Portal':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
                <span className="text-[10px] font-semibold text-[#64748B]">Active Jobs</span>
                <div className="mt-1 text-lg font-black" style={{ color: '#A855F7' }}>24</div>
                <div className="text-[9px] text-[#22C55E]">↑ 8 this week</div>
              </div>
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
                <span className="text-[10px] font-semibold text-[#64748B]">Applications</span>
                <div className="mt-1 text-lg font-black" style={{ color: '#3B82F6' }}>342</div>
                <div className="text-[9px] text-[#F59E0B]">28 new today</div>
              </div>
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
                <span className="text-[10px] font-semibold text-[#64748B]">Hired</span>
                <div className="mt-1 text-lg font-black" style={{ color: '#22C55E' }}>18</div>
                <div className="text-[9px] text-[#22C55E]">this month</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
                <span className="text-[10px] font-semibold text-[#64748B]">Applications Trend</span>
                <MiniLine color="#A855F7" />
              </div>
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
                <span className="text-[10px] font-semibold text-[#64748B]">Match Quality</span>
                <div className="mt-1 flex items-center justify-center"><MiniDonut pct={88} color="#A855F7" /><span className="ml-2 text-sm font-black text-[#A855F7]">88%</span></div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[#A855F7]/8 to-[#9333EA]/8 p-3 border border-[#A855F7]/15">
              <span className="text-[10px] font-semibold text-[#A855F7]">AI Shortlisted Candidates</span>
              <span className="text-xs font-extrabold text-[#A855F7]">12 →</span>
            </div>
          </div>
        );
      case 'Organization Portal':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
                <GraduationCap size={12} className="mb-1 text-[#F59E0B]" />
                <span className="text-[10px] font-semibold text-[#64748B]">Students</span>
                <div className="text-lg font-black" style={{ color: '#F59E0B' }}>3,240</div>
              </div>
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
                <UserCheck size={12} className="mb-1 text-[#3B82F6]" />
                <span className="text-[10px] font-semibold text-[#64748B]">Staff</span>
                <div className="text-lg font-black" style={{ color: '#3B82F6' }}>186</div>
              </div>
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
                <TrendingUp size={12} className="mb-1 text-[#22C55E]" />
                <span className="text-[10px] font-semibold text-[#64748B]">Revenue</span>
                <div className="text-lg font-black" style={{ color: '#22C55E' }}>$48K</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
                <span className="text-[10px] font-semibold text-[#64748B]">Monthly Growth</span>
                <MiniBar data={[45, 60, 50, 75, 65, 85]} color="#F59E0B" />
              </div>
              <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
                <span className="text-[10px] font-semibold text-[#64748B]">Retention</span>
                <div className="mt-1 flex items-center justify-center"><MiniDonut pct={94} color="#22C55E" /><span className="ml-2 text-sm font-black text-[#22C55E]">94%</span></div>
              </div>
            </div>
            <div className="rounded-xl bg-[#F8FAFC] p-3 border border-[#E2E8F0]/50">
              <span className="text-[10px] font-semibold text-[#64748B]">Departments</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {['Science', 'Arts', 'Commerce', 'Sports'].map((d) => (
                  <span key={d} className="rounded-md bg-white px-2 py-0.5 text-[9px] font-semibold text-[#475569] border border-[#E2E8F0]/50">{d}</span>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <SiteShell>
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24"
        style={{ background: 'linear-gradient(90deg, #F8FAFF 0%, #F4F1FF 30%, #FFFFFF 50%, #FFFFFF 100%)' }}>
        {/* Ambient background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[15%] top-0 h-[500px] w-[450px] -translate-x-1/2 rounded-full bg-[#6C4CF1]/10 blur-[120px]" />
          <div className="absolute bottom-0 left-[20%] h-[300px] w-[300px] rounded-full bg-[#6C4CF1]/8 blur-[80px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(108,76,241,0.10)_1px,transparent_0)] bg-[length:36px_36px] opacity-30" style={{ WebkitMaskImage: 'linear-gradient(to right, black 40%, transparent 100%)', mask: 'linear-gradient(to right, black 40%, transparent 100%)' }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left */}
            <div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E8E0FF] bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4 text-[#A855F7]" />
                <span className="text-xs font-extrabold" style={{ color: '#4F2DB8' }}>India&apos;s Leading AI-Powered Education Platform</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
                className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold leading-[1.06] tracking-tight" style={{ color: '#0F172A' }}>
                Transform Education<br />
                With{' '}
                <span className="bg-gradient-to-r from-[#6C4CF1] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">AI-Powered Innovation</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-5 max-w-xl text-lg leading-relaxed" style={{ color: '#475569' }}>
                Prasynx unifies students, parents, teachers, administrators, recruiters, and organizations into one intelligent ecosystem powered by AI.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}
                className="mt-8 flex flex-wrap gap-4">
                <a href="#get-started" className="btn btn-primary btn-lg shadow-lg shadow-[#6C4CF1]/25">
                  Get Started <ArrowRight className="h-5 w-5" />
                </a>
                <a href="/book-demo" className="btn btn-outline btn-lg">Book Live Demo</a>
                <a href="#platform" className="btn btn-light btn-lg"><Play className="h-5 w-5" /> Watch Tour</a>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-8 flex flex-wrap gap-5 text-sm" style={{ color: '#64748B' }}>
                {['Secure Platform', 'AI Powered', 'Enterprise Ready', 'Multi-Tenant'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> {item}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right - Hero Illustration */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
              className="relative hidden lg:flex items-center justify-center min-h-[520px]">

              {/* Subtle white/light glow behind illustration */}
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-b from-white via-white/90 to-[#6C4CF1]/10 rounded-full blur-[80px] opacity-70 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-white via-white/80 to-transparent rounded-full blur-[100px] opacity-80 pointer-events-none" />
              <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full blur-[90px] opacity-50 pointer-events-none bg-white" />
              <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] rounded-full blur-[70px] opacity-40 pointer-events-none bg-white" />

              {/* Floating particles */}
              {[
                { top: '12%', left: '8%', size: 3, color: '#6C4CF1', delay: 0 },
                { top: '32%', left: '2%', size: 4, color: '#A855F7', delay: 1 },
                { top: '52%', left: '6%', size: 3, color: '#6C4CF1', delay: 2 },
                { top: '72%', left: '3%', size: 5, color: '#A855F7', delay: 0.5 },
                { top: '22%', left: '88%', size: 4, color: '#A855F7', delay: 1.5 },
                { top: '48%', left: '92%', size: 3, color: '#6C4CF1', delay: 2.5 },
              ].map((p, i) => (
                <motion.div key={`p-${i}`}
                  className="absolute rounded-full pointer-events-none"
                  style={{ top: p.top, left: p.left, width: p.size, height: p.size, backgroundColor: p.color, opacity: 0.25 }}
                  animate={{ y: [0, -14 + i * 3, 0] }}
                  transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
                />
              ))}

              {/* Abstract decorative blobs - subtle */}
              <motion.div className="absolute top-8 right-12 h-20 w-20 rounded-full border border-[#E2E8F0] bg-white/60 pointer-events-none"
                animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div className="absolute bottom-16 left-6 h-14 w-14 rounded-full border border-[#E2E8F0] bg-white/50 pointer-events-none"
                animate={{ y: [0, 8, 0], rotate: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div className="absolute top-1/3 -right-4 h-10 w-10 rounded-lg border border-[#E2E8F0] bg-white/50 pointer-events-none rotate-45"
                animate={{ y: [0, -10, 0], rotate: [45, 55, 45] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Floating glassmorphism analytics cards */}
              <motion.div className="absolute top-8 -left-2 z-20 rounded-xl border border-white/80 bg-white/80 px-3 py-2.5 shadow-lg shadow-black/5 backdrop-blur-xl pointer-events-none"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="flex items-center gap-2.5">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#22C55E]/10">
                    <TrendingUp size={14} className="text-[#22C55E]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-[#64748B]">Active Users</div>
                    <div className="text-sm font-extrabold text-[#0F172A]">45.2K</div>
                  </div>
                  <div className="ml-2 rounded-full bg-[#22C55E]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#22C55E]">+12%</div>
                </div>
              </motion.div>

              <motion.div className="absolute top-[42%] -left-4 z-20 rounded-xl border border-white/80 bg-white/80 px-3 py-2.5 shadow-lg shadow-black/5 backdrop-blur-xl pointer-events-none"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="flex items-center gap-2.5">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#F59E0B]/10">
                    <Users size={14} className="text-[#F59E0B]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-[#64748B]">Teachers Online</div>
                    <div className="text-sm font-extrabold text-[#0F172A]">1,280</div>
                  </div>
                  <div className="ml-2 rounded-full bg-[#F59E0B]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#F59E0B]">+5%</div>
                </div>
              </motion.div>

              <motion.div className="absolute bottom-16 -left-1 z-20 rounded-xl border border-white/80 bg-white/80 px-3 py-2.5 shadow-lg shadow-black/5 backdrop-blur-xl pointer-events-none"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="flex items-center gap-2.5">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#F59E0B]/10">
                    <Star size={14} className="text-[#F59E0B]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-[#64748B]">Satisfaction</div>
                    <div className="text-sm font-extrabold text-[#0F172A]">98%</div>
                  </div>
                </div>
              </motion.div>

              <motion.div className="absolute top-8 right-6 z-20 rounded-xl border border-white/80 bg-white/80 px-3 py-2.5 shadow-lg shadow-black/5 backdrop-blur-xl pointer-events-none"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="flex items-center gap-2.5">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#6C4CF1]/10">
                    <Bot size={14} className="text-[#6C4CF1]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-[#64748B]">AI Queries</div>
                    <div className="text-sm font-extrabold text-[#0F172A]">128.4K</div>
                  </div>
                  <div className="ml-2 rounded-full bg-[#6C4CF1]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#6C4CF1]">+8%</div>
                </div>
              </motion.div>

              <motion.div className="absolute bottom-36 -left-4 z-20 rounded-xl border border-white/80 bg-white/80 px-3 py-2.5 shadow-lg shadow-black/5 backdrop-blur-xl pointer-events-none"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="flex items-center gap-2.5">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#EC4899]/10">
                    <BookOpen size={14} className="text-[#EC4899]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-[#64748B]">Courses Active</div>
                    <div className="text-sm font-extrabold text-[#0F172A]">3,450</div>
                  </div>
                  <div className="ml-2 rounded-full bg-[#EC4899]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#EC4899]">+18%</div>
                </div>
              </motion.div>

              <motion.div className="absolute bottom-24 right-4 z-20 rounded-xl border border-white/80 bg-white/80 px-3 py-2.5 shadow-lg shadow-black/5 backdrop-blur-xl pointer-events-none"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="flex items-center gap-2.5">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#3B82F6]/10">
                    <Building2 size={14} className="text-[#3B82F6]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-[#64748B]">Institutions</div>
                    <div className="text-sm font-extrabold text-[#0F172A]">50+</div>
                  </div>
                </div>
              </motion.div>

              {/* Main illustration */}
              <div className="relative z-10 flex items-center justify-center">
                <motion.img
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  src="/webherosection.png"
                  alt="Prasynx Unified Education OS"
                  className="relative mx-auto max-h-[480px] w-auto object-contain select-none pointer-events-none"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== LIVE STATS ===== */}
      <section className="relative -mt-8 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: 15200, suffix: '+', label: 'Active Students', icon: GraduationCap, color: '#22C55E' },
              { value: 500, suffix: '+', label: 'Expert Teachers', icon: UserCheck, color: '#6C4CF1' },
              { value: 50, suffix: '+', label: 'Institutions', icon: Building2, color: '#F59E0B' },
              { value: 98, suffix: '%', label: 'Customer Satisfaction', icon: Star, color: '#3B82F6' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label}
                  className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5">
                  <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-5 transition-all group-hover:scale-150" style={{ background: stat.color }} />
                  <div className="flex items-center gap-3 mb-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg" style={{ background: `${stat.color}15`, color: stat.color }}>
                      <Icon size={20} />
                    </div>
                  </div>
                  <div className="text-3xl font-black" style={{ color: '#0F172A' }}>
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="mt-1 text-sm font-semibold" style={{ color: '#64748B' }}>{stat.label}</div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="border-t border-[#E2E8F0] bg-white/50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mx-auto mb-14 max-w-2xl text-center">
            <span className="eyebrow mb-4">Features</span>
            <h2 className="section-title mt-3">Everything You Need to Run a Modern Institution</h2>
            <p className="section-subtitle mx-auto mt-4">From AI-powered learning to enterprise security, Prasynx provides every tool your institution needs.</p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} {...stagger} transition={{ ...stagger.transition, delay: i * 0.05 }}
                  className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#E8E0FF] hover:shadow-xl hover:shadow-[#6C4CF1]/5">
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#6C4CF1]/60 to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#F3F0FF] text-[#6C4CF1] transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#6C4CF1] group-hover:to-[#8B5CF6] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#6C4CF1]/30">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-lg font-extrabold" style={{ color: '#0F172A' }}>{f.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed" style={{ color: '#64748B' }}>{f.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== PORTAL SHOWCASE ===== */}
      <section id="platform" className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        {/* Premium background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#6C4CF1]/8 blur-[140px]" />
          <div className="absolute right-0 top-1/3 h-[500px] w-[500px] rounded-full bg-[#A855F7]/10 blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-[#8B5CF6]/8 blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(108,76,241,0.08)_1px,transparent_0)] bg-[length:32px_32px] opacity-40" />
          <div className="absolute left-0 top-1/4 h-px w-full bg-gradient-to-r from-transparent via-[#6C4CF1]/20 to-transparent" />
          <div className="absolute bottom-1/4 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#A855F7]/15 to-transparent" />
          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <div key={`bp-${i}`} className="absolute h-1 w-1 rounded-full bg-[#6C4CF1]/20"
              style={{ top: `${10 + i * 12}%`, left: `${5 + i * 12}%`, animation: `float ${6 + i * 1.5}s ease-in-out infinite`, animationDelay: `${i * 0.8}s` }} />
          ))}
        </div>

        <div className="relative mx-auto max-w-7xl">
          {/* Header */}
          <motion.div {...fadeUp} className="mx-auto mb-14 max-w-3xl text-center">
            <span className="eyebrow mb-5 inline-flex items-center gap-2 rounded-full border border-[#E8E0FF] bg-white/70 px-4 py-1.5 text-xs font-bold text-[#6C4CF1] shadow-sm backdrop-blur">
              <Sparkles size={12} className="text-[#A855F7]" /> Unified Education Ecosystem
            </span>
            <h2 className="section-title mt-4 text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-tight tracking-tight" style={{ color: '#0F172A' }}>
              Your Entire Institution.{' '}
              <span className="bg-gradient-to-r from-[#6C4CF1] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">One Intelligent Platform.</span>
            </h2>
            <p className="section-subtitle mx-auto mt-4 max-w-2xl text-base sm:text-lg" style={{ color: '#475569' }}>
              Manage students, parents, staff, recruiters, organizations, and platform operations from one intelligent ecosystem powered by AI.
            </p>
          </motion.div>


          <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
            {portals.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.button key={p.name} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setActivePortal(i)}
                  className={`group relative flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ${activePortal === i
                    ? 'text-white shadow-xl'
                    : 'border border-[#E2E8F0]/70 bg-white/60 text-[#475569] shadow-sm backdrop-blur-md hover:border-[#6C4CF1]/30 hover:bg-white hover:text-[#6C4CF1] hover:shadow-md'
                    }`}
                  style={activePortal === i ? { background: `linear-gradient(135deg, ${p.color}, ${p.color}dd)`, boxShadow: `0 4px 20px ${p.color}33` } : {}}>
                  {activePortal === i && (
                    <motion.span layoutId="activeTab" className="absolute inset-0 rounded-2xl" style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}dd)` }} />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon size={16} />
                    {p.name}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Main Showcase */}
          <AnimatePresence mode="wait">
            {portals.map((p, i) => {
              if (i !== activePortal) return null;
              const Icon = p.icon;
              return (
                <motion.div key={p.name} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                  className="grid gap-8 lg:grid-cols-5 lg:gap-10">

                  {/* Left - Dashboard Preview (3/5 width) */}
                  <div className="lg:col-span-3">
                    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0]/80 bg-white shadow-xl shadow-[#6C4CF1]/5 ring-1 ring-black/[0.02]">
                      {/* Mac-style title bar */}
                      <div className="flex items-center gap-2 border-b border-[#F1F5F9] bg-[#F8FAFC] px-4 py-3">
                        <div className="flex gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full bg-[#E2E8F0]" style={{ background: '#EF4444' }} />
                          <div className="h-2.5 w-2.5 rounded-full bg-[#E2E8F0]" style={{ background: '#F59E0B' }} />
                          <div className="h-2.5 w-2.5 rounded-full bg-[#E2E8F0]" style={{ background: '#22C55E' }} />
                        </div>
                        <div className="mx-auto rounded-md bg-white px-3 py-1 text-[10px] font-semibold text-[#64748B] shadow-sm border border-[#E2E8F0]/50">{p.name} Dashboard</div>
                        <div className="flex items-center gap-2">
                          <div className="grid h-6 w-6 place-items-center rounded-md bg-[#F1F5F9]"><Search size={12} className="text-[#94A3B8]" /></div>
                          <div className="grid h-6 w-6 place-items-center rounded-md bg-[#F1F5F9]"><Bell size={12} className="text-[#94A3B8]" /></div>
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#6C4CF1] to-[#A855F7]" />
                        </div>
                      </div>
                      {/* Dashboard content */}
                      <div className="p-5">
                        <PortalDashboard portal={p} />
                      </div>
                    </div>
                  </div>

                  {/* Right - Info Panel (2/5 width) */}
                  <div className="lg:col-span-2">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
                      className="flex h-full flex-col justify-center">
                      {/* Portal icon + name */}
                      <div className="mb-6 flex items-center gap-4">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl shadow-lg" style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}cc)`, boxShadow: `0 8px 24px ${p.color}33` }}>
                          <Icon size={28} className="text-white" />
                        </div>
                        <div>
                          <div className="text-lg font-extrabold" style={{ color: '#0F172A' }}>{p.name}</div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: p.color }}>
                            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
                            {p.users} active users
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="mb-6 text-sm leading-relaxed" style={{ color: '#475569' }}>{p.description}</p>

                      {/* Features */}
                      <div className="mb-8 space-y-3">
                        {p.features.map((f) => (
                          <motion.div key={f} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + p.features.indexOf(f) * 0.05 }}
                            className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] px-4 py-2.5 border border-[#E2E8F0]/50 transition-all hover:border-[#E8E0FF] hover:bg-white hover:shadow-sm">
                            <div className="grid h-6 w-6 shrink-0 place-items-center rounded-lg" style={{ background: `${p.color}15` }}>
                              <CheckCircle2 size={14} style={{ color: p.color }} />
                            </div>
                            <span className="text-sm font-semibold" style={{ color: '#0F172A' }}>{f}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* CTA */}
                      <a href={['http://localhost:3002', 'http://localhost:3004', 'http://localhost:3003', 'http://localhost:3006', 'http://localhost:3000/management/login'][i]}
                        className="group inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                        style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}cc)` }}>
                        Explore {p.name}
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                      </a>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Bottom Stats */}
          <motion.div {...fadeUp} className="mt-20">
            <div className="mx-auto max-w-5xl">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {[
                  { value: 50000, suffix: '+', label: 'Students', icon: GraduationCap, color: '#6C4CF1' },
                  { value: 10000, suffix: '+', label: 'Parents', icon: Users, color: '#8B5CF6' },
                  { value: 5000, suffix: '+', label: 'Staff', icon: UserCheck, color: '#7C3AED' },
                  { value: 2000, suffix: '+', label: 'Recruiters', icon: Briefcase, color: '#A855F7' },
                  { value: 500, suffix: '+', label: 'Organizations', icon: Building2, color: '#6D4CFF' },
                  { value: 99.9, suffix: '%', label: 'Uptime', icon: Shield, color: '#8B5CF6' },
                ].map((s) => {
                  const SIcon = s.icon;
                  return (
                    <div key={s.label}
                      className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0]/70 bg-white/80 px-4 py-5 text-center shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#E8E0FF] hover:shadow-lg hover:shadow-[#6C4CF1]/5">
                      <div className="mx-auto mb-2 grid h-8 w-8 place-items-center rounded-xl transition-all duration-300 group-hover:scale-110" style={{ background: `${s.color}15` }}>
                        <SIcon size={15} style={{ color: s.color }} />
                      </div>
                      <div className="text-xl font-black" style={{ color: '#0F172A' }}>
                        <AnimatedCounter value={s.value} suffix={s.suffix} />
                      </div>
                      <div className="mt-0.5 text-[11px] font-semibold" style={{ color: '#64748B' }}>{s.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== PRERANA AI SHOWCASE ===== */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 50%, #F4F1FF 100%)' }}>
        {/* Background effects matching landing page theme */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/3 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#6C4CF1]/8 blur-[120px]" />
          <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-[#A855F7]/10 blur-[100px]" />
          <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-[#8B5CF6]/8 blur-[80px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(108,76,241,0.08)_1px,transparent_0)] bg-[length:32px_32px] opacity-30" />
          <div className="absolute left-0 top-1/3 h-px w-full bg-gradient-to-r from-transparent via-[#6C4CF1]/20 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          {/* Premium header matching portal showcase */}
          <motion.div {...fadeUp} className="mx-auto mb-16 max-w-3xl text-center">
            <span className="eyebrow mb-5 inline-flex items-center gap-2 rounded-full border border-[#E8E0FF] bg-white/70 px-4 py-1.5 text-xs font-bold text-[#6C4CF1] shadow-sm backdrop-blur">
              <Sparkles size={12} className="text-[#A855F7]" /> AI Assistant
            </span>
            <h2 className="section-title mt-4 text-[clamp(2rem,3.5vw,3rem)] font-extrabold leading-tight tracking-tight" style={{ color: '#0F172A' }}>
              Meet Your AI{' '}
              <span className="bg-gradient-to-r from-[#6C4CF1] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">Education Assistant</span>
            </h2>
            <p className="section-subtitle mx-auto mt-4 max-w-2xl text-base sm:text-lg" style={{ color: '#475569' }}>
              Your intelligent educational assistant — helping students, parents, teachers, recruiters, and administrators work smarter with AI.
            </p>
          </motion.div>

          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
            {/* Left - AI Character Area */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="relative mx-auto flex h-[420px] w-[420px] items-center justify-center">

              {/* Premium concentric glow rings */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#6C4CF1]/15 via-[#A855F7]/10 to-transparent blur-3xl animate-pulse-glow" />
              <div className="absolute -inset-14 rounded-full border-2 border-[#8B5CF6]/20 animate-pulse-glow" style={{ animationDelay: '0.3s' }} />
              <div className="absolute -inset-8 rounded-full border border-dashed border-[#6C4CF1]/25 animate-pulse-glow" style={{ animationDelay: '0.6s' }} />
              <div className="absolute inset-6 rounded-full border border-[#6C4CF1]/15 animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
              <div className="absolute inset-12 rounded-full border border-[#A855F7]/12 animate-pulse-glow" style={{ animationDelay: '1s' }} />
              <div className="absolute inset-20 rounded-full bg-gradient-to-br from-[#6C4CF1]/20 via-[#A855F7]/12 to-[#6C4CF1]/8 blur-2xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

              {/* Floating particles around AI */}
              {[
                { top: '10%', left: '15%', size: 3, delay: 0 },
                { top: '20%', right: '10%', size: 4, delay: 0.8 },
                { top: '50%', left: '5%', size: 2, delay: 1.6 },
                { bottom: '15%', left: '20%', size: 3, delay: 0.4 },
                { bottom: '25%', right: '8%', size: 2, delay: 2 },
                { top: '35%', right: '5%', size: 3, delay: 1.2 },
              ].map((p, i) => (
                <motion.div key={`ap-${i}`}
                  className="absolute rounded-full bg-[#6C4CF1] pointer-events-none"
                  style={{ top: p.top, left: p.left, right: p.right, bottom: p.bottom, width: p.size, height: p.size, opacity: 0.3 }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
                />
              ))}

              {/* Decorative abstract shapes */}
              <motion.div className="absolute top-6 left-8 h-12 w-12 rounded-2xl border border-[#6C4CF1]/15 bg-gradient-to-br from-[#6C4CF1]/8 to-transparent pointer-events-none rotate-12"
                animate={{ y: [0, -8, 0], rotate: [12, 18, 12] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div className="absolute top-16 right-12 h-8 w-8 rounded-full border border-[#A855F7]/15 bg-gradient-to-tr from-[#A855F7]/8 to-transparent pointer-events-none"
                animate={{ y: [0, 10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div className="absolute bottom-20 left-10 h-10 w-10 rounded-xl border border-[#8B5CF6]/12 bg-gradient-to-bl from-[#8B5CF6]/6 to-transparent pointer-events-none rotate-45"
                animate={{ y: [0, -6, 0], rotate: [45, 52, 45] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Orbiting small icons */}
              <motion.div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                animate={{ y: [0, -50, 0], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="grid h-7 w-7 place-items-center rounded-xl bg-white/80 shadow-sm backdrop-blur border border-[#E2E8F0]/50">
                  <Sparkles size={12} className="text-[#6C4CF1]" />
                </div>
              </motion.div>
              <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                animate={{ y: [0, 40, 0], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="grid h-6 w-6 place-items-center rounded-xl bg-white/80 shadow-sm backdrop-blur border border-[#E2E8F0]/50">
                  <Zap size={10} className="text-[#A855F7]" />
                </div>
              </motion.div>

              {/* Mini analytics floating card */}
              <motion.div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
                <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-[#6C4CF1] to-[#A855F7] shadow-lg shadow-[#6C4CF1]/30 -translate-y-20">
                  <Bot size={10} className="text-white" />
                </div>
              </motion.div>

              {/* Center AI character */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10">
                {/* Glow behind icon */}
                <div className="absolute inset-0 rounded-full bg-[#6C4CF1]/20 blur-[40px] scale-150" />
                <motion.img
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  src="/prerana-ai.png"
                  alt="Prerana AI"
                  className="relative z-10 w-[220px] h-auto object-contain drop-shadow-[0_15px_30px_rgba(108,76,241,0.3)] select-none pointer-events-none"
                />
              </motion.div>

              {/* Premium floating conversation cards */}

              {/* Top floating notification */}
              <motion.div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: 0.3 }}>
                <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/90 px-4 py-2.5 shadow-lg shadow-[#6C4CF1]/10 backdrop-blur-xl whitespace-nowrap"
                  style={{ animation: 'float 3s ease-in-out infinite' }}>
                  <div className="grid h-6 w-6 place-items-center rounded-lg bg-[#6C4CF1]/10">
                    <Sparkles size={12} className="text-[#6C4CF1]" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold" style={{ color: '#0F172A' }}>24/7 AI Support</div>
                    <div className="text-[8px] font-medium" style={{ color: '#64748B' }}>Instant responses</div>
                  </div>
                </div>
              </motion.div>

              {/* Bottom floating notification */}
              <motion.div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: 0.6 }}>
                <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/90 px-4 py-2.5 shadow-lg shadow-[#A855F7]/10 backdrop-blur-xl whitespace-nowrap"
                  style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '1.5s' }}>
                  <div className="grid h-6 w-6 place-items-center rounded-lg bg-[#F59E0B]/10">
                    <Zap size={12} className="text-[#F59E0B]" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold" style={{ color: '#0F172A' }}>Smart Insights</div>
                    <div className="text-[8px] font-medium" style={{ color: '#64748B' }}>AI-powered analytics</div>
                  </div>
                </div>
              </motion.div>

              <motion.div className="floating absolute -left-4 top-12 z-20 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-lg shadow-[#6C4CF1]/8 backdrop-blur-xl pointer-events-none"
                animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="flex items-center gap-2.5">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#6C4CF1]/10">
                    <MessageCircle size={14} className="text-[#6C4CF1]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold" style={{ color: '#0F172A' }}>AI Chat</div>
                    <div className="text-[8px] font-medium" style={{ color: '#64748B' }}>Active now</div>
                  </div>
                  <div className="ml-1 h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                </div>
              </motion.div>

              <motion.div className="floating absolute -right-3 top-24 z-20 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-lg shadow-[#6C4CF1]/8 backdrop-blur-xl pointer-events-none"
                animate={{ y: [0, 8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="flex items-center gap-2.5">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#22C55E]/10">
                    <BookOpen size={14} className="text-[#22C55E]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold" style={{ color: '#0F172A' }}>Study Plan</div>
                    <div className="text-[8px] font-medium" style={{ color: '#64748B' }}>Generated</div>
                  </div>
                </div>
              </motion.div>

              <motion.div className="floating absolute -left-6 bottom-20 z-20 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-lg shadow-[#6C4CF1]/8 backdrop-blur-xl pointer-events-none"
                animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="flex items-center gap-2.5">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#F59E0B]/10">
                    <Award size={14} className="text-[#F59E0B]" />
                  </div>
                  <div className="text-[10px] font-bold" style={{ color: '#0F172A' }}>Career Match</div>
                </div>
              </motion.div>

              <motion.div className="floating absolute -right-5 bottom-24 z-20 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-lg shadow-[#6C4CF1]/8 backdrop-blur-xl pointer-events-none"
                animate={{ y: [0, 6, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="flex items-center gap-2.5">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#3B82F6]/10">
                    <BarChart3 size={14} className="text-[#3B82F6]" />
                  </div>
                  <div className="text-[10px] font-bold" style={{ color: '#0F172A' }}>Analytics</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right - AI Features */}
            <div className="space-y-4">
              {[
                { icon: MessageCircle, label: 'Intelligent AI Chat', desc: 'Natural conversation for instant help with any question or task across all portals.' },
                { icon: BookOpen, label: 'Academic Guidance', desc: 'Personalized learning paths, study recommendations, and course planning powered by AI.' },
                { icon: Award, label: 'Career Recommendations', desc: 'AI-powered career matching based on skills, interests, and real market demand data.' },
                { icon: BarChart3, label: 'Predictive Analytics', desc: 'Early warning system to identify at-risk students and recommend interventions.' },
                { icon: Briefcase, label: 'Recruitment Intelligence', desc: 'Smart candidate matching and hiring recommendations for job providers.' },
                { icon: FileText, label: 'Document Automation', desc: 'Auto-generate reports, certificates, and administrative documents in seconds.' },
              ].map((ai, i) => {
                const Icon = ai.icon;
                return (
                  <motion.div key={ai.label} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="group flex items-center gap-4 rounded-2xl border border-[#E2E8F0]/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-x-1 hover:border-[#E8E0FF] hover:bg-white hover:shadow-lg hover:shadow-[#6C4CF1]/5">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] text-[#6C4CF1] shadow-inner transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#6C4CF1] group-hover:to-[#8B5CF6] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#6C4CF1]/30">
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-extrabold" style={{ color: '#0F172A' }}>{ai.label}</div>
                      <div className="mt-0.5 text-xs leading-relaxed" style={{ color: '#64748B' }}>{ai.desc}</div>
                    </div>
                    <ChevronRight size={14} className="shrink-0 text-[#CBD5E1] transition-all group-hover:translate-x-0.5 group-hover:text-[#6C4CF1]" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHY PRASYNX ===== */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 50%, #F4F1FF 100%)' }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#6C4CF1]/8 via-[#8B5CF6]/5 to-transparent blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#A855F7]/8 via-[#6C4CF1]/5 to-transparent blur-3xl" />
        </div>

        <motion.div {...fadeUp} className="relative mx-auto mb-16 max-w-2xl text-center">
          <span className="eyebrow mb-4">Why Prasynx</span>
          <h2 className="section-title mt-3">
            Built Different.{' '}
            <span className="bg-gradient-to-r from-[#6C4CF1] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">Built Better.</span>
          </h2>
          <p className="section-subtitle mx-auto mt-4">We reimagined education management from the ground up with AI, automation, analytics, and enterprise-grade architecture.</p>
        </motion.div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Globe, title: 'Unified Education OS', desc: 'Replace 5+ separate systems with one integrated platform connecting every stakeholder.', metric: '6 Portals', color: '#6C4CF1' },
              { icon: Bot, title: 'AI-Powered Automation', desc: 'Reduce administrative work by 60% with intelligent automation across every workflow.', metric: '60% Less Work', color: '#8B5CF6' },
              { icon: Activity, title: 'Real-Time Monitoring', desc: 'Live dashboards with instant alerts on attendance, engagement, fees, and health.', metric: 'Live Monitoring', color: '#A855F7' },
              { icon: Building2, title: 'Multi-Tenant Architecture', desc: 'Scale seamlessly from one school to thousands of organizations on shared infrastructure.', metric: 'Unlimited Scale', color: '#6C4CF1' },
              { icon: Shield, title: 'Enterprise Security', desc: 'SOC 2, GDPR, ISO 27001 with RBAC, audit logs, encryption, and SSO.', metric: 'Enterprise Grade', color: '#10B981' },
              { icon: Cloud, title: 'Scalable Infrastructure', desc: 'Auto-scaling cloud architecture with 99.9% uptime SLA and multi-region support.', metric: '99.9% Uptime', color: '#6C4CF1' },
              { icon: Smartphone, title: 'Modern UX', desc: 'Beautifully designed interfaces for students, parents, teachers, and administrators.', metric: 'Mobile + Desktop', color: '#8B5CF6' },
              { icon: Zap, title: 'AI Intelligence Layer', desc: 'Prerana AI powers smart recommendations, analytics, and automation across every portal.', metric: 'AI Everywhere', color: '#6C4CF1' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="group relative rounded-2xl border border-[#E2E8F0] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#6C4CF1]/30 hover:shadow-lg hover:shadow-[#6C4CF1]/5">
                  <div className="relative mb-4 flex items-center justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#F3F0FF] text-[#6C4CF1] transition-all group-hover:bg-[#6C4CF1] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#6C4CF1]/30">
                      <Icon size={22} />
                    </div>
                    <span className="rounded-full bg-[#F3F0FF] px-2.5 py-1 text-[10px] font-bold text-[#6C4CF1] transition-colors group-hover:bg-[#6C4CF1] group-hover:text-white">{item.metric}</span>
                  </div>
                  <h3 className="relative text-base font-extrabold" style={{ color: '#0F172A' }}>{item.title}</h3>
                  <p className="relative mt-1.5 text-sm leading-relaxed" style={{ color: '#64748B' }}>{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="border-t border-[#E2E8F0] bg-white/50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mx-auto mb-14 max-w-2xl text-center">
            <span className="eyebrow mb-4">Testimonials</span>
            <h2 className="section-title mt-3">Trusted by Leading Institutions</h2>
            <p className="section-subtitle mx-auto mt-4">See what education leaders say about Prasynx.</p>
          </motion.div>

          <div className="relative mx-auto max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div key={testimonialActive} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}
                className="rounded-3xl border border-[#E2E8F0] bg-white p-8 shadow-xl sm:p-12">
                <Quote size={32} className="mb-4 text-[#6C4CF1]/20" />
                <p className="text-lg leading-relaxed italic" style={{ color: '#0F172A' }}>&ldquo;{testimonials[testimonialActive].content}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl ring-2 ring-white shadow-md">
                    <img src={testimonials[testimonialActive].avatar} alt={testimonials[testimonialActive].name}
                      className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold" style={{ color: '#0F172A' }}>{testimonials[testimonialActive].name}</div>
                    <div className="text-xs font-semibold" style={{ color: '#64748B' }}>{testimonials[testimonialActive].role}</div>
                    <div className="mt-1 flex gap-0.5">
                      {Array.from({ length: testimonials[testimonialActive].rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-center gap-3">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setTestimonialActive(i)}
                  className={`h-2 rounded-full transition-all ${i === testimonialActive ? 'w-8 bg-[#6C4CF1]' : 'w-2 bg-[#E2E8F0] hover:bg-[#CBD5E1]'}`} />
              ))}
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => setTestimonialActive((p) => (p - 1 + testimonials.length) % testimonials.length)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] transition hover:border-[#6C4CF1] hover:text-[#6C4CF1]"><ChevronLeft size={18} /></button>
              <button onClick={() => setTestimonialActive((p) => (p + 1) % testimonials.length)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] transition hover:border-[#6C4CF1] hover:text-[#6C4CF1]"><ChevronRight size={18} /></button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST SECTION ===== */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 50%, #FFFFFF 100%)' }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#6C4CF1]/6 via-[#8B5CF6]/3 to-transparent blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#A855F7]/6 via-[#6C4CF1]/3 to-transparent blur-3xl" />
        </div>

        <motion.div {...fadeUp} className="relative mx-auto mb-12 max-w-2xl text-center">
          <span className="eyebrow mb-4">
            <Shield className="h-4 w-4" /> Enterprise Trust
          </span>
          <h2 className="section-title mt-3">Built for Enterprise-Grade Security & Reliability</h2>
          <p className="section-subtitle mx-auto mt-4">Your data is protected by the highest industry standards.</p>
        </motion.div>

        <div className="relative mx-auto max-w-7xl">
          {/* Featured security card */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="relative mb-8 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-lg sm:p-8">
            <div className="pointer-events-none absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-[#6C4CF1]/5 to-transparent" />
            <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center">
              <div className="shrink-0">
                <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-[#6C4CF1] to-[#8B5CF6] text-white shadow-lg shadow-[#6C4CF1]/25">
                  <Shield size={36} />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-extrabold" style={{ color: '#0F172A' }}>Enterprise Security Suite</h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed" style={{ color: '#64748B' }}>
                  SOC 2 Type II, GDPR, ISO 27001, and PCI DSS compliant. End-to-end encryption, RBAC, audit logs, SSO, and 24/7 threat monitoring — built into every layer of the platform.
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-center gap-1 rounded-xl border border-[#6C4CF1]/10 bg-[#F3F0FF] px-5 py-3">
                <span className="text-2xl font-black text-[#6C4CF1]">99.9%</span>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#64748B' }}>Uptime SLA</span>
              </div>
            </div>
          </motion.div>

          {/* Feature grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trustItems.map((t, i) => {
              const Icon = t.icon;
              return (
                <motion.div key={t.label} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="group relative rounded-2xl border border-[#E2E8F0] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#6C4CF1]/20 hover:shadow-lg hover:shadow-[#6C4CF1]/5">
                  <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-[#6C4CF1]/0 to-[#8B5CF6]/0 opacity-0 transition-opacity group-hover:from-[#6C4CF1]/3 group-hover:to-[#8B5CF6]/3 group-hover:opacity-100" />
                  <div className="relative flex items-start gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#F3F0FF] text-[#6C4CF1] transition-all group-hover:bg-[#6C4CF1] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#6C4CF1]/25">
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold" style={{ color: '#0F172A' }}>{t.label}</div>
                      <div className="mt-0.5 text-xs leading-relaxed" style={{ color: '#64748B' }}>{t.desc}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Certification badges */}
          <motion.div {...fadeUp} className="relative mt-10 rounded-2xl border border-[#E2E8F0] bg-white/60 px-6 py-5 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {[
                { label: 'SOC 2 Type II', icon: Shield },
                { label: 'GDPR Compliant', icon: Globe },
                { label: 'ISO 27001', icon: Shield },
                { label: 'PCI DSS', icon: Lock },
                { label: 'AWS Cloud', icon: Cloud },
                { label: '99.9% Uptime', icon: Server },
              ].map((cert) => {
                const Icon = cert.icon;
                return (
                  <div key={cert.label} className="group/cert flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#6C4CF1]/20 hover:shadow-md hover:shadow-[#6C4CF1]/10">
                    <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#F3F0FF] text-[#6C4CF1] transition-all group-hover/cert:bg-[#6C4CF1] group-hover/cert:text-white">
                      <Icon size={14} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: '#0F172A' }}>{cert.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section id="get-started" className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl px-8 py-14 sm:px-14 sm:py-16 text-white shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #6C4CF1 0%, #8B5CF6 40%, #A855F7 100%)' }}>
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-[#4B2DB5]/20 blur-3xl" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-2xl animate-pulse-glow" />

            <div className="relative text-center">
              <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">Ready to Transform Your Institution?</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed sm:text-lg text-white/80">
                Join thousands of educational institutions already using Prasynx to streamline operations, enhance learning, and drive better outcomes.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <a href="/book-demo" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
                  style={{ color: '#6C4CF1' }}>
                  Start Free Trial <ArrowRight className="h-5 w-5" />
                </a>
                <a href="#platform" className="inline-flex items-center gap-2 rounded-xl border-2 border-white/20 px-8 py-3.5 text-base font-bold text-white/80 transition-all hover:-translate-y-0.5 hover:bg-white/5 hover:text-white hover:shadow-lg">
                  <Play className="h-5 w-5" /> Watch Platform Tour
                </a>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-white/70">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-300" /> No credit card required</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-300" /> Free migration assistance</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-300" /> Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="border-t border-[#E2E8F0] bg-white/50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <motion.div {...fadeUp} className="mx-auto mb-12 max-w-2xl text-center">
            <span className="eyebrow mb-4">FAQ</span>
            <h2 className="section-title mt-3">Frequently Asked Questions</h2>
            <p className="section-subtitle mx-auto mt-3">Everything you need to know about Prasynx.</p>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={faq.q} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className={`overflow-hidden rounded-2xl border transition-all ${faqOpen === i ? 'border-[#6C4CF1] shadow-md' : 'border-[#E2E8F0] bg-white'}`}>
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left font-bold transition hover:bg-[#F8FAFC]"
                  style={{ color: '#0F172A' }}>
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown size={18} className={`shrink-0 transition-transform duration-200 ${faqOpen === i ? 'rotate-180 text-[#6C4CF1]' : ''}`} style={{ color: '#94A3B8' }} />
                </button>
                <AnimatePresence initial={false}>
                  {faqOpen === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-[#F1F5F9]">
                      <div className="px-6 py-5 text-sm leading-relaxed" style={{ color: '#475569' }}>{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DOWNLOAD APP ===== */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-[#F5F3FF] to-white" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-96 -left-96 h-[800px] w-[800px] rounded-full bg-[#7C3AED]/6 blur-[150px]" />
          <div className="absolute -bottom-96 -right-96 h-[800px] w-[800px] rounded-full bg-[#8B5CF6]/5 blur-[150px]" />
          <div className="absolute top-1/3 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C3AED]/4 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#7C3AED 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>



        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left Content */}
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#EDE9FE] bg-white px-4 py-1.5 shadow-sm">
                <Smartphone size={12} className="text-[#7C3AED]" />
                <span className="text-xs font-bold text-[#7C3AED]">Mobile App Available</span>
              </motion.div>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl font-black tracking-tight text-[#0F172A] sm:text-5xl lg:text-6xl">
                Take Prasynx{' '}
                <span className="bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] bg-clip-text text-transparent">Everywhere</span>
                <br />You Go
              </motion.h2>

              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}
                className="mt-2 text-2xl font-black tracking-tight text-[#7C3AED] sm:text-3xl">
                Learn. Manage. Connect.
              </motion.p>

              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4 max-w-xl text-lg leading-relaxed text-[#64748B]">
                Access your entire educational ecosystem from anywhere. Whether you're a student, parent, teacher, recruiter, or administrator, the Prasynx Mobile App keeps everything at your fingertips.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.25 }}
                className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  'Student Learning & Assignments',
                  'Attendance Tracking',
                  'Parent Communication',
                  'Staff Management',
                  'Recruitment & Placements',
                  'Real-Time Notifications',
                  'AI-Powered Prerana Assistant',
                  'Secure Cloud Access',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="shrink-0 text-green-500" />
                    <span className="text-sm font-medium text-[#475569]">{feature}</span>
                  </div>
                ))}
              </motion.div>

              {/* Download Buttons */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.35 }}
                className="mt-10 flex flex-wrap gap-4">
                <motion.a href="#" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-[#0F172A] px-6 py-3.5 shadow-xl shadow-black/20 transition-all hover:shadow-2xl hover:shadow-black/30">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0 fill-white"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                  <div className="relative text-left">
                    <p className="text-[10px] font-medium text-white/60">Download on the</p>
                    <p className="text-sm font-bold text-white">App Store</p>
                  </div>
                </motion.a>

                <motion.a href="#" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-[#0F172A] px-6 py-3.5 shadow-xl shadow-black/20 transition-all hover:shadow-2xl hover:shadow-black/30">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0 fill-white"><path d="M17.523 12.065c.013 3.057 2.676 4.073 2.706 4.087-.022.074-.423 1.448-1.395 2.87-.841 1.23-1.715 2.456-3.092 2.48-1.352.025-1.787-.803-3.333-.803s-2.028.778-3.307.828c-1.33.05-2.343-1.332-3.195-2.553-1.737-2.513-3.064-7.1-1.282-10.196.885-1.537 2.467-2.51 4.185-2.534 1.307-.025 2.54.88 3.34.88s2.29-1.088 3.861-.928c.652.026 2.482.263 3.658 1.982-.095.06-2.184 1.275-2.16 3.806zm-2.56-7.556c.699-.847 1.17-2.025 1.041-3.2-1.007.04-2.226.67-2.948 1.516-.648.75-1.215 1.948-1.062 3.098 1.123.087 2.268-.57 2.969-1.414z" /></svg>
                  <div className="relative text-left">
                    <p className="text-[10px] font-medium text-white/60">Get it on</p>
                    <p className="text-sm font-bold text-white">Google Play</p>
                  </div>
                </motion.a>
              </motion.div>

              {/* Trust Stats */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.45 }}
                className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { value: '50,000+', label: 'Students' },
                  { value: '5,000+', label: 'Teachers' },
                  { value: '1,000+', label: 'Institutions' },
                  { value: '100,000+', label: 'Downloads' },
                ].map(({ value, label }) => (
                  <div key={label} className="rounded-xl border border-[#E2E8F0] bg-white/70 px-4 py-3 text-center shadow-sm backdrop-blur-sm">
                    <div className="text-lg font-black text-[#0F172A]">{value}</div>
                    <div className="mt-0.5 text-xs font-medium text-[#64748B]">{label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right - Phone Mockup */}
            <motion.div initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:flex items-center justify-center min-h-[620px]">
              <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10">
                {/* Phone Frame */}
                <div className="relative h-[580px] w-[280px] rounded-[2.5rem] border-[3px] border-[#CBD5E1] bg-white shadow-2xl shadow-[#7C3AED]/10 overflow-hidden">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 z-20 h-5 w-32 -translate-x-1/2 rounded-b-2xl bg-[#E2E8F0]" />

                  {/* Status Bar */}
                  <div className="relative z-10 flex items-center justify-between px-6 pt-7 pb-2">
                    <span className="text-[11px] font-bold text-[#475569]">9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-3.5 rounded-sm border border-[#94A3B8]" />
                      <svg className="h-3 w-3 fill-[#94A3B8]" viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" /></svg>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="relative px-4 pt-2">
                    {/* Greeting */}
                    <div className="mb-3">
                      <p className="text-[10px] font-medium text-[#94A3B8]">Good morning</p>
                      <p className="text-sm font-bold text-[#0F172A]">E2E Student</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-gradient-to-br from-[#7C3AED]/10 to-[#8B5CF6]/5 p-2.5">
                        <p className="text-[10px] font-medium text-[#64748B]">Attendance</p>
                        <p className="text-lg font-black text-[#22C55E]">96%</p>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-[#3B82F6]/10 to-[#2563EB]/5 p-2.5">
                        <p className="text-[10px] font-medium text-[#64748B]">GPA</p>
                        <p className="text-lg font-black text-[#1E40AF]">3.8</p>
                      </div>
                    </div>

                    {/* Upcoming */}
                    <div className="mt-3 rounded-xl bg-[#F8FAFC] p-2.5">
                      <p className="text-[10px] font-medium text-[#94A3B8]">Upcoming</p>
                      <p className="text-xs font-bold text-[#0F172A]">Mathematics Exam</p>
                      <p className="text-[10px] text-[#94A3B8]">Tomorrow, 10:00 AM</p>
                    </div>

                    {/* Prerana AI Chat */}
                    <div className="mt-2 rounded-xl bg-gradient-to-r from-[#7C3AED]/8 to-[#8B5CF6]/5 p-2.5">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={10} className="text-[#7C3AED]" />
                        <p className="text-[10px] font-bold text-[#7C3AED]">Prerana AI</p>
                      </div>
                      <p className="mt-1 text-[10px] text-[#64748B] leading-relaxed">Your Physics grade improved 15% this month. Great work!</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-3 grid grid-cols-4 gap-1.5">
                      {[
                        { label: 'Classes', color: '#7C3AED' },
                        { label: 'Tasks', color: '#22C55E' },
                        { label: 'Grades', color: '#3B82F6' },
                        { label: 'Chat', color: '#F97316' },
                      ].map(({ label, color }) => (
                        <div key={label} className="flex flex-col items-center gap-1 rounded-lg bg-[#F8FAFC] py-2">
                          <div className="h-4 w-4 rounded-full" style={{ background: `${color}20` }} />
                          <span className="text-[8px] font-medium text-[#64748B]">{label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Assignments */}
                    <div className="mt-3 space-y-1.5">
                      <p className="text-[10px] font-bold text-[#94A3B8]">Assignments</p>
                      {[
                        { title: 'Physics HW', due: 'Today', color: '#7C3AED' },
                        { title: 'Chemistry Lab', due: 'Tomorrow', color: '#22C55E' },
                      ].map(({ title, due, color }) => (
                        <div key={title} className="flex items-center gap-2 rounded-lg bg-[#F8FAFC] px-2.5 py-2">
                          <div className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                          <p className="flex-1 text-[10px] font-medium text-[#475569]">{title}</p>
                          <p className="text-[8px] font-medium text-[#94A3B8]">{due}</p>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Nav */}
                    <div className="mt-3 flex justify-around rounded-xl bg-[#F8FAFC] px-2 py-2">
                      {['Home', 'Courses', 'Chat', 'Profile'].map((label) => (
                        <span key={label} className={`text-[8px] font-medium ${label === 'Home' ? 'text-[#7C3AED]' : 'text-[#94A3B8]'}`}>{label}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

    </SiteShell>
  );
}
