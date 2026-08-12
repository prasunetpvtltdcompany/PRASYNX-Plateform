"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Calendar, CheckCircle, ChevronDown, Clock, FileText, Globe, Headphones,
  Mail, MapPin, MessageSquare, Phone, Send, Shield, Sparkles, Star, Users, Video,
  Building2, GraduationCap, BookOpen, Briefcase, ChevronRight, Quote, X,
  Plus, Minus, Play, ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';
import SiteShell from '../components/SiteShell';

const institutionTypes = ['School', 'College', 'University', 'Training Institute', 'Corporate Organization'];
const roles = ['Principal', 'Director', 'Teacher', 'Administrator', 'IT Manager', 'Recruiter', 'Parent'];
const subjects = ['Request Demo', 'Sales Inquiry', 'Technical Support', 'Implementation', 'Partnership', 'Billing', 'General Inquiry'];

const quickCards = [
  { icon: Building2, label: 'Sales Team', desc: 'Learn how Prasynx can transform your institution.', color: '#7C3AED' },
  { icon: Headphones, label: 'Support Team', desc: 'Get technical support and assistance.', color: '#059669' },
  { icon: Briefcase, label: 'Implementation Team', desc: 'Discuss onboarding and deployment.', color: '#2563EB' },
  { icon: Users, label: 'Partnership Team', desc: 'Explore collaboration opportunities.', color: '#D97706' },
];

const supportChannels = [
  { icon: Phone, label: 'Call Us', desc: 'Get direct assistance.', action: '+91 8905483183', href: 'tel:+918905483183' },
  { icon: Mail, label: 'Email Support', desc: 'Receive detailed responses.', action: 'support@prasynx.com', href: 'mailto:support@prasynx.com' },
  { icon: Video, label: 'Schedule Demo', desc: 'Book a live walkthrough.', action: 'Book Now', href: '/book-demo' },
  { icon: MessageSquare, label: 'Live Chat', desc: 'Instant support from our team.', action: 'Start Chat', href: '#' },
];


const contactInfo = [
  { icon: Phone, title: 'Phone Support', value: '+91 8905483183', note: 'Mon - Fri, 9:00 AM - 6:00 PM IST' },
  { icon: Mail, title: 'Email Support', value: 'support@prasynx.com', note: 'We respond within 24 hours' },
  { icon: Mail, title: 'Sales Team', value: 'sales@prasynx.com', note: 'Dedicated sales support' },
  { icon: MapPin, title: 'Head Office', value: 'Chandigarh, India', note: 'Global operations in 15+ countries' },
];

const faqs = [
  { q: 'How quickly will I receive a response?', a: 'Our team typically responds within 2-4 hours during business hours (Mon-Fri, 9 AM - 6 PM IST). For urgent inquiries, we recommend calling our support line for immediate assistance.' },
  { q: 'Can I schedule a custom demo?', a: 'Yes! You can book a personalized demo tailored to your institution type and requirements. Our team will walk you through relevant features and answer your specific questions during the session.' },
  { q: 'Do you support international institutions?', a: 'Absolutely. Prasynx serves institutions in 15+ countries worldwide. Our platform supports multiple time zones, languages, and regional compliance requirements including GDPR.' },
  { q: 'Do you provide implementation assistance?', a: 'Yes, our implementation team works closely with your institution to ensure a smooth deployment. We provide dedicated support during onboarding, data migration, staff training, and go-live.' },
  { q: 'Can multiple team members join a demo?', a: 'Absolutely. We encourage you to invite stakeholders from different departments. Our demo sessions support multiple participants and we can customize the walkthrough based on each attendee interest.' },
  { q: 'Do you offer onboarding support?', a: 'Yes, every new institution receives comprehensive onboarding support including dedicated account management, staff training sessions, documentation, and a phased rollout plan tailored to your institution size.' },
];

function FAQItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className={`group rounded-2xl border transition-all ${open ? 'border-[#7C3AED]/30 bg-[#F3F0FF] shadow-md' : 'border-[#E2E8F0] bg-white hover:border-[#7C3AED]/20 hover:shadow-sm'}`}>
      <button onClick={onToggle} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
        <span className={`text-sm font-bold transition ${open ? 'text-[#7C3AED]' : 'text-[#0F172A]'}`}>{q}</span>
        <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border transition ${open ? 'border-[#7C3AED]/30 bg-[#7C3AED]/10' : 'border-[#E2E8F0] bg-white group-hover:border-[#7C3AED]/30'}`}>
          {open ? <Minus size={12} className="text-[#7C3AED]" /> : <Plus size={12} className="text-[#64748B]" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div key="content" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="overflow-hidden">
            <p className="border-t border-[#E2E8F0] px-6 pb-5 pt-4 text-sm leading-relaxed text-[#475569]">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Contact() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <SiteShell>
      <main>
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden px-4 pt-8 sm:px-6 lg:px-8" style={{ minHeight: '650px', background: '#FAFAFE' }}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(124,58,237,0.08)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.06)_0%,transparent_50%),radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.04)_0%,transparent_40%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(124,58,237,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#7C3AED]/10 blur-[120px]" />
          <div className="pointer-events-none absolute -right-40 bottom-10 h-80 w-80 rounded-full bg-[#A855F7]/8 blur-[100px]" />

          <div className="mx-auto flex max-w-7xl flex-col items-center lg:flex-row" style={{ minHeight: '650px' }}>
            <div className="flex w-full items-center lg:w-[55%] lg:pr-8" style={{ minHeight: '650px' }}>
              <div className="w-full py-16 text-center lg:text-left">
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl text-[#0F172A]">
                  Let's Build the{' '}
                  <span className="bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">Future of Education</span>{' '}
                  Together
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                  className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-[#64748B] lg:mx-0">
                  Whether you're exploring Prasynx, planning implementation, looking for enterprise solutions, or need technical assistance, our experts are ready to help.
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
                  <a href="#form" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#7C3AED]/20 transition-all hover:-translate-y-1 hover:shadow-xl">
                    Contact Our Team <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </a>
                  <a href="/book-demo" className="inline-flex items-center gap-2 rounded-xl border-2 border-[#E2E8F0] bg-white/80 backdrop-blur-sm px-7 py-3.5 text-sm font-bold text-[#475569] transition-all hover:-translate-y-0.5 hover:border-[#7C3AED]/30 hover:bg-[#F3F0FF] hover:text-[#7C3AED] hover:shadow-lg">
                    Schedule Demo
                  </a>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}
                  className="mt-10 rounded-2xl border border-[#E2E8F0] bg-white/80 backdrop-blur-sm p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#F59E0B] mb-3">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-current" />)}
                    <span className="ml-1 text-xs font-medium text-[#64748B]">Trusted by Institutions Worldwide</span>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    {[
                      { value: '50,000+', label: 'Students' },
                      { value: '5,000+', label: 'Teachers' },
                      { value: '1,000+', label: 'Institutions' },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[#7C3AED]" />
                        <span className="text-sm font-bold text-[#0F172A]">{s.value}</span>
                        <span className="text-xs text-[#94A3B8]">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="relative flex w-full items-end justify-center lg:w-[45%]" style={{ minHeight: '650px' }}>
              <div className="relative flex h-[600px] w-full max-w-[560px] items-end justify-center">
                <motion.img
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  src="/contacthero.png"
                  alt="Prasynx contact team"
                  className="h-full w-full object-contain drop-shadow-2xl"
                />

              </div>
            </div>
          </div>
        </section>

        {/* ===== TRUST BAR ===== */}
        <section className="relative -mt-10 px-4 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white/80 backdrop-blur-xl p-5 shadow-lg sm:p-6">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#7C3AED]/3 via-transparent to-[#8B5CF6]/3" />
              <div className="relative flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                {[
                  { icon: CheckCircle, text: 'Avg Response: Under 1 Hour', color: '#059669' },
                  { icon: Star, text: 'Customer Satisfaction: 98%', color: '#F59E0B' },
                  { icon: Globe, text: 'Global Support Coverage', color: '#7C3AED' },
                  { icon: Users, text: 'Dedicated Success Team', color: '#2563EB' },
                  { icon: Shield, text: 'Enterprise Onboarding', color: '#7C3AED' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <Icon size={14} style={{ color: item.color }} />
                      <span className="text-xs font-bold text-[#475569] whitespace-nowrap">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== QUICK CONTACT OPTIONS ===== */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickCards.map((card) => {
                const Icon = card.icon;
                return (
                  <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
                    className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-[#7C3AED]/20">
                    <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-0 transition-opacity group-hover:opacity-100" style={{ background: `${card.color}08` }} />
                    <div className="grid h-10 w-10 place-items-center rounded-xl mb-4" style={{ background: `${card.color}10`, color: card.color }}>
                      <Icon size={20} />
                    </div>
                    <h3 className="text-sm font-black text-[#0F172A]">{card.label}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#64748B]">{card.desc}</p>
                    <a href="#form" className="mt-4 inline-flex items-center gap-1 text-xs font-bold transition-all" style={{ color: card.color }}>
                      Get in Touch <ArrowRight size={12} />
                    </a>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== CONTACT FORM + INFO ===== */}
        <section id="form" className="px-4 py-16 sm:px-6 lg:px-8" style={{ background: '#F8FAFC' }}>
          <div className="mx-auto max-w-7xl">
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
              <h2 className="text-3xl font-black text-[#0F172A] sm:text-4xl">Tell Us How We Can Help</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-[#64748B]">Share your requirements and we'll connect you with the right specialist.</p>
            </motion.div>
            <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-lg sm:p-8">
                <form className="grid gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <label className="text-xs font-bold text-[#475569]">Full Name <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="John Doe" className="rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition focus:border-[#7C3AED]/40 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10" />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-xs font-bold text-[#475569]">Work Email <span className="text-red-500">*</span></label>
                      <input type="email" placeholder="john@institution.edu" className="rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition focus:border-[#7C3AED]/40 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10" />
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <label className="text-xs font-bold text-[#475569]">Phone Number</label>
                      <input type="tel" placeholder="+1 (555) 000-0000" className="rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition focus:border-[#7C3AED]/40 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10" />
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-xs font-bold text-[#475569]">Organization Name <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="Your Institution" className="rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition focus:border-[#7C3AED]/40 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10" />
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-3">
                    <div className="grid gap-1.5">
                      <label className="text-xs font-bold text-[#475569]">Organization Type</label>
                      <div className="relative">
                        <select className="w-full appearance-none rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] px-4 py-3 pr-10 text-sm text-[#0F172A] transition focus:border-[#7C3AED]/40 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10">
                          <option value="">Select type</option>
                          {institutionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                      </div>
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-xs font-bold text-[#475569]">Role</label>
                      <div className="relative">
                        <select className="w-full appearance-none rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] px-4 py-3 pr-10 text-sm text-[#0F172A] transition focus:border-[#7C3AED]/40 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10">
                          <option value="">Select role</option>
                          {roles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                      </div>
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-xs font-bold text-[#475569]">Subject</label>
                      <div className="relative">
                        <select className="w-full appearance-none rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] px-4 py-3 pr-10 text-sm text-[#0F172A] transition focus:border-[#7C3AED]/40 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10">
                          <option value="">Select subject</option>
                          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-xs font-bold text-[#475569]">Message <span className="text-red-500">*</span></label>
                    <textarea rows={5} placeholder="Tell us about your requirements..." className="rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition focus:border-[#7C3AED]/40 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10" />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-xs font-bold text-[#475569]">Attach Documents</label>
                    <div className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-[#E2E8F0] bg-[#FAFAFA] px-5 py-4 transition hover:border-[#7C3AED]/30 hover:bg-[#F3F0FF]">
                      <FileText size={18} className="text-[#7C3AED]" />
                      <span className="text-sm font-medium text-[#64748B]">Click to upload or drag and drop</span>
                    </div>
                  </div>
                  <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#7C3AED]/20 transition-all hover:-translate-y-0.5 hover:shadow-xl">
                    Send Request <Send size={15} />
                  </button>
                </form>
              </motion.div>
              <div className="grid gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                  <h3 className="font-black text-[#0F172A]">We're Here to Help</h3>
                  <p className="mt-1 text-xs text-[#64748B]">Our team typically responds within 2-4 hours.</p>
                  <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#F3F0FF] px-4 py-3">
                    <Clock size={16} className="text-[#7C3AED]" />
                    <span className="text-xs font-bold text-[#475569]">Mon - Fri, 9 AM - 6 PM IST</span>
                  </div>
                </motion.div>
                {contactInfo.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={item.title} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 * i + 0.1 }}
                      className="flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-[#7C3AED]/20">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F3F0FF] text-[#7C3AED]">
                        <Icon size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[#0F172A]">{item.title}</h4>
                        <p className="text-sm font-medium text-[#475569]">{item.value}</p>
                        <p className="text-[11px] text-[#94A3B8]">{item.note}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ===== SMART SUPPORT ===== */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 text-center">
              <h2 className="text-3xl font-black text-[#0F172A] sm:text-4xl">Choose The Right Support Channel</h2>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {supportChannels.map((ch) => {
                const Icon = ch.icon;
                return (
                  <motion.a key={ch.label} href={ch.href}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
                    className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center transition-all hover:-translate-y-1 hover:shadow-xl hover:border-[#7C3AED]/20">
                    <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#7C3AED]/5 opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#F3F0FF] text-[#7C3AED]">
                      <Icon size={22} />
                    </div>
                    <h3 className="mt-4 text-sm font-black text-[#0F172A]">{ch.label}</h3>
                    <p className="mt-1 text-xs text-[#64748B]">{ch.desc}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#7C3AED] transition-all group-hover:gap-2">
                      {ch.action} <ArrowRight size={11} />
                    </span>
                  </motion.a>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== BOOK A DEMO CTA ===== */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white px-8 py-16 shadow-lg sm:px-16 sm:py-20">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#7C3AED]/3 via-transparent to-[#8B5CF6]/3" />
              <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-[#7C3AED]/5 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-[#8B5CF6]/5 blur-3xl" />

              <div className="relative flex flex-col items-center text-center">
                <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-[#F3F0FF] shadow-sm border border-[#E8E0FF]">
                  <Calendar size={28} className="text-[#7C3AED]" />
                </motion.div>
                <h2 className="text-3xl font-black leading-tight text-[#0F172A] sm:text-4xl lg:text-5xl max-w-2xl">Want A Personalized Walkthrough?</h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#64748B]">
                  See how Prasynx can streamline administration, improve engagement, and empower your institution with AI-powered technology.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  <a href="/book-demo" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-[#7C3AED]/20 transition-all hover:-translate-y-1 hover:shadow-xl">
                    Schedule Demo <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                  </a>
                  <a href="/platform" className="inline-flex items-center gap-2 rounded-xl border-2 border-[#E2E8F0] px-8 py-3.5 text-base font-bold text-[#475569] transition-all hover:-translate-y-0.5 hover:border-[#7C3AED]/30 hover:bg-[#F3F0FF] hover:text-[#7C3AED] hover:shadow-lg">
                    <Play size={16} /> Watch Platform Tour
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="px-4 py-20 sm:px-6 lg:px-8" style={{ background: '#F8FAFC' }}>
          <div className="mx-auto max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 text-center">
              <h2 className="text-3xl font-black text-[#0F172A] sm:text-4xl">Frequently Asked Questions</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-[#64748B]">Quick answers to common questions about connecting with our team.</p>
            </motion.div>
            <div className="grid gap-3">
              {faqs.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="px-4 pb-20 pt-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white px-8 py-14 sm:px-14 sm:py-16 shadow-lg text-center">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#7C3AED]/3 via-transparent to-[#8B5CF6]/3" />
              <div className="relative">
                <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#F3F0FF] shadow-sm">
                  <Sparkles size={24} className="text-[#7C3AED]" />
                </motion.div>
                <h2 className="text-3xl font-black leading-tight text-[#0F172A] sm:text-4xl">Ready To Transform Your Institution?</h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#64748B]">
                  Join thousands of educators, administrators, students, and organizations using Prasynx to modernize education and operations.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  <a href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-[#7C3AED]/20 transition-all hover:-translate-y-1 hover:shadow-xl">
                    Contact Sales <ArrowRight size={18} />
                  </a>
                  <a href="/book-demo" className="inline-flex items-center gap-2 rounded-xl border-2 border-[#E2E8F0] px-8 py-3.5 text-base font-bold text-[#475569] transition-all hover:-translate-y-0.5 hover:border-[#7C3AED]/30 hover:bg-[#F3F0FF] hover:text-[#7C3AED] hover:shadow-lg">
                    Book Demo
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
