"use client";
import { Radio, ArrowRight, ChevronRight, FileText, Download, BookOpen, Zap, Users, Globe, Star, BarChart3, Award, Eye, Clock, TrendingUp, Microscope, Dna, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SiteShell from '../../components/SiteShell';
import { PageMain, PageSection, SectionHeader, FeatureCard, CtaBand } from '../../components/MarketingSections';

const stagger = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-30px' },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
};

const researchPapers = [
  {
    title: 'AI-Driven Predictive Analytics for Student Performance',
    authors: 'Dr. Mehta, Dr. Sharma, Dr. Patel',
    abstract: 'This paper explores how machine learning models can predict student academic outcomes with 94% accuracy, enabling early intervention strategies.',
    date: 'May 2026', category: 'AI & Machine Learning', downloads: '2,400', citations: '18',
  },
  {
    title: 'Multi-Tenant Architecture in Educational Platforms',
    authors: 'Verma, Singh, Reddy',
    abstract: 'A comprehensive analysis of multi-tenant design patterns for education management systems, including data isolation, scalability, and performance benchmarks.',
    date: 'April 2026', category: 'Platform Engineering', downloads: '1,800', citations: '12',
  },
  {
    title: 'The Impact of Real-Time Parent Engagement on Student Success',
    authors: 'Dr. Mitchell, Dr. Kumar',
    abstract: 'A longitudinal study across 50 institutions showing that real-time parent engagement tools improve student attendance by 23% and grades by 18%.',
    date: 'March 2026', category: 'Education Research', downloads: '3,100', citations: '24',
  },
  {
    title: 'Blockchain for Academic Credential Verification',
    authors: 'Patel, Joshi, Williams',
    abstract: 'Proposing a decentralized framework for issuing and verifying academic credentials using blockchain technology, reducing fraud and verification time.',
    date: 'February 2026', category: 'Emerging Tech', downloads: '1,600', citations: '9',
  },
  {
    title: 'Automated Attendance Systems: A Comparative Study',
    authors: 'Reddy, Dr. Singh',
    abstract: 'Comparing QR code, biometric, RFID, and AI-based facial recognition attendance systems across 30 institutions for accuracy, speed, and user satisfaction.',
    date: 'January 2026', category: 'Product Research', downloads: '2,100', citations: '15',
  },
  {
    title: 'Privacy-Preserving Analytics in Education Data',
    authors: 'Dr. Chen, Sharma, Gupta',
    abstract: 'Techniques for performing analytics on sensitive student data while maintaining privacy compliance with GDPR, FERPA, and other regulations.',
    date: 'December 2025', category: 'Security & Privacy', downloads: '1,400', citations: '21',
  },
];

const categories = Array.from(new Set(researchPapers.map((r) => r.category)));

