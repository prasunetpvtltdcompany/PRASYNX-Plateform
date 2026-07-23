"use client";
import { Code2, ChevronDown, FileText, Download, ExternalLink, Search, Copy, CheckCircle, BookOpen, Server, Shield, Zap, ArrowRight, Terminal, Globe, Lock, Key } from 'lucide-react';
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

const endpoints = [
  {
    method: 'GET', path: '/api/v1/students', desc: 'Retrieve paginated list of students.', auth: 'Bearer Token', cat: 'Students',
  },
  {
    method: 'POST', path: '/api/v1/students', desc: 'Create a new student record.', auth: 'Bearer Token', cat: 'Students',
  },
  {
    method: 'GET', path: '/api/v1/students/{id}', desc: 'Get student details by ID.', auth: 'Bearer Token', cat: 'Students',
  },
  {
    method: 'PUT', path: '/api/v1/students/{id}', desc: 'Update student information.', auth: 'Bearer Token', cat: 'Students',
  },
  {
    method: 'GET', path: '/api/v1/courses', desc: 'List all courses with filters.', auth: 'Bearer Token', cat: 'Courses',
  },
  {
    method: 'POST', path: '/api/v1/courses', desc: 'Create a new course.', auth: 'Bearer Token', cat: 'Courses',
  },
  {
    method: 'GET', path: '/api/v1/attendance', desc: 'Get attendance records.', auth: 'Bearer Token', cat: 'Attendance',
  },
  {
    method: 'POST', path: '/api/v1/attendance/bulk', desc: 'Mark attendance in bulk.', auth: 'Bearer Token', cat: 'Attendance',
  },
  {
    method: 'GET', path: '/api/v1/grades', desc: 'Retrieve grades and transcripts.', auth: 'Bearer Token', cat: 'Grades',
  },
  {
    method: 'POST', path: '/api/v1/grades', desc: 'Submit grades for a course.', auth: 'Bearer Token', cat: 'Grades',
  },
  {
    method: 'GET', path: '/api/v1/fees', desc: 'Get fee structure and payments.', auth: 'Bearer Token', cat: 'Fees',
  },
  {
    method: 'POST', path: '/api/v1/payments', desc: 'Process a payment transaction.', auth: 'Bearer Token', cat: 'Fees',
  },
];

const codeSample = `// Prasynx API Client Example
const PRASYNX_API = 'https://api.prasynx.com/v1';
const API_KEY = 'your_api_key_here';

async function getStudents(page = 1) {
  const response = await fetch(\`\${PRASYNX_API}/students?page=\${page}\`, {
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

// Create a new student
async function createStudent(data) {
  const response = await fetch(\`\${PRASYNX_API}/students\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}`;

