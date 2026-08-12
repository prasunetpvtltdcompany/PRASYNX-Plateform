"use client";
import { Trophy, ArrowRight, ChevronRight, Star, Quote, Building2, Users, TrendingUp, Award, BookOpen, BarChart3, Globe, Heart } from 'lucide-react';
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

const cases = [
  {
    institution: 'Delhi Public School Group',
    type: 'School Chain (12 campuses)',
    challenge: 'Managing 12 campuses with separate systems, inconsistent student records, and no unified parent communication platform.',
    solution: 'Implemented Prasynx Education OS across all campuses with multi-tenant configuration, centralized admin dashboard, and unified parent portal.',
    results: [
      { metric: 'Administrative Efficiency', value: '74%', change: 'increase' },
      { metric: 'Parent Engagement', value: '89%', change: 'increase' },
      { metric: 'Data Entry Errors', value: '92%', change: 'decrease' },
    ],
    quote: 'Prasynx transformed how we operate. We now have real-time visibility into all 12 campuses from a single dashboard.',
    quotee: 'Principal, Delhi Public School Group',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&h=400&fit=crop',
    logo: 'DPS',
  },
  {
    institution: 'Mumbai University College of Engineering',
    type: 'Engineering College (8,000+ students)',
    challenge: 'Outdated legacy system unable to handle growing student population, manual attendance and grade management causing delays.',
    solution: 'Deployed full Prasynx suite including automated attendance, digital gradebook, exam management, and student portal with AI analytics.',
    results: [
      { metric: 'Grade Processing Time', value: '85%', change: 'decrease' },
      { metric: 'Attendance Accuracy', value: '99.5%', change: 'increase' },
      { metric: 'Student Satisfaction', value: '4.6/5', change: 'increase' },
    ],
    quote: 'The AI analytics module has been a game-changer. We can now identify at-risk students early and provide timely intervention.',
    quotee: 'Dean of Academics, MUCE',
    image: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=600&h=400&fit=crop',
    logo: 'MUCE',
  },
  {
    institution: 'Oakridge International Schools',
    type: 'International School (3 countries)',
    challenge: 'Need for a standardized platform across three countries with different curricula, grading systems, and regulatory requirements.',
    solution: 'Multi-tenant deployment with curriculum-specific configurations, localized payment gateways, and multilingual parent portal.',
    results: [
      { metric: 'Cross-Campus Collaboration', value: '3x', change: 'increase' },
      { metric: 'Fee Collection Rate', value: '96%', change: 'increase' },
      { metric: 'Staff Productivity', value: '65%', change: 'increase' },
    ],
    quote: 'Having a single platform that adapts to different curricula while maintaining consistency is exactly what we needed.',
    quotee: 'Director of Operations, Oakridge International',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&h=400&fit=crop',
    logo: 'OIS',
  },
];

const stats = [
  { icon: Building2, value: '500+', label: 'Institutions' },
  { icon: Users, value: '2M+', label: 'Active Users' },
  { icon: Globe, value: '15+', label: 'Countries' },
  { icon: Award, value: '99.97%', label: 'Uptime' },
];

export default function CaseStudiesPage() {
  return (
    <SiteShell>
      <PageMain>
        <section className="relative overflow-hidden px-4 pt-20 pb-10 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/3 top-0 h-96 w-96 rounded-full bg-[#6D4CFF]/8 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-amber-500/8 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E8E0FF] bg-white/80 px-4 py-2 text-sm font-extrabold text-[#4F2DB8] shadow-sm">
                <Trophy className="h-4 w-4 text-[#A855F7]" />
                Case Studies
              </div>
              <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Success Stories from Leading Institutions
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Discover how educational institutions around the world are transforming their operations with the Prasynx Education OS.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label}
                    className="text-center rounded-2xl border border-[#E2E8F0] bg-white/80 p-5 shadow-sm">
                    <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#6C4CF1] to-[#A855F7] text-white">
                      <Icon size={18} />
                    </span>
                    <div className="mt-3 text-2xl font-black text-slate-950">{stat.value}</div>
                    <div className="text-xs font-bold text-slate-500">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <PageSection>
          <div className="space-y-10">
            {cases.map((study, i) => (
              <motion.div key={study.institution} {...stagger}
                className="group relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-lg transition hover:shadow-xl hover:-translate-y-1">
                <div className="grid lg:grid-cols-5">
                  <div className="relative h-56 lg:h-full lg:col-span-2 min-h-[250px] overflow-hidden">
                    <img src={study.image} alt={study.institution} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="inline-block rounded-full bg-white/90 px-4 py-2 text-sm font-black text-slate-900 backdrop-blur">{study.logo}</div>
                    </div>
                  </div>
                  <div className="p-6 lg:p-8 lg:col-span-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#6C4CF1] mb-2">
                      <Building2 size={14} /> {study.type}
                    </div>
                    <h2 className="text-xl font-black text-slate-950">{study.institution}</h2>

                    <div className="mt-4 space-y-3">
                      <div>
                        <h3 className="text-xs font-black text-slate-700">Challenge</h3>
                        <p className="text-sm leading-relaxed text-slate-600">{study.challenge}</p>
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-700">Solution</h3>
                        <p className="text-sm leading-relaxed text-slate-600">{study.solution}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      {study.results.map((r) => (
                        <div key={r.metric} className="rounded-xl bg-[#F3F0FF] p-3 text-center">
                          <div className="text-lg font-black text-[#6C4CF1]">{r.value}</div>
                          <div className="text-[10px] font-bold text-slate-600">{r.metric}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 border-t border-[#F1F5F9] pt-4">
                      <div className="flex items-start gap-2">
                        <Quote size={16} className="shrink-0 text-[#6C4CF1]" />
                        <div>
                          <p className="text-sm italic leading-relaxed text-slate-600">{study.quote}</p>
                          <p className="mt-1 text-xs font-bold text-slate-400">— {study.quotee}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </PageSection>

        <PageSection tone="soft">
          <SectionHeader
            eyebrow="Testimonials"
            title="What Our Customers Say"
            description="Hear directly from education leaders about their experience with Prasynx."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Dr. Suresh Kumar', role: 'Director, VIT University', text: 'Prasynx has streamlined our entire academic management process. The AI analytics module is truly revolutionary for student assessment.', rating: 5 },
              { name: 'Anita Desai', role: 'Principal, Ryan International', text: 'The parent engagement features have dramatically improved communication between teachers and parents. Our parent satisfaction scores went up by 40%.', rating: 5 },
              { name: 'Rajiv Mehta', role: 'CEO, Education Trust Group', text: 'Managing 8 schools under one platform seemed impossible until we found Prasynx. The multi-tenant architecture is flawless.', rating: 5 },
            ].map((t) => (
              <div key={t.name}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-6 transition hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="mt-3 text-sm italic leading-relaxed text-slate-600">"{t.text}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <img src={`https://i.pravatar.cc/40?img=${Math.floor(Math.random() * 70)}`} alt="" className="h-10 w-10 rounded-full" />
                  <div>
                    <p className="text-xs font-bold text-slate-950">{t.name}</p>
                    <p className="text-[10px] font-bold text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PageSection>

        <CtaBand
          title="Be Our Next Success Story"
          description="Ready to transform your institution? Join 500+ educational organizations already using Prasynx Education OS."
          href="/book-demo"
          action="Book a Demo"
        />
      </PageMain>
    </SiteShell>
  );
}
