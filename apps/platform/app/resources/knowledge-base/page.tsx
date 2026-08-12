"use client";
import { Search, BookOpenText, ChevronRight, FileText, Award, Zap, Users, GraduationCap, Settings, Shield, HelpCircle, Star, ArrowRight, BarChart3, TrendingUp } from 'lucide-react';
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

const categories = [
  {
    title: 'Getting Started', icon: Star, color: '#6C4CF1', articles: [
      { title: 'What is Prasynx Education OS?', desc: 'Overview of the platform, core modules, and key benefits for educational institutions.' },
      { title: 'System Requirements & Compatibility', desc: 'Supported browsers, devices, and network requirements for optimal performance.' },
      { title: 'Account Setup & Configuration', desc: 'How to create your institution account and configure initial settings.' },
      { title: 'Understanding User Roles', desc: 'Complete guide to student, parent, staff, and admin roles and permissions.' },
    ],
  },
  {
    title: 'Student Management', icon: Users, color: '#8B5CF6', articles: [
      { title: 'Student Enrollment & Admissions', desc: 'Process for enrolling new students, managing applications, and admissions workflows.' },
      { title: 'Attendance Tracking Methods', desc: 'QR code, biometric, RFID, and manual attendance configuration.' },
      { title: 'Academic Records & Transcripts', desc: 'Managing grades, transcripts, and academic history for students.' },
      { title: 'Student Communication Tools', desc: 'In-app messaging, email, and notification preferences for students.' },
    ],
  },
  {
    title: 'Academic Management', icon: GraduationCap, color: '#A855F7', articles: [
      { title: 'Course & Curriculum Planning', desc: 'Creating courses, setting syllabi, and organizing academic curricula.' },
      { title: 'Exam Scheduling & Proctoring', desc: 'Schedule exams, assign rooms, and configure online proctoring.' },
      { title: 'Gradebook & Assessment Setup', desc: 'Configuring grading scales, categories, and assessment types.' },
      { title: 'Report Card Generation', desc: 'Automated report card creation with custom templates.' },
    ],
  },
  {
    title: 'Administration', icon: Settings, color: '#4F2DB8', articles: [
      { title: 'Fee Management & Invoicing', desc: 'Configure fee structures, payment gateways, and automated invoicing.' },
      { title: 'HR & Payroll Integration', desc: 'Manage staff records, attendance, leave, and payroll processing.' },
      { title: 'Timetable & Schedule Management', desc: 'Create and manage class schedules, room assignments, and resource allocation.' },
      { title: 'Inventory & Asset Management', desc: 'Track institutional assets, equipment, and inventory.' },
    ],
  },
  {
    title: 'Security & Compliance', icon: Shield, color: '#7C3AED', articles: [
      { title: 'Data Privacy & GDPR Compliance', desc: 'Understanding data protection features and compliance configuration.' },
      { title: 'Two-Factor Authentication Setup', desc: 'Enabling and configuring 2FA for enhanced account security.' },
      { title: 'Audit Trail & Activity Logs', desc: 'Monitoring user activity, changes, and system events.' },
      { title: 'Data Backup & Recovery', desc: 'Automated backup schedules, retention policies, and restoration procedures.' },
    ],
  },
  {
    title: 'AI & Automation', icon: Zap, color: '#6D28D9', articles: [
      { title: 'Prerana AI Overview & Capabilities', desc: 'Introduction to AI-powered features including automation, analytics, and recommendations.' },
      { title: 'Automated Workflow Rules', desc: 'Creating if-then automation rules for notifications, assignments, and approvals.' },
      { title: 'AI-Powered Analytics Dashboards', desc: 'Configuring intelligent dashboards with predictive insights.' },
      { title: 'Smart Recommendations Engine', desc: 'How AI recommends courses, resources, and interventions for students.' },
    ],
  },
];

const popularTags = [
  'Getting Started', 'Attendance', 'Grades', 'Exams', 'Fees', 'Timetable', 'Reports',
  'API Integration', 'Security', 'AI Features', 'Mobile App', 'Parent Portal',
];

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SiteShell>
      <PageMain>
        <section className="relative overflow-hidden px-4 pt-20 pb-10 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-[#6D4CFF]/8 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-[#8B5CF6]/10 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E8E0FF] bg-white/80 px-4 py-2 text-sm font-extrabold text-[#4F2DB8] shadow-sm">
                <BookOpenText className="h-4 w-4 text-[#A855F7]" />
                Knowledge Base
              </div>
              <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Searchable Knowledge Base
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Find answers to common questions, troubleshooting guides, and detailed articles about every feature in Prasynx Education OS.
              </p>
              <div className="relative mx-auto mt-8 max-w-xl">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search for answers, features, guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-[#E2E8F0] bg-white/90 py-4 pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#6C4CF1] focus:ring-4 focus:ring-[#F3F0FF] shadow-sm"
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-bold text-slate-400">Popular:</span>
                {popularTags.slice(0, 5).map((tag) => (
                  <button key={tag} onClick={() => setSearchQuery(tag)}
                    className="rounded-full border border-[#E2E8F0] bg-white/70 px-3 py-1 text-[11px] font-bold text-slate-600 transition hover:border-[#6C4CF1] hover:text-[#6C4CF1]">
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <PageSection>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.div key={cat.title} {...stagger}>
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: `${cat.color}15`, color: cat.color }}>
                      <Icon size={18} />
                    </span>
                    <h2 className="text-sm font-black text-slate-950">{cat.title}</h2>
                  </div>
                  <div className="space-y-2">
                    {cat.articles.map((article) => (
                      <Link key={article.title} href="#"
                        className="group flex items-start gap-2 rounded-xl border border-transparent px-3 py-2.5 transition hover:border-[#E8E0FF] hover:bg-white hover:shadow-sm">
                        <FileText size={14} className="mt-0.5 shrink-0 text-slate-300 transition group-hover:text-[#6C4CF1]" />
                        <div>
                          <h3 className="text-xs font-bold text-slate-950 transition group-hover:text-[#6C4CF1]">{article.title}</h3>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{article.desc}</p>
                        </div>
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
            eyebrow="Still Stuck?"
            title="Can't Find What You're Looking For?"
            description="Our support team is ready to help with any question you have."
          />
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/resources/help-center"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6C4CF1] to-[#8B5CF6] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
              <HelpCircle size={16} /> Visit Help Center
            </Link>
            <Link href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-[#6C4CF1] hover:text-[#6C4CF1]">
              Contact Support
            </Link>
          </div>
        </PageSection>
      </PageMain>
    </SiteShell>
  );
}
