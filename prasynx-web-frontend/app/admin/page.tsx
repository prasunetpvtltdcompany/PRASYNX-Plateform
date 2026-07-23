"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Shield, Users, FileText, BarChart3, Activity, Lock, UserCheck, Database, RefreshCw, FileCheck, ScrollText, Sliders, TrendingUp, Monitor, Bell, Server, Sparkles, Globe, Key, Fingerprint, ClipboardCheck, Clock, Download, LayoutDashboard, PieChart, LineChart, AlertTriangle } from 'lucide-react';
import SiteShell from '../components/SiteShell';

const primary = '#7C3AED';

const fadeUp = { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
const fadeIn = { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true }, transition: { duration: 0.6 } };
const stagger = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, staggerChildren: 0.1 } };

const metrics = [
  { label: 'Active Users', value: '12,458', change: '+14%', up: true, icon: Users },
  { label: 'Security Status', value: 'Secure', change: 'All Clear', up: true, icon: Shield },
  { label: 'Compliance Score', value: '98.6%', change: '+2.1%', up: true, icon: FileCheck },
  { label: 'Campus Analytics', value: '156', change: 'Campuses', up: true, icon: BarChart3 },
];

const features = [
  {
    title: 'User Management',
    subtitle: 'RBAC, Lifecycle & Directory Sync',
    desc: 'Role-based access control with granular permissions. Automated user provisioning, SSO/SAML integration, and real-time directory synchronization across all campuses.',
    icon: Users,
    items: ['Role-Based Access Control (RBAC)', 'Automated User Lifecycle Management', 'LDAP / Active Directory Sync', 'SSO / SAML / OAuth Integration', 'Bulk Import & Export', 'Session & Audit Management'],
  },
  {
    title: 'Security',
    subtitle: 'SOC 2, GDPR & Enterprise Encryption',
    desc: 'Multi-layered security architecture with end-to-end encryption, zero-trust access, and continuous compliance monitoring across your entire institution.',
    icon: Lock,
    items: ['SOC 2 Type II Certified', 'GDPR & Data Privacy Compliance', 'AES-256 End-to-End Encryption', 'Zero-Trust Access Architecture', 'Automated Audit Logging', 'Incident Response & Forensics'],
  },
  {
    title: 'Compliance',
    subtitle: 'Policy Management & Report Generation',
    desc: 'Centralized compliance hub for managing institutional policies, generating audit reports, and maintaining regulatory adherence across jurisdictions.',
    icon: ClipboardCheck,
    items: ['Automated Report Generation', 'Policy Lifecycle Management', 'Regulatory Compliance Tracking', 'Custom Audit Trails', 'Data Retention Scheduling', 'Third-Party Vendor Assessment'],
  },
  {
    title: 'Reporting',
    subtitle: 'Custom Report Builder & Scheduling',
    desc: 'Powerful report builder with drag-and-drop interface. Schedule automated reports, set custom KPIs, and distribute insights to stakeholders seamlessly.',
    icon: FileText,
    items: ['Drag-and-Drop Report Builder', 'Scheduled Report Distribution', 'Custom KPI Dashboards', 'Export to PDF, CSV, Excel', 'Interactive Data Visualizations', 'Role-Based Report Access'],
  },
  {
    title: 'Analytics',
    subtitle: 'Multi-Campus Dashboards & Trends',
    desc: 'Unified analytics across all campuses with real-time data aggregation, trend analysis, predictive modeling, and actionable institutional insights.',
    icon: TrendingUp,
    items: ['Multi-Campus Data Aggregation', 'Real-Time Trend Analysis', 'Predictive Analytics Models', 'Custom Dashboard Builder', 'Attendance & Performance Trends', 'Financial & Operational Metrics'],
  },
  {
    title: 'Monitoring',
    subtitle: 'System Health & Real-Time Alerts',
    desc: 'Comprehensive system monitoring with real-time health checks, intelligent alerting, and automated incident response for maximum platform uptime.',
    icon: Activity,
    items: ['Real-Time System Health Monitoring', 'Intelligent Alerting & Notifications', 'Automated Incident Response', 'Uptime & Performance SLAs', 'Resource Utilization Tracking', 'Root Cause Analysis Tools'],
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const Icon = feature.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#7C3AED]/10">
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#7C3AED]/10 opacity-0 transition-all duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15), transparent)' }} />
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#F3F0FF] text-slate-900 text-xl font-black transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl" style={{ color: primary }}>
        <Icon size={24} />
      </span>
      <h3 className="mt-6 text-xl font-black text-slate-900">{feature.title}</h3>
      <p className="mt-1.5 text-sm font-semibold text-[#7C3AED]">{feature.subtitle}</p>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">{feature.desc}</p>
      <ul className="mt-6 space-y-2.5">
        {feature.items.map(item => (
          <li key={item} className="flex items-center gap-2.5 text-sm font-semibold text-slate-600"><CheckCircle size={14} className="shrink-0 text-[#7C3AED]" />{item}</li>
        ))}
      </ul>
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, change, up }: { icon: any; label: string; value: string; change: string; up: boolean }) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F3F0FF] text-[#7C3AED]"><Icon size={20} /></span>
        <span className={`flex items-center gap-1 text-[11px] font-bold ${up ? 'text-emerald-500' : 'text-red-500'}`}>
          {change} {up ? <ArrowRight size={12} className="rotate-[-45deg]" /> : <ArrowRight size={12} className="rotate-45" />}
        </span>
      </div>
      <p className="mt-3 text-2xl font-black text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-slate-500">{label}</p>
    </div>
  );
}

