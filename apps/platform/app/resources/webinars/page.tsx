"use client";
import { Monitor, Play, Calendar, Clock, Users, BookOpen, Star, ArrowRight, ChevronRight, Download, Share2, Heart, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import SiteShell from '../../components/SiteShell';
import { PageMain, PageSection, SectionHeader, CtaBand } from '../../components/MarketingSections';

const stagger = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-30px' },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
};

const webinars = [
  {
    title: 'Getting Started with Prasynx Education OS', type: 'On-Demand', duration: '45 min',
    desc: 'A comprehensive walkthrough of the platform for new administrators. Learn navigation, user setup, and core configuration.',
    date: 'Recorded', presenter: 'Product Team', attendees: '1,240', rating: '4.8',
    tags: ['Getting Started', 'Administration', 'Beginners'],
  },
  {
    title: 'AI-Powered Analytics: Transforming Education Data', type: 'On-Demand', duration: '60 min',
    desc: 'Discover how Prerana AI analyzes student performance data to provide predictive insights and personalized learning recommendations.',
    date: 'Recorded', presenter: 'AI Team', attendees: '980', rating: '4.9',
    tags: ['AI', 'Analytics', 'Prerana AI'],
  },
  {
    title: 'Multi-Tenant Management Best Practices', type: 'On-Demand', duration: '50 min',
    desc: 'Learn how to configure and manage multiple campuses, branches, or institutions under a single Prasynx instance.',
    date: 'Recorded', presenter: 'Engineering', attendees: '720', rating: '4.7',
    tags: ['Multi-Tenant', 'Administration', 'Advanced'],
  },
  {
    title: 'Integrating Prasynx with Your Existing Systems', type: 'Upcoming', duration: '55 min',
    desc: 'Technical deep-dive into REST APIs, webhooks, and pre-built integrations with popular LMS and ERP systems.',
    date: 'July 15, 2026', presenter: 'Solutions Team', attendees: '340 registered', rating: '-',
    tags: ['API', 'Integrations', 'Developers'],
  },
  {
    title: 'Parent Engagement Strategies Using Prasynx', type: 'Upcoming', duration: '40 min',
    desc: 'Best practices for leveraging the parent portal, notifications, and communication tools to increase parent engagement.',
    date: 'July 28, 2026', presenter: 'Education Team', attendees: '280 registered', rating: '-',
    tags: ['Parents', 'Communication', 'Best Practices'],
  },
  {
    title: 'Advanced Reporting & Custom Dashboards', type: 'On-Demand', duration: '65 min',
    desc: 'Master the report builder and create custom dashboards with real-time data visualizations for your institution.',
    date: 'Recorded', presenter: 'Product Team', attendees: '560', rating: '4.6',
    tags: ['Reports', 'Dashboards', 'Analytics'],
  },
];

export default function WebinarsPage() {
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? webinars : webinars.filter((w) => w.type === filter);

  return (
    <SiteShell>
      <PageMain>
        <section className="relative overflow-hidden px-4 pt-20 pb-10 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/3 top-0 h-80 w-80 rounded-full bg-[#6D4CFF]/10 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-[#8B5CF6]/12 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E8E0FF] bg-white/80 px-4 py-2 text-sm font-extrabold text-[#4F2DB8] shadow-sm">
                <Monitor className="h-4 w-4 text-[#A855F7]" />
                Webinars
              </div>
              <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Webinars & Live Sessions
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Join our live webinars or watch recorded sessions to deepen your knowledge of the Prasynx Education OS platform and best practices.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="#"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6C4CF1] to-[#8B5CF6] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
                  <Calendar size={16} /> Register for Upcoming
                </Link>
                <span className="flex items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white/80 px-5 py-3 text-sm font-bold text-slate-600 shadow-sm">
                  <Play size={16} className="text-[#6C4CF1]" /> 50+ recorded sessions
                </span>
              </div>
            </div>
          </div>
        </section>

        <PageSection>
          <div className="mb-6 flex flex-wrap gap-2">
            {['All', 'On-Demand', 'Upcoming'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-full px-5 py-2 text-xs font-bold transition ${
                  filter === f
                    ? 'bg-[#6C4CF1] text-white shadow-sm'
                    : 'bg-white border border-[#E2E8F0] text-slate-600 hover:border-[#6C4CF1] hover:text-[#6C4CF1]'
                }`}>
                {f}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((webinar) => (
              <motion.div key={webinar.title} {...stagger}
                className={`group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 transition hover:border-[#E8E0FF] hover:shadow-lg hover:-translate-y-1 ${
                  webinar.type === 'Upcoming' ? 'ring-2 ring-[#6C4CF1]/20' : ''
                }`}>
                {webinar.type === 'Upcoming' && (
                  <div className="absolute top-3 right-3 rounded-full bg-[#6C4CF1] px-2.5 py-0.5 text-[9px] font-bold text-white">Live Soon</div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${
                    webinar.type === 'Upcoming' ? 'bg-[#F3F0FF] text-[#6C4CF1]' : 'bg-[#F1F5F9] text-slate-500'
                  }`}>
                    {webinar.type === 'Upcoming' ? <Calendar size={18} /> : <Play size={18} />}
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400">{webinar.type}</span>
                    <p className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                      <Clock size={10} /> {webinar.duration}
                    </p>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-950">{webinar.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{webinar.desc}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {webinar.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[9px] font-bold text-slate-500">{tag}</span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[#F1F5F9] pt-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <Users size={10} /> {webinar.attendees}
                  </div>
                  <div className="flex items-center gap-2">
                    {webinar.rating !== '-' && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600">
                        <Star size={10} /> {webinar.rating}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-slate-400">{webinar.date}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </PageSection>

        <PageSection tone="soft">
          <SectionHeader
            eyebrow="Featured Series"
            title="Webinar Series & Playlists"
            description="Curated collections of webinars organized by topic for deeper learning."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BookOpen, title: 'Getting Started Series', count: '6 sessions', desc: 'Perfect for new administrators.' },
              { icon: Users, title: 'Admin Mastery', count: '8 sessions', desc: 'Advanced administration techniques.' },
              { icon: Star, title: 'AI & Innovation', count: '4 sessions', desc: 'Prerana AI and automation deep-dives.' },
              { icon: Monitor, title: 'Integration Talks', count: '5 sessions', desc: 'Technical integration workshops.' },
            ].map((series) => {
              const Icon = series.icon;
              return (
                <div key={series.title}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-5 transition hover:border-[#E8E0FF] hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#6C4CF1] to-[#A855F7] text-white">
                    <Icon size={16} />
                  </span>
                  <h3 className="mt-3 text-sm font-bold text-slate-950">{series.title}</h3>
                  <p className="text-xs text-slate-500">{series.desc}</p>
                  <p className="mt-2 text-[10px] font-bold text-[#6C4CF1]">{series.count}</p>
                </div>
              );
            })}
          </div>
        </PageSection>

        <CtaBand
          title="Suggest a Webinar Topic"
          description="Is there a topic you would like us to cover? Let us know and we will consider it for our upcoming webinar schedule."
          href="/contact"
          action="Suggest Topic"
        />
      </PageMain>
    </SiteShell>
  );
}
