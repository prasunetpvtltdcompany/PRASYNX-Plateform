'use client';

import type { ReactNode } from 'react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, ArrowRight, ArrowUpRight, AtSign, BarChart3, BookOpen, BookOpenText,
  Building2, CheckCircle, ChevronDown, Cloud, FileText, Globe,
  GraduationCap, Heart, Layers, LifeBuoy, Lock, Mail, MapPin,
  Menu, MessageCircle, Monitor, Phone, School, Search, Server, Share2, Shield, Smartphone, Sparkles,
  Star, Users, Video, X, Zap, ChevronRight, BookMarked, BookCopy,
  Code2, Headphones, Newspaper, Radio, Trophy, Wrench, Bot,
} from 'lucide-react';
import PreranaAI from './PreranaAI';

const PORTALS_URL = process.env.NEXT_PUBLIC_PORTALS_URL ?? 'http://localhost:3000';

const navLinks = [
  { href: '/', label: 'Home' },
  {
    href: '/solutions', label: 'Solutions',
    badge: 'New',
    menu: [
      { href: `${PORTALS_URL}/student/login`, label: 'Student Portal', description: 'AI-powered learning, grades, attendance & career guidance.', icon: GraduationCap },
      { href: `${PORTALS_URL}/parent/login`, label: 'Parent Portal', description: 'Real-time updates, fee management & teacher communication.', icon: Users },
      { href: `${PORTALS_URL}/staff/login`, label: 'Staff Portal', description: 'Class management, assessments & performance analytics.', icon: BarChart3 },
      { href: `${PORTALS_URL}/management/login`, label: 'Management Portal', description: 'School day-to-day operations - classes, staff, attendance & more.', icon: School },
    ],
  },

  { href: '/platform', label: 'Platform' },
  { href: '/pricing', label: 'Pricing' },
  {
    href: '/resources', label: 'Resources', megaMenu: true,
    groups: [
      {
        title: 'Learn', icon: BookOpen,
        items: [
          { href: '/resources/documentation', label: 'Documentation', description: 'Guides, SDKs & integration docs.', icon: BookMarked },
          { href: '/resources/tutorials', label: 'Tutorials', description: 'Step-by-step learning guides.', icon: BookCopy },
          { href: '/resources/knowledge-base', label: 'Knowledge Base', description: 'Searchable article library.', icon: BookOpenText },
        ],
      },
      {
        title: 'Support', icon: Headphones,
        items: [
          { href: '/resources/help-center', label: 'Help Center', description: 'FAQs, tickets & live support.', icon: LifeBuoy },
          { href: '/resources/status', label: 'System Status', description: 'Real-time platform health.', icon: Activity },
        ],
      },
      {
        title: 'Developers', icon: Code2,
        items: [
          { href: '/resources/api-reference', label: 'API Reference', description: 'Full API documentation.', icon: Code2 },
          { href: '/resources/releases', label: 'Release Notes', description: 'Product updates & changelog.', icon: Wrench },
        ],
      },
      {
        title: 'Community', icon: Users,
        items: [
          { href: '/resources/community', label: 'Community', description: 'Forums, discussions & events.', icon: MessageCircle },
          { href: '/resources/webinars', label: 'Webinars', description: 'Live & recorded sessions.', icon: Monitor },
        ],
      },
      {
        title: 'Insights', icon: Newspaper,
        items: [
          { href: '/resources/blog', label: 'Blog', description: 'Product & education insights.', icon: Newspaper },
          { href: '/resources/case-studies', label: 'Case Studies', description: 'Real institution success stories.', icon: Trophy },
          { href: '/resources/research', label: 'Research Hub', description: 'Whitepapers & AI research.', icon: Radio },
        ],
      },
    ],
  },
  {
    href: '/about', label: 'Company',
    menu: [
      { href: '/about', label: 'About Us', description: 'Our mission, team & values.', icon: Globe },
      { href: '/careers', label: 'Careers', description: 'Join the team building the future of education.', icon: Users },
      { href: '/contact', label: 'Contact', description: 'Get in touch with our team.', icon: Mail },
    ],
  },
];

