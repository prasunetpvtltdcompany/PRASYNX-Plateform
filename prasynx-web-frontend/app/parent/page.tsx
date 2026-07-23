"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, CheckCircle, ChevronDown, GraduationCap, BarChart3, BookOpen,
  DollarSign, MessageCircle, Bell, Star, Sparkles, Users, TrendingUp,
  Calendar, CreditCard, Send, Phone, Shield, Zap, Globe, Layers,
  Quote, ChevronRight, MoveRight, Trophy
} from 'lucide-react';
import SiteShell from '../components/SiteShell';

const P = '#7C3AED';
const S = '#8B5CF6';

const fadeUp = { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
const stagger = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, staggerChildren: 0.1 } };

function Badge({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold ${light ? 'border-white/20 text-white/80' : 'border-[#E8E0FF] bg-[#F3F0FF] text-[#4F2DB8]'}`}>
      <Sparkles size={12} /> {children}
    </span>
  );
}

function SectionHeading({ badge, title, subtitle, light }: { badge: string; title: string; subtitle?: string; light?: boolean }) {
  return (
    <motion.div {...fadeUp} className="mx-auto mb-16 max-w-3xl text-center">
      <Badge light={light}>{badge}</Badge>
      <h2 className={`mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl ${light ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
      {subtitle && <p className={`mt-4 text-base leading-relaxed ${light ? 'text-white/60' : 'text-slate-500'}`}>{subtitle}</p>}
    </motion.div>
  );
}


const testimonials = [
  { name: 'Sunita Verma', child: 'Aarav, Grade 8', text: 'Prasynx has made it so easy to track my son\'s progress. The attendance alerts and teacher messages keep me informed every single day.', avatar: 'SV' },
  { name: 'Rohit Mehta', child: 'Priya, Grade 5', text: 'Fee management is seamless. I can pay online, download receipts, and never miss a deadline. Absolute game-changer for working parents.', avatar: 'RM' },
  { name: 'Anita Desai', child: 'Neha & Rohan, Grade 3 & 6', text: 'Having two children in different grades, Prasynx lets me monitor both from one dashboard. The report cards and teacher communication are excellent.', avatar: 'AD' },
];

const faqs = [
  { q: 'How do I track my child\'s daily attendance?', a: 'Once logged in, your dashboard shows real-time attendance for each child. You\'ll also receive instant alerts via SMS, email, and in-app notifications if your child is marked absent.' },
  { q: 'Can I pay school fees online through the portal?', a: 'Yes. The Fee Management section lets you view due amounts, payment history, and pay using credit/debit cards, UPI, net banking, or digital wallets. Instant receipts are generated.' },
  { q: 'How can I communicate with my child\'s teachers?', a: 'The Teacher Communication module provides a direct messaging interface. You can send messages, attach files, and schedule parent-teacher meetings — all within the portal.' },
  { q: 'Will I get notified about school events and announcements?', a: 'Absolutely. The School Announcements section displays all notices, and you\'ll receive push notifications for urgent updates, event reminders, and holiday schedules.' },
  { q: 'Is my child\'s data secure on Prasynx?', a: 'Yes. Prasynx uses enterprise-grade encryption, role-based access control, and is fully compliant with data protection regulations. Your child\'s information is accessible only to authorized school staff and you.' },
];

export default function ParentPortal() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <SiteShell>
      {/* HERO */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#F3F0FF]/80 via-white to-white pb-20 pt-32 lg:pt-40">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-[#DDD6FE]/20 blur-3xl" />
          <div className="absolute -right-40 top-40 h-[400px] w-[400px] rounded-full bg-[#C4B5FD]/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-[300px] w-[800px] -translate-x-1/2 rounded-full bg-[#E8E0FF]/30 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex flex-col items-center gap-16 lg:flex-row">
            <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex-1 max-w-xl">
              <Badge>Parent Portal</Badge>
              <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl text-slate-950">
                Stay Connected To<br />
                Every <span className="bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] bg-clip-text text-transparent">Milestone</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-500 lg:text-lg">
                Get real-time academic updates, attendance tracking, fee management, and direct teacher communication — all from one unified dashboard designed for modern parents.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/parent/login" className="group inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold text-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl" style={{ background: `linear-gradient(135deg, ${P}, ${S})` }}>
                  Access Parent Portal <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </Link>
                <Link href="/book-demo" className="group inline-flex items-center gap-2 rounded-2xl border-2 border-[#E2E8F0] bg-white px-8 py-4 text-sm font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-1 hover:border-[#DDD6FE] hover:shadow-lg">
                  Book a Demo
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6">
                {[
                  { icon: Shield, label: 'Secure' },
                  { icon: Zap, label: 'Real-Time' },
                  { icon: Globe, label: 'Multi-Child' },
                ].map(({ icon: I, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <I size={14} className="text-[#7C3AED]" /> {label}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT ILLUSTRATION */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
              className="relative flex-1 w-full max-w-xl flex items-end justify-end min-h-[460px] lg:-mr-16 xl:-mr-28 lg:-mb-20">
              
              {/* Soft purple radial glow behind illustration */}
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#7C3AED]/10 via-[#8B5CF6]/5 to-transparent rounded-full blur-[100px] opacity-80 pointer-events-none" />
              
              <div className="relative z-10 flex items-end justify-end w-full">
                <motion.img
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  src="/parentportalhero.png"
                  alt="Prasynx Parent Portal Ecosystem"
                  className="relative max-h-[460px] w-auto object-contain object-right object-bottom select-none pointer-events-none drop-shadow-[0_20px_50px_rgba(124,58,237,0.12)]"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ACADEMIC MONITORING */}
      <section className="px-6 py-28 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading badge="Academic Monitoring" title="Keep Track Of Every Grade & Report" subtitle="View real-time academic performance, attendance records, and detailed progress reports for each child." />
          <div className="grid gap-8 lg:grid-cols-3">
            {[
              { icon: BarChart3, title: 'Performance Analytics', desc: 'Visual dashboards showing subject-wise grades, class rankings, and improvement trends over time.', color: P },
              { icon: TrendingUp, title: 'Attendance Tracking', desc: 'Real-time attendance with daily alerts, monthly summaries, and absence justification requests.', color: S },
              { icon: BookOpen, title: 'Digital Report Cards', desc: 'Download term-wise report cards, teacher remarks, and co-curricular assessment scores instantly.', color: '#8B5CF6' },
            ].map(({ icon: I, title, desc, color }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl" style={{ boxShadow: `0 4px 6px ${color}08` }}>
                <span className="grid h-14 w-14 place-items-center rounded-2xl text-white text-xl font-black transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl" style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
                  <I size={24} />
                </span>
                <h3 className="mt-6 text-xl font-black text-slate-900">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{desc}</p>
                <ul className="mt-6 space-y-2.5">
                  {[
                    { label: 'Subject-wise grade breakdown' },
                    { label: 'Comparative class analytics' },
                    { label: 'Downloadable PDF reports' },
                  ].map(({ label }) => (
                    <li key={label} className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                      <CheckCircle size={14} className="shrink-0" style={{ color }} /> {label}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEE MANAGEMENT */}
      <section className="bg-[#F3F0FF]/40 px-6 py-28 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading badge="Fee Management" title="Simplified Payments & Financial Tracking" subtitle="View fee structures, track payment history, set up auto-pay, and receive timely reminders." />
          <div className="flex flex-col items-center gap-16 lg:flex-row">
            <motion.div {...fadeUp} className="flex-1 space-y-6">
              {[
                { icon: CreditCard, title: 'Online Payments', desc: 'Pay tuition, transport, and activity fees via credit card, UPI, net banking, or digital wallets.' },
                { icon: DollarSign, title: 'Payment History', desc: 'Complete transaction history with downloadable receipts and annual fee statements.' },
                { icon: Calendar, title: 'Due Date Reminders', desc: 'Automated email, SMS, and in-app reminders before every fee due date — never miss a payment.' },
                { icon: Shield, title: 'Secure Transactions', desc: 'All payments are processed through PCI-DSS compliant gateways with bank-grade encryption.' },
              ].map(({ icon: I, title, desc }) => (
                <div key={title} className="flex items-start gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#F3F0FF] text-[#7C3AED]"><I size={22} /></span>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{title}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="flex-1 w-full max-w-md">
              <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xl shadow-[#4F2DB8]/5">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                  <h4 className="text-sm font-black text-slate-900">Fee Dashboard</h4>
                  <span className="rounded-full bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#4F2DB8]">2 Children</span>
                </div>
                <div className="mt-5 space-y-4">
                  {[
                    { child: 'Aarav Verma', class: 'Grade 8-A', fee: '₹45,000', status: 'Paid', due: '-' },
                    { child: 'Anaya Verma', class: 'Grade 5-B', fee: '₹42,000', status: 'Pending', due: 'Jun 20' },
                  ].map((item) => (
                    <div key={item.child} className="rounded-xl bg-[#F8FAFF] p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-black text-slate-900">{item.child}</p>
                          <p className="text-xs font-semibold text-slate-400">{item.class}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${item.status === 'Paid' ? 'bg-[#F3F0FF] text-[#4F2DB8]' : 'bg-amber-50 text-amber-700'}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-[#E2E8F0] pt-3">
                        <span className="text-xs font-semibold text-slate-400">Annual Fee</span>
                        <span className="text-sm font-black text-slate-900">{item.fee}</span>
                      </div>
                      {item.due !== '-' && (
                        <p className="mt-2 text-xs font-bold text-amber-600">Due by {item.due}</p>
                      )}
                    </div>
                  ))}
                </div>
                <button className="mt-5 w-full rounded-xl py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg" style={{ background: `linear-gradient(135deg, ${P}, ${S})` }}>
                  Pay Outstanding Fees
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TEACHER COMMUNICATION */}
      <section className="px-6 py-28 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading badge="Teacher Communication" title="Stay In Touch With Educators" subtitle="Direct messaging, parent-teacher meeting scheduling, and instant updates from your child\'s teachers." />
          <div className="flex flex-col-reverse items-center gap-16 lg:flex-row">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="flex-1 w-full max-w-md">
              <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xl shadow-[#4F2DB8]/5">
                <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-xs font-bold text-white">MR</span>
                  <div>
                    <p className="text-sm font-black text-slate-900">Ms. Meera Rao</p>
                    <p className="text-xs font-semibold text-slate-400">Class Teacher - Grade 8A</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { from: 'Ms. Rao', text: 'Aarav has shown great improvement in Mathematics this quarter. Keep encouraging him!' },
                    { from: 'You', text: 'Thank you so much! We\'ve been practicing at home daily.' },
                    { from: 'Ms. Rao', text: 'Parent-Teacher meeting is scheduled for Friday, 4 PM. Please confirm.' },
                  ].map((msg, i) => (
                    <div key={i} className={`flex ${msg.from === 'You' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.from === 'You' ? 'bg-[#7C3AED] text-white' : 'bg-[#F1F5F9] text-slate-700'}`}>
                        <p className="text-xs font-bold opacity-70">{msg.from}</p>
                        <p className="mt-0.5 text-xs leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFF] px-4 py-2">
                  <input type="text" placeholder="Type your message..." className="flex-1 bg-transparent text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-400" />
                  <button className="grid h-8 w-8 place-items-center rounded-xl bg-[#7C3AED] text-white transition hover:bg-[#7C3AED]">
                    <Send size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
            <motion.div {...fadeUp} className="flex-1 space-y-6">
              {[
                { icon: MessageCircle, title: 'Direct Messaging', desc: 'Send messages directly to teachers, attach files, and receive instant replies.' },
                { icon: Users, title: 'PTM Scheduling', desc: 'Book parent-teacher meeting slots online based on teacher availability.' },
                { icon: Bell, title: 'Instant Notifications', desc: 'Get notified when teachers send updates, share feedback, or raise concerns.' },
              ].map(({ icon: I, title, desc }) => (
                <div key={title} className="flex items-start gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#F3F0FF] text-[#7C3AED]"><I size={22} /></span>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{title}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* SCHOOL ANNOUNCEMENTS */}
      <section className="bg-[#F3F0FF]/40 px-6 py-28 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading badge="School Announcements" title="Never Miss An Important Update" subtitle="Stay informed with school-wide announcements, event calendars, holiday schedules, and urgent notices." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Bell, title: 'Summer Break Notice', date: 'Jun 1, 2026', tag: 'Important', color: '#F59E0B', desc: 'School will remain closed from June 15 to July 10 for summer vacation.' },
              { icon: Trophy, title: 'Annual Sports Day', date: 'May 20, 2026', tag: 'Event', color: P, desc: 'Annual sports day will be held on May 25. Parents are cordially invited.' },
              { icon: Star, title: 'Science Fair Results', date: 'May 15, 2026', tag: 'Achievement', color: '#3B82F6', desc: 'Congratulations to all winners! The science fair was a huge success this year.' },
              { icon: Calendar, title: 'PTM Schedule', date: 'May 10, 2026', tag: 'Meeting', color: S, desc: 'Parent-teacher meetings for all grades will be held from May 28-30.' },
              { icon: BookOpen, title: 'New Curriculum', date: 'May 5, 2026', tag: 'Academic', color: '#8B5CF6', desc: 'The new NEP-aligned curriculum will be introduced from the upcoming academic session.' },
              { icon: Shield, title: 'Safety Workshop', date: 'Apr 28, 2026', tag: 'Workshop', color: '#EC4899', desc: 'Mandatory safety awareness workshop for parents on May 5 at 10 AM in the auditorium.' },
            ].map(({ icon: I, title, date, tag, color, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }}
                className="group rounded-3xl border border-[#E2E8F0] bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${color}15`, color }}><I size={18} /></span>
                  <span className="rounded-full px-3 py-1 text-[10px] font-bold" style={{ background: `${color}15`, color }}>{tag}</span>
                </div>
                <h4 className="mt-4 text-sm font-black text-slate-900">{title}</h4>
                <p className="mt-1 text-xs font-semibold text-slate-400">{date}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-6 py-28 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading badge="Parent Testimonials" title="Trusted By Thousands Of Parents" subtitle="Hear from parents who use Prasynx to stay connected with their child\'s education journey every day." />
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:border-[#E8E0FF] hover:shadow-2xl hover:shadow-[#4F2DB8]/10">
                <Quote size={24} className="text-[#DDD6FE]" />
                <p className="mt-4 text-sm leading-relaxed text-slate-600">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3 border-t border-[#E2E8F0] pt-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-xs font-bold text-white">{t.avatar}</span>
                  <div>
                    <p className="text-sm font-black text-slate-900">{t.name}</p>
                    <p className="text-xs font-semibold text-slate-400">{t.child}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#F3F0FF]/40 px-6 py-28 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <SectionHeading badge="FAQ" title="Frequently Asked Questions" subtitle="Everything you need to know about the Prasynx Parent Portal." />
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.3 }}
                className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm transition-all hover:shadow-md">
                <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left">
                  <span className="text-sm font-black text-slate-900">{faq.q}</span>
                  <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                      className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm leading-relaxed text-slate-500">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden px-6 py-28 lg:px-12" style={{ background: 'linear-gradient(135deg, #4F2DB8, #7C3AED, #8B5CF6, #A855F7)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#C4B5FD]/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)] bg-size-[32px_32px]" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div {...fadeUp}>
            <Users size={48} className="mx-auto text-white/60" />
            <h2 className="mt-6 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">Ready To Stay Connected?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/60">Join thousands of parents already using Prasynx to monitor, manage, and celebrate their child\'s educational journey in real-time.</p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/parent/login" className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-[#4F2DB8] shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl">
                Access Your Portal <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </Link>
              <Link href="/book-demo" className="group inline-flex items-center gap-2 rounded-2xl border-2 border-white/20 px-8 py-4 text-sm font-bold text-white transition-all hover:-translate-y-1 hover:border-white/40 hover:bg-white/5">
                Schedule a Demo <MoveRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </SiteShell>
  );
}
