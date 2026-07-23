"use client";
import { LifeBuoy, HelpCircle, MessageCircle, Ticket, Phone, Mail, Search, ChevronRight, ArrowRight, FileText, Video, BookOpen, Star, Zap, Users, Bot, Monitor, Clock } from 'lucide-react';
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

const faqs = [
  {
    q: 'How do I reset my password?', a: 'Go to the login page and click "Forgot Password". Enter your registered email address and we\'ll send you a password reset link. For admin assistance, contact your institution\'s system administrator.',
    category: 'Account',
  },
  {
    q: 'How do I add new students to the system?', a: 'Navigate to the Admin Dashboard > Student Management. You can add students individually via the "Add Student" button or bulk import using our CSV template. The system supports up to 10,000 records per import.',
    category: 'Students',
  },
  {
    q: 'What payment methods are supported for fee collection?', a: 'Prasynx supports Razorpay, Stripe, PayPal, and bank transfer integrations. Parents can pay via credit/debit cards, UPI, net banking, and wallets. All transactions are PCI-DSS compliant.',
    category: 'Payments',
  },
  {
    q: 'How do I generate report cards?', a: 'Go to Academic > Reports > Report Cards. Select the class, term, and template. The system auto-populates grades and generates PDF report cards that can be emailed to parents or printed.',
    category: 'Reports',
  },
  {
    q: 'Is there a mobile app for parents?', a: 'Yes, the Prasynx Parent App is available on iOS and Android. Parents can track attendance, view grades, receive notifications, communicate with teachers, and make fee payments from their phone.',
    category: 'Mobile',
  },
  {
    q: 'How does attendance tracking work?', a: 'Prasynx supports multiple attendance methods: QR code scanning, RFID cards, biometric fingerprint, and manual entry. Teachers can mark attendance via the web portal or mobile app in under 30 seconds.',
    category: 'Attendance',
  },
  {
    q: 'Can I integrate Prasynx with my existing LMS?', a: 'Yes, Prasynx offers REST APIs and pre-built connectors for Moodle, Canvas, Blackboard, and Google Classroom. Our integration team can assist with custom integrations.',
    category: 'Integrations',
  },
  {
    q: 'What are the system requirements for Prasynx?', a: 'Prasynx runs entirely in the browser. We recommend the latest versions of Chrome, Firefox, Edge, or Safari. Internet connectivity of at least 5 Mbps is recommended for optimal performance.',
    category: 'Technical',
  },
];

const supportOptions = [
  { icon: MessageCircle, title: 'Live Chat', desc: 'Instant messaging with our support team.', availability: 'Available now', color: '#6C4CF1', href: '#' },
  { icon: Ticket, title: 'Submit a Ticket', desc: 'Create a detailed support request for complex issues.', availability: 'Response in 2 hours', color: '#8B5CF6', href: '#' },
  { icon: Phone, title: 'Phone Support', desc: 'Speak directly with a support specialist.', availability: 'Mon-Sat, 9AM-6PM IST', color: '#A855F7', href: '#' },
  { icon: Mail, title: 'Email Support', desc: 'Send us a detailed message and we will respond promptly.', availability: 'Avg. 4 hours', color: '#4F2DB8', href: '#' },
];

export default function HelpCenterPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <SiteShell>
      <PageMain>
        <section className="relative overflow-hidden px-4 pt-20 pb-10 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-[#6D4CFF]/10 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-[#8B5CF6]/12 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E8E0FF] bg-white/80 px-4 py-2 text-sm font-extrabold text-[#4F2DB8] shadow-sm">
                <LifeBuoy className="h-4 w-4 text-[#A855F7]" />
                Help Center
              </div>
              <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                How Can We Help You?
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Find answers, get support, and connect with our team. We are here to help you make the most of Prasynx Education OS.
              </p>
              <div className="relative mx-auto mt-8 max-w-xl">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search for help articles, FAQs, topics..."
                  className="w-full rounded-2xl border border-[#E2E8F0] bg-white/90 py-4 pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#6C4CF1] focus:ring-4 focus:ring-[#F3F0FF] shadow-sm"
                />
              </div>
            </div>
          </div>
        </section>

        <PageSection>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {supportOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <Link key={opt.title} href={opt.href}
                  className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 transition hover:border-[#E8E0FF] hover:shadow-lg hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl transition group-hover:scale-105"
                      style={{ background: `${opt.color}15`, color: opt.color }}>
                      <Icon size={18} />
                    </span>
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">{opt.availability}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-950">{opt.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{opt.desc}</p>
                </Link>
              );
            })}
          </div>
        </PageSection>

        <PageSection tone="soft">
          <SectionHeader
            eyebrow="FAQ"
            title="Frequently Asked Questions"
            description="Quick answers to the most common questions about Prasynx Education OS."
          />
          <div className="mx-auto max-w-3xl space-y-2">
            {faqs.map((faq, i) => (
              <motion.div key={i} {...stagger}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between rounded-2xl border border-[#E2E8F0] bg-white px-6 py-4 text-left text-sm font-bold text-slate-950 transition hover:border-[#E8E0FF] hover:shadow-sm">
                  <span className="flex items-center gap-2">
                    <span className="rounded-full bg-[#F3F0FF] px-2 py-0.5 text-[10px] font-bold text-[#6C4CF1]">{faq.category}</span>
                    {faq.q}
                  </span>
                  <ChevronRight size={16} className={`shrink-0 text-slate-400 transition duration-200 ${openFaq === i ? 'rotate-90' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="mx-6 mt-2 mb-4 text-sm leading-relaxed text-slate-600">{faq.a}</div>
                )}
              </motion.div>
            ))}
          </div>
        </PageSection>

        <PageSection>
          <SectionHeader
            eyebrow="Guides"
            title="Popular Help Articles"
            description="Quick-start guides and tutorials to get you up and running fast."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: FileText, title: 'Getting Started Guide', desc: 'Set up your institution in 30 minutes.', href: '/resources/documentation' },
              { icon: Video, title: 'Video Tutorials', desc: 'Watch step-by-step walkthroughs.', href: '/resources/tutorials' },
              { icon: BookOpen, title: 'Knowledge Base', desc: 'Browse all help articles.', href: '/resources/knowledge-base' },
              { icon: Bot, title: 'Prerana AI Guide', desc: 'Learn about AI-powered features.', href: '/resources/documentation' },
            ].map((guide) => {
              const Icon = guide.icon;
              return (
                <Link key={guide.title} href={guide.href}
                  className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 transition hover:border-[#E8E0FF] hover:shadow-lg hover:-translate-y-1">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#F3F0FF] text-[#6C4CF1] transition group-hover:bg-[#6C4CF1] group-hover:text-white">
                    <Icon size={16} />
                  </span>
                  <h3 className="mt-3 text-sm font-bold text-slate-950">{guide.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{guide.desc}</p>
                </Link>
              );
            })}
          </div>
        </PageSection>

        <CtaBand
          title="Still Need Help?"
          description="Our dedicated support team is available to assist you with any issue, big or small."
          href="/contact"
          action="Contact Us Today"
        />
      </PageMain>
    </SiteShell>
  );
}
