"use client";
import Link from 'next/link';
import SiteShell from '../components/SiteShell';
import { PageHero, PageMain, PageSection, SectionHeader } from '../components/MarketingSections';

type SitemapItem = {
  href?: string;
  label: string;
  description: string;
};

const groups: Array<{ title: string; links: SitemapItem[] }> = [
  {
    title: 'Main Pages',
    links: [
      { href: '/', label: 'Home', description: 'Landing page' },
      { href: '/solutions', label: 'Solutions', description: 'Comprehensive solutions' },
      { href: '/platform', label: 'Platform', description: 'Technology and features' },
      { href: '/customers', label: 'Customers', description: 'Testimonials and case studies' },
      { href: '/resources', label: 'Resources', description: 'Documentation and guides' },
      { href: '/contact', label: 'Contact', description: 'Get in touch' }
    ]
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About Us', description: 'Learn about Prasynx' },
      { href: '/careers', label: 'Careers', description: 'Join our team' },
      { href: '/book-demo', label: 'Book Demo', description: 'Schedule a walkthrough' }
    ]
  },
  {
    title: 'Legal & Policies',
    links: [
      { href: '/privacy-policy', label: 'Privacy Policy', description: 'Privacy practices' },
      { href: '/terms', label: 'Terms & Conditions', description: 'Terms of service' }
    ]
  },
  {
    title: 'Services',
    links: [
      { label: 'Student Management System', description: 'Academic and attendance workflows' },
      { label: 'Parent Engagement Portal', description: 'Guardian communication and updates' },
      { label: 'Staff Management Tools', description: 'Staff operations and reviews' },
      { label: 'Management Dashboard', description: 'Reporting and analytics' }
    ]
  }
];

export default function Sitemap() {
  return (
    <SiteShell>
      <PageMain>
        <PageHero eyebrow="Sitemap" title="Navigate Every Page and Resource" description="A structured overview of the public Prasynx web experience." />
        <PageSection>
          <SectionHeader eyebrow="Directory" title="Site Structure" />
          <div className="grid gap-6 md:grid-cols-2">
            {groups.map((group) => (
              <section key={group.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
                <h2 className="text-xl font-black text-slate-950">{group.title}</h2>
                <div className="mt-5 grid gap-3">
                  {group.links.map((item) => {
                    const content = (
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50">
                        <h3 className="font-black text-slate-900">{item.label}</h3>
                        <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                      </div>
                    );

                    return item.href ? (
                      <Link key={item.label} href={item.href}>{content}</Link>
                    ) : (
                      <div key={item.label}>{content}</div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </PageSection>
      </PageMain>
    </SiteShell>
  );
}
