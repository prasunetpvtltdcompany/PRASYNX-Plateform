"use client";
import { BookOpen, Code, Download, FileText, Search, ChevronRight, ArrowRight, BookMarked, BookCopy, BookOpenText, GraduationCap, Settings, Users, Shield } from 'lucide-react';
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

const categories = [
  {
    title: 'Getting Started', icon: BookOpen, color: '#6C4CF1', guides: [
      { label: 'Quick Start Guide', desc: 'Set up your institution in under 30 minutes.', time: '30 min' },
      { label: 'Platform Overview', desc: 'Understand the Prasynx Education OS ecosystem.', time: '15 min' },
      { label: 'First-Time Setup', desc: 'Configure users, roles, and permissions.', time: '20 min' },
      { label: 'Migration Guide', desc: 'Import existing data from legacy systems.', time: '45 min' },
    ],
  },
  {
    title: 'User Guides', icon: Users, color: '#8B5CF6', guides: [
      { label: 'Student Portal Guide', desc: 'Navigate courses, grades, and attendance.', time: '10 min' },
      { label: 'Parent Portal Guide', desc: 'Monitor progress, communicate with staff.', time: '10 min' },
      { label: 'Staff Dashboard Guide', desc: 'Manage classes, assignments, and reports.', time: '25 min' },
      { label: 'Admin Console Guide', desc: 'System-wide configuration and analytics.', time: '40 min' },
    ],
  },
  {
    title: 'Integration Docs', icon: Code, color: '#A855F7', guides: [
      { label: 'LMS Integration', desc: 'Connect Moodle, Canvas, or Blackboard.', time: '20 min' },
      { label: 'Payment Gateway Setup', desc: 'Configure Razorpay, Stripe, or PayPal.', time: '15 min' },
      { label: 'SSO Integration', desc: 'Set up SAML, OAuth, or LDAP authentication.', time: '25 min' },
      { label: 'Calendar Sync', desc: 'Google Calendar, Outlook, and iCal integration.', time: '10 min' },
    ],
  },
  {
    title: 'Admin Guides', icon: Settings, color: '#4F2DB8', guides: [
      { label: 'Role Management', desc: 'Define custom roles and permission sets.', time: '15 min' },
      { label: 'Batch & Course Setup', desc: 'Configure academic terms and curricula.', time: '30 min' },
      { label: 'Exam Management', desc: 'Create, schedule, and grade examinations.', time: '20 min' },
      { label: 'Report Configuration', desc: 'Build custom reports and dashboards.', time: '25 min' },
    ],
  },
  {
    title: 'Security & Compliance', icon: Shield, color: '#7C3AED', guides: [
      { label: 'Data Privacy Setup', desc: 'Configure GDPR and data retention policies.', time: '20 min' },
      { label: 'Audit Logs', desc: 'Monitor and export system activity logs.', time: '10 min' },
      { label: 'Backup & Recovery', desc: 'Automated backup schedules and restore.', time: '15 min' },
      { label: 'Security Best Practices', desc: 'Recommended configuration for enterprise use.', time: '25 min' },
    ],
  },
  {
    title: 'SDK & API Docs', icon: GraduationCap, color: '#6D28D9', guides: [
      { label: 'REST API Reference', desc: 'Complete API endpoints with examples.', time: '60 min' },
      { label: 'Webhook Events', desc: 'Real-time event notifications setup.', time: '15 min' },
      { label: 'JavaScript SDK', desc: 'Client-side integration for custom portals.', time: '30 min' },
      { label: 'Mobile SDKs', desc: 'iOS and Android native SDK documentation.', time: '45 min' },
    ],
  },
];

const quickLinks = [
  { icon: Download, label: 'Download PDF Manual', href: '#' },
  { icon: FileText, label: 'Release Notes', href: '/resources/releases' },
  { icon: Search, label: 'Search Documentation', href: '/resources/knowledge-base' },
  { icon: BookCopy, label: 'Video Tutorials', href: '/resources/tutorials' },
];

