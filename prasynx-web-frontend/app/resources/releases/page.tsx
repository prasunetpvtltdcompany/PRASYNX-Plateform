"use client";
import { Wrench, ArrowRight, ChevronRight, Star, Zap, Shield, CheckCircle, RefreshCw, Cloud, Server, GitBranch, Clock } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SiteShell from '../../components/SiteShell';
import { PageMain, PageSection, SectionHeader, CtaBand } from '../../components/MarketingSections';

const stagger = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-30px' },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
};

const releases = [
  {
    version: '4.2.0', date: 'June 1, 2026', type: 'major',
    title: 'AI-Powered Analytics & Multi-Tenant Enhancements',
    highlights: [
      'Prerana AI analytics engine with predictive insights for student performance',
      'Multi-tenant management with cross-campus data aggregation',
      'Redesigned parent dashboard with real-time activity feed',
      'New REST API endpoints for attendance and grade bulk operations',
      'Performance optimization: 40% faster page load times',
    ],
  },
  {
    version: '4.1.0', date: 'April 15, 2026', type: 'minor',
    title: 'Mobile App Update & Integration Improvements',
    highlights: [
      'iOS and Android apps with biometric authentication',
      'Google Classroom and Moodle integration connectors',
      'Custom report builder with drag-and-drop interface',
      'Enhanced notification system with delivery tracking',
      'Updated UI components library for consistent design',
    ],
  },
  {
    version: '4.0.0', date: 'February 1, 2026', type: 'major',
    title: 'Platform Redesign & Unified OS Launch',
    highlights: [
      'Complete platform redesign with new user interface',
      'Unified Education OS platform combining all modules',
      'Role-based access control with granular permissions',
      'Real-time collaboration tools for staff communication',
      'New onboarding wizard for faster institution setup',
    ],
  },
  {
    version: '3.5.0', date: 'December 10, 2025', type: 'minor',
    title: 'Fee Management & Payment Gateway Expansion',
    highlights: [
      'Integrated Razorpay, Stripe, and PayPal payment gateways',
      'Automated fee reminder notifications via email and SMS',
      'Bulk fee assignment and concession management',
      'Payment reconciliation dashboard with transaction logs',
    ],
  },
  {
    version: '3.4.0', date: 'October 20, 2025', type: 'patch',
    title: 'Security & Compliance Update',
    highlights: [
      'GDPR compliance tools with data retention policies',
      'Two-factor authentication for all user roles',
      'Enhanced audit logging with searchable activity history',
      'Data encryption at rest for all stored records',
    ],
  },
  {
    version: '3.3.0', date: 'August 5, 2025', type: 'minor',
    title: 'Attendance System Overhaul',
    highlights: [
      'QR code attendance scanning via mobile app',
      'Biometric device integration (fingerprint, RFID)',
      'Automated attendance report generation',
      'Real-time attendance dashboard for parents',
    ],
  },
];

const typeConfig = {
  major: { label: 'Major Release', classes: 'bg-purple-100 text-purple-700' },
  minor: { label: 'Feature Update', classes: 'bg-blue-100 text-blue-700' },
  patch: { label: 'Patch', classes: 'bg-green-100 text-green-700' },
};

export default function ReleasesPage() {
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
                <Wrench className="h-4 w-4 text-[#A855F7]" />
                Release Notes
              </div>
              <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Product Release Notes
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Stay up to date with the latest features, improvements, and fixes across the Prasynx Education OS platform.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-5 py-2.5 text-sm font-bold text-green-700 shadow-sm">
                  <CheckCircle size={15} /> Latest: v4.2.0
                </span>
                <a href="#roadmap"
                  className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white/80 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-[#6C4CF1] hover:text-[#6C4CF1]">
                  <GitBranch size={15} /> View Roadmap
                </a>
              </div>
            </div>
          </div>
        </section>

        <PageSection>
          <div className="relative mx-auto max-w-4xl">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[#6C4CF1] via-[#8B5CF6] to-transparent" />
            <div className="space-y-8">
              {releases.map((release, i) => {
                const type = typeConfig[release.type as keyof typeof typeConfig];
                return (
                  <motion.div key={release.version} {...stagger} className="relative pl-16">
                    <div className={`absolute left-4 grid h-8 w-8 -translate-x-1/2 place-items-center rounded-full border-2 border-white shadow-md ${
                      release.type === 'major' ? 'bg-[#6C4CF1]' : release.type === 'minor' ? 'bg-[#8B5CF6]' : 'bg-[#A855F7]'
                    }`}>
                      <Wrench size={13} className="text-white" />
                    </div>
                    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 transition hover:border-[#E8E0FF] hover:shadow-lg">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-[#F3F0FF] px-2.5 py-1 text-xs font-black text-[#6C4CF1]">v{release.version}</span>
                          <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${type.classes}`}>{type.label}</span>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <Clock size={10} /> {release.date}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-950">{release.title}</h3>
                      <ul className="mt-3 space-y-1.5">
                        {release.highlights.map((h, j) => (
                          <li key={j} className="flex items-start gap-2 text-xs text-slate-600">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6C4CF1]" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </PageSection>

        <PageSection tone="soft" id="roadmap">
          <SectionHeader
            eyebrow="Coming Soon"
            title="Upcoming Releases"
            description="Here is what we are working on for the next major releases."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Zap, title: 'v4.3.0 - Q3 2026', desc: 'Advanced AI grading assistant, automated curriculum mapping, parent-teacher video conferencing.' },
              { icon: Shield, title: 'v4.4.0 - Q4 2026', desc: 'Blockchain credential verification, enhanced analytics with ML predictions, white-label portal option.' },
              { icon: Cloud, title: 'v5.0.0 - Q1 2027', desc: 'Full platform rewrite with edge computing, offline mode, AI tutor integration, global CDN for low latency.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title}
                  className="group rounded-2xl border border-[#E2E8F0] bg-white p-6 transition hover:border-[#E8E0FF] hover:shadow-lg">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#6C4CF1] to-[#A855F7] text-white">
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-4 text-sm font-black text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </PageSection>

        <CtaBand
          title="Have a Feature Request?"
          description="We love hearing from our users. Share your ideas and suggestions for future releases."
          href="/contact"
          action="Submit Feedback"
        />
      </PageMain>
    </SiteShell>
  );
}
