"use client";
import { BookCopy, Play, Clock, BarChart3, Users, GraduationCap, Settings, Shield, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SiteShell from '../../components/SiteShell';
import { PageMain, PageSection, SectionHeader, CtaBand, FeatureCard } from '../../components/MarketingSections';

const stagger = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-30px' },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
};

const tutorials = [
  {
    level: 'Beginner', icon: Star, color: '#6C4CF1', lessons: [
      { title: 'Welcome to Prasynx Platform Tour', duration: '5 min', desc: 'A quick walkthrough of the entire platform interface and key modules.' },
      { title: 'Setting Up Your Institution Profile', duration: '8 min', desc: 'Configure your institution name, logo, address, and academic calendar.' },
      { title: 'Adding Users: Students & Staff', duration: '10 min', desc: 'Step-by-step guide to importing or manually adding users to the system.' },
      { title: 'Creating Your First Course', duration: '7 min', desc: 'Set up a course with syllabus, schedule, and enrollment settings.' },
    ],
  },
  {
    level: 'Intermediate', icon: BarChart3, color: '#8B5CF6', lessons: [
      { title: 'Automated Attendance Tracking', duration: '12 min', desc: 'Configure QR code, biometric, and manual attendance modes.' },
      { title: 'Exam Scheduling & Grade Management', duration: '15 min', desc: 'Create exams, assign invigilators, publish results, and generate reports.' },
      { title: 'Parent-Teacher Communication Setup', duration: '10 min', desc: 'Enable messaging, notifications, and meeting scheduling for parents.' },
      { title: 'Custom Report Builder Walkthrough', duration: '18 min', desc: 'Design custom academic and administrative reports with drag-and-drop.' },
    ],
  },
  {
    level: 'Advanced', icon: Settings, color: '#A855F7', lessons: [
      { title: 'Multi-Tenant Configuration', duration: '20 min', desc: 'Manage multiple branches or campuses under one Prasynx instance.' },
      { title: 'API Integration with External LMS', duration: '25 min', desc: 'Connect Prasynx to Moodle, Canvas, or Blackboard via REST APIs.' },
      { title: 'Advanced Analytics Dashboard Setup', duration: '15 min', desc: 'Configure real-time analytics, KPIs, and custom data visualizations.' },
      { title: 'Workflow Automation with Prerana AI', duration: '22 min', desc: 'Set up automated notifications, alerts, and triggered actions.' },
    ],
  },
  {
    level: 'Admin & Security', icon: Shield, color: '#4F2DB8', lessons: [
      { title: 'Role & Permission Configuration', duration: '12 min', desc: 'Define custom roles with granular permission sets for all user types.' },
      { title: 'Data Backup & Disaster Recovery', duration: '10 min', desc: 'Configure automated backup schedules and test restoration procedures.' },
      { title: 'SSO & Identity Provider Setup', duration: '18 min', desc: 'Integrate SAML, OAuth 2.0, or LDAP for single sign-on.' },
      { title: 'GDPR & Data Privacy Compliance', duration: '14 min', desc: 'Configure privacy settings, consent management, and data retention policies.' },
    ],
  },
];

const featured = [
  { icon: Users, title: 'Student Onboarding Best Practices', duration: '15 min', author: 'Product Team', views: '3.2k' },
  { icon: GraduationCap, title: 'Complete Gradebook Mastery', duration: '25 min', author: 'Education Team', views: '2.8k' },
  { icon: BookCopy, title: 'Mobile App for Parents Guide', duration: '8 min', author: 'UX Team', views: '4.1k' },
];

export default function TutorialsPage() {
  return (
    <SiteShell>
      <PageMain>
        <section className="relative overflow-hidden px-4 pt-20 pb-10 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-1/3 top-0 h-80 w-80 rounded-full bg-[#8B5CF6]/10 blur-3xl" />
            <div className="absolute left-0 bottom-0 h-64 w-64 rounded-full bg-[#6C4CF1]/12 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E8E0FF] bg-white/80 px-4 py-2 text-sm font-extrabold text-[#4F2DB8] shadow-sm">
                <Play className="h-4 w-4 text-[#A855F7]" />
                Video Tutorials & Guides
              </div>
              <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Step-by-Step Tutorials
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Learn how to use every feature of the Prasynx Education OS with our comprehensive library of video tutorials, walkthroughs, and guides.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-6 rounded-2xl border border-[#E2E8F0] bg-white/80 px-6 py-3 shadow-sm">
                  <div className="text-center">
                    <div className="text-2xl font-black text-[#6C4CF1]">50+</div>
                    <div className="text-[10px] font-bold text-slate-500">Tutorials</div>
                  </div>
                  <div className="h-8 w-px bg-[#E2E8F0]" />
                  <div className="text-center">
                    <div className="text-2xl font-black text-[#6C4CF1]">12h</div>
                    <div className="text-[10px] font-bold text-slate-500">Content</div>
                  </div>
                  <div className="h-8 w-px bg-[#E2E8F0]" />
                  <div className="text-center">
                    <div className="text-2xl font-black text-[#6C4CF1]">4.8</div>
                    <div className="text-[10px] font-bold text-slate-500">Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PageSection>
          <div className="space-y-10">
            {tutorials.map((group) => {
              const Icon = group.icon;
              return (
                <motion.div key={group.level} {...stagger}>
                  <div className="mb-5 flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: `${group.color}15`, color: group.color }}>
                      <Icon size={18} />
                    </span>
                    <div>
                      <h2 className="text-base font-black text-slate-950">{group.level} Tutorials</h2>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {group.lessons.map((lesson) => (
                      <div key={lesson.title}
                        className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 transition hover:border-[#E8E0FF] hover:shadow-lg hover:shadow-[#6D4CFF]/5 hover:-translate-y-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#F3F0FF] text-[#6C4CF1]">
                            <Play size={14} />
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <Clock size={10} /> {lesson.duration}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-950">{lesson.title}</h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{lesson.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </PageSection>

        <PageSection tone="soft">
          <SectionHeader
            eyebrow="Featured"
            title="Most Popular Tutorials"
            description="Start with these top-rated tutorials that other institutions find most valuable."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {featured.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title}
                  className="group rounded-2xl border border-[#E2E8F0] bg-white p-6 transition hover:border-[#E8E0FF] hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#F3F0FF] text-[#6C4CF1]">
                      <Icon size={16} />
                    </span>
                    <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-bold text-[#92400E]">Featured</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mb-2">
                    <Clock size={10} /> {item.duration} <span className="mx-1">·</span> {item.views} views
                  </div>
                  <h3 className="text-sm font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">By {item.author}</p>
                </div>
              );
            })}
          </div>
        </PageSection>

        <CtaBand
          title="Request a Custom Tutorial"
          description="Need training for your specific workflow? Our education team can create customized tutorials for your institution."
          href="/contact"
          action="Request Tutorial"
        />
      </PageMain>
    </SiteShell>
  );
}