export default function DocumentationPage() {
  return (
    <SiteShell>
      <PageMain>
        <section className="relative overflow-hidden px-4 pt-20 pb-10 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/3 top-0 h-96 w-96 rounded-full bg-[#6D4CFF]/10 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-[#A855F7]/12 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E8E0FF] bg-white/80 px-4 py-2 text-sm font-extrabold text-[#4F2DB8] shadow-sm">
                <BookOpenText className="h-4 w-4 text-[#A855F7]" />
                Documentation
              </div>
              <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Comprehensive Platform Documentation
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Everything you need to implement, configure, and manage the Prasynx Education OS across your institution. From setup guides to API references.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="#guides" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6C4CF1] to-[#8B5CF6] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
                  Browse Guides <ChevronRight size={16} />
                </Link>
                <Link href="/resources/api-reference" className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-[#6C4CF1] hover:text-[#6C4CF1]">
                  API Reference
                </Link>
              </div>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.label} href={link.href}
                    className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white/80 px-5 py-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#E8E0FF] hover:bg-[#F3F0FF] hover:text-[#6C4CF1]">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F3F0FF] text-[#6C4CF1]">
                      <Icon size={16} />
                    </span>
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <PageSection>
          <div className="space-y-8" id="guides">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.div key={cat.title} {...stagger}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${cat.color}15`, color: cat.color }}>
                      <Icon size={20} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-slate-950">{cat.title}</h2>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {cat.guides.map((guide) => (
                      <Link key={guide.label} href="#"
                        className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 transition hover:border-[#E8E0FF] hover:shadow-lg hover:shadow-[#6D4CFF]/5 hover:-translate-y-1">
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#6C4CF1] to-[#A855F7] opacity-0 transition group-hover:opacity-100" />
                        <h3 className="text-sm font-bold text-slate-950">{guide.label}</h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{guide.desc}</p>
                        <span className="mt-3 inline-block rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[10px] font-bold text-slate-500">{guide.time}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </PageSection>

        <PageSection tone="soft">
          <SectionHeader
            eyebrow="Popular Topics"
            title="Most Viewed Documentation"
            description="Curated guides based on what other institutions are reading most."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Users, title: 'Bulk User Import', desc: 'Import thousands of students and staff with CSV upload.', views: '12.4k', href: '#' },
              { icon: Shield, title: 'Role-Based Access Control', desc: 'Fine-grained permissions for every user type.', views: '9.8k', href: '#' },
              { icon: Settings, title: 'Academic Year Setup', desc: 'Configure terms, semesters, and grading periods.', views: '8.2k', href: '#' },
              { icon: Code, title: 'REST API Authentication', desc: 'OAuth 2.0 and API key authentication guide.', views: '7.6k', href: '#' },
              { icon: BookCopy, title: 'Gradebook Configuration', desc: 'Set up grading scales, categories, and calculations.', views: '6.9k', href: '#' },
              { icon: Download, title: 'Data Export & Reports', desc: 'Export data to Excel, PDF, and CSV formats.', views: '5.4k', href: '#' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href}
                  className="group rounded-2xl border border-[#E2E8F0] bg-white p-6 transition hover:border-[#E8E0FF] hover:shadow-lg hover:-translate-y-1">
                  <div className="flex items-start justify-between">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F3F0FF] text-[#6C4CF1] transition group-hover:bg-[#6C4CF1] group-hover:text-white">
                      <Icon size={18} />
                    </span>
                    <span className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[10px] font-bold text-slate-500">{item.views} views</span>
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.desc}</p>
                </Link>
              );
            })}
          </div>
        </PageSection>

        <CtaBand
          title="Need Help Finding Something?"
          description="Our documentation team can point you to the right guide or help troubleshoot any issues."
          href="/resources/help-center"
          action="Visit Help Center"
        />
      </PageMain>
    </SiteShell>
  );
}
