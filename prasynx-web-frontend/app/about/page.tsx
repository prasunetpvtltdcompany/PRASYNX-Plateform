"use client";
import {
  ArrowRight, Sparkles, Users, Building2, Star, Bot, Target, Eye,
  GraduationCap, BookOpen, Briefcase, BarChart3, TrendingUp, Award,
  Lightbulb, Heart, Globe, Zap, Shield, Quote, Rocket, Calendar,
  Cpu, Database, Cloud, Layers, Trophy, CheckCircle, Server,
  MessageCircle, MapPin,   BookMarked, Gift, Compass, Infinity as InfinityIcon,
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

const timeline = [
  { year: '2024', title: 'The Vision Begins', desc: 'Prasynx was founded with a bold vision: unify the fragmented education technology landscape into a single intelligent platform.', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&h=350&fit=crop', color: '#7C3AED' },
  { year: '2025', title: 'Platform Development', desc: 'Built the core Education OS with student, parent, staff, and admin portals. Onboarded first 100 institutions across India.', image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=500&h=350&fit=crop', color: '#8B5CF6' },
  { year: '2026', title: 'AI Integration', desc: 'Launched Prerana AI — our intelligent education assistant. Expanded to 500+ institutions with 50,000+ active students.', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=350&fit=crop', color: '#A855F7' },
  { year: '2027', title: 'Institution Expansion', desc: 'Crossed 1,000+ institutions across 15 countries. Introduced recruitment platform and career development ecosystem.', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=350&fit=crop', color: '#6D28D9' },
];

const futureMilestones = [
  { year: '2028', title: 'Global Education Ecosystem', desc: 'Connecting learners, educators, institutions, and employers across the world through a unified AI-powered platform.', color: '#7C3AED', icon: Globe },
];

const platforms = [
  { icon: GraduationCap, title: 'Student Portal', desc: 'Personalized learning dashboard with courses, grades, attendance, assignments, and AI-powered recommendations.', color: '#7C3AED', preview: '📚' },
  { icon: Users, title: 'Parent Portal', desc: 'Real-time visibility into student progress, attendance, fee payments, and direct communication with teachers.', color: '#8B5CF6', preview: '👨‍👩‍👧' },
  { icon: BookOpen, title: 'Teacher Workspace', desc: 'Powerful tools for lesson planning, grade management, attendance tracking, and student performance analytics.', color: '#A855F7', preview: '👩‍🏫' },
  { icon: Building2, title: 'Institution Management', desc: 'Complete ERP for admissions, timetables, exams, HR, payroll, inventory, and compliance management.', color: '#6D28D9', preview: '🏛️' },
  { icon: Briefcase, title: 'Recruitment Platform', desc: 'Connecting skilled graduates and job seekers with employers through AI-matched opportunities.', color: '#7C3AED', preview: '💼' },
  { icon: Bot, title: 'Prerana AI', desc: 'Intelligent AI assistant that automates workflows, predicts student outcomes, and provides personalized insights.', color: '#8B5CF6', preview: '🤖' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Real-time institutional analytics with predictive insights, custom reports, and data visualization.', color: '#A855F7', preview: '📊' },
  { icon: TrendingUp, title: 'Career Development', desc: 'Skill assessments, career counseling, internship matching, and job placement services for students.', color: '#6D28D9', preview: '🚀' },
];

const values = [
  { icon: Lightbulb, title: 'Innovation First', desc: 'We constantly push boundaries to create next-generation education technology that transforms how people learn and teach.', color: '#7C3AED' },
  { icon: Star, title: 'Student Success', desc: 'Every feature we build, every decision we make is measured by its impact on student outcomes and learning experiences.', color: '#8B5CF6' },
  { icon: Shield, title: 'Integrity', desc: 'We operate with complete transparency, ethical AI practices, and uncompromising commitment to data privacy and security.', color: '#A855F7' },
  { icon: BookMarked, title: 'Continuous Learning', desc: 'We invest in our own growth as much as we invest in our products, fostering a culture of curiosity and mastery.', color: '#6D28D9' },
  { icon: Users, title: 'Collaboration', desc: 'We believe the best solutions emerge from diverse perspectives, open dialogue, and genuine partnership with our users.', color: '#7C3AED' },
  { icon: Globe, title: 'Long-Term Impact', desc: 'We build for the long haul, creating sustainable solutions that will serve educational institutions for generations.', color: '#8B5CF6' },
];

const team = [
  { name: 'Vikram Patel', role: 'CEO & Founder', bio: 'Former EdTech founder with a vision to transform education through AI. Built products serving 2M+ users.', avatar: 'https://i.pravatar.cc/120?img=41' },
  { name: 'Dr. Neha Gupta', role: 'CTO', bio: 'PhD in AI from IIT. Former Google AI researcher. Published 30+ papers in ML and NLP.', avatar: 'https://i.pravatar.cc/120?img=42' },
  { name: 'Sarah Mitchell', role: 'VP of Product', bio: 'Product leader who scaled EdTech products from 0 to 10M+ users across global markets.', avatar: 'https://i.pravatar.cc/120?img=43' },
  { name: 'Rajesh Kumar', role: 'Engineering Lead', bio: 'Distributed systems expert. Built platforms serving 50M+ users at top internet companies.', avatar: 'https://i.pravatar.cc/120?img=44' },
  { name: 'Dr. Arjun Mehta', role: 'AI Research Lead', bio: 'Published 30+ papers in ML & NLP. Leading Prerana AI research and development.', avatar: 'https://i.pravatar.cc/120?img=45' },
  { name: 'Ananya Reddy', role: 'Marketing Lead', bio: 'Growth marketer who built brands from 0 to industry leaders in EdTech and SaaS.', avatar: 'https://i.pravatar.cc/120?img=46' },
];

const whyTrust = [
  { icon: Zap, title: 'AI-Powered Learning', desc: 'Personalized learning paths and predictive analytics powered by Prerana AI engine.', stat: '94% accuracy' },
  { icon: Globe, title: 'Unified Ecosystem', desc: 'One platform connecting every stakeholder — students, parents, teachers, institutions, recruiters.', stat: '8+ portals' },
  { icon: TrendingUp, title: 'Career Growth Tools', desc: 'Skill assessments, job matching, internship placement, and career counseling services.', stat: '10K+ opportunities' },
  { icon: Building2, title: 'Institution Management', desc: 'Complete ERP covering admissions, academics, HR, payroll, exams, and compliance.', stat: '500+ institutions' },
  { icon: BarChart3, title: 'Data-Driven Insights', desc: 'Real-time analytics, predictive modeling, and custom reports for informed decision-making.', stat: '1M+ data points' },
  { icon: Shield, title: 'Scalable Infrastructure', desc: 'Enterprise-grade security, 99.97% uptime, and infrastructure built for global scale.', stat: '99.97% uptime' },
];

const techStack = [
  { icon: Cpu, title: 'AI Engine', desc: 'Advanced ML models for prediction, recommendation, and automation.', color: '#7C3AED' },
  { icon: BarChart3, title: 'Analytics', desc: 'Real-time data processing with predictive insights.', color: '#8B5CF6' },
  { icon: Cloud, title: 'Cloud Infrastructure', desc: 'Scalable multi-region deployment on AWS/GCP.', color: '#A855F7' },
  { icon: Shield, title: 'Security Layer', desc: 'Enterprise-grade encryption, auth, and compliance.', color: '#6D28D9' },
  { icon: Zap, title: 'Automation Services', desc: 'Workflow automation with AI-driven decision engine.', color: '#7C3AED' },
  { icon: Layers, title: 'Integrations', desc: 'Seamless API ecosystem with 50+ pre-built connectors.', color: '#8B5CF6' },
];

const awards = [
  { icon: Trophy, title: 'Best EdTech Startup 2025', org: 'India Education Awards', year: '2025', color: '#7C3AED' },
  { icon: Award, title: 'AI Innovation of the Year', org: 'Tech Innovation Summit', year: '2026', color: '#8B5CF6' },
  { icon: Globe, title: 'Global EdTech Top 100', org: 'HolonIQ', year: '2026', color: '#A855F7' },
  { icon: Star, title: 'Highest Customer Satisfaction', org: 'SaaS Review Platform', year: '2026', color: '#6D28D9' },
  { icon: BookOpen, title: 'Research Publication Award', org: 'AI in Education Conference', year: '2026', color: '#7C3AED' },
  { icon: TrendingUp, title: 'Fastest Growing EdTech', org: 'Startup Growth Index', year: '2026', color: '#8B5CF6' },
];

const testimonials = [
  { text: 'Prasynx has completely transformed how we manage our institution. The AI-powered analytics give us insights we never had before.', name: 'Dr. Suresh Kumar', role: 'Director, VIT University', type: 'Institution Leader', avatar: 'https://i.pravatar.cc/80?img=21' },
  { text: 'As a parent, I love being able to track my child\'s progress in real-time. The communication with teachers has never been easier.', name: 'Anita Desai', role: 'Parent of 2 students', type: 'Parent', avatar: 'https://i.pravatar.cc/80?img=22' },
  { text: 'The student portal makes it so easy to access courses, submit assignments, and track my grades. Prerana AI recommendations are spot-on.', name: 'Rohan Mehta', role: 'Computer Science Student', type: 'Student', avatar: 'https://i.pravatar.cc/80?img=23' },
  { text: 'I found my dream internship through Prasynx\'s recruitment platform. The AI matching was incredibly accurate.', name: 'Priya Sharma', role: 'Recent Graduate', type: 'Student', avatar: 'https://i.pravatar.cc/80?img=24' },
  { text: 'The teacher workspace has saved me hours every week. Automated attendance and grade management let me focus on what matters — teaching.', name: 'Rajiv Verma', role: 'Physics Teacher', type: 'Teacher', avatar: 'https://i.pravatar.cc/80?img=25' },
  { text: 'We found exceptional talent through Prasynx\'s recruitment platform. The quality of candidates and the matching algorithm is impressive.', name: 'Meera Reddy', role: 'HR Director, Tech Corp', type: 'Recruiter', avatar: 'https://i.pravatar.cc/80?img=26' },
];

function AnimatedCount({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const duration = 2000;
        const steps = 60;
        const increment = value / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= value) { setCount(value); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, duration / steps);
        observer.disconnect();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);
  return <div ref={ref} className="text-4xl font-black text-white sm:text-5xl">{count}{suffix}</div>;
}

export default function About() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [testFilter, setTestFilter] = useState('All');

  const testTypes = ['All', ...Array.from(new Set(testimonials.map(t => t.type)))];
  const filteredTests = testFilter === 'All' ? testimonials : testimonials.filter(t => t.type === testFilter);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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
                  <Sparkles className="h-4 w-4 text-[#7C3AED]" />
                  About Prasynx
                </div>
                <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl xl:text-7xl">
                  Empowering The Future Of Education Through{' '}
                  <span className="bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">
                    AI & Innovation
                  </span>
                </h1>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  Prasynx is building India&apos;s most comprehensive AI-powered education ecosystem, connecting students, parents, teachers, institutions, recruiters, and organizations through intelligent technology.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a href="#mission"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#7C3AED]/25 transition hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]">
                    Our Mission <ArrowRight size={16} />
                  </a>
                  <Link href="/book-demo"
                    className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white/80 px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#7C3AED] hover:text-[#7C3AED] hover:shadow-md">
                    Get Started
                  </Link>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { value: '50K+', label: 'Students', icon: Users },
                    { value: '500+', label: 'Institutions', icon: Building2 },
                    { value: '95%', label: 'Satisfaction', icon: Star },
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
                        <span className="tracking-wider">PRASYNX ECOSYSTEM</span>
                      </div>
                      <div className="relative grid grid-cols-3 gap-2">
                        {[
                          { emoji: '🎓', label: 'Students', cx: 'col-start-1', color: '#7C3AED' },
                          { emoji: '👩‍🏫', label: 'Teachers', cx: 'col-start-2', color: '#8B5CF6' },
                          { emoji: '👨‍👩‍👧', label: 'Parents', cx: 'col-start-3', color: '#A855F7' },
                          { emoji: '🏛️', label: 'Institutions', cx: 'col-start-1 mt-2', color: '#6D28D9' },
                          { emoji: '🤖', label: 'Prerana AI', cx: 'col-start-2 mt-2', color: '#7C3AED' },
                          { emoji: '💼', label: 'Recruiters', cx: 'col-start-3 mt-2', color: '#8B5CF6' },
                        ].map((item) => (
                          <div key={item.label}
                            className={`rounded-xl p-2 text-center border ${item.cx}`}
                            style={{ background: `${item.color}10`, borderColor: `${item.color}20` }}>
                            <span className="text-xl">{item.emoji}</span>
                            <p className="text-[9px] font-bold text-slate-600 mt-0.5">{item.label}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-center gap-1 text-[10px] font-bold text-[#7C3AED]">
                        <InfinityIcon size={14} /> Connected Platform
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#6D28D9]" style={{ width: '94%' }} />
                      </div>
                    </div>
                  </div>
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -right-20 top-6 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl px-4 py-3 shadow-xl shadow-black/5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#7C3AED]/10 text-[#7C3AED]"><GraduationCap size={16} /></span>
                    <div><p className="text-[10px] font-bold text-slate-400">Students</p><p className="text-sm font-black text-slate-950">50,000+</p></div>
                  </motion.div>
                  <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -left-20 bottom-20 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl px-4 py-3 shadow-xl shadow-black/5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6]"><Building2 size={16} /></span>
                    <div><p className="text-[10px] font-bold text-slate-400">Institutions</p><p className="text-sm font-black text-slate-950">500+</p></div>
                  </motion.div>
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -right-16 bottom-12 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl px-4 py-3 shadow-xl shadow-black/5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#A855F7]/10 text-[#A855F7]"><Star size={16} /></span>
                    <div><p className="text-[10px] font-bold text-slate-400">Satisfaction</p><p className="text-sm font-black text-slate-950">95%</p></div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 2 — OUR STORY ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12" id="mission">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-10 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <Rocket size={12} /> Our Journey
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Our Story</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
                From a bold vision to a platform serving thousands of institutions — here is our journey.
              </p>
            </motion.div>
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hidden sm:block" />
              <div className="space-y-6">
                {timeline.map((milestone, i) => (
                  <motion.div key={milestone.year} {...stagger} transition={{ delay: i * 0.1 }}
                    className="relative sm:pl-20">
                    <div className="absolute left-0 top-0 hidden sm:grid h-16 w-16 place-items-center rounded-2xl text-white shadow-lg shadow-[#7C3AED]/20"
                      style={{ background: `linear-gradient(135deg, ${milestone.color}, ${milestone.color}dd)` }}>
                      <span className="text-lg font-black">{milestone.year}</span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-5 rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden transition hover:shadow-lg hover:border-[#E8E0FF]">
                      <div className="sm:col-span-2 relative h-40 sm:h-full min-h-[160px] overflow-hidden">
                        <img src={milestone.image} alt={milestone.title} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                      </div>
                      <div className="sm:col-span-3 p-5 sm:p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="rounded-full px-2.5 py-0.5 text-[9px] font-bold text-white" style={{ background: milestone.color }}>{milestone.year}</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-950">{milestone.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-500">{milestone.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {futureMilestones.map((m) => {
                  const Icon = m.icon;
                  return (
                    <motion.div key={m.year} {...stagger}
                      className="relative sm:pl-20">
                      <div className="absolute left-0 top-0 hidden sm:grid h-16 w-16 place-items-center rounded-2xl border-2 border-dashed border-[#7C3AED]/40 text-[#7C3AED] bg-white">
                        <Icon size={22} />
                      </div>
                      <div className="rounded-2xl border-2 border-dashed border-[#E8E0FF] bg-gradient-to-br from-[#7C3AED]/5 to-[#8B5CF6]/5 p-5 sm:p-6">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="rounded-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-2.5 py-0.5 text-[9px] font-bold text-white">{m.year}</span>
                          <span className="text-[10px] font-bold text-[#7C3AED]">Coming Soon</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-950">{m.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-500">{m.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 3 — MISSION & VISION ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 sm:grid-cols-2">
              <motion.div {...fadeUp}
                className="relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-8 sm:p-10 shadow-lg transition hover:shadow-xl hover:-translate-y-1">
                <div className="absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-[#7C3AED]/5" />
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] text-white shadow-lg mb-5">
                  <Target size={24} />
                </span>
                <h2 className="text-2xl font-black text-slate-950">Our Mission</h2>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  To make quality education, guidance, opportunities, and career growth accessible to every learner through technology and AI.
                </p>
                <div className="mt-6 flex items-center gap-3 text-xs font-bold text-slate-400">
                  <CheckCircle size={14} className="text-green-500" /> Impacting 50,000+ learners
                </div>
              </motion.div>
              <motion.div {...fadeUp} transition={{ delay: 0.15 }}
                className="relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-8 sm:p-10 shadow-lg transition hover:shadow-xl hover:-translate-y-1">
                <div className="absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-[#8B5CF6]/5" />
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] text-white shadow-lg mb-5">
                  <Compass size={24} />
                </span>
                <h2 className="text-2xl font-black text-slate-950">Our Vision</h2>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  To become the world&apos;s most trusted AI-powered education ecosystem, connecting every learner with the resources, guidance, and opportunities they need to succeed.
                </p>
                <div className="mt-6 flex items-center gap-3 text-xs font-bold text-slate-400">
                  <Globe size={14} className="text-[#7C3AED]" /> Serving institutions across 15+ countries
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 4 — WHAT WE BUILD ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-10 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <Layers size={12} /> Our Platform
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">One Platform. Unlimited Possibilities.</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
                A unified education operating system connecting every stakeholder in the learning ecosystem.
              </p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {platforms.map((p) => {
                const Icon = p.icon;
                return (
                  <motion.div key={p.title} {...stagger}
                    className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 transition-all hover:-translate-y-1.5 hover:shadow-xl"
                    style={{ hover: { borderColor: `${p.color}30` } } as any}>
                    <div className="absolute inset-x-0 top-0 h-1 opacity-0 transition group-hover:opacity-100" style={{ background: `linear-gradient(90deg, ${p.color}, ${p.color}88)` }} />
                    <div className="flex items-center justify-between mb-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl transition group-hover:scale-105"
                        style={{ background: `${p.color}12`, color: p.color }}>
                        <Icon size={18} />
                      </span>
                      <span className="text-xl opacity-50">{p.preview}</span>
                    </div>
                    <h3 className="text-sm font-black text-slate-950">{p.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{p.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== SECTION 5 — IMPACT STATISTICS ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-[#1a1040] p-8 sm:p-12 shadow-2xl">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#7C3AED]/15 blur-3xl" />
                <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[#8B5CF6]/10 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] bg-size-[24px_24px]" />
              </div>
              <div className="relative">
                <div className="mb-8 text-center">
                  <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold text-white/80 backdrop-blur">
                    <BarChart3 size={12} /> Transforming Education At Scale
                  </span>
                  <h2 className="text-3xl font-black text-white sm:text-4xl">The Impact We&apos;re Creating</h2>
                </div>
                <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
                  {[
                    { value: 50000, suffix: '+', label: 'Students', icon: Users },
                    { value: 500, suffix: '+', label: 'Institutions', icon: Building2 },
                    { value: 1, suffix: 'M+', label: 'Learning Sessions', icon: BarChart3 },
                    { value: 10000, suffix: '+', label: 'Opportunities Delivered', icon: Briefcase },
                    { value: 95, suffix: '%', label: 'Success Rate', icon: Star },
                  ].map((metric) => {
                    const Icon = metric.icon;
                    return (
                      <motion.div key={metric.label} {...stagger}
                        className="text-center rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:bg-white/10 hover:-translate-y-1">
                        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#7C3AED]/30 to-[#A855F7]/30 text-white">
                          <Icon size={22} />
                        </span>
                        <AnimatedCount value={metric.value} suffix={metric.suffix} label={metric.label} />
                        <div className="text-xs font-bold text-white/60">{metric.label}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 6 — VALUES ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-10 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <Heart size={12} /> Our Values
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Values That Drive Us</h2>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((val) => {
                const Icon = val.icon;
                return (
                  <motion.div key={val.title} {...stagger}
                    className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 transition-all hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#7C3AED]/5"
                    style={{ hover: { borderColor: `${val.color}30` } } as any}>
                    <div className="absolute inset-x-0 top-0 h-1 opacity-0 transition group-hover:opacity-100" style={{ background: `linear-gradient(90deg, ${val.color}, ${val.color}88)` }} />
                    <span className="grid h-11 w-11 place-items-center rounded-xl transition group-hover:scale-105" style={{ background: `${val.color}12`, color: val.color }}>
                      <Icon size={20} />
                    </span>
                    <h3 className="mt-3 text-base font-black text-slate-950">{val.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{val.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== SECTION 7 — MEET THE TEAM ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-10 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <Users size={12} /> Leadership
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">The People Behind Prasynx</h2>
            </motion.div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <motion.div key={member.name} {...stagger}
                  className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center transition hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#7C3AED]/5">
                  <img src={member.avatar} alt={member.name} className="mx-auto h-20 w-20 rounded-full border-2 border-[#E8E0FF] object-cover transition group-hover:border-[#7C3AED]" />
                  <h3 className="mt-4 text-base font-black text-slate-950">{member.name}</h3>
                  <p className="text-sm font-bold text-[#7C3AED]">{member.role}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SECTION 8 — WHY TRUST ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-10 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <Shield size={12} /> Why Prasynx
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Why Thousands Trust Prasynx</h2>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {whyTrust.map((item) => {
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

        {/* ===== SECTION 9 — TECHNOLOGY & INNOVATION ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-10 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <Cpu size={12} /> Built On Innovation
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Technology & Innovation</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
                Enterprise-grade infrastructure powered by cutting-edge AI and cloud technology.
              </p>
            </motion.div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/5 via-[#8B5CF6]/5 to-[#A855F7]/5 rounded-3xl" />
              <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-6 sm:p-8">
                {techStack.map((tech) => {
                  const Icon = tech.icon;
                  return (
                    <motion.div key={tech.title} {...stagger}
                      className="group rounded-2xl border border-[#E2E8F0] bg-white/80 backdrop-blur-sm p-5 transition hover:-translate-y-1.5 hover:shadow-xl hover:bg-white"
                      style={{ hover: { borderColor: `${tech.color}30` } } as any}>
                      <span className="grid h-11 w-11 place-items-center rounded-xl transition group-hover:scale-105" style={{ background: `${tech.color}12`, color: tech.color }}>
                        <Icon size={20} />
                      </span>
                      <h3 className="mt-3 text-sm font-black text-slate-950">{tech.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{tech.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 10 — AWARDS & RECOGNITION ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-10 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <Trophy size={12} /> Recognition
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Awards & Recognition</h2>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {awards.map((a) => {
                const Icon = a.icon;
                return (
                  <motion.div key={a.title} {...stagger}
                    className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 transition hover:-translate-y-1.5 hover:shadow-xl"
                    style={{ hover: { borderColor: `${a.color}30` } } as any}>
                    <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${a.color}12`, color: a.color }}>
                      <Icon size={18} />
                    </span>
                    <h3 className="mt-3 text-sm font-bold text-slate-950">{a.title}</h3>
                    <p className="text-xs text-slate-500">{a.org}</p>
                    <p className="mt-1 text-[10px] font-bold text-[#7C3AED]">{a.year}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== SECTION 11 — TESTIMONIALS ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-8 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <MessageCircle size={12} /> What People Say
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">What People Say About Prasynx</h2>
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
                  className="relative rounded-2xl border border-[#E2E8F0] bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#7C3AED]/5">
                  <Quote size={18} className="text-[#E8E0FF] mb-2" />
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

        {/* ===== SECTION 12 — CAREERS CTA ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-3xl border border-[#E8E0FF] bg-gradient-to-br from-[#7C3AED]/5 via-[#8B5CF6]/5 to-[#A855F7]/5 p-8 sm:p-12 shadow-lg">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#7C3AED]/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#8B5CF6]/10 blur-3xl" />
              </div>
              <div className="relative flex flex-col items-center text-center">
                <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-white/80 px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                  <Rocket size={12} /> Join Our Mission
                </span>
                <h2 className="text-3xl font-black text-slate-950 sm:text-4xl max-w-2xl">
                  Help us shape the future of education and create opportunities for millions.
                </h2>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link href="/careers"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#7C3AED]/25 transition hover:shadow-xl hover:-translate-y-0.5">
                    View Careers <ArrowRight size={16} />
                  </Link>
                  <Link href="/contact"
                    className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-[#7C3AED] hover:text-[#7C3AED]">
                    Join The Team
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 13 — FINAL CTA ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
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
                    <Sparkles size={12} /> Building The Future Of Learning, Together
                  </div>
                  <h2 className="text-3xl font-black text-white leading-tight sm:text-4xl lg:text-5xl">
                    Building The Future Of Learning, Together
                  </h2>
                  <p className="mt-4 max-w-lg text-base leading-relaxed text-white/80">
                    Whether you&apos;re a student, educator, institution, recruiter, or partner, Prasynx is here to help you grow.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link href="/book-demo"
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-[#7C3AED] shadow-lg transition hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]">
                      Get Started <ArrowRight size={16} />
                    </Link>
                    <Link href="/book-demo"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20">
                      Book Demo
                    </Link>
                  </div>
                </div>
                <div className="hidden lg:col-span-2 lg:block">
                  <div className="relative">
                    <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-6">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { emoji: '🎓', label: 'Students' },
                          { emoji: '👩‍🏫', label: 'Educators' },
                          { emoji: '🏛️', label: 'Institutions' },
                          { emoji: '💼', label: 'Recruiters' },
                        ].map((item) => (
                          <div key={item.label} className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-center backdrop-blur-sm">
                            <span className="text-2xl">{item.emoji}</span>
                            <p className="text-[10px] font-bold text-white mt-1">{item.label}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-xs font-bold text-white/70">
                          <InfinityIcon size={14} /> One Platform, Infinite Possibilities
                        </div>
                      </div>
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
