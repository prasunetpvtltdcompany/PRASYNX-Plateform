"use client";
import { BookOpen, Code2, Headphones, Activity, FileText, Wrench, Users, Monitor, Newspaper, Trophy, Radio, BookCopy, BookMarked, BookOpenText, MessageCircle, LifeBuoy, ArrowRight, Sparkles, Star, Zap, Shield, Search, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SiteShell from '../components/SiteShell';
import { PageMain, PageSection, SectionHeader, CtaBand } from '../components/MarketingSections';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
};

const resourceGroups = [
  {
    title: 'Learn', color: '#6C4CF1', icon: BookOpen,
    resources: [
      { href: '/resources/documentation', label: 'Documentation', icon: BookMarked, desc: 'Guides, SDKs & integration documentation for the full platform.' },
      { href: '/resources/tutorials', label: 'Tutorials', icon: BookCopy, desc: 'Step-by-step video tutorials and walkthroughs for every feature.' },
      { href: '/resources/knowledge-base', label: 'Knowledge Base', icon: BookOpenText, desc: 'Searchable library of articles, FAQs, and troubleshooting guides.' },
    ],
  },
  {
    title: 'Support', color: '#8B5CF6', icon: Headphones,
    resources: [
      { href: '/resources/help-center', label: 'Help Center', icon: LifeBuoy, desc: 'FAQs, ticket system, live chat, and phone support options.' },
      { href: '/resources/status', label: 'System Status', icon: Activity, desc: 'Real-time platform health monitoring and incident history.' },
    ],
  },
  {
    title: 'Developers', color: '#A855F7', icon: Code2,
    resources: [
      { href: '/resources/api-reference', label: 'API Reference', icon: Code2, desc: 'Complete REST API documentation with endpoints and examples.' },
      { href: '/resources/releases', label: 'Release Notes', icon: Wrench, desc: 'Product updates, changelog, and upcoming roadmap.' },
    ],
  },
  {
    title: 'Community', color: '#4F2DB8', icon: Users,
    resources: [
      { href: '/resources/community', label: 'Community', icon: MessageCircle, desc: 'Forums, user groups, events, and discussion boards.' },
      { href: '/resources/webinars', label: 'Webinars', icon: Monitor, desc: 'Live and on-demand webinar sessions and training.' },
    ],
  },
  {
    title: 'Insights', color: '#7C3AED', icon: Star,
    resources: [
      { href: '/resources/blog', label: 'Blog', icon: Newspaper, desc: 'Product insights, education technology articles, and updates.' },
      { href: '/resources/case-studies', label: 'Case Studies', icon: Trophy, desc: 'Real success stories from institutions using Prasynx.' },
      { href: '/resources/research', label: 'Research Hub', icon: Radio, desc: 'Whitepapers, research papers, and technical reports.' },
    ],
  },
];

const quickActions = [
  { icon: Search, label: 'Search Knowledge Base', href: '/resources/knowledge-base', desc: 'Find answers fast' },
  { icon: LifeBuoy, label: 'Get Help', href: '/resources/help-center', desc: 'Contact support' },
  { icon: Code2, label: 'API Docs', href: '/resources/api-reference', desc: 'Developer resources' },
  { icon: Activity, label: 'System Status', href: '/resources/status', desc: 'Check platform health' },
];

export default function Resources() {
  return (
    <SiteShell>
      <PageMain>
        <section className="relative overflow-hidden px-4 pt-20 pb-10 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-[#6C4CF1]/10 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-[#A855F7]/12 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E8E0FF] bg-white/80 px-4 py-2 text-sm font-extrabold text-[#4F2DB8] shadow-sm">
                <Sparkles className="h-4 w-4 text-[#A855F7]" />
                Resource Center
              </div>
              <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Everything You Need to Succeed with Prasynx
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Explore documentation, tutorials, support options, developer resources, community forums, and research — all in one place.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="#browse"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6C4CF1] to-[#8B5CF6] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
                  Browse All Resources <ArrowRight size={16} />
                </Link>
                <Link href="/resources/help-center"
                  className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white/80 px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-[#6C4CF1] hover:text-[#6C4CF1]">
                  Get Help Now
                </Link>
              </div>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.href}
                    className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white/80 px-5 py-4 shadow-sm transition hover:border-[#E8E0FF] hover:bg-[#F3F0FF]">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F3F0FF] text-[#6C4CF1]">
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-950">{action.label}</p>
                      <p className="text-[11px] font-semibold text-slate-400">{action.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <PageSection id="browse">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {resourceGroups.map((group) => {
              const Icon = group.icon;
              return (
                <motion.div key={group.title} {...fadeUp}>
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="grid h-9 w-9 place-items-center rounded-xl"
                      style={{ background: `${group.color}15`, color: group.color }}>
                      <Icon size={18} />
                    </span>
                    <h2 className="text-sm font-black text-slate-950">{group.title}</h2>
                  </div>
                  <div className="space-y-2">
                    {group.resources.map((res) => {
                      const RIcon = res.icon;
                      return (
                        <Link key={res.label} href={res.href}
                          className="group block rounded-xl border border-transparent px-3 py-3 transition hover:border-[#E8E0FF] hover:bg-white hover:shadow-sm">
                          <div className="flex items-start gap-2.5">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#F1F5F9] text-[#6C4CF1] transition group-hover:bg-[#6C4CF1] group-hover:text-white">
                              <RIcon size={14} />
                            </span>
                            <div className="min-w-0">
                              <h3 className="text-xs font-bold text-slate-950 transition group-hover:text-[#6C4CF1]">{res.label}</h3>
                              <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">{res.desc}</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </PageSection>

        <PageSection tone="soft">
          <SectionHeader
            eyebrow="Popular"
            title="Most Visited Resources"
            description="Quick links to the most popular resources for our users."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BookMarked, title: 'Getting Started Guide', count: '12.4k visits', href: '/resources/documentation' },
              { icon: Code2, title: 'REST API Reference', count: '9.8k visits', href: '/resources/api-reference' },
              { icon: LifeBuoy, title: 'Help Center', count: '8.2k visits', href: '/resources/help-center' },
              { icon: BookCopy, title: 'Video Tutorials', count: '7.6k visits', href: '/resources/tutorials' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href}
                  className="group flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-5 transition hover:border-[#E8E0FF] hover:shadow-lg hover:-translate-y-1">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F3F0FF] text-[#6C4CF1] transition group-hover:bg-[#6C4CF1] group-hover:text-white">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-950">{item.title}</p>
                    <p className="text-[10px] font-bold text-slate-400">{item.count}</p>
                  </div>
                  <ArrowUpRight size={14} className="ml-auto shrink-0 text-slate-300 transition group-hover:text-[#6C4CF1]" />
                </Link>
              );
            })}
          </div>
        </PageSection>

        <CtaBand
          title="Can't Find What You Need?"
          description="Our support team is ready to help you find the right resources or answer your questions directly."
          href="/resources/help-center"
          action="Contact Support"
        />
      </PageMain>
    </SiteShell>
  );
}
