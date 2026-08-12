'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, ChevronDown, Copy, Check, Download, Search, Shield, FileText,
  Lock, Eye, Sparkles, Users, BookOpen, Briefcase, GraduationCap,
  Globe, Printer, Clock, ExternalLink, Mail,
  CheckCircle, XCircle, Award,
} from 'lucide-react';
import SiteShell from '../components/SiteShell';

const P = '#7C3AED';

const sections = [
  { id: 'acceptance', title: '1. Acceptance of Terms' },
  { id: 'eligibility', title: '2. User Eligibility' },
  { id: 'account', title: '3. Account Responsibilities' },
  { id: 'usage', title: '4. Platform Usage' },
  { id: 'student', title: '5. Student Portal Terms' },
  { id: 'parent', title: '6. Parent Portal Terms' },
  { id: 'staff', title: '7. Staff Portal Terms' },
  { id: 'job-provider', title: '8. Job Provider Terms' },
  { id: 'admin', title: '9. Admin Portal Terms' },
  { id: 'prerana-ai', title: '10. Prerana AI Usage Policy' },
  { id: 'privacy', title: '11. Privacy & Data Security' },
  { id: 'intellectual', title: '12. Intellectual Property' },
  { id: 'payment', title: '13. Payment & Subscription' },
  { id: 'termination', title: '14. Termination' },
  { id: 'liability', title: '15. Limitation of Liability' },
  { id: 'contact-info', title: '16. Contact Information' },
];