export default function ApiReferencePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Students', 'Courses', 'Attendance', 'Grades', 'Fees'];
  const filtered = selectedCategory === 'All' ? endpoints : endpoints.filter((e) => e.cat === selectedCategory);

  return (
    <SiteShell>
      <PageMain>
        <section className="relative overflow-hidden px-4 pt-20 pb-10 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/4 top-0 h-80 w-80 rounded-full bg-[#6D4CFF]/10 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-[#8B5CF6]/12 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E8E0FF] bg-white/80 px-4 py-2 text-sm font-extrabold text-[#4F2DB8] shadow-sm">
                <Code2 className="h-4 w-4 text-[#A855F7]" />
                API Reference
              </div>
              <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Prasynx REST API
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Integrate and extend the Prasynx Education OS with our comprehensive REST API. Build custom solutions, automate workflows, and connect third-party services.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="#endpoints"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6C4CF1] to-[#8B5CF6] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
                  <Terminal size={16} /> Explore Endpoints
                </Link>
                <Link href="#"
                  className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-[#6C4CF1] hover:text-[#6C4CF1]">
                  <Download size={16} /> Download OpenAPI Spec
                </Link>
              </div>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Server, label: 'Base URL', value: 'https://api.prasynx.com/v1' },
                { icon: Key, label: 'Authentication', value: 'Bearer Token / OAuth 2.0' },
                { icon: Globe, label: 'Rate Limit', value: '1000 req/min' },
                { icon: Lock, label: 'Encryption', value: 'TLS 1.3 (HTTPS)' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white/80 px-4 py-3 shadow-sm">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F3F0FF] text-[#6C4CF1]">
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400">{item.label}</p>
                      <p className="text-xs font-bold text-slate-950 truncate">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <PageSection id="endpoints">
          <SectionHeader
            eyebrow="API Endpoints"
            title="Complete Endpoint Reference"
            description="All available REST API endpoints organized by category. Each endpoint includes authentication requirements and response formats."
            align="left"
          />
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  selectedCategory === cat
                    ? 'bg-[#6C4CF1] text-white shadow-sm'
                    : 'bg-white border border-[#E2E8F0] text-slate-600 hover:border-[#6C4CF1] hover:text-[#6C4CF1]'
                }`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Method</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Endpoint</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden sm:table-cell">Description</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Auth</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ep, i) => (
                    <tr key={i} className="border-b border-[#F1F5F9] last:border-0 transition hover:bg-[#F8FAFC]">
                      <td className="px-5 py-3">
                        <span className={`inline-block rounded-md px-2 py-1 text-[10px] font-bold ${
                          ep.method === 'GET' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                        }`}>{ep.method}</span>
                      </td>
                      <td className="px-5 py-3">
                        <code className="text-xs font-bold text-slate-950">{ep.path}</code>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500 hidden sm:table-cell">{ep.desc}</td>
                      <td className="px-5 py-3 text-xs text-slate-500 hidden lg:table-cell">{ep.auth}</td>
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-[#F3F0FF] px-2 py-0.5 text-[9px] font-bold text-[#6C4CF1]">{ep.cat}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </PageSection>

        <PageSection tone="soft">
          <SectionHeader
            eyebrow="Code Example"
            title="Quick Start with JavaScript"
            description="Get started with the Prasynx API using this JavaScript example. Full SDKs are available for multiple languages."
          />
          <div className="mx-auto max-w-3xl">
            <div className="relative rounded-2xl border border-[#E2E8F0] bg-slate-950 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs font-bold text-slate-400">api-example.js</span>
                </div>
                <button className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-[10px] font-bold text-slate-300 transition hover:bg-slate-700 hover:text-white">
                  <Copy size={12} /> Copy
                </button>
              </div>
              <pre className="overflow-x-auto p-5 text-sm leading-relaxed text-slate-300">
                <code>{codeSample}</code>
              </pre>
            </div>
          </div>
        </PageSection>

        <PageSection>
          <SectionHeader
            eyebrow="Quick Links"
            title="Developer Resources"
            description="Additional tools and documentation to accelerate your development."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: BookOpen, title: 'SDK Documentation', desc: 'JavaScript, Python, Java, and .NET SDKs.', href: '/resources/documentation' },
              { icon: FileText, title: 'API Changelog', desc: 'Track API version changes and updates.', href: '/resources/releases' },
              { icon: Zap, title: 'Webhook Guide', desc: 'Configure real-time event notifications.', href: '/resources/documentation' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href}
                  className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 transition hover:border-[#E8E0FF] hover:shadow-lg hover:-translate-y-1">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F3F0FF] text-[#6C4CF1] transition group-hover:bg-[#6C4CF1] group-hover:text-white">
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-3 text-sm font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
                </Link>
              );
            })}
          </div>
        </PageSection>

        <CtaBand
          title="Need Integration Help?"
          description="Our solutions engineering team can help you design and implement custom integrations for your institution."
          href="/contact"
          action="Talk to an Engineer"
        />
      </PageMain>
    </SiteShell>
  );
}
