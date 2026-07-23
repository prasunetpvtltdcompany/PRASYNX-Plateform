'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Shield, Lock, Eye, Sparkles, Download, ArrowRight, ChevronDown, Copy, Check,
  Search, FileText, Users, BookOpen, Briefcase, GraduationCap, Globe, Printer,
  ExternalLink, Mail, CheckCircle, XCircle, Award, Cloud, Fingerprint, Server,
  RefreshCw, Sliders, UserCheck, Bell, Clock, Database, Activity, Monitor,
  Moon, Sun, Menu, X, Star, Key, Share2, HardDrive, Zap, ShieldCheck,
  FileSearch, UserCog, FilePen, FileDown, UserX, Smartphone, Laptop,
  Building2, Headphones, MessageCircle, LockKeyhole, ShieldHalf,
} from 'lucide-react';
import SiteShell from '../components/SiteShell';

const P = '#7C3AED';

const sections = [
  { id: 'overview', title: '1. Overview' },
  { id: 'collection', title: '2. Information We Collect' },
  { id: 'usage', title: '3. How We Use Information' },
  { id: 'student-data', title: '4. Student Data Protection' },
  { id: 'parent-data', title: '5. Parent Data Protection' },
  { id: 'staff-data', title: '6. Staff Data Protection' },
  { id: 'recruiter-data', title: '7. Job Provider Data Protection' },
  { id: 'prerana-ai', title: '8. Prerana AI Data Usage' },
  { id: 'cookies', title: '9. Cookies & Tracking' },
  { id: 'security', title: '10. Data Security' },
  { id: 'third-party', title: '11. Third-Party Services' },
  { id: 'rights', title: '12. User Rights' },
  { id: 'retention', title: '13. Data Retention' },
  { id: 'transfers', title: '14. International Transfers' },
  { id: 'children', title: '15. Children\'s Privacy' },
  { id: 'changes', title: '16. Changes to Policy' },
  { id: 'contact', title: '17. Contact Us' },
];