const content: Record<string, { body: string[]; items?: string[]; restrictions?: string[] }> = {
  acceptance: {
    body: [
      'By accessing, browsing, or using the Prasynx platform, including all interconnected portals (Student, Parent, Staff, Job Provider, Admin) and Prerana AI services, you acknowledge that you have read, understood, and agree to be bound by these legally binding Terms & Conditions.',
      'If you are accepting these terms on behalf of an educational institution, organization, or legal entity, you represent and warrant that you have the authority to bind that entity to these terms. If you do not agree with any provision, you must not access or use the platform.',
      'Prasynx reserves the right to update or modify these terms at any time. Material changes will be communicated via email or platform notification. Continued use after changes constitutes acceptance of the revised terms.',
    ],
  },
  eligibility: {
    body: [
      'Prasynx services are available to educational institutions, students, parents, educators, recruiters, and administrators who meet the eligibility criteria defined herein.',
      'Users must be at least 13 years of age. Users under 18 must have parental or institutional consent. Institutions must be legally recognized educational entities.',
      'Prasynx reserves the right to verify eligibility and deny service to any entity or individual that does not meet these criteria or violates any applicable law.',
    ],
  },
  account: {
    body: [
      'You are responsible for maintaining the confidentiality of your account credentials, including passwords, access tokens, and multi-factor authentication devices.',
      'All activities occurring under your account are your responsibility. You must notify Prasynx immediately of any unauthorized use or security breach.',
      'You may not share your account with third parties. Institutional accounts may have designated administrators who manage sub-accounts for students, staff, and other stakeholders.',
    ],
  },
  usage: {
    body: [
      'Prasynx grants you a limited, non-exclusive, non-transferable, revocable license to access and use the platform in accordance with these terms and your subscription plan.',
      'You agree not to misuse the platform, including attempting to circumvent access controls, reverse engineer any component, or use the platform for any unlawful purpose.',
    ],
    items: [
      'Interfering with or disrupting platform services, servers, or networks',
      'Attempting to gain unauthorized access to any system or user account',
      'Data mining, scraping, or extracting content without written permission',
      'Transmitting malware, viruses, or any harmful code',
      'Violating any applicable local, national, or international law',
    ],
  },
  student: {
    body: [
      'The Student Portal provides access to academic resources, including course materials, assignments, assessments, attendance records, grades, scholarships, internships, and career guidance.',
      'Students must use the portal responsibly and respect intellectual property rights of educational content provided through the platform.',
      'Academic integrity is expected. Plagiarism, cheating, or misuse of AI-powered learning tools violates these terms and may result in account suspension.',
    ],
  },
  parent: {
    body: [
      "The Parent Portal allows guardians to monitor their child's academic progress, attendance, fee payments, and communicate with educators.",
      'Parents may only access data related to their enrolled children. Access to other students\' data is strictly prohibited.',
      'Fee payment transactions processed through the portal are subject to additional terms provided at the point of payment.',
    ],
  },
  staff: {
    body: [
      'The Staff Portal empowers educators with tools for lesson planning, attendance management, assessment creation, grading, and student analytics.',
      'Staff are responsible for maintaining the accuracy of academic records and grades entered into the system.',
      'Use of AI-assisted teaching tools must align with institutional policies and educational best practices.',
    ],
  },
  'job-provider': {
    body: [
      'The Job Provider Portal enables recruiters to post job opportunities, search for candidates, manage applications, and utilize AI-powered recruitment tools.',
      'Job providers must post accurate and lawful job descriptions. Discriminatory hiring practices are strictly prohibited.',
      'Candidate data accessed through the platform may only be used for legitimate recruitment purposes and must be handled in compliance with applicable data protection laws.',
    ],
  },
  admin: {
    body: [
      'The Admin Portal provides institutional administrators with comprehensive management capabilities, including user management, security controls, compliance monitoring, and analytics.',
      'Administrators are responsible for configuring role-based access controls appropriate to their institution\'s organizational structure.',
      'Audit logs and monitoring features must be used in accordance with institutional privacy policies and applicable regulations.',
    ],
  },
  'prerana-ai': {
    body: [
      'Prerana AI is an intelligent platform assistant that provides personalized recommendations, proactive insights, and conversational support across all Prasynx portals.',
      'Users must use Prerana AI responsibly and in accordance with these guidelines. AI-generated content should be reviewed before use in academic or professional contexts.',
    ],
    items: [
      'Educational Assistance: Personalized learning recommendations, study plans, and academic guidance',
      'Recruitment Assistance: AI-powered candidate matching, resume screening, and hiring insights',
      'Administrative Support: Automated workflows, data analysis, and operational recommendations',
      'Content Generation: AI-assisted creation of educational materials within institutional guidelines',
    ],
    restrictions: [
      'Illegal Activities: Using Prerana AI for any unlawful purpose or to generate prohibited content',
      'Harmful Content: Generating discriminatory, harassing, or otherwise harmful material',
      'Unauthorized Access: Attempting to use AI to bypass security controls or access restricted data',
      'Data Misuse: Using AI to process personal data in ways that violate privacy regulations',
    ],
  },
  privacy: {
    body: [
      'Prasynx is committed to protecting your privacy. Our data handling practices comply with GDPR, FERPA, COPPA, and other applicable privacy regulations.',
      'We implement industry-standard encryption, access controls, and security measures to protect your data. Personal information is only collected, processed, and stored as necessary to provide our services.',
      'For detailed information about our data practices, please refer to our separate Privacy Policy. Data processing agreements are available upon request for institutional subscribers.',
    ],
  },
  intellectual: {
    body: [
      'The Prasynx platform, including its software, design, branding, content, and proprietary algorithms, is protected by intellectual property laws. All rights not expressly granted are reserved.',
      'Users retain ownership of content they upload to the platform. By uploading content, you grant Prasynx a license to host, process, and display that content as necessary to provide our services.',
      'You may not reproduce, distribute, modify, or create derivative works of Prasynx intellectual property without explicit written permission.',
    ],
  },
  payment: {
    body: [
      'Subscription fees, payment terms, and billing cycles are defined in your service agreement or order form. Payments are due according to the agreed schedule.',
      'Late payments may result in service suspension. Refund policies are defined in your specific service agreement.',
      'Prasynx may modify pricing with reasonable notice. Price changes will not apply during current subscription terms.',
    ],
  },
  termination: {
    body: [
      'Either party may terminate this agreement under the terms specified in your service contract. Prasynx reserves the right to suspend or terminate access for violations of these terms.',
      'Upon termination, your access to the platform will cease. Data export options are available for a limited period following termination.',
      'Sections regarding intellectual property, limitation of liability, and governing law survive termination of this agreement.',
    ],
  },
  liability: {
    body: [
      'To the maximum extent permitted by law, Prasynx and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.',
      'Our total liability for any claim arising from these terms or platform use is limited to the amount you have paid us in the twelve months preceding the claim.',
      'This limitation does not apply to liability for death, personal injury, fraud, or gross negligence where applicable law prohibits such limitations.',
    ],
  },
  'contact-info': {
    body: [
      'For questions, concerns, or legal inquiries regarding these terms, please contact our legal team. We are committed to resolving any issues promptly and fairly.',
      'For disputes that cannot be resolved informally, you agree to binding arbitration in accordance with the laws of India. The courts of Chandigarh, India shall have exclusive jurisdiction.',
    ],
  },
};

