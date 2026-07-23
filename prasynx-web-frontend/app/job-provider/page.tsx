"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Sparkles, CheckCircle, ChevronDown, Search, Filter, Users,
  Bot, FileText, Video, Brain, BarChart3, TrendingUp,
  Briefcase, Target, Shield, ChevronRight, Quote,
  Network, Layers
} from 'lucide-react';
import SiteShell from '../components/SiteShell';

const primary = '#7C3AED';
const cyan = '#7C3AED';
const secondary = '#8B5CF6';

const fadeUp = { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
const fadeIn = { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true }, transition: { duration: 0.6 } };

function SectionHeading({ badge, title, subtitle, light }: { badge: string; title: string; subtitle?: string; light?: boolean }) {
  return (
    <motion.div {...fadeUp} className="mx-auto mb-16 max-w-3xl text-center">
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold ${light ? 'border-white/20 text-white/80' : 'border-[#EDE9FE] bg-[#F5F3FF] text-[#7C3AED]'}`}>
        <Sparkles size={12} /> {badge}
      </span>
      <h2 className={`mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl ${light ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
      {subtitle && <p className={`mt-4 text-base leading-relaxed ${light ? 'text-white/60' : 'text-slate-500'}`}>{subtitle}</p>}
    </motion.div>
  );
}

const features = [
  { icon: Brain, title: 'AI Candidate Matching', desc: 'Our AI analyzes job requirements and candidate profiles to deliver the most relevant matches with 95% accuracy.', color: primary },
  { icon: FileText, title: 'Resume Scoring', desc: 'Automatically parse and score resumes based on skills, experience, education, and cultural fit indicators.', color: cyan },
  { icon: Video, title: 'Video Interviews', desc: 'Built-in video interview platform with AI analysis of speech, sentiment, and response quality.', color: '#8B5CF6' },
  { icon: Bot, title: 'Automated Screening', desc: 'AI-powered chatbots handle initial screening, scheduling, and candidate communication 24/7.', color: '#EC4899' },
  { icon: BarChart3, title: 'Hiring Analytics', desc: 'Comprehensive analytics on time-to-hire, source effectiveness, conversion rates, and cost-per-hire.', color: '#10B981' },
  { icon: Network, title: 'Talent Pool Management', desc: 'Build and nurture passive talent pools with AI-driven engagement and re-engagement campaigns.', color: '#F59E0B' },
];


const jobCategories = [
  { title: 'Engineering', count: '1,247', icon: Briefcase, color: primary },
  { title: 'Marketing', count: '843', icon: Target, color: cyan },
  { title: 'Finance', count: '562', icon: TrendingUp, color: '#10B981' },
  { title: 'Operations', count: '391', icon: Layers, color: '#F59E0B' },
];

const pipelineStages = [
  { name: 'Applied', count: 184, color: '#7C3AED', pct: 100 },
  { name: 'Screened', count: 96, color: '#8B5CF6', pct: 52 },
  { name: 'Interview', count: 43, color: '#7C3AED', pct: 23 },
  { name: 'Offer', count: 18, color: '#10B981', pct: 10 },
  { name: 'Hired', count: 12, color: '#22C55E', pct: 7 },
];

const successStories = [
  { company: 'TechNova Solutions', role: 'Senior Full-Stack Engineer', hire: 'Rahul Sharma', desc: 'Found a perfect candidate in just 3 days with AI matching. Reduced time-to-hire by 60%.', result: '60% Faster Hire', avatar: 'TS', color: primary },
  { company: 'CloudPeak Systems', role: 'DevOps Lead', hire: 'Ananya Patel', desc: 'AI screening processed 500+ applicants automatically. Top 5 candidates were all excellent.', result: '500+ Auto-Screened', avatar: 'CS', color: cyan },
  { company: 'DataForge Inc.', role: 'Data Scientist', hire: 'Vikram Joshi', desc: 'Resume scoring identified the ideal candidate who had been overlooked by traditional screening.', result: '95% Match Score', avatar: 'DF', color: '#8B5CF6' },
];

const faqs = [
  { q: 'How does AI candidate matching work?', a: 'Our AI analyzes job descriptions against candidate profiles using natural language processing, skill extraction, and experience mapping to deliver ranked matches with detailed fit analysis.' },
  { q: 'Can I integrate with my existing ATS?', a: 'Yes, Prasynx integrates with major ATS platforms including Greenhouse, Lever, Workable, and BambooHR via API. We also offer custom integration support for enterprise plans.' },
  { q: 'What types of assessments are available?', a: 'We offer coding challenges, personality assessments, cognitive ability tests, role-specific skills tests, and custom assessments you can design yourself.' },
  { q: 'Is candidate data secure?', a: 'Absolutely. We use enterprise-grade encryption at rest and in transit, SOC 2 Type II compliant infrastructure, and strict access controls to protect all candidate data.' },
  { q: 'How long does implementation take?', a: 'Most teams are up and running within 48 hours. Our onboarding team provides guided setup, team training, and best practices to ensure a smooth launch.' },
];

export default function JobProviderLanding() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <SiteShell>
      {/* HERO */}
      <section className="relative overflow-hidden bg-white pb-16 pt-24 sm:pb-24 sm:pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#7C3AED]/10 blur-[120px]" />
          <div className="absolute -bottom-40 right-1/4 h-[500px] w-[500px] rounded-full bg-[#7C3AED]/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-center">
            <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex-1 max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EDE9FE] bg-[#F5F3FF] px-4 py-1.5 text-xs font-bold text-[#7C3AED]">
                <Sparkles size={12} /> Job Provider Portal
              </span>
              <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl text-slate-950">
                Hire Verified Talent<br />
                <span className="bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#7C3AED] bg-clip-text text-transparent">Faster &amp; Smarter</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-500 lg:text-lg">
                AI-powered recruitment platform that connects you with pre-verified candidates. Reduce time-to-hire by 60% with intelligent matching, automated screening, and data-driven hiring decisions.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/job-provider/login" className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-8 py-4 text-sm font-bold text-white shadow-xl shadow-[#7C3AED]/25 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#7C3AED]/35">
                  Post a Job <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </Link>
                <Link href="/book-demo" className="group inline-flex items-center gap-2 rounded-2xl border-2 border-[#E2E8F0] bg-white px-8 py-4 text-sm font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-1 hover:border-[#7C3AED]/30 hover:shadow-lg hover:shadow-[#7C3AED]/10">
                  Book Demo
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-8">
                <div className="flex -space-x-2">
                  {['https://i.pravatar.cc/40?u=1', 'https://i.pravatar.cc/40?u=2', 'https://i.pravatar.cc/40?u=3', 'https://i.pravatar.cc/40?u=4'].map((src, i) => (
                    <img key={i} src={src} alt="" className="h-9 w-9 rounded-full border-2 border-white" />
                  ))}
                  <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-[#F5F3FF] text-[10px] font-bold text-[#7C3AED]">2k+</span>
                </div>
                <span className="text-xs font-semibold text-slate-500">Trusted by 2,000+ companies</span>
              </div>
            </motion.div>
            {/* Right Hero Illustration — removed */}
            <div className="flex-1" />
          </div>
        </div>
      </section>

      {/* RECRUITMENT FEATURES */}
      <section className="bg-[#FAFAFF] px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading badge="Features" title="AI-Powered Recruitment Tools" subtitle="Everything you need to find, screen, and hire the best talent — powered by intelligent automation." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#7C3AED]/10">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 transition-all duration-500 group-hover:opacity-10" style={{ background: `radial-gradient(circle, ${f.color}, transparent)` }} />
                <span className="grid h-14 w-14 place-items-center rounded-2xl text-white text-xl font-black transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl" style={{ background: `linear-gradient(135deg, ${f.color}, ${f.color}dd)` }}>
                  <f.icon size={24} />
                </span>
                <h3 className="mt-6 text-xl font-black text-slate-900">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CANDIDATE SEARCH */}
      <section className="px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-center">
            <motion.div {...fadeUp} className="flex-1 max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EDE9FE] bg-[#F5F3FF] px-4 py-1.5 text-xs font-bold text-[#7C3AED]">
                <Search size={12} /> Smart Search
              </span>
              <h2 className="mt-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">Find Candidates In Seconds</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                Search through thousands of verified candidate profiles using AI-powered filters. Match by skills, experience, location, salary expectations, and cultural fit indicators.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  'Natural language search — "React developer with 5 years fintech experience"',
                  'AI-powered skill extraction and experience validation',
                  'Pre-verified profiles with background checks and skill assessments',
                  'Save searches and get real-time alerts for new matches',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle size={16} className="mt-0.5 shrink-0 text-[#7C3AED]" />
                    <span className="text-sm font-semibold leading-relaxed text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            {/* Search Mockup */}
            <motion.div {...fadeIn} className="flex-1 w-full max-w-xl">
              <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-2xl shadow-[#7C3AED]/5">
                <div className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-[#FAFAFA] px-4 py-3">
                  <Search size={16} className="text-slate-400" />
                  <input readOnly value="Senior React Developer with..." className="flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" />
                  <span className="flex items-center gap-1 rounded-lg bg-[#7C3AED] px-3 py-1.5 text-[11px] font-bold text-white"><Filter size={12} /> Filters</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['React', 'TypeScript', '5+ years', 'Remote', '$120k+', 'Fintech'].map((tag) => (
                    <span key={tag} className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1 text-[11px] font-bold text-slate-600">{tag}</span>
                  ))}
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    { name: 'Priya Sharma', role: 'Senior React Developer', skills: 'React • TypeScript • Node.js', match: 96, avatar: 'PS' },
                    { name: 'Arun Kumar', role: 'Full-Stack Engineer', skills: 'React • Python • AWS', match: 92, avatar: 'AK' },
                    { name: 'Neha Gupta', role: 'Frontend Lead', skills: 'React • GraphQL • Next.js', match: 88, avatar: 'NG' },
                  ].map((c, i) => (
                    <motion.div key={c.name} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 rounded-2xl border border-[#F1F5F9] bg-[#FAFAFA] p-3 transition hover:border-[#7C3AED]/20 hover:bg-white">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] text-xs font-bold text-white">{c.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-900">{c.name}</p>
                        <p className="text-xs font-semibold text-slate-500">{c.role}</p>
                        <p className="text-[11px] font-medium text-slate-400">{c.skills}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-[#7C3AED]">{c.match}%</span>
                        <p className="text-[10px] font-semibold text-slate-400">Match</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ATS DASHBOARD */}
      <section className="bg-[#FAFAFF] px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading badge="ATS Pipeline" title="Visual Applicant Tracking" subtitle="Drag-and-drop pipeline management with real-time collaboration and AI-driven prioritization." />
          <motion.div {...fadeIn} className="mx-auto max-w-4xl">
            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-2xl shadow-[#7C3AED]/5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-black text-slate-700">Software Engineer Hiring Pipeline</span>
                <span className="flex items-center gap-1 rounded-full bg-[#F5F3FF] px-3 py-1 text-[11px] font-bold text-[#7C3AED]"><Users size={12} /> 184 Total</span>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {pipelineStages.map((stage, i) => (
                  <motion.div key={stage.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="rounded-2xl border border-[#F1F5F9] bg-[#FAFAFA] p-3 text-center">
                    <div className="text-xs font-bold text-slate-500">{stage.name}</div>
                    <div className="mt-1 text-2xl font-black text-slate-900">{stage.count}</div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-[#E2E8F0] overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${stage.pct}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                        className="h-full rounded-full" style={{ background: stage.color }} />
                    </div>
                    <div className="mt-1 text-[10px] font-semibold text-slate-400">{stage.pct}%</div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#F5F3FF] to-[#F3E8FF] px-4 py-3">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-700"><Brain size={14} className="text-[#7C3AED]" /> AI recommends prioritizing Interview stage — 3 high-fit candidates</span>
                <span className="text-[10px] font-bold text-[#7C3AED]">View</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HIRING ANALYTICS */}
      <section className="px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-16 lg:flex-row-reverse lg:items-center">
            <motion.div {...fadeUp} className="flex-1 max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EDE9FE] bg-[#F5F3FF] px-4 py-1.5 text-xs font-bold text-[#7C3AED]">
                <BarChart3 size={12} /> Analytics
              </span>
              <h2 className="mt-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">Data-Driven Hiring Decisions</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                Make informed decisions with real-time analytics on every aspect of your recruitment process. Identify bottlenecks, optimize sourcing channels, and improve hiring outcomes.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { label: 'Time-to-hire reduced by 60%', value: '18 days', up: true },
                  { label: 'Cost-per-hire reduced', value: '₹42,000 avg.', up: true },
                  { label: 'Candidate quality score', value: '4.8/5.0', up: true },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between rounded-2xl border border-[#F1F5F9] bg-[#FAFAFA] px-5 py-3">
                    <span className="text-sm font-semibold text-slate-600">{m.label}</span>
                    <span className={`text-sm font-black ${m.up ? 'text-emerald-500' : 'text-red-400'}`}>{m.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            {/* Analytics Mockup */}
            <motion.div {...fadeIn} className="flex-1 w-full max-w-lg">
              <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-2xl shadow-[#7C3AED]/5">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                  <span className="text-sm font-black text-slate-700">Hiring Overview</span>
                  <span className="text-[10px] font-bold text-slate-400">Last 30 days</span>
                </div>
                <div className="mt-5 space-y-5">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500"><span>Applications</span><span>247</span></div>
                    <div className="mt-1 h-2 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: '100%' }} viewport={{ once: true }} transition={{ duration: 1 }} className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500"><span>Interviews</span><span>43</span></div>
                    <div className="mt-1 h-2 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: '35%' }} viewport={{ once: true }} transition={{ duration: 1 }} className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500"><span>Offers</span><span>18</span></div>
                    <div className="mt-1 h-2 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: '15%' }} viewport={{ once: true }} transition={{ duration: 1 }} className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#34D399]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500"><span>Hires</span><span>12</span></div>
                    <div className="mt-1 h-2 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: '10%' }} viewport={{ once: true }} transition={{ duration: 1 }} className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#4ADE80]" />
                    </div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#F1F5F9] bg-[#FAFAFA] p-4 text-center">
                    <p className="text-[11px] font-semibold text-slate-500">Avg. Time to Hire</p>
                    <p className="mt-1 text-xl font-black text-[#7C3AED]">18 days</p>
                    <p className="text-[10px] font-bold text-emerald-500">↓ 60%</p>
                  </div>
                  <div className="rounded-2xl border border-[#F1F5F9] bg-[#FAFAFA] p-4 text-center">
                    <p className="text-[11px] font-semibold text-slate-500">Offer Acceptance</p>
                    <p className="mt-1 text-xl font-black text-[#7C3AED]">94%</p>
                    <p className="text-[10px] font-bold text-emerald-500">↑ 12%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="bg-[#FAFAFF] px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading badge="Success Stories" title="Real Placements. Real Results." subtitle="See how companies are finding exceptional talent with Prasynx AI recruitment." />
          <div className="grid gap-6 md:grid-cols-3">
            {successStories.map((s, i) => (
              <motion.div key={s.company} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#7C3AED]/10">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 transition-all duration-500 group-hover:opacity-10" style={{ background: `radial-gradient(circle, ${s.color}, transparent)` }} />
                <div className="flex items-center gap-3 mb-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white text-sm font-bold" style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}dd)` }}>{s.avatar}</span>
                  <div>
                    <p className="text-base font-black text-slate-900">{s.company}</p>
                    <p className="text-xs font-semibold text-slate-500">{s.role}</p>
                  </div>
                </div>
                <Quote size={20} className="text-slate-200 mb-2" />
                <p className="text-sm leading-relaxed text-slate-600">&ldquo;{s.desc}&rdquo;</p>
                <div className="mt-5 flex items-center justify-between border-t border-[#F1F5F9] pt-4">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] text-[9px] font-bold text-white">
                      {s.hire.split(' ').map(w => w[0]).join('')}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">Hired: {s.hire}</span>
                  </div>
                  <span className="rounded-lg bg-[#F5F3FF] px-3 py-1 text-[11px] font-bold text-[#7C3AED]">{s.result}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <SectionHeading badge="FAQ" title="Frequently Asked Questions" subtitle="Everything you need to know about hiring with Prasynx." />
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-[#E2E8F0] bg-white transition-all hover:border-[#7C3AED]/20 hover:shadow-md">
                <button type="button" onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left">
                  <span className="text-sm font-extrabold text-slate-900">{faq.q}</span>
                  <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform duration-200 ${faqOpen === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {faqOpen === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-hidden">
                      <p className="px-6 pb-4 text-sm leading-relaxed text-slate-500">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl px-8 py-14 sm:px-14 sm:py-16 text-white shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 40%, #7C3AED 100%)' }}>
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-[#5B21B6]/20 blur-3xl" />
            <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:text-left">
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">Ready to Transform Your Hiring?</h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80 lg:mx-0">
                  Join 2,000+ companies already using Prasynx to hire verified talent faster. Start your free trial today.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
                  <Link href="/job-provider/login" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl text-[#7C3AED]">
                    Get Started <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link href="/book-demo" className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-lg">
                    Book Demo
                  </Link>
                </div>
              </div>
              <div className="relative shrink-0">
                <div className="relative grid h-48 w-48 place-items-center rounded-3xl bg-white/10 backdrop-blur-sm sm:h-56 sm:w-56">
                  <Briefcase size={64} className="text-white/60" />
                  <motion.div className="absolute -top-3 -right-3 rounded-xl bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm"
                    animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                    AI Powered
                  </motion.div>
                  <motion.div className="absolute -bottom-2 -left-2 rounded-xl bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm"
                    animate={{ y: [0, 6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
                    60% Faster
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </SiteShell>
  );
}
