"use client";
import { Quote, Star } from 'lucide-react';
import Link from 'next/link';
import SiteShell from '../components/SiteShell';
import { CtaBand, PageHero, PageMain, PageSection, SectionHeader } from '../components/MarketingSections';

const testimonials = [
  { name: 'Dr. Rajesh Kumar', role: 'Principal, Delhi Public School', content: 'Prasynx has transformed how we manage our institution. The student portal has improved engagement significantly.' },
  { name: 'Priya Sharma', role: 'Parent & Guardian', content: 'Finally, I can track my child\'s progress in real-time. The app notifications keep me updated throughout the day.' },
  { name: 'Arun Patel', role: 'Academic Director, Mumbai Institute', content: 'The analytics dashboard gives us insights we never had before. Data-driven decisions are now the norm.' },
  { name: 'Sarah Martinez', role: 'IT Manager, Global University', content: 'Seamless integration with our existing systems. The support team is incredibly responsive.' },
  { name: 'Vikram Singh', role: 'Registrar, Bangalore Tech College', content: 'Implementation was smooth. Staff adopted it quickly, and daily processes are far easier to manage.' },
  { name: 'Neha Gupta', role: 'Admin Head, Chennai School', content: 'Time savings are extraordinary. What took hours now takes minutes. It has been a strong investment.' }
];

const caseStudies = [
  { institution: 'Delhi Public School Network', challenge: 'Managing 50+ schools with different systems', solution: 'Unified Prasynx platform across all campuses', result: '40% reduction in administrative time and 95% parent satisfaction' },
  { institution: 'Mumbai Institute of Excellence', challenge: 'Poor communication between departments', solution: 'Integrated workflow and real-time collaboration', result: '60% faster decision-making and 88% staff efficiency increase' },
  { institution: 'Bangalore Tech University', challenge: 'Data security and compliance issues', solution: 'Enterprise security and audit trails', result: 'Full GDPR compliance and zero security incidents' }
];

export default function Customers() {
  return (
    <SiteShell>
      <PageMain>
        <PageHero
          eyebrow="Customers"
          title="Trusted by Education Leaders"
          description="Institutions use Prasynx to reduce manual work, improve communication, and make better decisions with reliable data."
          metrics={[
            { value: '500+', label: 'Institutions' },
            { value: '5M+', label: 'Active users' },
            { value: '98%', label: 'Satisfaction' }
          ]}
        />

        <PageSection>
          <SectionHeader eyebrow="Testimonials" title="What Customers Say" />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 transition hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-950/10">
                <div className="mb-5 flex items-center justify-between">
                  <Quote className="h-6 w-6 text-blue-500" />
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm leading-7 text-slate-600">"{testimonial.content}"</p>
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <h3 className="font-black text-slate-950">{testimonial.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </article>
            ))}
          </div>
        </PageSection>

        <PageSection tone="soft">
          <SectionHeader eyebrow="Proof" title="Case Studies" />
          <div className="grid gap-6 lg:grid-cols-3">
            {caseStudies.map((study) => (
              <article key={study.institution} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
                <h3 className="text-xl font-black text-slate-950">{study.institution}</h3>
                <div className="mt-5 grid gap-4">
                  <div>
                    <p className="text-xs font-black uppercase text-blue-600">Challenge</p>
                    <p className="mt-1 text-sm leading-7 text-slate-600">{study.challenge}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-blue-600">Solution</p>
                    <p className="mt-1 text-sm leading-7 text-slate-600">{study.solution}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="text-xs font-black uppercase text-emerald-700">Result</p>
                    <p className="mt-1 text-sm font-bold leading-7 text-emerald-800">{study.result}</p>
                  </div>
                </div>
                <Link href="/book-demo" className="mt-5 inline-flex text-sm font-black text-blue-600 hover:text-blue-800">
                  Learn more
                </Link>
              </article>
            ))}
          </div>
        </PageSection>

        <CtaBand
          title="Join 500+ Institutions Transforming Education"
          description="Start your journey with Prasynx and give every stakeholder a clearer, faster workflow."
          href="/book-demo"
          action="Get Started"
        />
      </PageMain>
    </SiteShell>
  );
}