const footerConfig = {
  brand: {
    title: 'Prasynx Education OS',
    description: 'Empowering educational institutions with AI-powered management, automation, communication, recruitment, and analytics solutions across one unified platform.',
    trustBadges: ['Enterprise Ready', 'AI Powered', 'Multi-Tenant', 'Secure Infrastructure'],
  },
  columns: [
    {
      title: 'Platform', icon: Cloud, items: [
        { href: `${PORTALS_URL}/student/login`, label: 'Student Portal' }, { href: `${PORTALS_URL}/parent/login`, label: 'Parent Portal' },
        { href: `${PORTALS_URL}/staff/login`, label: 'Staff Portal' },
        { href: `${PORTALS_URL}/management/login`, label: 'Management Portal' },
        { href: '/solutions', label: 'API & Integrations' },
      ],
    },
    {
      title: 'Solutions', icon: Building2, items: [
        { href: '/solutions', label: 'School Management' }, { href: '/solutions', label: 'College ERP' },
        { href: '/solutions', label: 'Recruitment Platform' }, { href: '/solutions', label: 'Learning Management' },
        { href: '/solutions', label: 'Attendance Management' }, { href: '/solutions', label: 'Analytics Suite' },
        { href: '/solutions', label: 'AI Automation' },
      ],
    },
    {
      title: 'Resources', icon: BookOpenText, items: [
        { href: '/resources', label: 'Documentation' }, { href: '/resources', label: 'Help Center' },
        { href: '/resources', label: 'API Reference' }, { href: '/resources', label: 'Community' },
        { href: '/resources', label: 'Blog' }, { href: '/resources/case-studies', label: 'Case Studies' },
        { href: '/resources', label: 'System Status' },
      ],
    },
    {
      title: 'Company', icon: Globe, items: [
        { href: '/about', label: 'About Us' }, { href: '/careers', label: 'Careers' },
        { href: '/contact', label: 'Contact' }, { href: '/sitemap', label: 'Sitemap' },
      ],
    },
    {
      title: 'Legal', icon: Shield, items: [
        { href: '/terms', label: 'Terms of Service' }, { href: '/privacy-policy', label: 'Privacy Policy' },
        { href: '/terms', label: 'Cookie Policy' }, { href: '/terms', label: 'Data Processing' },
        { href: '/terms', label: 'Compliance' }, { href: '/terms', label: 'SLA' },
      ],
    },
  ],
  socialLinks: [
    { label: 'LinkedIn', icon: Share2, href: '#' },
    { label: 'Facebook', icon: MessageCircle, href: '#' },
    { label: 'Instagram', icon: Heart, href: '#' },
    { label: 'YouTube', icon: Video, href: '#' },
    { label: 'Twitter / X', icon: AtSign, href: '#' },
  ],
  contact: [
    { icon: Phone, label: 'Call Us', value: '+91 8905483183', sub: 'Mon–Sat, 9AM–6PM IST' },
    { icon: Mail, label: 'Email Us', value: 'prasunetcompany@gmail.com', sub: 'Avg. response: 2 hours' },
    { icon: MapPin, label: 'Visit Us', value: 'Chandigarh, India', sub: 'Serving institutions globally' },
  ],
  newsletter: {
    heading: 'Stay Updated with Prasynx',
    description: 'Get product updates, AI innovations, platform announcements, and educational insights.',
  },
  trustItems: [
    { icon: Lock, label: 'SSL Secured' },
    { icon: Shield, label: 'ISO 27001 Certified' },
    { icon: Server, label: '99.9% Uptime' },
    { icon: CheckCircle, label: 'GDPR Compliant' },
    { icon: Zap, label: 'AI Powered Platform' },
    { icon: Star, label: 'Enterprise Security' },
  ],
  copyright: {
    text: '© 2026 Prasynx. All rights reserved.',
    tagline: 'Built for the future of education.',
    extras: [
      { label: 'v4.2.0', href: '#' },
      { label: 'Platform Status', href: '#' },
      { label: 'Powered by Prasynx', href: '#' },
    ],
  },
};

