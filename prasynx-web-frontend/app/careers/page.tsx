"use client";
import {
  Briefcase, MapPin, Clock, DollarSign, GraduationCap, ArrowRight,
  Search, Sparkles, Heart, Zap, Star, Globe, Target, Lightbulb,
  Users, Award, BookOpen, Laptop, HeartHandshake, Gift, Wifi,
  Quote, Building2, Rocket, ChevronDown, Camera, Layers,
  Sun, TreePine, BookMarked, TrendingUp, Shield, Code2, Palette,
  BarChart3, Megaphone, Bot, FileText, HelpCircle, MessageCircle,
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

const whyJoin = [
  { icon: Target, title: 'Meaningful Impact', desc: 'Build products that directly improve education for millions of students and institutions worldwide. Your code changes lives.', color: '#7C3AED' },
  { icon: Heart, title: 'Work-Life Balance', desc: 'We genuinely care about your well-being. Flexible hours, unlimited PTO, and respect for your time outside work.', color: '#8B5CF6' },
  { icon: Globe, title: 'Remote First', desc: 'Work from anywhere in the world. Our remote-first culture ensures you have the freedom to do your best work.', color: '#A855F7' },
  { icon: TrendingUp, title: 'Fast Career Growth', desc: 'Clear promotion paths, quarterly reviews, and a culture that rewards initiative and impact over tenure.', color: '#6D28D9' },
  { icon: BookOpen, title: 'Learning Budget', desc: 'Annual ₹1L+ learning budget for courses, conferences, books, and certifications. Your growth is our priority.', color: '#7C3AED' },
  { icon: Zap, title: 'Innovation Culture', desc: 'Ship early, ship often. Hackathons, innovation sprints, and dedicated time for passion projects and R&D.', color: '#9333EA' },
];

const values = [
  { icon: Rocket, title: 'Innovation First', desc: 'We challenge the status quo. Every team member is empowered to question assumptions and propose better solutions. Innovation is not a department — it is a mindset.', color: '#7C3AED', gradient: 'from-[#7C3AED] to-[#8B5CF6]' },
  { icon: HeartHandshake, title: 'Customer Obsession', desc: 'Every decision starts with the customer. We deeply understand the needs of students, parents, teachers, and institutions, and build solutions that truly matter.', color: '#8B5CF6', gradient: 'from-[#8B5CF6] to-[#A855F7]' },
  { icon: BookMarked, title: 'Continuous Learning', desc: 'The moment you stop learning, you stop growing. We invest heavily in learning, experimentation, and knowledge sharing across the entire team.', color: '#A855F7', gradient: 'from-[#A855F7] to-[#6D28D9]' },
  { icon: Shield, title: 'Ownership Mindset', desc: 'We hire owners, not employees. Take ownership of your projects, make decisions, own the outcomes, and celebrate the wins as a team.', color: '#6D28D9', gradient: 'from-[#6D28D9] to-[#7C3AED]' },
];

const benefits = [
  { icon: Briefcase, title: 'Competitive Salary', desc: 'Top-tier compensation packages with equity options.' },
  { icon: Sun, title: 'Flexible Hours', desc: 'Design your work schedule around your peak productivity.' },
  { icon: Globe, title: 'Remote Work', desc: 'Fully remote with co-working space budget if needed.' },
  { icon: BookOpen, title: 'Learning Budget', desc: '₹1L+ annual budget for courses, books & conferences.' },
  { icon: HeartHandshake, title: 'Health Benefits', desc: 'Comprehensive health insurance for you and your family.' },
  { icon: TreePine, title: 'Paid Time Off', desc: 'Unlimited PTO policy — take the time you need.' },
  { icon: Users, title: 'Team Retreats', desc: 'Bi-annual team retreats at amazing locations.' },
  { icon: Award, title: 'Performance Bonuses', desc: 'Quarterly bonuses tied to company and individual impact.' },
  { icon: Wifi, title: 'Internet Allowance', desc: 'High-speed internet reimbursement for home office.' },
  { icon: Award, title: 'Certification Support', desc: 'Full sponsorship for professional certifications.' },
  { icon: Laptop, title: 'Equipment Budget', desc: 'Latest MacBook Pro + ₹50K home office setup.' },
  { icon: Star, title: 'Career Coaching', desc: '1:1 coaching with industry leaders and mentors.' },
];

const jobs = [
  { role: 'Senior Software Engineer', dept: 'Engineering', loc: 'Remote', type: 'Full-time', salary: '₹25L – ₹40L', exp: '4-7 yrs', color: '#7C3AED', desc: 'Build scalable microservices powering our Education OS platform.' },
  { role: 'AI/ML Engineer', dept: 'AI', loc: 'Remote', type: 'Full-time', salary: '₹30L – ₹50L', exp: '3-6 yrs', color: '#8B5CF6', desc: 'Train and deploy models for Prerana AI — our intelligent education assistant.' },
  { role: 'Frontend Engineer', dept: 'Engineering', loc: 'Remote', type: 'Full-time', salary: '₹20L – ₹35L', exp: '3-5 yrs', color: '#A855F7', desc: 'Craft beautiful, performant interfaces with React, Next.js & Tailwind.' },
  { role: 'Backend Engineer', dept: 'Engineering', loc: 'Remote', type: 'Full-time', salary: '₹22L – ₹38L', exp: '3-6 yrs', color: '#6D28D9', desc: 'Design and build robust APIs and data pipelines at scale.' },
  { role: 'Product Designer', dept: 'Design', loc: 'Remote', type: 'Full-time', salary: '₹18L – ₹30L', exp: '3-5 yrs', color: '#7C3AED', desc: 'Design intuitive, delightful experiences for students and educators.' },
  { role: 'Product Manager', dept: 'Product', loc: 'Remote', type: 'Full-time', salary: '₹25L – ₹40L', exp: '4-7 yrs', color: '#8B5CF6', desc: 'Define product strategy and drive execution across teams.' },
  { role: 'Marketing Lead', dept: 'Marketing', loc: 'Remote', type: 'Full-time', salary: '₹18L – ₹28L', exp: '3-6 yrs', color: '#A855F7', desc: 'Own brand strategy, demand generation, and content marketing.' },
  { role: 'Business Development Executive', dept: 'Sales', loc: 'Multiple', type: 'Full-time', salary: '₹12L – ₹20L', exp: '2-4 yrs', color: '#6D28D9', desc: 'Drive growth and build partnerships with leading institutions.' },
  { role: 'HR Executive', dept: 'People', loc: 'Remote', type: 'Full-time', salary: '₹10L – ₹16L', exp: '2-4 yrs', color: '#7C3AED', desc: 'Shape company culture and drive talent acquisition initiatives.' },
  { role: 'Data Scientist', dept: 'AI', loc: 'Remote', type: 'Full-time', salary: '₹24L – ₹42L', exp: '3-6 yrs', color: '#8B5CF6', desc: 'Extract insights from education data to power intelligent features.' },
];

const internships = [
  { role: 'Software Development Intern', dept: 'Engineering', duration: '3-6 months', stipend: '₹30K-₹50K/mo', desc: 'Build production features with our engineering team.', icon: Code2 },
  { role: 'AI Research Intern', dept: 'AI', duration: '3-6 months', stipend: '₹35K-₹55K/mo', desc: 'Work on cutting-edge ML models for education.', icon: Bot },
  { role: 'Marketing Intern', dept: 'Marketing', duration: '3 months', stipend: '₹15K-₹25K/mo', desc: 'Learn growth marketing and brand strategy.', icon: Megaphone },
  { role: 'UI/UX Design Intern', dept: 'Design', duration: '3-6 months', stipend: '₹20K-₹35K/mo', desc: 'Design real products used by millions.', icon: Palette },
  { role: 'HR Intern', dept: 'People', duration: '3 months', stipend: '₹12K-₹20K/mo', desc: 'Learn talent acquisition and people operations.', icon: Users },
  { role: 'Business Development Intern', dept: 'Sales', duration: '3 months', stipend: '₹15K-₹25K/mo', desc: 'Learn enterprise sales and partnerships.', icon: Briefcase },
];

const teamTestimonials = [
  { name: 'Ananya Sharma', role: 'Senior Frontend Engineer', dept: 'Engineering', text: 'The ownership culture here is incredible. As an engineer, I have real input into product decisions, and my code impacts millions of students. There is nothing more fulfilling.', rating: 5, avatar: 'https://i.pravatar.cc/80?img=31' },
  { name: 'Rahul Verma', role: 'AI Research Scientist', dept: 'AI', text: 'Prasynx gives me the freedom to explore cutting-edge AI research while building products that actually ship. The compute budget and research time are unmatched.', rating: 5, avatar: 'https://i.pravatar.cc/80?img=32' },
  { name: 'Priya Mehta', role: 'Product Designer', dept: 'Design', text: 'The design team operates at the highest quality bar I have experienced. We have the tools, the talent, and the trust to create award-worthy work every day.', rating: 5, avatar: 'https://i.pravatar.cc/80?img=33' },
  { name: 'Arjun Patel', role: 'Product Manager', dept: 'Product', text: 'Joining Prasynx was the best career decision I made. The mentorship, the autonomy, and the mission-driven culture make every day meaningful.', rating: 5, avatar: 'https://i.pravatar.cc/80?img=34' },
];

const teamSpotlight = [
  { name: 'Vikram Patel', role: 'CEO & Founder', dept: 'Leadership', bio: 'Former EdTech founder. On a mission to transform education through AI.', avatar: 'https://i.pravatar.cc/120?img=41' },
  { name: 'Dr. Neha Gupta', role: 'CTO', dept: 'Technology', bio: 'PhD in AI, ex-Google. Building the world\'s most advanced education AI.', avatar: 'https://i.pravatar.cc/120?img=42' },
  { name: 'Sarah Mitchell', role: 'VP of Product', dept: 'Product', bio: 'Product leader who scaled products to 10M+ users across EdTech.', avatar: 'https://i.pravatar.cc/120?img=43' },
  { name: 'Rajesh Kumar', role: 'Engineering Lead', dept: 'Engineering', bio: 'Distributed systems expert. Built platforms serving 50M+ users.', avatar: 'https://i.pravatar.cc/120?img=44' },
  { name: 'Dr. Arjun Mehta', role: 'AI Research Lead', dept: 'AI', bio: 'Published 30+ papers in ML & NLP. Leading Prerana AI research.', avatar: 'https://i.pravatar.cc/120?img=45' },
  { name: 'Ananya Reddy', role: 'Marketing Lead', dept: 'Marketing', bio: 'Growth marketer who built brands from 0 to industry leaders.', avatar: 'https://i.pravatar.cc/120?img=46' },
];

const faqs = [
  { q: 'Do you offer remote roles?', a: 'Yes! Prasynx is a remote-first company. Most roles are fully remote with optional co-working space memberships. We hire talent from across India and select international locations.' },
  { q: 'Do you hire freshers?', a: 'Absolutely. We have dedicated early-career programs and hire freshers across engineering, design, and business functions. We look for potential, curiosity, and alignment with our values over years of experience.' },
  { q: 'Do you provide internships?', a: 'Yes, we run a structured internship program year-round. Interns work on real projects, receive mentorship, and get opportunities for full-time conversion based on performance.' },
  { q: 'What is the interview process like?', a: 'Our process is designed to be respectful of your time: 1) Application review (2-3 days), 2) Initial screening call (30 min), 3) Technical assessment or case study, 4) Deep-dive interview with the team, 5) Offer. We aim for under 2 weeks total.' },
  { q: 'Can students apply for internships?', a: 'Yes, we welcome applications from current students in their pre-final or final year. Internships are available in engineering, design, marketing, and business development.' },
  { q: 'Do you sponsor professional certifications?', a: 'We fully support and sponsor relevant professional certifications. Our learning budget covers certification fees, prep courses, and exam costs for approved programs.' },
];

const hiringSteps = [
  { step: '1', title: 'Application Review', desc: 'Our talent team reviews your application within 2-3 business days. We look for skills, experience, and cultural alignment.', icon: FileText },
  { step: '2', title: 'Initial Screening', desc: 'A 30-minute chat with our recruiter to understand your background, aspirations, and answer your questions about Prasynx.', icon: MessageCircle },
  { step: '3', title: 'Technical Assessment', desc: 'A practical, real-world problem relevant to the role. No whiteboard coding — we respect your time and real skills.', icon: Code2 },
  { step: '4', title: 'Deep-Dive Interview', desc: 'Meet the team you will work with. Discuss your approach, collaborate on problems, and experience our culture first-hand.', icon: Users },
  { step: '5', title: 'Offer & Onboarding', desc: 'Receive a competitive offer, complete onboarding, get your equipment shipped, and start making an impact from day one.', icon: Gift },
];

function Counter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
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

export default function Careers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');

  const departments = ['All', ...Array.from(new Set(jobs.map(j => j.dept)))];
  const filteredJobs = deptFilter === 'All'
    ? jobs.filter(j => j.role.toLowerCase().includes(searchQuery.toLowerCase()))
    : jobs.filter(j => j.dept === deptFilter && j.role.toLowerCase().includes(searchQuery.toLowerCase()));

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
                  We&apos;re Hiring
                </div>
                <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl xl:text-7xl">
                  Build The Future Of{' '}
                  <span className="bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">
                    AI-Powered Education
                  </span>
                </h1>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  Join a team that&apos;s transforming how millions of students, institutions, and educators learn, grow, and succeed through technology.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a href="#positions"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#7C3AED]/25 transition hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]">
                    View Open Positions <ArrowRight size={16} />
                  </a>
                  <a href="#culture"
                    className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white/80 px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#7C3AED] hover:text-[#7C3AED] hover:shadow-md">
                    <Sparkles size={16} /> Life At Prasynx
                  </a>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { value: '50+', label: 'Team Members' },
                    { value: '10+', label: 'Departments' },
                    { value: 'Remote', label: 'First Culture' },
                    { value: 'Fast', label: 'Growing Startup' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl border border-[#E2E8F0] bg-white/70 backdrop-blur-sm px-4 py-3 text-center shadow-sm">
                      <div className="text-lg font-black text-[#7C3AED]">{s.value}</div>
                      <div className="text-[10px] font-bold text-slate-500">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative hidden lg:col-span-2 lg:block">
                <div className="relative mx-auto h-[440px] w-[380px]">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#7C3AED]/20 via-[#8B5CF6]/10 to-[#A855F7]/20" />
                  <div className="absolute inset-2 rounded-2xl border border-[#E8E0FF] bg-white/60 backdrop-blur-sm overflow-hidden shadow-2xl">
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#E8E0FF]">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#7C3AED] text-white"><Users size={16} /></span>
                        <div>
                          <span className="text-sm font-black text-slate-950">Our Team</span>
                          <p className="text-[10px] font-bold text-slate-400">50+ members across 10 departments</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[
                          { role: 'Engineering', emoji: '💻', count: '15 members', color: '#7C3AED' },
                          { role: 'AI & Research', emoji: '🤖', count: '8 members', color: '#8B5CF6' },
                          { role: 'Design', emoji: '🎨', count: '6 members', color: '#A855F7' },
                          { role: 'Product', emoji: '📊', count: '5 members', color: '#6D28D9' },
                        ].map((dept) => (
                          <div key={dept.role} className="flex items-center justify-between rounded-xl bg-[#F8FAFF] p-2.5 border border-[#E8E0FF]">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{dept.emoji}</span>
                              <span className="text-xs font-bold text-slate-950">{dept.role}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">{dept.count}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex -space-x-2">
                        {[51, 52, 53, 54, 55].map((n) => (
                          <img key={n} src={`https://i.pravatar.cc/32?img=${n}`} alt="" className="h-8 w-8 rounded-full border-2 border-white" />
                        ))}
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#7C3AED] text-[9px] font-bold text-white">+50</span>
                      </div>
                    </div>
                  </div>
                  <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -right-20 top-6 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl px-4 py-3 shadow-xl shadow-black/5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#7C3AED]/10 text-[#7C3AED]"><Briefcase size={16} /></span>
                    <div><p className="text-[10px] font-bold text-slate-400">Open Roles</p><p className="text-sm font-black text-slate-950">10 Positions</p></div>
                  </motion.div>
                  <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -left-20 bottom-20 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl px-4 py-3 shadow-xl shadow-black/5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6]"><Globe size={16} /></span>
                    <div><p className="text-[10px] font-bold text-slate-400">Remote</p><p className="text-sm font-black text-slate-950">First Culture</p></div>
                  </motion.div>
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -right-16 bottom-12 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl px-4 py-3 shadow-xl shadow-black/5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#A855F7]/10 text-[#A855F7]"><Star size={16} /></span>
                    <div><p className="text-[10px] font-bold text-slate-400">Internships</p><p className="text-sm font-black text-slate-950">6 Programs</p></div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 2 — WHY JOIN ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-10 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <Star size={12} /> Why Prasynx
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Why Top Talent Chooses Prasynx</h2>
            </motion.div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {whyJoin.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div key={item.title} {...stagger}
                    className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#7C3AED]/5"
                    style={{ hover: { borderColor: `${item.color}30` } } as any}>
                    <div className="absolute inset-x-0 top-0 h-1 opacity-0 transition group-hover:opacity-100" style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}88)` }} />
                    <span className="grid h-12 w-12 place-items-center rounded-xl transition group-hover:scale-105" style={{ background: `${item.color}12`, color: item.color }}>
                      <Icon size={22} />
                    </span>
                    <h3 className="mt-4 text-base font-black text-slate-950">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== SECTION 3 — LIFE AT PRASYNX ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12" id="culture">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-10 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <Camera size={12} /> Life At Prasynx
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">A Culture Built For Growth</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
                From hackathons to team retreats, every day at Prasynx is an opportunity to learn, build, and connect with amazing people.
              </p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: 'Team Hackathons', desc: '48-hour innovation sprints to build what excites you.', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop', h: 'h-48' },
                { title: 'Workshops & Learning', desc: 'Weekly knowledge-sharing sessions and workshops.', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300&fit=crop', h: 'h-48' },
                { title: 'Team Retreats', desc: 'Bi-annual getaways to recharge and bond.', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop', h: 'h-48' },
                { title: 'Office Life', desc: 'Collaborative spaces designed for creativity.', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop', h: 'h-48' },
                { title: 'Remote Collaboration', desc: 'async-first culture with global team syncs.', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop', h: 'h-48' },
                { title: 'Celebrations', desc: 'Birthdays, milestones, and wins — we celebrate together.', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop', h: 'h-48' },
              ].map((item, i) => (
                <motion.div key={item.title} {...stagger} transition={{ delay: i * 0.05 }}
                  className={`group relative overflow-hidden rounded-2xl ${i < 2 ? 'sm:col-span-1' : ''} ${i === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}>
                  <div className={`relative ${i === 0 ? 'h-80 sm:h-96' : 'h-48'} overflow-hidden rounded-2xl`}>
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-base font-black text-white">{item.title}</h3>
                      <p className="mt-1 text-xs text-white/80">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SECTION 4 — COMPANY VALUES ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-10 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <Shield size={12} /> Our Core Values
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">What We Stand For</h2>
            </motion.div>
            <div className="grid gap-5 sm:grid-cols-2">
              {values.map((val) => {
                const Icon = val.icon;
                return (
                  <motion.div key={val.title} {...stagger}
                    className="group relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#7C3AED]/10">
                    <div className="absolute inset-0 bg-gradient-to-br opacity-0 transition group-hover:opacity-5" style={{ background: `linear-gradient(135deg, ${val.color}, transparent)` }} />
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${val.color}, ${val.color}dd)` }}>
                      <Icon size={24} />
                    </span>
                    <h3 className="mt-5 text-xl font-black text-slate-950">{val.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-500">{val.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== SECTION 5 — BENEFITS & PERKS ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-10 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <Gift size={12} /> Benefits & Perks
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Benefits That Help You Thrive</h2>
            </motion.div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <motion.div key={benefit.title} {...stagger}
                    className="flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg hover:border-[#E8E0FF]">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F3F0FF] text-[#7C3AED] transition group-hover:bg-[#7C3AED] group-hover:text-white">
                      <Icon size={18} />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-950">{benefit.title}</h3>
                      <p className="mt-0.5 text-xs text-slate-400">{benefit.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== SECTION 6 — OPEN POSITIONS ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12" id="positions">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-8 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <Briefcase size={12} /> Open Positions
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Explore Open Opportunities</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">Join a team building the future of AI-powered education technology.</p>
            </motion.div>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by role, skill, or keyword..."
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white py-3 pl-10 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#F3F0FF]" />
              </div>
              <div className="flex flex-wrap gap-2">
                {departments.map((d) => (
                  <button key={d} onClick={() => setDeptFilter(d)}
                    className={`rounded-full px-4 py-2 text-[10px] font-bold transition ${
                      deptFilter === d
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white shadow-sm'
                        : 'bg-white border border-[#E2E8F0] text-slate-600 hover:border-[#7C3AED] hover:text-[#7C3AED]'
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredJobs.map((job) => (
                <motion.div key={job.role} {...stagger}
                  className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 transition-all hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#7C3AED]/5"
                  style={{ hover: { borderColor: `${job.color}30` } } as any}>
                  <div className="absolute inset-x-0 top-0 h-1" style={{ background: job.color }} />
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-black text-slate-950">{job.role}</h3>
                    <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[9px] font-bold text-white shadow-sm" style={{ background: job.color }}>{job.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[9px] font-bold text-slate-600"><MapPin size={10} />{job.loc}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[9px] font-bold text-slate-600"><Briefcase size={10} />{job.dept}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[9px] font-bold text-slate-600"><DollarSign size={10} />{job.salary}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[9px] font-bold text-slate-600"><Clock size={10} />{job.exp}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500 mb-4">{job.desc}</p>
                  <Link href="/contact"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] py-2.5 text-[10px] font-bold text-slate-700 transition hover:border-[#7C3AED] hover:bg-[#F3F0FF] hover:text-[#7C3AED]">
                    Apply Now <ArrowRight size={12} />
                  </Link>
                </motion.div>
              ))}
            </div>
            {filteredJobs.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#E2E8F0] p-12 text-center">
                <p className="text-sm font-bold text-slate-500">No positions match your search. Try different keywords or check back soon.</p>
              </div>
            )}
          </div>
        </section>

        {/* ===== SECTION 7 — INTERNSHIP PROGRAM ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7C3AED]/5 via-[#8B5CF6]/5 to-[#A855F7]/5 border border-[#E8E0FF] p-8 sm:p-10">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#7C3AED]/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#8B5CF6]/10 blur-3xl" />
              </div>
              <div className="relative">
                <div className="mb-8 text-center">
                  <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-white/80 px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                    <GraduationCap size={12} /> Internship Program
                  </span>
                  <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Launch Your Career With Prasynx</h2>
                  <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
                    Gain real-world experience working on products used by millions. Mentorship, certificates, and fast-track to full-time.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {internships.map((intern) => {
                    const Icon = intern.icon;
                    return (
                      <motion.div key={intern.role} {...stagger}
                        className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg hover:border-[#E8E0FF]">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F3F0FF] text-[#7C3AED] transition group-hover:bg-[#7C3AED] group-hover:text-white">
                          <Icon size={18} />
                        </span>
                        <h3 className="mt-3 text-sm font-bold text-slate-950">{intern.role}</h3>
                        <p className="mt-1 text-xs text-slate-500">{intern.desc}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-[9px] font-bold text-slate-600">{intern.duration}</span>
                          <span className="rounded-full bg-[#F3F0FF] px-2.5 py-0.5 text-[9px] font-bold text-[#7C3AED]">{intern.stipend}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                  {[
                    { icon: HeartHandshake, label: 'Mentorship' },
                    { icon: Award, label: 'Certificates' },
                    { icon: Code2, label: 'Live Projects' },
                    { icon: TrendingUp, label: 'Job Opportunities' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-center gap-2 rounded-xl bg-white/70 backdrop-blur-sm border border-[#E8E0FF] px-4 py-2.5 shadow-sm">
                        <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#F3F0FF] text-[#7C3AED]"><Icon size={12} /></span>
                        <span className="text-[10px] font-bold text-slate-700">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== SECTION 8 — HIRING PROCESS ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-10 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <Layers size={12} /> Hiring Process
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Simple & Transparent Hiring Process</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">We designed our process to be respectful of your time and give you a real taste of how we work.</p>
            </motion.div>
            <div className="relative mx-auto max-w-4xl">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hidden sm:block" />
              <div className="space-y-6">
                {hiringSteps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <motion.div key={step.step} {...stagger} transition={{ delay: i * 0.1 }}
                      className="relative sm:pl-20">
                      <div className="absolute left-0 top-0 hidden sm:grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] text-white shadow-lg shadow-[#7C3AED]/20">
                        <span className="text-xl font-black">{step.step}</span>
                      </div>
                      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6 transition hover:shadow-lg hover:border-[#E8E0FF]">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#F3F0FF] text-[#7C3AED] sm:hidden"><Icon size={15} /></span>
                          <h3 className="text-base font-black text-slate-950">{step.title}</h3>
                        </div>
                        <p className="text-sm text-slate-500">{step.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 9 — EMPLOYEE TESTIMONIALS ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-10 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <Quote size={12} /> Hear From Our Team
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">What Our Team Says</h2>
            </motion.div>
            <div className="grid gap-5 sm:grid-cols-2">
              {teamTestimonials.map((t) => (
                <motion.div key={t.name} {...stagger}
                  className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#7C3AED]/5">
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (<Star key={i} size={14} fill="currentColor" />))}
                  </div>
                  <p className="text-sm italic leading-relaxed text-slate-600">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-3 border-t border-[#F1F5F9] pt-4">
                    <img src={t.avatar} alt={t.name} className="h-11 w-11 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-bold text-slate-950">{t.name}</p>
                      <p className="text-[10px] font-bold text-[#7C3AED]">{t.role} · {t.dept}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SECTION 10 — TEAM SPOTLIGHT ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-10 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <Users size={12} /> Team Spotlight
              </span>
              <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Meet The People Behind Prasynx</h2>
            </motion.div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {teamSpotlight.map((member) => (
                <motion.div key={member.name} {...stagger}
                  className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center transition hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#7C3AED]/5">
                  <img src={member.avatar} alt={member.name} className="mx-auto h-20 w-20 rounded-full border-2 border-[#E8E0FF] object-cover transition group-hover:border-[#7C3AED]" />
                  <h3 className="mt-4 text-base font-black text-slate-950">{member.name}</h3>
                  <p className="text-sm font-bold text-[#7C3AED]">{member.role}</p>
                  <p className="mt-1 text-xs text-slate-400">{member.dept}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SECTION 11 — IMPACT METRICS ===== */}
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
                    <BarChart3 size={12} /> The Impact We&apos;re Creating
                  </span>
                  <h2 className="text-3xl font-black text-white sm:text-4xl">Our Reach & Impact</h2>
                </div>
                <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
                  {[
                    { value: 50000, suffix: '+', label: 'Students', icon: Users },
                    { value: 500, suffix: '+', label: 'Institutions', icon: Building2 },
                    { value: 10, suffix: 'M+', label: 'Learning Sessions', icon: BarChart3 },
                    { value: 95, suffix: '%', label: 'Satisfaction Rate', icon: Star },
                    { value: 24, suffix: '/7', label: 'AI Support', icon: Bot },
                  ].map((metric) => {
                    const Icon = metric.icon;
                    return (
                      <motion.div key={metric.label} {...stagger}
                        className="text-center rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:bg-white/10 hover:-translate-y-1">
                        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#7C3AED]/30 to-[#A855F7]/30 text-white">
                          <Icon size={22} />
                        </span>
                        <Counter value={metric.value} suffix={metric.suffix} label={metric.label} />
                        <div className="text-xs font-bold text-white/60">{metric.label}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 12 — FAQ ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-3xl">
            <motion.div {...fadeUp} className="mb-8 text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <HelpCircle size={12} /> FAQ
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
                    <Rocket size={12} /> Join the mission
                  </div>
                  <h2 className="text-3xl font-black text-white leading-tight sm:text-4xl lg:text-5xl">
                    Ready To Shape The Future Of Education?
                  </h2>
                  <p className="mt-4 max-w-lg text-base leading-relaxed text-white/80">
                    Join our mission and help build the next generation of AI-powered learning experiences that transform education for millions.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <a href="#positions"
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-[#7C3AED] shadow-lg transition hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]">
                      Apply Now <ArrowRight size={16} />
                    </a>
                    <a href="#positions"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20">
                      View Open Positions
                    </a>
                  </div>
                </div>
                <div className="hidden lg:col-span-2 lg:block">
                  <div className="relative">
                    <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 text-white"><Users size={20} /></span>
                        <div>
                          <p className="text-sm font-bold text-white">Our Growing Team</p>
                          <p className="text-xs text-white/60">50+ members and expanding</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { dept: 'Engineering', color: 'bg-[#7C3AED]/40' },
                          { dept: 'AI & Data', color: 'bg-[#8B5CF6]/40' },
                          { dept: 'Product & Design', color: 'bg-[#A855F7]/40' },
                          { dept: 'Business', color: 'bg-[#6D28D9]/40' },
                        ].map((d) => (
                          <div key={d.dept} className={`rounded-xl ${d.color} border border-white/10 px-3 py-2 text-center`}>
                            <p className="text-[10px] font-bold text-white">{d.dept}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex -space-x-2">
                        {[61, 62, 63, 64, 65].map((n) => (
                          <img key={n} src={`https://i.pravatar.cc/28?img=${n}`} alt="" className="h-7 w-7 rounded-full border-2 border-white/50" />
                        ))}
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/50 bg-white/20 text-[8px] font-bold text-white">+50</span>
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