export default function ResearchPage() {
  return (
    <SiteShell>
      <PageMain>
        <section className="relative overflow-hidden px-4 pt-20 pb-10 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-[#6D4CFF]/8 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-[#A855F7]/10 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E8E0FF] bg-white/80 px-4 py-2 text-sm font-extrabold text-[#4F2DB8] shadow-sm">
                <Radio className="h-4 w-4 text-[#A855F7]" />
                Research Hub
              </div>
              <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Research & Innovation Hub
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Explore whitepapers, research papers, and technical reports from the Prasynx research team. We are advancing education technology through rigorous research and innovation.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="#papers"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6C4CF1] to-[#8B5CF6] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
                  <BookOpen size={16} /> Browse Papers
                </Link>
                <Link href="#"
                  className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white/80 px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-[#6C4CF1] hover:text-[#6C4CF1]">
                  <Download size={16} /> Download All Research
                </Link>
              </div>
              <div className="mt-6 flex items-center justify-center gap-6">
                <div className="flex items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white/80 px-6 py-3 shadow-sm">
                  <div className="text-center">
                    <div className="text-xl font-black text-[#6C4CF1]">24</div>
                    <div className="text-[9px] font-bold text-slate-500">Research Papers</div>
                  </div>
                  <div className="h-8 w-px bg-[#E2E8F0]" />
                  <div className="text-center">
                    <div className="text-xl font-black text-[#6C4CF1]">12</div>
                    <div className="text-[9px] font-bold text-slate-500">Whitepapers</div>
                  </div>
                  <div className="h-8 w-px bg-[#E2E8F0]" />
                  <div className="text-center">
                    <div className="text-xl font-black text-[#6C4CF1]">450+</div>
                    <div className="text-[9px] font-bold text-slate-500">Citations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PageSection id="papers">
          <SectionHeader
            eyebrow="Research"
            title="Latest Research Papers"
            description="Our latest publications covering AI in education, platform architecture, security, and emerging technologies."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {researchPapers.map((paper) => (
              <motion.div key={paper.title} {...stagger}
                className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 transition hover:border-[#E8E0FF] hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-full bg-[#F3F0FF] px-2.5 py-0.5 text-[9px] font-bold text-[#6C4CF1]">{paper.category}</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <Clock size={10} /> {paper.date}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-950">{paper.title}</h3>
                <p className="mt-1 text-xs text-slate-400">{paper.authors}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{paper.abstract}</p>
                <div className="mt-4 flex items-center justify-between border-t border-[#F1F5F9] pt-3">
                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                    <span className="flex items-center gap-1"><Download size={10} /> {paper.downloads}</span>
                    <span className="flex items-center gap-1"><Award size={10} /> {paper.citations} citations</span>
                  </div>
                  <Link href="#"
                    className="flex items-center gap-1 text-[10px] font-bold text-[#6C4CF1] transition hover:text-[#4F2DB8]">
                    Read <ArrowRight size={10} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </PageSection>

        <PageSection tone="soft">
          <SectionHeader
            eyebrow="Whitepapers"
            title="Featured Whitepapers"
            description="In-depth technical reports and industry analysis from the Prasynx research team."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Microscope, title: 'The Future of Education Technology 2026', desc: 'Comprehensive analysis of emerging trends including AI tutors, blockchain credentials, and immersive learning environments.', pages: '45', href: '#' },
              { icon: Dna, title: 'Building Scalable Education Platforms', desc: 'Technical whitepaper on microservices architecture, data partitioning, and multi-tenant design for education systems.', pages: '38', href: '#' },
              { icon: Lightbulb, title: 'AI Ethics in Educational Data Mining', desc: 'A framework for responsible AI use in education, covering bias mitigation, transparency, and student data rights.', pages: '52', href: '#' },
            ].map((wp) => {
              const Icon = wp.icon;
              return (
                <div key={wp.title}
                  className="group rounded-2xl border border-[#E2E8F0] bg-white p-6 transition hover:border-[#E8E0FF] hover:shadow-lg hover:-translate-y-1">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#6C4CF1] to-[#A855F7] text-white">
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-slate-950">{wp.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">{wp.desc}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">{wp.pages} pages</span>
                    <Link href={wp.href}
                      className="flex items-center gap-1 text-[10px] font-bold text-[#6C4CF1] transition hover:text-[#4F2DB8]">
                      Download <Download size={10} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </PageSection>

        <PageSection>
          <SectionHeader
            eyebrow="Categories"
            title="Research Categories"
            description="Explore research by area of focus."
          />
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <Link key={cat} href="#"
                className="rounded-full border border-[#E2E8F0] bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:border-[#6C4CF1] hover:bg-[#F3F0FF] hover:text-[#6C4CF1]">
                {cat}
              </Link>
            ))}
          </div>
        </PageSection>

        <CtaBand
          title="Collaborate With Our Research Team"
          description="Interested in partnering on research? We welcome collaboration with academic institutions and research organizations."
          href="/contact"
          action="Propose Collaboration"
        />
      </PageMain>
    </SiteShell>
  );
}