const content: Record<string, { body: string[]; items?: { label: string; desc: string }[] }> = {
  overview: {
    body: [
      'Prasynx ("we", "us", "our") is committed to protecting the privacy and security of all users across our education, recruitment, administration, and AI-powered services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.',
      'We adhere to GDPR, FERPA, COPPA, and other applicable data protection regulations. This policy applies to all users including students, parents, educators, job providers, administrators, and institutional partners.',
      'By using Prasynx, you consent to the practices described in this policy. We encourage you to read this document carefully and contact our privacy team with any questions.',
    ],
  },
  collection: {
    body: [
      'We collect information necessary to provide and improve our services. The types of information we collect depend on your role and how you interact with the platform.',
    ],
    items: [
      { label: 'Personal Information', desc: 'Name, email address, phone number, date of birth, and government-issued identification where required for verification purposes.' },
      { label: 'Academic Information', desc: 'Enrollment records, attendance data, grades, assignments, examination results, certifications, and academic progress reports.' },
      { label: 'Recruitment Information', desc: 'Resume/CV, skills assessments, job applications, placement records, interview feedback, and career preferences.' },
      { label: 'Parent Information', desc: 'Parent/guardian name, contact details, relationship to student, and communication preferences.' },
      { label: 'Staff Information', desc: 'Employment records, qualifications, teaching assignments, performance evaluations, and professional development history.' },
      { label: 'Platform Usage Data', desc: 'Login activity, feature interactions, device information, IP address, browser type, and analytics on how you use our services.' },
      { label: 'Communication Data', desc: 'Messages sent through the platform, support inquiries, feedback submissions, and notification preferences.' },
    ],
  },
  usage: {
    body: [
      'We use collected information to deliver, maintain, and enhance our services across the Prasynx ecosystem.',
    ],
    items: [
      { label: 'Platform Operations', desc: 'Delivering core platform functionality, managing user accounts, and ensuring service reliability.' },
      { label: 'Educational Services', desc: 'Providing academic management, attendance tracking, grade reporting, and learning analytics.' },
      { label: 'Recruitment Services', desc: 'Enabling job matching, application processing, candidate evaluation, and placement tracking.' },
      { label: 'Parent Communication', desc: 'Sharing academic progress updates, attendance alerts, fee notifications, and school announcements.' },
      { label: 'Security Monitoring', desc: 'Detecting and preventing unauthorized access, fraud, abuse, and security incidents.' },
      { label: 'AI Assistance', desc: 'Powering Prerana AI to provide personalized recommendations, insights, and conversational support.' },
      { label: 'Analytics & Reporting', desc: 'Generating institutional analytics, performance reports, and trend analysis for continuous improvement.' },
      { label: 'Service Improvements', desc: 'Analyzing usage patterns to enhance platform features, user experience, and system performance.' },
    ],
  },
  'student-data': {
    body: [
      'Student data is protected with the highest level of security and access controls. We comply with FERPA, COPPA, and other student privacy regulations.',
      'Student data is only accessible to authorized educators, parents, and administrators based on role-based permissions. Data is never shared with third parties for marketing purposes.',
      'Students can access their academic records, manage communication preferences, and request data corrections through their portal.',
    ],
  },
  'parent-data': {
    body: [
      'Parent data is collected to facilitate communication between educational institutions and families. We respect the privacy of parents and guardians.',
      'Parents have access to their child\'s academic information, attendance records, fee details, and school communications. Parent data is not used for any purpose other than platform functionality.',
    ],
  },
  'staff-data': {
    body: [
      'Staff data is used to manage employment records, teaching assignments, professional development, and performance evaluations.',
      'Staff can control their profile visibility, communication preferences, and notification settings. Access to staff data is restricted to authorized administrators.',
    ],
  },
  'recruiter-data': {
    body: [
      'Job provider data is collected to facilitate recruitment services, including job postings, candidate matching, and application management.',
      'Recruiter data is only shared with candidates through the application process. We implement safeguards to prevent unauthorized access to recruitment data.',
    ],
  },
  'prerana-ai': {
    body: [
      'Prerana AI is designed with privacy and security as foundational principles. AI interactions are processed securely and data is protected by strict access controls.',
    ],
    items: [
      { label: 'Role-Based AI Access', desc: 'AI responses are tailored based on user role and permissions. Students see only educational content; recruiters see only recruitment data.' },
      { label: 'Secure Conversations', desc: 'All AI interactions are encrypted in transit and at rest. Conversation history is protected by the same access controls as other platform data.' },
      { label: 'Context-Aware Assistance', desc: 'Prerana AI only accesses data necessary to answer your query. It does not have unrestricted access to all platform data.' },
      { label: 'Data Protection Controls', desc: 'Institutions can configure AI access policies, data retention periods, and usage boundaries for their users.' },
      { label: 'Responsible AI Practices', desc: 'We regularly audit AI outputs for fairness, accuracy, and privacy compliance. AI models are trained on anonymized, aggregated data.' },
    ],
  },
  cookies: {
    body: [
      'We use cookies and similar tracking technologies to enhance user experience, analyze platform usage, and provide personalized features.',
      'Essential cookies are required for platform functionality. Analytics and preference cookies can be managed through your browser settings.',
      'We do not use cookies for targeted advertising. Third-party cookies are only used for essential platform integrations.',
    ],
  },
  security: {
    body: [
      'Prasynx implements enterprise-grade security measures to protect your data from unauthorized access, disclosure, alteration, and destruction.',
    ],
    items: [
      { label: 'Encryption at Rest', desc: 'All data stored on our servers is encrypted using AES-256 encryption standards.' },
      { label: 'Encryption in Transit', desc: 'All data transmitted between clients and servers is protected using TLS 1.3 protocols.' },
      { label: 'Multi-Factor Authentication', desc: 'MFA is available and recommended for all user accounts to provide an additional layer of security.' },
      { label: 'Role-Based Permissions', desc: 'Granular access controls ensure users only access data necessary for their role.' },
      { label: 'Audit Logging', desc: 'All access and modifications to sensitive data are logged and monitored for suspicious activity.' },
      { label: 'Secure Infrastructure', desc: 'Our infrastructure is hosted on SOC 2 compliant cloud providers with 24/7 security monitoring.' },
      { label: 'Continuous Monitoring', desc: 'Automated security systems monitor for threats, vulnerabilities, and unauthorized access attempts.' },
      { label: 'Data Backup Systems', desc: 'Regular encrypted backups ensure data integrity and availability with defined recovery point objectives.' },
    ],
  },
  'third-party': {
    body: [
      'We may share information with trusted third-party service providers who assist in operating our platform. We do not sell personal information.',
      'Third-party providers are bound by contractual agreements to protect your data and use it only for specified purposes. We conduct periodic security assessments of our providers.',
    ],
  },
  rights: {
    body: [
      'You have control over your personal data. Prasynx respects your privacy rights and provides tools to exercise them.',
    ],
    items: [
      { label: 'Access Your Data', desc: 'Request access to the personal information we hold about you.' },
      { label: 'Update Information', desc: 'Correct inaccurate or incomplete personal information.' },
      { label: 'Delete Information', desc: 'Request deletion of personal data where applicable by law.' },
      { label: 'Export Data', desc: 'Download your personal data in a portable, machine-readable format.' },
      { label: 'Withdraw Consent', desc: 'Manage privacy preferences and withdraw consent where processing is based on consent.' },
    ],
  },
  retention: {
    body: [
      'We retain your personal information only as long as necessary to fulfill the purposes described in this policy, unless a longer retention period is required by law.',
      'Data retention periods vary based on the type of information and applicable legal requirements. Academic records may be retained longer due to institutional obligations.',
      'When data is no longer needed, we securely delete or anonymize it. You can request details about our retention schedules for specific data categories.',
    ],
  },
  transfers: {
    body: [
      'Your information may be processed in countries where our servers and service providers are located. We ensure appropriate safeguards are in place for international data transfers.',
      'When transferring data across borders, we implement standard contractual clauses, binding corporate rules, or other approved transfer mechanisms as required by applicable law.',
    ],
  },
  children: {
    body: [
      'Prasynx is designed for educational institutions and their communities. We take children\'s privacy seriously and comply with COPPA and similar regulations.',
      'Children under 13 require parental or institutional consent to use the platform. We do not knowingly collect personal information from children without proper authorization.',
      'Parents and guardians can review, update, or delete their child\'s information. Contact our privacy team for assistance with children\'s privacy matters.',
    ],
  },
  changes: {
    body: [
      'We may update this Privacy Policy periodically to reflect changes in our practices, legal requirements, or platform features.',
      'Material changes will be communicated through platform notifications, email, or website announcements. We encourage you to review this policy regularly.',
      'Continued use of Prasynx after policy changes constitutes acceptance of the updated terms. If you disagree with changes, you may stop using the platform.',
    ],
  },
  contact: {
    body: [
      'If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our privacy team.',
      'We are committed to resolving privacy concerns promptly. If we cannot resolve your concern, you have the right to lodge a complaint with your local data protection authority.',
    ],
  },
};

const trustItems = [
  { icon: Shield, label: 'End-to-End Security' },
  { icon: Lock, label: 'Role-Based Access Control' },
  { icon: Key, label: 'Data Encryption' },
  { icon: Fingerprint, label: 'Secure Authentication' },
  { icon: Eye, label: 'Privacy First Design' },
  { icon: Sparkles, label: 'AI Governance Standards' },
];

