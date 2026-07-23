"use client";
import { Activity, CheckCircle, AlertTriangle, Clock, ArrowUp, ArrowDown, Server, Shield, Zap, Wifi, RefreshCw, ChevronRight, ArrowRight, History } from 'lucide-react';
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

const services = [
  { name: 'Web Platform', status: 'Operational', uptime: '99.99%', icon: Server, color: 'green' },
  { name: 'Mobile API', status: 'Operational', uptime: '99.97%', icon: Activity, color: 'green' },
  { name: 'Database Services', status: 'Operational', uptime: '99.99%', icon: Server, color: 'green' },
  { name: 'AI Processing (Prerana)', status: 'Operational', uptime: '99.95%', icon: Zap, color: 'green' },
  { name: 'Payment Gateway', status: 'Operational', uptime: '99.99%', icon: Shield, color: 'green' },
  { name: 'Email Service', status: 'Operational', uptime: '99.93%', icon: Wifi, color: 'green' },
  { name: 'File Storage', status: 'Operational', uptime: '99.99%', icon: Server, color: 'green' },
  { name: 'Notification Service', status: 'Operational', uptime: '99.96%', icon: RefreshCw, color: 'green' },
];

const incidents = [
  {
    date: 'June 10, 2026', title: 'Scheduled Maintenance - Database Optimization',
    desc: 'Planned maintenance to optimize database performance. Expected downtime: 2 hours.',
    status: 'Completed', type: 'maintenance',
  },
  {
    date: 'June 5, 2026', title: 'Minor API Latency Issue',
    desc: 'Brief period of increased latency on API endpoints due to traffic spike. Resolved within 15 minutes.',
    status: 'Resolved', type: 'incident',
  },
  {
    date: 'May 28, 2026', title: 'Platform Update - v4.2.0 Release',
    desc: 'Scheduled deployment of version 4.2.0 with new features and performance improvements.',
    status: 'Completed', type: 'maintenance',
  },
  {
    date: 'May 15, 2026', title: 'Third-Party Email Delivery Delay',
    desc: 'External email provider experienced delays affecting notification delivery. All emails queued and delivered.',
    status: 'Resolved', type: 'incident',
  },
];

export default function StatusPage() {
  return (
    <SiteShell>
      <PageMain>
        <section className="relative overflow-hidden px-4 pt-20 pb-10 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/3 top-0 h-80 w-80 rounded-full bg-green-500/8 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-[#6C4CF1]/10 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50/80 px-4 py-2 text-sm font-extrabold text-green-700 shadow-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                All Systems Operational
              </div>
              <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                System Status
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Real-time monitoring of all Prasynx Education OS services. Check current operational status and view incident history.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white/80 px-6 py-3 shadow-sm">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-green-600">
                    <CheckCircle size={16} /> All 8 services operational
                  </span>
                  <span className="h-6 w-px bg-[#E2E8F0]" />
                  <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                    <Clock size={15} /> 99.97% avg uptime
                  </span>
                </div>
                <Link href="#history"
                  className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white/80 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-[#6C4CF1] hover:text-[#6C4CF1]">
                  <History size={15} /> View Incident History
                </Link>
              </div>
            </div>
          </div>
        </section>

        <PageSection>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((svc) => {
              const Icon = svc.icon;
              return (
                <motion.div key={svc.name} {...stagger}
                  className="flex items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green-50 text-green-600">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-950">{svc.name}</h3>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-bold text-green-700">{svc.status}</span>
                    </div>
                    <p className="mt-0.5 text-xs font-semibold text-slate-400">{svc.uptime} uptime</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </PageSection>

        <PageSection tone="soft" id="history">
          <SectionHeader
            eyebrow="History"
            title="Recent Incidents & Maintenance"
            description="Transparent record of all service incidents and scheduled maintenance activities over the last 30 days."
          />
          <div className="mx-auto max-w-4xl space-y-3">
            {incidents.map((incident, i) => (
              <motion.div key={i} {...stagger}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-5 transition hover:border-[#E8E0FF] hover:shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${
                      incident.type === 'maintenance' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {incident.type === 'maintenance' ? <RefreshCw size={15} /> : <AlertTriangle size={15} />}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-950">{incident.title}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          incident.status === 'Completed' || incident.status === 'Resolved'
                            ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>{incident.status}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{incident.desc}</p>
                      <p className="mt-1 text-[10px] font-bold text-slate-400">{incident.date}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </PageSection>

        <PageSection tone="dark">
          <div className="text-center">
            <h2 className="text-2xl font-black text-white">99.97% Uptime Guaranteed</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 max-w-2xl mx-auto">
              Prasynx Education OS is built on enterprise-grade infrastructure with redundant systems, automated failover, and 24/7 monitoring to ensure maximum availability for your institution.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
              {[
                { label: 'Data Centers', value: '3' },
                { label: 'SLA Guarantee', value: '99.97%' },
                { label: 'Response Time', value: '< 15min' },
                { label: 'Monitoring', value: '24/7' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-xl font-black text-white">{s.value}</div>
                  <div className="text-[10px] font-bold text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </PageSection>

        <CtaBand
          title="Experiencing an Issue?"
          description="If you are experiencing a problem not reflected here, please contact our support team immediately."
          href="/resources/help-center"
          action="Contact Support"
        />
      </PageMain>
    </SiteShell>
  );
}