const trustItems = [
  { icon: CheckCircle, label: 'GDPR Ready' },
  { icon: Shield, label: 'FERPA Friendly' },
  { icon: Lock, label: 'Enterprise Security' },
  { icon: Sparkles, label: 'AI Governance' },
  { icon: Eye, label: 'Data Protection' },
  { icon: Globe, label: 'Multi-Tenant Compliance' },
];

const featureCards = [
  { icon: Users, title: 'User Rights', desc: 'Understand your rights and protections as a Prasynx platform user.', color: '#3B82F6' },
  { icon: Shield, title: 'Data Protection', desc: 'Learn how Prasynx secures your information with enterprise-grade measures.', color: '#7C3AED' },
  { icon: Sparkles, title: 'AI Usage', desc: 'Guidelines for using Prerana AI responsibly and effectively.', color: '#F97316' },
  { icon: Award, title: 'Compliance', desc: 'Enterprise-grade legal compliance standards we adhere to.', color: '#22C55E' },
];

const sectionIcons: Record<string, { icon: any; color: string }> = {
  acceptance: { icon: FileText, color: '#7C3AED' },
  eligibility: { icon: Users, color: '#3B82F6' },
  account: { icon: Lock, color: '#22C55E' },
  usage: { icon: Shield, color: '#F97316' },
  student: { icon: GraduationCap, color: '#3B82F6' },
  parent: { icon: Users, color: '#22C55E' },
  staff: { icon: BookOpen, color: '#F97316' },
  'job-provider': { icon: Briefcase, color: '#6366F1' },
  admin: { icon: Shield, color: '#7C3AED' },
  'prerana-ai': { icon: Sparkles, color: '#7C3AED' },
  privacy: { icon: Eye, color: '#06B6D4' },
  intellectual: { icon: Award, color: '#8B5CF6' },
  payment: { icon: Clock, color: '#22C55E' },
  termination: { icon: XCircle, color: '#EF4444' },
  liability: { icon: Shield, color: '#F97316' },
  'contact-info': { icon: Mail, color: '#3B82F6' },
};

const contactCards = [
  { icon: Mail, title: 'Legal Team', email: 'compliance@prasynx.com', desc: 'For legal inquiries and compliance matters' },
  { icon: Lock, title: 'Privacy Team', email: 'privacy@prasynx.com', desc: 'For data privacy and protection questions' },
  { icon: HeadphonesIcon, title: 'Support Team', email: 'support@prasynx.com', desc: 'For general platform support' },
];

function HeadphonesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('acceptance');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['acceptance']));
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyLink = useCallback((id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/terms#${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const printTerms = () => window.print();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const filteredSections = searchQuery
    ? sections.filter((s) => {
        const c = content[s.id];
        const text = [s.title, ...(c?.body || []), ...(c?.items || []), ...(c?.restrictions || [])].join(' ').toLowerCase();
        return text.includes(searchQuery.toLowerCase());
      })
    : sections;

  return (
    <SiteShell>
      <div className="min-h-screen bg-white pt-20">
        {/* Floating Actions Bar */}
        <div className={`sticky top-20 z-40 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'}`}>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <div className="relative max-w-xs flex-1">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search terms..."
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 pl-9 text-xs text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15" />
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-[#94A3B8] sm:inline">Last updated: June 1, 2026</span>
              <button onClick={printTerms} className="grid h-8 w-8 place-items-center rounded-lg text-[#94A3B8] transition hover:bg-[#F1F5F9] hover:text-[#475569]">
                <Printer size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden bg-white px-4 py-24 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-96 -left-96 h-[800px] w-[800px] rounded-full bg-[#7C3AED]/5 blur-[150px]" />
            <div className="absolute -bottom-96 -right-96 h-[800px] w-[800px] rounded-full bg-[#8B5CF6]/5 blur-[150px]" />
            <div className="absolute top-1/2 left-1/3 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[#7C3AED]/3 blur-[120px]" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                  className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#EDE9FE] bg-[#F5F3FF] px-4 py-1.5">
                  <Shield size={12} className="text-[#7C3AED]" />
                  <span className="text-xs font-bold text-[#7C3AED]">Legal & Compliance</span>
                </motion.div>

                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl font-black tracking-tight text-[#0F172A] sm:text-5xl lg:text-6xl">
                  Terms &{' '}
                  <span className="bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] bg-clip-text text-transparent">Conditions</span>
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-4 max-w-xl text-lg leading-relaxed text-[#64748B]">
                  These Terms & Conditions govern your use of the Prasynx ecosystem, including Student Portal, Parent Portal, Staff Portal, Job Provider Portal, Admin Portal, and Prerana AI.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-8 flex flex-wrap gap-3">
                  <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#7C3AED]/25 transition hover:-translate-y-0.5 hover:shadow-xl">
                    <Download size={15} /> Download PDF
                  </button>
                  <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-5 py-3 text-sm font-bold text-[#475569] shadow-sm transition hover:border-[#7C3AED]/30 hover:text-[#7C3AED] hover:shadow-md">
                    Contact Legal Team <ArrowRight size={15} />
                  </Link>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
                className="relative hidden lg:flex items-center justify-center">
                <div className="relative h-96 w-96">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#7C3AED]/10 to-[#8B5CF6]/5 blur-3xl" />
                  <div className="relative grid h-full w-full place-items-center">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { icon: FileText, color: '#3B82F6', delay: 0, label: 'Contracts' },
                        { icon: Shield, color: '#22C55E', delay: 0.1, label: 'Secure' },
                        { icon: Lock, color: '#7C3AED', delay: 0.2, label: 'Privacy' },
                        { icon: Sparkles, color: '#F97316', delay: 0.3, label: 'AI' },
                      ].map(({ icon: Icon, color, delay, label }) => (
                        <motion.div key={color}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 + delay }}
                          className="flex h-36 w-36 flex-col items-center justify-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
                          <Icon size={32} style={{ color }} />
                          <span className="text-[10px] font-semibold text-[#94A3B8]">{label}</span>
                        </motion.div>
                      ))}
                    </div>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                      className="absolute -top-4 -right-4 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] p-3 shadow-lg">
                      <CheckCircle size={20} className="text-white" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Last Updated */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="relative mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
              <Clock size={12} />
              <span>Last Updated: <span className="font-semibold text-[#64748B]">June 1, 2026</span></span>
            </div>
          </motion.div>
        </section>

        {/* TRUST BAR */}
        <section className="border-b border-[#E2E8F0] bg-[#FAFAFA]">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {trustItems.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2.5 shadow-sm">
                  <Icon size={14} className="shrink-0 text-[#7C3AED]" />
                  <span className="text-xs font-semibold text-[#475569]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURE CARDS */}
        <section className="border-b border-[#E2E8F0] bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featureCards.map(({ icon: Icon, title, desc, color }) => (
                <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                  style={{ borderColor: `${color}20` }}>
                  <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: `radial-gradient(600px circle at 50% 50%, ${color}10, transparent 40%)` }} />
                  <div className="relative z-10">
                    <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${color}10`, color }}>
                      <Icon size={20} />
                    </div>
                    <h3 className="text-sm font-extrabold text-[#0F172A]">{title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#64748B]">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-16">
              {/* Sticky Nav */}
              <nav className="lg:sticky lg:top-32 lg:self-start">
                <div className="space-y-0.5 rounded-2xl border border-[#E2E8F0] bg-[#FAFAFA] p-2">
                  {sections.map((s) => {
                    const isActive = activeSection === s.id;
                    const isFiltered = !searchQuery || filteredSections.some(fs => fs.id === s.id);
                    if (!isFiltered) return null;
                    return (
                      <a key={s.id} href={`#${s.id}`}
                        onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }); }}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                          isActive ? 'bg-white text-[#7C3AED] shadow-sm' : 'text-[#64748B] hover:bg-white/60 hover:text-[#475569]'
                        }`}>
                        <span className={`h-1 w-1 rounded-full transition-all ${isActive ? 'bg-[#7C3AED] scale-150' : 'bg-[#CBD5E1]'}`} />
                        {s.title}
                      </a>
                    );
                  })}
                </div>
              </nav>

              {/* Content */}
              <div className="min-w-0">
                <AnimatePresence>
                  {filteredSections.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                      <Search size={40} className="text-[#CBD5E1]" />
                      <p className="mt-4 text-sm font-semibold text-[#64748B]">No terms found matching your search.</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                      {filteredSections.map((s) => {
                        const c = content[s.id];
                        if (!c) return null;
                        const isExpanded = expandedSections.has(s.id);

                        return (
                          <motion.section key={s.id} id={s.id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-100px' }}
                            className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 transition-all duration-300 hover:border-[#7C3AED]/20 hover:shadow-md sm:p-8">
                            <div className="pointer-events-none absolute top-0 left-0 h-full w-0.5 rounded-l-2xl transition-colors duration-300 group-hover:bg-[#7C3AED]" style={{ background: `${sectionIcons[s.id]?.color || '#7C3AED'}15` }} />
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <button onClick={() => toggleSection(s.id)}
                                  className="flex w-full items-center justify-between gap-2 text-left">
                                  <div className="flex items-center gap-3">
                                    {sectionIcons[s.id] && (() => {
                                      const Icon = sectionIcons[s.id].icon;
                                      return (
                                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: `${sectionIcons[s.id].color}12` }}>
                                          <Icon size={16} style={{ color: sectionIcons[s.id].color }} />
                                        </div>
                                      );
                                    })()}
                                    <h2 className="text-base font-extrabold text-[#0F172A] sm:text-lg">{s.title}</h2>
                                  </div>
                                  <ChevronDown size={16} className={`shrink-0 text-[#94A3B8] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence initial={false}>
                                  {isExpanded && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }} className="mt-4 space-y-4 overflow-hidden">
                                      {c.body.map((p, j) => (
                                        <div key={j} className="relative pl-6">
                                          <div className="absolute left-0 top-2.5 h-5 w-1 rounded-full opacity-60" style={{ background: sectionIcons[s.id]?.color || '#7C3AED' }} />
                                          <p className="text-[15px] leading-[1.75] text-[#334155]">{p}</p>
                                        </div>
                                      ))}
                                      {c.items && (
                                        <div className="mt-6 space-y-2">
                                          <p className="flex items-center gap-1.5 text-xs font-bold text-[#22C55E] uppercase tracking-wider"><CheckCircle size={12} /> Allowed</p>
                                          {c.items.map((item) => (
                                            <div key={item} className="flex items-start gap-2 pl-3 border-l-2 border-green-200">
                                              <CheckCircle size={14} className="mt-0.5 shrink-0 text-green-500" />
                                              <span className="text-sm text-[#475569]">{item}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {c.restrictions && (
                                        <div className="mt-6 space-y-2">
                                          <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-wider"><XCircle size={12} /> Restricted</p>
                                          {c.restrictions.map((item) => (
                                            <div key={item} className="flex items-start gap-2 pl-3 border-l-2 border-red-200">
                                              <XCircle size={14} className="mt-0.5 shrink-0 text-red-500" />
                                              <span className="text-sm text-[#475569]">{item}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              <button onClick={() => copyLink(s.id)}
                                className="shrink-0 grid h-8 w-8 place-items-center rounded-lg text-[#94A3B8] opacity-0 transition group-hover:opacity-100 hover:bg-[#F1F5F9] hover:text-[#7C3AED]"
                                title="Copy link to section">
                                {copiedId === s.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                              </button>
                            </div>
                          </motion.section>
                        );
                      })}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* PRERANA AI POLICY */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#FAFAFA] via-white to-[#F5F3FF] px-4 py-20 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-96 left-1/3 h-[600px] w-[600px] rounded-full bg-[#7C3AED]/6 blur-[150px]" />
            <div className="absolute -bottom-96 right-1/3 h-[600px] w-[600px] rounded-full bg-[#8B5CF6]/5 blur-[150px]" />
            <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#7C3AED 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          </div>

          <div className="relative mx-auto max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#EDE9FE] bg-white px-4 py-1.5 shadow-sm">
              <Sparkles size={12} className="text-[#7C3AED]" />
              <span className="text-xs font-bold text-[#7C3AED]">AI Governance</span>
            </motion.div>

            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl font-black text-[#0F172A] sm:text-4xl lg:text-5xl">
              Prerana AI Responsible Use Policy
            </motion.h2>

            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="mt-4 max-w-2xl text-lg text-[#64748B]">
              Guidelines for using Prerana AI responsibly across the Prasynx ecosystem.
            </motion.p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="rounded-2xl border border-green-200 bg-green-50 p-6">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-green-700">
                  <CheckCircle size={16} /> Allowed Use Cases
                </h3>
                <div className="mt-4 space-y-3">
                  {['Educational Assistance', 'Recruitment Assistance', 'Administrative Support', 'Content Generation'].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle size={14} className="mt-0.5 shrink-0 text-green-500" />
                      <span className="text-sm text-[#475569]">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-red-700">
                  <XCircle size={16} /> Restricted Use Cases
                </h3>
                <div className="mt-4 space-y-3">
                  {['Illegal Activities', 'Harmful Content', 'Unauthorized Access', 'Data Misuse'].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <XCircle size={14} className="mt-0.5 shrink-0 text-red-500" />
                      <span className="text-sm text-[#475569]">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-black text-[#0F172A] sm:text-4xl">Need Legal Assistance?</h2>
              <p className="mt-3 text-[#64748B]">Our legal and compliance teams are ready to help.</p>
            </motion.div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {contactCards.map(({ icon: Icon, title, email, desc }) => (
                <motion.a key={email} href={`mailto:${email}`}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="group rounded-2xl border border-[#E2E8F0] bg-white p-6 text-left transition-all duration-300 hover:border-[#7C3AED]/20 hover:shadow-lg hover:-translate-y-0.5">
                  <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[#F3F0FF] text-[#7C3AED] transition group-hover:bg-[#7C3AED] group-hover:text-white">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-sm font-extrabold text-[#0F172A]">{title}</h3>
                  <p className="mt-0.5 text-xs text-[#64748B]">{desc}</p>
                  <p className="mt-2 text-xs font-bold text-[#7C3AED]">{email} <ExternalLink size={10} className="inline" /></p>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="border-t border-[#E2E8F0] bg-gradient-to-br from-[#FAFAFA] via-white to-[#F5F3FF] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-black text-[#0F172A] sm:text-4xl">Questions About Our Policies?</h2>
              <p className="mt-3 text-lg text-[#64748B]">Our compliance and legal teams are here to help.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#7C3AED]/25 transition hover:-translate-y-0.5 hover:shadow-xl">
                  Contact Us <ArrowRight size={15} />
                </Link>
                <Link href="/privacy-policy"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-bold text-[#475569] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  View Privacy Policy
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