const featureCards = [
  { icon: FileSearch, title: 'Information Collection', desc: 'Learn what information we collect and why.', color: '#3B82F6' },
  { icon: Shield, title: 'Data Security', desc: 'Understand how we protect your information.', color: '#7C3AED' },
  { icon: UserCheck, title: 'Your Privacy Rights', desc: 'Manage, access, and control your personal data.', color: '#22C55E' },
  { icon: Sparkles, title: 'Prerana AI Privacy', desc: 'Learn how AI interactions are handled responsibly.', color: '#F97316' },
];

const dataCollectionCards = [
  { icon: UserCheck, title: 'Personal Information', color: '#3B82F6', items: ['Name', 'Email', 'Phone Number', 'School Information'] },
  { icon: BookOpen, title: 'Academic Information', color: '#22C55E', items: ['Attendance', 'Grades', 'Assignments', 'Certifications'] },
  { icon: Briefcase, title: 'Recruitment Information', color: '#F97316', items: ['Resume', 'Skills', 'Job Applications', 'Placement Records'] },
  { icon: Monitor, title: 'Platform Usage Data', color: '#7C3AED', items: ['Login Activity', 'Device Information', 'Preferences', 'Analytics'] },
];

const userRights = [
  { icon: FileSearch, title: 'Access Your Data', desc: 'Request access to your personal information.', color: '#3B82F6' },
  { icon: FilePen, title: 'Update Information', desc: 'Correct inaccurate information.', color: '#22C55E' },
  { icon: UserX, title: 'Delete Information', desc: 'Request deletion of eligible data.', color: '#EF4444' },
  { icon: FileDown, title: 'Export Data', desc: 'Download your personal records.', color: '#7C3AED' },
  { icon: Sliders, title: 'Withdraw Consent', desc: 'Manage privacy preferences.', color: '#F97316' },
];

const securityFeatures = [
  { icon: Lock, title: 'Encryption at Rest', desc: 'AES-256 encryption for all stored data.' },
  { icon: Share2, title: 'Encryption in Transit', desc: 'TLS 1.3 for all data transmissions.' },
  { icon: Fingerprint, title: 'Multi-Factor Authentication', desc: 'Additional security layer for accounts.' },
  { icon: Shield, title: 'Role-Based Permissions', desc: 'Granular access control per user role.' },
  { icon: FileText, title: 'Audit Logging', desc: 'Complete audit trail of data access.' },
  { icon: Server, title: 'Secure Infrastructure', desc: 'SOC 2 compliant cloud infrastructure.' },
  { icon: Activity, title: 'Continuous Monitoring', desc: '24/7 threat detection and monitoring.' },
  { icon: HardDrive, title: 'Data Backup Systems', desc: 'Regular encrypted backups with DR plan.' },
];

const contactCards = [
  { icon: Lock, title: 'Privacy Office', email: 'privacy@prasynx.com', desc: 'For privacy inquiries and requests' },
  { icon: Shield, title: 'Data Protection Team', email: 'security@prasynx.com', desc: 'For security and data protection' },
  { icon: Headphones, title: 'Support Team', email: 'support@prasynx.com', desc: 'For general platform support' },
];

const sectionIcons: Record<string, { icon: any; color: string }> = {
  overview: { icon: Eye, color: '#7C3AED' },
  collection: { icon: Database, color: '#3B82F6' },
  usage: { icon: Activity, color: '#22C55E' },
  'student-data': { icon: GraduationCap, color: '#3B82F6' },
  'parent-data': { icon: Users, color: '#22C55E' },
  'staff-data': { icon: BookOpen, color: '#F97316' },
  'recruiter-data': { icon: Briefcase, color: '#6366F1' },
  'prerana-ai': { icon: Sparkles, color: '#7C3AED' },
  cookies: { icon: Sliders, color: '#06B6D4' },
  security: { icon: Shield, color: '#22C55E' },
  'third-party': { icon: Share2, color: '#F97316' },
  rights: { icon: UserCheck, color: '#7C3AED' },
  retention: { icon: Clock, color: '#64748B' },
  transfers: { icon: Globe, color: '#3B82F6' },
  children: { icon: Users, color: '#EC4899' },
  changes: { icon: RefreshCw, color: '#8B5CF6' },
  contact: { icon: Mail, color: '#3B82F6' },
};

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 10L85 25V45C85 68 70 85 50 92C30 85 15 68 15 45V25L50 10Z" fill="url(#shield_grad)" stroke="#7C3AED" strokeWidth="2" opacity="0.15" />
      <path d="M50 18L77 30V46C77 64 66 78 50 84C34 78 23 64 23 46V30L50 18Z" fill="url(#shield_grad2)" stroke="#7C3AED" strokeWidth="1.5" opacity="0.3" />
      <path d="M38 50L47 59L62 42" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      <circle cx="50" cy="50" r="18" stroke="#7C3AED" strokeWidth="1" opacity="0.15" strokeDasharray="4 4" />
      <defs>
        <linearGradient id="shield_grad" x1="50" y1="10" x2="50" y2="92"><stop offset="0%" stopColor="#7C3AED" stopOpacity="0.12"/><stop offset="100%" stopColor="#7C3AED" stopOpacity="0.02"/></linearGradient>
        <linearGradient id="shield_grad2" x1="50" y1="18" x2="50" y2="84"><stop offset="0%" stopColor="#7C3AED" stopOpacity="0.15"/><stop offset="100%" stopColor="#7C3AED" stopOpacity="0.05"/></linearGradient>
      </defs>
    </svg>
  );
}

function CloudLockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 70C15 70 10 62 10 55C10 46 16 40 24 40C24 28 36 18 48 22C52 12 68 12 72 24C84 24 90 36 86 46C92 48 90 60 82 62" stroke="#7C3AED" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
      <rect x="38" y="48" width="24" height="18" rx="3" stroke="#7C3AED" strokeWidth="2" opacity="0.5" />
      <circle cx="50" cy="56" r="3" fill="#7C3AED" opacity="0.6" />
      <path d="M50 51V56" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M50 62V66" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <defs>
        <linearGradient id="cloud_grad" x1="50" y1="22" x2="50" y2="72"><stop offset="0%" stopColor="#7C3AED" stopOpacity="0.08"/><stop offset="100%" stopColor="#7C3AED" stopOpacity="0.02"/></linearGradient>
      </defs>
    </svg>
  );
}

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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
    navigator.clipboard.writeText(`${window.location.origin}/privacy-policy#${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const printPage = () => window.print();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDark(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

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
        const text = [s.title, ...(c?.body || []), ...(c?.items || []).map(i => i.label + i.desc)].join(' ').toLowerCase();
        return text.includes(searchQuery.toLowerCase());
      })
    : sections;

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileNavOpen(false);
  };

  return (
    <SiteShell>
      <div className={`min-h-screen transition-colors duration-300 ${dark ? 'dark bg-[#0B0B1A]' : 'bg-white'}`}>
        {/* Dark Mode Toggle */}
        <div className="fixed bottom-6 right-6 z-50">
          <button onClick={() => setDark(!dark)}
            className="grid h-12 w-12 place-items-center rounded-full shadow-lg backdrop-blur-md transition-all hover:scale-110 active:scale-95"
            style={{ background: dark ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.9)', border: `1px solid ${dark ? 'rgba(124,58,237,0.3)' : 'rgba(226,232,240,0.8)'}` }}>
            {dark ? <Sun size={18} className="text-[#A78BFA]" /> : <Moon size={18} className="text-[#475569]" />}
          </button>
        </div>

        {/* Floating Actions Bar */}
        <div className={`sticky top-20 z-40 transition-all duration-300 ${dark ? 'bg-[#0B0B1A]/95 backdrop-blur-md' : `${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'}`}`}>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <div className="relative max-w-xs flex-1">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search privacy policy..."
                className={`w-full rounded-lg border px-3 py-2 pl-9 text-xs outline-none transition placeholder:text-[#94A3B8] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 ${dark ? 'border-[#1E293B] bg-[#0F172A] text-[#F1F5F9]' : 'border-[#E2E8F0] bg-white text-[#0F172A]'}`} />
            </div>
            <div className="flex items-center gap-2">
              <span className={`hidden text-xs sm:inline ${dark ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>Last updated: June 1, 2026</span>
              <button onClick={printPage}
                className={`grid h-8 w-8 place-items-center rounded-lg transition ${dark ? 'text-[#64748B] hover:bg-[#1E293B] hover:text-[#F1F5F9]' : 'text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#475569]'}`}>
                <Printer size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* HERO */}
        <section className={`relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 ${dark ? 'bg-[#0B0B1A]' : 'bg-gradient-to-br from-white via-[#FAFAFA] to-[#F5F3FF]'}`}>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-96 -left-96 h-[800px] w-[800px] rounded-full bg-[#7C3AED]/8 blur-[150px]" />
            <div className="absolute -bottom-96 -right-96 h-[800px] w-[800px] rounded-full bg-[#8B5CF6]/8 blur-[150px]" />
            <div className="absolute top-1/3 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C3AED]/5 blur-[120px]" />
            {!dark && <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#7C3AED 1px, transparent 1px)', backgroundSize: '40px 40px' }} />}
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                  className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 ${dark ? 'border-[#7C3AED]/30 bg-[#7C3AED]/10 shadow-sm' : 'border-[#EDE9FE] bg-white shadow-sm'}`}>
                  <Shield size={12} className="text-[#7C3AED]" />
                  <span className={`text-xs font-bold ${dark ? 'text-[#A78BFA]' : 'text-[#7C3AED]'}`}>Privacy & Trust</span>
                </motion.div>

                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                  className={`text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl ${dark ? 'text-white' : 'text-[#0F172A]'}`}>
                  Privacy{' '}
                  <span className="bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] bg-clip-text text-transparent">Policy</span>
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
                  className={`mt-2 text-2xl font-black tracking-tight sm:text-3xl ${dark ? 'text-[#A78BFA]' : 'text-[#7C3AED]'}`}>
                  Your Data. Your Control.
                </motion.p>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                  className={`mt-4 max-w-xl text-lg leading-relaxed ${dark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                  At Prasynx, we are committed to protecting your privacy and securing your personal information across our education, recruitment, administration, and AI-powered services.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-8 flex flex-wrap gap-3">
                  <button onClick={printPage}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#7C3AED]/25 transition hover:-translate-y-0.5 hover:shadow-xl">
                    <Download size={14} /> Download Privacy Policy
                  </button>
                  <Link href="mailto:privacy@prasynx.com"
                    className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${dark ? 'border-[#1E293B] bg-[#0F172A] text-[#F1F5F9]' : 'border-[#E2E8F0] bg-white text-[#475569]'}`}>
                    Contact Privacy Team <ArrowRight size={15} />
                  </Link>
                </motion.div>
              </div>

              {/* Right Illustration */}
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
                className="relative hidden lg:flex items-center justify-center">
                <div className="relative h-[420px] w-[420px]">
                  <div className={`absolute inset-0 rounded-3xl blur-3xl ${dark ? 'bg-[#7C3AED]/10' : 'bg-gradient-to-br from-[#7C3AED]/15 to-[#8B5CF6]/10'}`} />
                  <div className="relative grid h-full w-full place-items-center">
                    {/* Center Shield */}
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
                      className="absolute z-10">
                      <ShieldIcon className="h-40 w-40" />
                    </motion.div>

                    {/* Orbiting elements */}
                    {[
                      { icon: Cloud, color: '#3B82F6', angle: 0, label: 'Encrypted Cloud', delay: 0.6 },
                      { icon: GraduationCap, color: '#22C55E', angle: 72, label: 'Student Protection', delay: 0.7 },
                      { icon: Fingerprint, color: '#F97316', angle: 144, label: 'Secure Auth', delay: 0.8 },
                      { icon: Sparkles, color: '#7C3AED', angle: 216, label: 'AI Privacy', delay: 0.9 },
                      { icon: Award, color: '#06B6D4', angle: 288, label: 'Compliance', delay: 1.0 },
                    ].map(({ icon: Icon, color, angle, label, delay }) => (
                      <motion.div key={label}
                        initial={{ opacity: 0, x: 0, y: 0 }}
                        animate={{
                          opacity: 1,
                          x: Math.cos(angle * Math.PI / 180) * 130,
                          y: Math.sin(angle * Math.PI / 180) * 130,
                        }}
                        transition={{ delay, type: 'spring', stiffness: 100 }}
                        className={`absolute flex flex-col items-center gap-1.5 rounded-xl border p-3 backdrop-blur-sm ${dark ? 'border-white/10 bg-white/[0.05]' : 'border-[#E2E8F0] bg-white shadow-sm'}`}>
                        <Icon size={22} style={{ color }} />
                        <span className={`text-[9px] font-semibold whitespace-nowrap ${dark ? 'text-white/50' : 'text-[#94A3B8]'}`}>{label}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* TRUST INDICATORS */}
        <section className={`border-b ${dark ? 'border-[#1E293B] bg-[#0F172A]' : 'border-[#E2E8F0] bg-[#FAFAFA]'}`}>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {trustItems.map(({ icon: Icon, label }) => (
                <div key={label} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${dark ? 'border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-sm' : 'border-[#E2E8F0] bg-white shadow-sm'}`}>
                  <Icon size={14} className="shrink-0 text-[#7C3AED]" />
                  <span className={`text-xs font-semibold ${dark ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURE CARDS */}
        <section className={`px-4 py-16 sm:px-6 lg:px-8 ${dark ? 'bg-[#0B0B1A]' : 'bg-white'}`}>
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featureCards.map(({ icon: Icon, title, desc, color }) => (
                <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${dark ? 'border-[#1E293B] bg-[#0F172A] hover:border-[#7C3AED]/30' : 'border-[#E2E8F0] bg-white'}`}
                  style={{ borderColor: `${color}20` }}>
                  <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: `radial-gradient(600px circle at 50% 50%, ${color}10, transparent 40%)` }} />
                  <div className="relative z-10">
                    <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${color}10`, color }}>
                      <Icon size={20} />
                    </div>
                    <h3 className={`text-sm font-extrabold ${dark ? 'text-white' : 'text-[#0F172A]'}`}>{title}</h3>
                    <p className={`mt-1.5 text-xs leading-relaxed ${dark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <section className={`px-4 py-16 sm:px-6 lg:px-8 ${dark ? 'bg-[#0B0B1A]' : 'bg-white'}`}>
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-16">
              {/* Sticky Nav - Desktop */}
              <nav className="hidden lg:block lg:sticky lg:top-32 lg:self-start">
                <div className={`space-y-0.5 rounded-2xl border p-2 ${dark ? 'border-[#1E293B] bg-[#0F172A]' : 'border-[#E2E8F0] bg-[#FAFAFA]'}`}>
                  {sections.map((s) => {
                    const isActive = activeSection === s.id;
                    const isFiltered = !searchQuery || filteredSections.some(fs => fs.id === s.id);
                    if (!isFiltered) return null;
                    return (
                      <a key={s.id} href={`#${s.id}`}
                        onClick={(e) => { e.preventDefault(); scrollToSection(s.id); }}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                          isActive
                            ? `${dark ? 'bg-[#1E293B] text-[#A78BFA]' : 'bg-white text-[#7C3AED] shadow-sm'}`
                            : `${dark ? 'text-[#64748B] hover:bg-[#1E293B]/50 hover:text-[#CBD5E1]' : 'text-[#64748B] hover:bg-white/60 hover:text-[#475569]'}`
                        }`}>
                        <span className={`h-1 w-1 rounded-full transition-all ${isActive ? 'bg-[#7C3AED] scale-150' : 'bg-[#CBD5E1]'}`} />
                        {s.title}
                      </a>
                    );
                  })}
                </div>
              </nav>

              {/* Mobile Nav Button */}
              <div className="lg:hidden">
                <button onClick={() => setMobileNavOpen(!mobileNavOpen)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold ${dark ? 'border-[#1E293B] bg-[#0F172A] text-[#F1F5F9]' : 'border-[#E2E8F0] bg-[#FAFAFA] text-[#0F172A]'}`}>
                  <span>Sections</span>
                  {mobileNavOpen ? <X size={16} /> : <Menu size={16} />}
                </button>
                <AnimatePresence>
                  {mobileNavOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className={`mt-2 space-y-0.5 rounded-xl border p-2 ${dark ? 'border-[#1E293B] bg-[#0F172A]' : 'border-[#E2E8F0] bg-white shadow-lg'}`}>
                      {sections.map((s) => {
                        const isActive = activeSection === s.id;
                        return (
                          <button key={s.id} onClick={() => scrollToSection(s.id)}
                            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all text-left ${
                              isActive
                                ? `${dark ? 'bg-[#1E293B] text-[#A78BFA]' : 'bg-[#F5F3FF] text-[#7C3AED]'}`
                                : `${dark ? 'text-[#64748B] hover:bg-[#1E293B]/50' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`
                            }`}>
                            <span className={`h-1 w-1 rounded-full ${isActive ? 'bg-[#7C3AED]' : 'bg-[#CBD5E1]'}`} />
                            {s.title}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Content */}
              <div className="min-w-0">
                <AnimatePresence>
                  {filteredSections.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                      <Search size={40} className="text-[#CBD5E1]" />
                      <p className="mt-4 text-sm font-semibold text-[#64748B]">No sections found matching your search.</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                      {filteredSections.map((s) => {
                        const c = content[s.id];
                        if (!c) return null;
                        const isExpanded = expandedSections.has(s.id);
                        const si = sectionIcons[s.id];
                        const Icon = si?.icon;

                        return (
                          <motion.section key={s.id} id={s.id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-100px' }}
                            className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 sm:p-8 ${dark ? 'border-[#1E293B] bg-[#0F172A] hover:border-[#7C3AED]/20' : 'border-[#E2E8F0] bg-white hover:border-[#7C3AED]/20 hover:shadow-md'}`}>
                            <div className="pointer-events-none absolute top-0 left-0 h-full w-0.5 rounded-l-2xl transition-colors duration-300 group-hover:bg-[#7C3AED]"
                              style={{ background: `${si?.color || '#7C3AED'}15` }} />
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <button onClick={() => toggleSection(s.id)}
                                  className="flex w-full items-center justify-between gap-2 text-left">
                                  <div className="flex items-center gap-3">
                                    {Icon && (
                                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: `${si.color}12` }}>
                                        <Icon size={16} style={{ color: si.color }} />
                                      </div>
                                    )}
                                    <h2 className={`text-base font-extrabold sm:text-lg ${dark ? 'text-white' : 'text-[#0F172A]'}`}>{s.title}</h2>
                                  </div>
                                  <ChevronDown size={16} className={`shrink-0 transition-transform duration-200 ${dark ? 'text-[#475569]' : 'text-[#94A3B8]'} ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence initial={false}>
                                  {isExpanded && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }} className="mt-4 space-y-4 overflow-hidden">
                                      {c.body.map((p, j) => (
                                        <div key={j} className="relative pl-6">
                                          <div className="absolute left-0 top-2.5 h-5 w-1 rounded-full opacity-60" style={{ background: si?.color || '#7C3AED' }} />
                                          <p className={`text-[15px] leading-[1.75] ${dark ? 'text-[#CBD5E1]' : 'text-[#334155]'}`}>{p}</p>
                                        </div>
                                      ))}
                                      {c.items && (
                                        <div className={`mt-6 space-y-3 ${dark ? '' : ''}`}>
                                          {c.items.map(({ label, desc }) => (
                                            <div key={label} className={`flex items-start gap-3 rounded-xl border p-4 ${dark ? 'border-[#1E293B] bg-[#0B0B1A]' : 'border-[#E2E8F0] bg-[#FAFAFA]'}`}>
                                              <CheckCircle size={16} className="mt-0.5 shrink-0 text-[#22C55E]" />
                                              <div>
                                                <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-[#0F172A]'}`}>{label}</p>
                                                <p className={`mt-0.5 text-xs leading-relaxed ${dark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>{desc}</p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              <button onClick={() => copyLink(s.id)}
                                className={`shrink-0 grid h-8 w-8 place-items-center rounded-lg opacity-0 transition group-hover:opacity-100 ${dark ? 'text-[#475569] hover:bg-[#1E293B] hover:text-[#A78BFA]' : 'text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#7C3AED]'}`}
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

        {/* DATA COLLECTION */}
        <section className={`px-4 py-20 sm:px-6 lg:px-8 ${dark ? 'bg-[#0F172A]' : 'bg-[#FAFAFA]'}`}>
          <div className="mx-auto max-w-7xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 ${dark ? 'border-[#7C3AED]/30 bg-[#7C3AED]/10' : 'border-[#EDE9FE] bg-white shadow-sm'}`}>
              <Database size={12} className="text-[#7C3AED]" />
              <span className={`text-xs font-bold ${dark ? 'text-[#A78BFA]' : 'text-[#7C3AED]'}`}>Data Collection</span>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className={`text-3xl font-black sm:text-4xl lg:text-5xl ${dark ? 'text-white' : 'text-[#0F172A]'}`}>
              Information We Collect
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className={`mx-auto mt-4 max-w-2xl text-lg ${dark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
              We collect only the information necessary to deliver our platform services.
            </motion.p>
          </div>

          <div className="mx-auto mt-12 grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {dataCollectionCards.map(({ icon: Icon, title, color, items }) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${dark ? 'border-[#1E293B] bg-[#0B0B1A]' : 'border-[#E2E8F0] bg-white'}`}>
                <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: `radial-gradient(600px circle at 50% 50%, ${color}08, transparent 40%)` }} />
                <div className="relative z-10">
                  <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl" style={{ background: `${color}12`, color }}>
                    <Icon size={22} />
                  </div>
                  <h3 className={`text-sm font-extrabold ${dark ? 'text-white' : 'text-[#0F172A]'}`}>{title}</h3>
                  <ul className="mt-3 space-y-2">
                    {items.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle size={10} className="shrink-0 text-[#22C55E]" />
                        <span className={`text-xs ${dark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* HOW WE USE DATA */}
        <section className={`px-4 py-20 sm:px-6 lg:px-8 ${dark ? 'bg-[#0B0B1A]' : 'bg-white'}`}>
          <div className="mx-auto max-w-7xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 ${dark ? 'border-[#7C3AED]/30 bg-[#7C3AED]/10' : 'border-[#EDE9FE] bg-white shadow-sm'}`}>
              <Activity size={12} className="text-[#7C3AED]" />
              <span className={`text-xs font-bold ${dark ? 'text-[#A78BFA]' : 'text-[#7C3AED]'}`}>Data Usage</span>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className={`text-3xl font-black sm:text-4xl lg:text-5xl ${dark ? 'text-white' : 'text-[#0F172A]'}`}>
              How We Use Your Information
            </motion.h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {content.usage.items?.map(({ label, desc }) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${dark ? 'border-[#1E293B] bg-[#0F172A]' : 'border-[#E2E8F0] bg-[#FAFAFA]'}`}>
                <div className="flex items-start gap-3">
                  <CheckCircle size={16} className="mt-0.5 shrink-0 text-[#22C55E]" />
                  <div>
                    <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-[#0F172A]'}`}>{label}</p>
                    <p className={`mt-0.5 text-xs leading-relaxed ${dark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>{desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* PRERANA AI PRIVACY */}
        <section className={`relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 ${dark ? 'bg-[#0F172A]' : 'bg-gradient-to-br from-[#FAFAFA] via-white to-[#F5F3FF]'}`}>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-96 left-1/3 h-[600px] w-[600px] rounded-full bg-[#7C3AED]/6 blur-[150px]" />
            <div className="absolute -bottom-96 right-1/3 h-[600px] w-[600px] rounded-full bg-[#8B5CF6]/5 blur-[150px]" />
            {!dark && <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#7C3AED 1px, transparent 1px)', backgroundSize: '40px 40px' }} />}
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 ${dark ? 'border-[#7C3AED]/30 bg-[#7C3AED]/10' : 'border-[#EDE9FE] bg-white shadow-sm'}`}>
                  <Sparkles size={12} className="text-[#7C3AED]" />
                  <span className={`text-xs font-bold ${dark ? 'text-[#A78BFA]' : 'text-[#7C3AED]'}`}>AI Privacy</span>
                </motion.div>

                <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className={`text-3xl font-black sm:text-4xl lg:text-5xl ${dark ? 'text-white' : 'text-[#0F172A]'}`}>
                  Prerana AI &{' '}
                  <span className="bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] bg-clip-text text-transparent">Data Privacy</span>
                </motion.h2>

                <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className={`mt-4 max-w-xl text-lg leading-relaxed ${dark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                  Prerana AI is designed with privacy and security as foundational principles. AI interactions are processed securely with strict access controls.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="mt-8 space-y-3">
                  {content['prerana-ai'].items?.map(({ label, desc }) => (
                    <div key={label} className={`flex items-start gap-3 rounded-xl border p-4 ${dark ? 'border-[#1E293B] bg-[#0B0B1A]' : 'border-[#E2E8F0] bg-white'}`}>
                      <CheckCircle size={16} className="mt-0.5 shrink-0 text-[#22C55E]" />
                      <div>
                        <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-[#0F172A]'}`}>{label}</p>
                        <p className={`mt-0.5 text-xs leading-relaxed ${dark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>

                {/* Privacy Guarantees */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className={`mt-8 grid gap-3 sm:grid-cols-2`}>
                  {[
                    { icon: Shield, label: 'No unauthorized data sharing' },
                    { icon: Lock, label: 'Secure conversation storage' },
                    { icon: UserCheck, label: 'Controlled access permissions' },
                    { icon: Building2, label: 'Institution-level data isolation' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 ${dark ? 'border-[#1E293B] bg-[#0B0B1A]' : 'border-[#E2E8F0] bg-[#FAFAFA]'}`}>
                      <Icon size={14} className="shrink-0 text-[#22C55E]" />
                      <span className={`text-xs font-semibold ${dark ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>{label}</span>
                    </div>
                  ))}
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                className="relative hidden lg:flex items-center justify-center">
                <div className="relative h-80 w-80">
                  <div className={`absolute inset-0 rounded-3xl blur-3xl ${dark ? 'bg-[#7C3AED]/10' : 'bg-gradient-to-br from-[#7C3AED]/15 to-[#8B5CF6]/10'}`} />
                  <div className="relative grid h-full w-full place-items-center">
                    <CloudLockIcon className="h-48 w-48" />
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                      className="absolute -bottom-2 -right-2 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] p-3 shadow-lg">
                      <CheckCircle size={20} className="text-white" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* USER RIGHTS */}
        <section className={`px-4 py-20 sm:px-6 lg:px-8 ${dark ? 'bg-[#0B0B1A]' : 'bg-white'}`}>
          <div className="mx-auto max-w-7xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 ${dark ? 'border-[#7C3AED]/30 bg-[#7C3AED]/10' : 'border-[#EDE9FE] bg-white shadow-sm'}`}>
              <UserCheck size={12} className="text-[#7C3AED]" />
              <span className={`text-xs font-bold ${dark ? 'text-[#A78BFA]' : 'text-[#7C3AED]'}`}>Your Rights</span>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className={`text-3xl font-black sm:text-4xl lg:text-5xl ${dark ? 'text-white' : 'text-[#0F172A]'}`}>
              Your Privacy Rights
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className={`mx-auto mt-4 max-w-2xl text-lg ${dark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
              You have control over your personal data. Exercise your privacy rights at any time.
            </motion.p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {userRights.map(({ icon: Icon, title, desc, color }) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className={`group relative overflow-hidden rounded-2xl border p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${dark ? 'border-[#1E293B] bg-[#0F172A]' : 'border-[#E2E8F0] bg-white'}`}>
                <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: `radial-gradient(600px circle at 50% 50%, ${color}08, transparent 40%)` }} />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl transition-all duration-300 group-hover:scale-110"
                    style={{ background: `${color}12`, color }}>
                    <Icon size={22} />
                  </div>
                  <h3 className={`text-sm font-extrabold ${dark ? 'text-white' : 'text-[#0F172A]'}`}>{title}</h3>
                  <p className={`mt-1 text-xs leading-relaxed ${dark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECURITY SECTION */}
        <section className={`px-4 py-20 sm:px-6 lg:px-8 ${dark ? 'bg-[#0F172A]' : 'bg-[#FAFAFA]'}`}>
          <div className="mx-auto max-w-7xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 ${dark ? 'border-[#7C3AED]/30 bg-[#7C3AED]/10' : 'border-[#EDE9FE] bg-white shadow-sm'}`}>
              <Shield size={12} className="text-[#7C3AED]" />
              <span className={`text-xs font-bold ${dark ? 'text-[#A78BFA]' : 'text-[#7C3AED]'}`}>Security</span>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className={`text-3xl font-black sm:text-4xl lg:text-5xl ${dark ? 'text-white' : 'text-[#0F172A]'}`}>
              How We Protect Your Data
            </motion.h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {securityFeatures.map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className={`group relative overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${dark ? 'border-[#1E293B] bg-[#0B0B1A]' : 'border-[#E2E8F0] bg-white'}`}>
                <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${dark ? 'bg-[#7C3AED]/10' : 'bg-[#F3F0FF]'} text-[#7C3AED] transition-all duration-300 group-hover:scale-110`}>
                  <Icon size={18} />
                </div>
                <h3 className={`text-sm font-extrabold ${dark ? 'text-white' : 'text-[#0F172A]'}`}>{title}</h3>
                <p className={`mt-1 text-xs leading-relaxed ${dark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section className={`px-4 py-20 sm:px-6 lg:px-8 ${dark ? 'bg-[#0B0B1A]' : 'bg-white'}`}>
          <div className="mx-auto max-w-5xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 ${dark ? 'border-[#7C3AED]/30 bg-[#7C3AED]/10' : 'border-[#EDE9FE] bg-white shadow-sm'}`}>
              <Mail size={12} className="text-[#7C3AED]" />
              <span className={`text-xs font-bold ${dark ? 'text-[#A78BFA]' : 'text-[#7C3AED]'}`}>Contact</span>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className={`text-3xl font-black sm:text-4xl ${dark ? 'text-white' : 'text-[#0F172A]'}`}>
              Questions About Privacy?
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className={`mt-3 ${dark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
              Our privacy and security teams are ready to help you.
            </motion.p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-3">
            {contactCards.map(({ icon: Icon, title, email, desc }) => (
              <motion.a key={email} href={`mailto:${email}`}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className={`group rounded-2xl border p-6 text-left transition-all duration-300 hover:-translate-y-0.5 ${dark ? 'border-[#1E293B] bg-[#0F172A] hover:border-[#7C3AED]/30 hover:shadow-lg hover:shadow-[#7C3AED]/5' : 'border-[#E2E8F0] bg-white hover:border-[#7C3AED]/20 hover:shadow-lg'}`}>
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[#F3F0FF] text-[#7C3AED] transition group-hover:bg-[#7C3AED] group-hover:text-white">
                  <Icon size={18} />
                </div>
                <h3 className={`text-sm font-extrabold ${dark ? 'text-white' : 'text-[#0F172A]'}`}>{title}</h3>
                <p className={`mt-0.5 text-xs ${dark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>{desc}</p>
                <p className="mt-2 text-xs font-bold text-[#7C3AED]">{email} <ExternalLink size={10} className="inline" /></p>
              </motion.a>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="mailto:privacy@prasynx.com"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#7C3AED]/25 transition hover:-translate-y-0.5 hover:shadow-xl">
              Contact Privacy Team <ArrowRight size={15} />
            </Link>
            <button
              className={`inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${dark ? 'border-[#1E293B] bg-[#0F172A] text-[#F1F5F9]' : 'border-[#E2E8F0] bg-white text-[#475569]'}`}>
              Submit Privacy Request
            </button>
          </motion.div>
        </section>

        {/* BOTTOM CTA */}
        <section className={`border-t px-4 py-20 sm:px-6 lg:px-8 ${dark ? 'border-[#1E293B] bg-gradient-to-br from-[#0F172A] via-[#0B0B1A] to-[#0F172A]' : 'border-[#E2E8F0] bg-gradient-to-br from-[#FAFAFA] via-white to-[#F5F3FF]'}`}>
          <div className="mx-auto max-w-3xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#7C3AED]/20 to-[#8B5CF6]/20 shadow-lg">
                <Shield size={28} className="text-[#7C3AED]" />
              </motion.div>
              <h2 className={`text-3xl font-black sm:text-4xl ${dark ? 'text-white' : 'text-[#0F172A]'}`}>Your Trust Matters</h2>
              <p className={`mx-auto mt-3 max-w-xl text-lg ${dark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                Prasynx is committed to maintaining the highest standards of privacy, security, and transparency for students, parents, educators, recruiters, and institutions.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#7C3AED]/25 transition hover:-translate-y-0.5 hover:shadow-xl">
                  Contact Us <ArrowRight size={15} />
                </Link>
                <Link href="/terms"
                  className={`inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${dark ? 'border-[#1E293B] bg-[#0F172A] text-[#F1F5F9]' : 'border-[#E2E8F0] bg-white text-[#475569]'}`}>
                  View Terms & Conditions
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