export default function AdminPortal() {
  return (
    <SiteShell>
      {/* HERO */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#F3F0FF] via-white to-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-48 -top-48 h-[700px] w-[700px] rounded-full bg-[#7C3AED]/5 blur-3xl" />
          <div className="absolute -bottom-48 -right-48 h-[600px] w-[600px] rounded-full bg-[#7C3AED]/3 blur-3xl" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(124,58,237,0.04) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center gap-16 px-6 pb-32 pt-36 lg:flex-row lg:px-12">
          <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-4 py-1.5 text-xs font-bold text-[#7C3AED]">
              <Sparkles size={12} /> Admin Portal v4.2
            </span>
            <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl xl:text-7xl">
              Complete Institutional<br />
              <span className="bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#C084FC] bg-clip-text text-transparent">Control</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-500 lg:text-lg">
              Enterprise-grade administration platform for multi-campus management. Role-based access, real-time analytics, compliance automation, and system monitoring — all from a single command center.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/admin/login" className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-8 py-4 text-sm font-bold text-white shadow-xl shadow-[#7C3AED]/25 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#7C3AED]/35">
                Access Dashboard <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </Link>
              <Link href="/book-demo" className="group inline-flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white px-8 py-4 text-sm font-bold text-slate-900 transition-all hover:-translate-y-1 hover:border-[#D0D5E0] hover:bg-[#F8FAFF]">
                Request Demo <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6 }} className="flex-1 w-full max-w-xl">
            <div className="grid grid-cols-2 gap-3">
              {metrics.map(m => <StatCard key={m.label} {...m} />)}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="col-span-2 rounded-2xl border border-[#E2E8F0] bg-white p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">System Uptime</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online</span>
                </div>
                <p className="mt-1 text-lg font-black text-slate-900">99.97%</p>
                <div className="mt-3 h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '99.97%' }} transition={{ duration: 1.5, delay: 0.8 }} className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #7C3AED, #A855F7, #C084FC)' }} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="relative overflow-hidden px-6 py-28 lg:px-12 bg-gradient-to-b from-[#F8FAFF] via-white to-[#F8FAFF]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C3AED]/3 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mx-auto mb-16 max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-4 py-1.5 text-xs font-bold text-[#7C3AED]"><Sparkles size={12} /> Enterprise Platform</span>
            <h2 className="mt-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl">Everything You Need To<br />Command Your Institution</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-500">Six integrated pillars of enterprise administration, purpose-built for multi-campus management at scale.</p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => <FeatureCard key={f.title} feature={f} index={i} />)}
          </div>
        </div>
      </section>

      {/* ARCHITECTURE OVERVIEW */}
      <section className="relative overflow-hidden px-6 py-28 lg:px-12 bg-gradient-to-b from-white via-[#F3F0FF] to-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.05)_0%,transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mx-auto mb-16 max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-4 py-1.5 text-xs font-bold text-[#7C3AED]"><LayoutDashboard size={12} /> Architecture</span>
            <h2 className="mt-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl">Unified Command Center Architecture</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-500">Every layer designed for security, scale, and seamless multi-campus orchestration.</p>
          </motion.div>
          <motion.div {...fadeIn} className="relative mx-auto max-w-5xl">
            <div className="relative grid gap-4 md:grid-cols-3">
              {[
                { label: 'Data Layer', icon: Database, items: ['PostgreSQL', 'Redis Cache', 'S3 Storage', 'Data Lake'] },
                { label: 'Service Layer', icon: Server, items: ['REST APIs', 'WebSocket', 'Microservices', 'Message Queue'] },
                { label: 'Access Layer', icon: Shield, items: ['RBAC Engine', 'API Gateway', 'SSO/SAML', 'Rate Limiter'] },
              ].map((layer, i) => (
                <motion.div key={layer.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-6 transition hover:shadow-md">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F3F0FF] text-[#7C3AED]"><layer.icon size={20} /></span>
                  <h3 className="mt-4 text-lg font-black text-slate-900">{layer.label}</h3>
                  <div className="mt-4 space-y-2">
                    {layer.items.map(item => (
                      <div key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-500"><CheckCircle size={12} className="text-[#7C3AED]" />{item}</div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
              className="mt-6 rounded-2xl border border-[#7C3AED]/20 bg-gradient-to-r from-[#7C3AED]/5 to-[#A855F7]/5 p-6 text-center">
              <p className="text-lg font-black text-slate-900">Connected via Secure, Encrypted, Real-Time Data Pipeline</p>
              <p className="mt-1 text-sm text-slate-500">Zero-trust architecture with end-to-end encryption across all layers</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden px-6 py-28 lg:px-12 bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#A855F7]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div {...fadeUp}>
            <Globe size={48} className="mx-auto text-white/60" />
            <h2 className="mt-6 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">Ready To Take Command?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/80">Join leading institutions already using Prasynx Admin Portal to manage their multi-campus operations with enterprise-grade security and intelligence.</p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/admin/login" className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-[#7C3AED] shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl">
                Sign In <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </Link>
              <Link href="/book-demo" className="group inline-flex items-center gap-2 rounded-2xl border-2 border-white/30 px-8 py-4 text-sm font-bold text-white transition-all hover:-translate-y-1 hover:border-white/50 hover:bg-white/10">
                Schedule Demo <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </SiteShell>
  );
}