const staggerItem = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.5, ease: 'easeOut' as const } }) };

export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFF' }}>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-strong shadow-lg shadow-black/5' : 'bg-transparent'}`}>
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center">
            <img src="/logo.png" alt="Prasynx Logo"              className="h-20 w-auto translate-y-1 object-contain transition-transform group-hover:scale-[1.02]" />
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" ref={dropdownRef}>
            {navLinks.map((link) => {
              const hasMenu = Boolean(link.menu?.length) || Boolean(link.megaMenu);
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <div key={link.href} className="relative" onMouseEnter={() => hasMenu && setOpenDropdown(link.href)} onMouseLeave={() => setOpenDropdown(null)}>
                  <Link href={link.href}
                    className={`inline-flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all ${active ? 'bg-[#F3F0FF] text-[#6C4CF1]' : 'text-[#475569] hover:bg-white/60 hover:text-[#6C4CF1]'}`}>
                    {link.label}
                    {link.badge && <span className="ml-1 rounded-full bg-[#6C4CF1]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#6C4CF1]">{link.badge}</span>}
                    {hasMenu && <ChevronDown size={14} className={`transition-transform duration-200 ${openDropdown === link.href ? 'rotate-180' : ''}`} />}
                  </Link>
                  {hasMenu && !link.megaMenu && (
                    <AnimatePresence>
                      {openDropdown === link.href && (
                        <motion.div initial={{ opacity: 0, y: 6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.96 }} transition={{ duration: 0.15 }}
                          className="absolute left-1/2 top-full z-50 w-[min(44rem,calc(100vw-2rem))] -translate-x-1/2 translate-y-2 pt-2">
                          <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white/95 backdrop-blur-xl p-2 shadow-xl shadow-black/5">
                            <div className="grid gap-1 md:grid-cols-2">
                              {link.menu?.map((item) => {
                                const Icon = item.icon;
                                return (
                                  <Link key={item.label} href={item.href} onClick={closeMenu}
                                    className="group/item flex gap-3 rounded-xl p-3 text-left transition hover:bg-[#F3F0FF]">
                                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#F1F5F9] text-[#6C4CF1] transition group-hover/item:bg-gradient-to-br group-hover/item:from-[#6C4CF1] group-hover/item:to-[#8B5CF6] group-hover/item:text-white">
                                      <Icon size={16} />
                                    </span>
                                    <span className="min-w-0">
                                      <span className="block text-sm font-bold" style={{ color: '#0F172A' }}>{item.label}</span>
                                      <span className="mt-0.5 block text-xs leading-relaxed" style={{ color: '#64748B' }}>{item.description}</span>
                                    </span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                  {link.megaMenu && (
                    <AnimatePresence>
                      {openDropdown === link.href && (
                        <motion.div initial={{ opacity: 0, y: 6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.96 }} transition={{ duration: 0.15 }}
                          className="absolute left-1/2 top-full z-50 w-[min(56rem,calc(100vw-2rem))] -translate-x-1/2 translate-y-2 pt-2">
                          <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white/95 backdrop-blur-xl p-4 shadow-xl shadow-black/5">
                            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
                              {link.groups?.map((group) => {
                                const GIcon = group.icon;
                                return (
                                  <div key={group.title} className="space-y-2">
                                    <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: '#6C4CF1' }}>
                                      <GIcon size={13} /> {group.title}
                                    </h4>
                                    <div className="space-y-0.5">
                                      {group.items.map((item) => {
                                        const MI = item.icon;
                                        return (
                                          <Link key={item.label} href={item.href} onClick={closeMenu}
                                            className="group/mega flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold transition hover:bg-[#F3F0FF]" style={{ color: '#475569' }}>
                                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#F1F5F9] text-[#6C4CF1] transition group-hover/mega:bg-[#6C4CF1] group-hover/mega:text-white">
                                              <MI size={12} />
                                            </span>
                                            <span>{item.label}</span>
                                          </Link>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="mt-4 border-t border-[#F1F5F9] pt-3">
                              <Link href="/resources" onClick={closeMenu}
                                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-bold text-[#6C4CF1] transition hover:bg-[#F3F0FF]">
                                View All Resources
                                <ArrowRight size={14} />
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <button type="button" aria-label="Search"
              className="grid h-8 w-8 place-items-center rounded-lg text-[#94A3B8] transition hover:text-[#6C4CF1]">
              <Search size={16} />
            </button>
            <Link href="/signin" className="text-sm font-semibold text-[#64748B] transition hover:text-[#6C4CF1]">Sign In</Link>
            <Link href="/book-demo" className="text-sm font-semibold text-[#64748B] transition hover:text-[#6C4CF1]">Book Demo</Link>
            <Link href="/get-started" className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#6C4CF1] to-[#8B5CF6] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]">
              Get Started <ArrowRight size={15} />
            </Link>
          </div>

          <button type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] transition hover:bg-[#F1F5F9] lg:hidden">
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="border-t border-[#F1F5F9] bg-white/95 backdrop-blur-xl overflow-hidden lg:hidden">
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => {
                  const hasMenu = Boolean(link.menu?.length) || Boolean(link.megaMenu);
                  const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                  return (
                    <div key={link.href}>
                      <Link href={link.href} onClick={closeMenu}
                        className={`flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-semibold transition ${active ? 'bg-[#6C4CF1] text-white' : 'text-[#475569] hover:text-[#6C4CF1]'}`}>
                        <span className="flex items-center gap-2">{link.label}{link.badge && <span className="rounded-full bg-[#6C4CF1]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#6C4CF1]">{link.badge}</span>}</span>
                        {hasMenu && <ChevronDown size={14} />}
                      </Link>
                      {hasMenu && !link.megaMenu && (
                        <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-[#F3F0FF] pl-2">
                          {link.menu?.map((item) => (
                            <Link key={item.label} href={item.href} onClick={closeMenu}
                              className="block rounded-lg px-4 py-2 text-xs font-semibold text-[#64748B] transition hover:bg-[#F3F0FF] hover:text-[#6C4CF1]">
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      )}
                      {link.megaMenu && (
                        <div className="ml-3 mt-0.5 space-y-2 border-l-2 border-[#F3F0FF] pl-2">
                          {link.groups?.map((group) => (
                            <div key={group.title}>
                              <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6C4CF1]">{group.title}</p>
                              {group.items.map((item) => (
                                <Link key={item.label} href={item.href} onClick={closeMenu}
                                  className="block rounded-lg px-4 py-2 text-xs font-semibold text-[#64748B] transition hover:bg-[#F3F0FF] hover:text-[#6C4CF1]">
                                  {item.label}
                                </Link>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-[#F1F5F9]">
                  <Link href="/signin" onClick={closeMenu} className="text-sm font-semibold text-[#64748B] transition hover:text-[#6C4CF1]">Sign In</Link>
                  <Link href="/book-demo" onClick={closeMenu} className="text-sm font-semibold text-[#64748B] transition hover:text-[#6C4CF1]">Book Demo</Link>
                  <Link href="/get-started" onClick={closeMenu} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#6C4CF1] to-[#8B5CF6] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:shadow-md">
                    Get Started <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>{children}</main>
      <PreranaAI context={{
        role: pathname === '/' || pathname === '/about' || pathname === '/pricing' || pathname === '/platform' || pathname === '/solutions' || pathname === '/get-started' || pathname === '/resources' || pathname.startsWith('/resources/') || pathname === '/contact' || pathname === '/careers' || pathname === '/customers' || pathname === '/book-demo'
          ? 'visitor'
          : pathname.startsWith('/parent') ? 'parent' : pathname.startsWith('/staff') ? 'teacher' : pathname.startsWith('/job-provider') ? 'recruiter' : pathname.startsWith('/admin') ? 'admin' : 'student',
        userId: 'anonymous',
        page: pathname,
        portal: pathname.split('/')[1] || 'website',
        sessionId: `sess-${Date.now()}`,
      }} />

      <footer className="relative overflow-hidden border-0 bg-white px-4 py-16 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 40%, #F4F1FF 70%, #FFFFFF 100%)' }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-[#6C4CF1]/10 via-[#8B5CF6]/5 to-transparent blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-[#A855F7]/10 via-[#6C4CF1]/5 to-transparent blur-3xl" />
          <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNkM0Q0YxIiBzdHJva2Utd2lkdGg9IjAuNSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDYiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
        </div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
          className="relative mx-auto max-w-7xl">

          <div className="grid gap-16 lg:grid-cols-[1.35fr_2.65fr]">
            <motion.div variants={staggerItem} custom={0} className="space-y-6">
              <div className="group relative">
                <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-[#6C4CF1]/5 to-transparent opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                <Link href="/" className="relative flex items-center">
                  <img src="/logo.png" alt="Prasynx Logo" className="h-15 w-auto object-contain transition-transform group-hover:scale-[1.02]" />
                </Link>
              </div>
              <p className="max-w-sm text-sm leading-relaxed" style={{ color: '#64748B' }}>
                {footerConfig.brand.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {footerConfig.brand.trustBadges.map((badge) => (
                  <span key={badge} className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white/70 px-3 py-1.5 text-[11px] font-bold backdrop-blur-sm" style={{ color: '#475569' }}>
                    <CheckCircle size={12} style={{ color: '#6C4CF1' }} />
                    {badge}
                  </span>
                ))}
              </div>
            </motion.div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {footerConfig.columns.map((col, colIdx) => {
                const ColIcon = col.icon;
                return (
                  <motion.div key={col.title} variants={staggerItem} custom={colIdx + 1} className="space-y-3">
                    <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: '#6C4CF1' }}>
                      <ColIcon size={14} />
                      {col.title}
                    </h3>
                    <div className="grid gap-1.5">
                      {col.items.map((item) => (
                        <Link key={item.label} href={item.href}
                          className="group/link flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-all hover:bg-white/80 hover:shadow-sm"
                          style={{ color: '#475569' }}>
                          <span className="transition-all group-hover/link:translate-x-0.5">{item.label}</span>
                          <ChevronRight size={12} className="opacity-0 -translate-x-1 transition-all group-hover/link:opacity-100 group-hover/link:translate-x-0" style={{ color: '#6C4CF1' }} />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
            <motion.div variants={staggerItem} custom={7} className="flex items-center gap-3">
              {footerConfig.socialLinks.map((social, sIdx) => {
                const SIcon = social.icon;
                return (
                  <motion.div key={social.label} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Link href={social.href} aria-label={social.label}
                      className="group/social grid h-11 w-11 place-items-center rounded-xl border border-[#E2E8F0] bg-white/70 text-[#64748B] shadow-sm backdrop-blur-sm transition-all hover:border-[#6C4CF1] hover:bg-gradient-to-br hover:from-[#6C4CF1] hover:to-[#8B5CF6] hover:text-white hover:shadow-lg hover:shadow-[#6C4CF1]/25">
                      <SIcon size={17} className="transition-transform group-hover/social:scale-110" />
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          <motion.div variants={staggerItem} custom={8} className="mt-8 grid gap-4 sm:grid-cols-3">
            {footerConfig.contact.map((item) => {
              const CIcon = item.icon;
              return (
                <div key={item.label} className="group/card relative overflow-hidden rounded-xl border border-[#E2E8F0] bg-white/70 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-[#6C4CF1]/20 hover:shadow-md hover:shadow-[#6C4CF1]/5">
                  <div className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-br from-[#6C4CF1]/0 to-[#8B5CF6]/0 opacity-0 transition-opacity group-hover/card:from-[#6C4CF1]/5 group-hover/card:to-[#8B5CF6]/5 group-hover/card:opacity-100" />
                  <div className="relative flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#6C4CF1]/10 to-[#8B5CF6]/10 text-[#6C4CF1] transition-all group-hover/card:from-[#6C4CF1] group-hover/card:to-[#8B5CF6] group-hover/card:text-white">
                      <CIcon size={16} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>{item.label}</p>
                      <p className="mt-0.5 text-sm font-bold" style={{ color: '#0F172A' }}>{item.value}</p>
                      <p className="mt-0.5 text-[11px]" style={{ color: '#64748B' }}>{item.sub}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>

          <motion.div variants={staggerItem} custom={9} className="relative mt-14 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute top-0 right-0 h-32 w-64 rounded-bl-full bg-gradient-to-bl from-[#6C4CF1]/5 to-transparent" />
              <div className="absolute bottom-0 left-0 h-32 w-64 rounded-tr-full bg-gradient-to-tr from-[#A855F7]/5 to-transparent" />
            </div>
            <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold" style={{ color: '#0F172A' }}>{footerConfig.newsletter.heading}</h3>
                  <motion.span animate={{ rotate: [0, -10, 10, -5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                    <Mail size={16} style={{ color: '#6C4CF1' }} />
                  </motion.span>
                </div>
                <p className="mt-1 text-sm" style={{ color: '#64748B' }}>{footerConfig.newsletter.description}</p>
              </div>
              <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
                <input type="email" placeholder="Enter your email"
                  className="min-h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFF] px-4 text-sm outline-none transition placeholder:text-[#94A3B8] focus:border-[#6C4CF1] focus:ring-2 focus:ring-[rgba(108,76,241,0.15)] sm:w-64"
                  style={{ color: '#0F172A' }} />
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6C4CF1] to-[#8B5CF6] px-6 text-sm font-bold text-white shadow-md shadow-[#6C4CF1]/20 transition-all hover:shadow-lg hover:shadow-[#6C4CF1]/30">
                  Subscribe
                  <ArrowUpRight size={15} />
                </motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div variants={staggerItem} custom={10}
            className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl border border-[#E2E8F0] bg-white/60 px-6 py-4 backdrop-blur-sm">
            {footerConfig.trustItems.map((item) => {
              const TIcon = item.icon;
              return (
                <div key={item.label} className="group/trust flex items-center gap-2 transition-all hover:scale-105">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-[#6C4CF1]/10 to-[#8B5CF6]/10 text-[#6C4CF1] transition-all group-hover/trust:from-[#6C4CF1] group-hover/trust:to-[#8B5CF6] group-hover/trust:text-white">
                    <TIcon size={13} />
                  </span>
                  <span className="text-xs font-bold whitespace-nowrap" style={{ color: '#475569' }}>{item.label}</span>
                </div>
              );
            })}
          </motion.div>

          <motion.div variants={staggerItem} custom={11}
            className="relative mt-8 flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-[#6C4CF1]/10 bg-gradient-to-r from-[#6C4CF1]/5 via-[#8B5CF6]/5 to-[#A855F7]/5 px-6 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImRvdHMiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0iIzhCNUNGNiIgZmlsbC1vcGFjaXR5PSIwLjE1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2RvdHMpIi8+PC9zdmc+')] opacity-50" />
            <div className="relative flex items-center gap-2">
              <p className="text-xs font-semibold" style={{ color: '#64748B' }}>{footerConfig.copyright.text}</p>
              <span className="hidden h-3 w-px bg-[#E2E8F0] sm:block" />
              <p className="text-xs font-bold" style={{ color: '#6C4CF1' }}>{footerConfig.copyright.tagline}</p>
            </div>
            <div className="relative flex items-center gap-3">
              {footerConfig.copyright.extras.map((extra) => (
                <Link key={extra.label} href={extra.href}
                  className="text-[11px] font-semibold transition hover:text-[#6C4CF1]" style={{ color: '#94A3B8' }}>
                  {extra.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </footer>
    </div>
  );
}
