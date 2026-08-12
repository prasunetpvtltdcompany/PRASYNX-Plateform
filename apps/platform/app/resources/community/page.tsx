"use client";
import { MessageCircle, Users, Globe, Calendar, ArrowRight, MessageSquare, Heart, Share2, BookOpen, Star, Award, ChevronRight, Sparkles, Heading1 } from 'lucide-react';
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

const communityFeatures = [
  { icon: MessageSquare, title: 'Discussion Forums', desc: 'Join conversations about features, best practices, and troubleshooting with thousands of education professionals.', members: '4,200+ discussions' },
  { icon: Users, title: 'User Groups', desc: 'Connect with peers from similar institutions — schools, colleges, coaching centers, and universities.', members: '12 user groups' },
  { icon: Award, title: 'Community Badges', desc: 'Earn recognition for contributions, helping others, and sharing knowledge with the community.', members: '6 badge levels' },
  { icon: Calendar, title: 'Events & Meetups', desc: 'Attend virtual meetups, workshops, and annual user conferences to learn and network.', members: '24 events/year' },
  { icon: Globe, title: 'Regional Chapters', desc: 'Local community groups in 15+ countries organizing regional events and knowledge sharing.', members: '15 chapters' },
  { icon: Star, title: 'Feature Requests', desc: 'Vote on and suggest new features. Top community requests influence our product roadmap.', members: '340+ ideas submitted' },
];

const topContributors = [
  { name: 'Dr. Ananya Sharma', role: 'University Admin', contributions: '342', badges: 5, avatar: 'https://i.pravatar.cc/40?img=1' },
  { name: 'Rajesh Kumar', role: 'School Principal', contributions: '289', badges: 4, avatar: 'https://i.pravatar.cc/40?img=2' },
  { name: 'Priya Patel', role: 'IT Director', contributions: '256', badges: 4, avatar: 'https://i.pravatar.cc/40?img=3' },
  { name: 'Michael Chen', role: 'EdTech Consultant', contributions: '201', badges: 3, avatar: 'https://i.pravatar.cc/40?img=4' },
  { name: 'Sarah Johnson', role: 'Curriculum Lead', contributions: '198', badges: 3, avatar: 'https://i.pravatar.cc/40?img=5' },
];

const forums = [
  { title: 'Getting Started Help', topics: '1,240', posts: '4,820', recent: '2 min ago' },
  { title: 'Feature Discussions', topics: '890', posts: '3,450', recent: '15 min ago' },
  { title: 'Bugs & Issues', topics: '456', posts: '1,890', recent: '1 hour ago' },
  { title: 'Integrations & API', topics: '623', posts: '2,340', recent: '30 min ago' },
  { title: 'Best Practices', topics: '782', posts: '3,120', recent: '45 min ago' },
  { title: 'Product Feedback', topics: '567', posts: '2,100', recent: '10 min ago' },
];

export default function CommunityPage() {
  return (
    <SiteShell>
      <PageMain>
        <section className="relative overflow-hidden px-4 pt-20 pb-10 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/3 top-0 h-96 w-96 rounded-full bg-[#6D4CFF]/8 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-[#A855F7]/10 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E8E0FF] bg-white/80 px-4 py-2 text-sm font-extrabold text-[#4F2DB8] shadow-sm">
                <Users className="h-4 w-4 text-[#A855F7]" />
                Community
              </div>
              <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Join the Prasynx Community
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Connect with thousands of educators, administrators, and developers. Share knowledge, get help, and help shape the future of education technology.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="#"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6C4CF1] to-[#8B5CF6] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
                  <MessageCircle size={16} /> Join the Community
                </Link>
                <Link href="#forums"
                  className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white/80 px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-[#6C4CF1] hover:text-[#6C4CF1]">
                  Browse Forums
                </Link>
              </div>
              <div className="mt-6 flex items-center justify-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <img key={i} src={`https://i.pravatar.cc/32?img=${i + 10}`} alt="" className="h-8 w-8 rounded-full border-2 border-white" />
                  ))}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#6C4CF1] text-[9px] font-bold text-white">2k+</span>
                </div>
                <span className="text-xs font-bold text-slate-400">Join 2,400+ active community members</span>
              </div>
            </div>
          </div>
        </section>

        <PageSection>
          <SectionHeader
            eyebrow="Forums"
            title="Active Discussion Forums"
            description="Browse our community forums to find answers, share ideas, and connect with other Prasynx users."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" id="forums">
            {forums.map((forum) => (
              <Link key={forum.title} href="#"
                className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 transition hover:border-[#E8E0FF] hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-950">{forum.title}</h3>
                  <ChevronRight size={14} className="text-slate-300 transition group-hover:text-[#6C4CF1]" />
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{forum.topics} topics</span>
                  <span>{forum.posts} posts</span>
                </div>
                <p className="mt-2 text-[10px] font-bold text-slate-400">Latest: {forum.recent}</p>
              </Link>
            ))}
          </div>
        </PageSection>

        <PageSection tone="soft">
          <SectionHeader
            eyebrow="Community"
            title="Top Contributors"
            description="Recognizing our most active community members who help make the Prasynx community great."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {topContributors.map((person) => (
              <div key={person.name}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-5 text-center transition hover:border-[#E8E0FF] hover:shadow-lg hover:-translate-y-1">
                <img src={person.avatar} alt={person.name} className="mx-auto h-14 w-14 rounded-full border-2 border-[#E8E0FF]" />
                <h3 className="mt-3 text-sm font-bold text-slate-950">{person.name}</h3>
                <p className="text-[10px] font-bold text-slate-400">{person.role}</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="rounded-full bg-[#F3F0FF] px-2 py-0.5 text-[10px] font-bold text-[#6C4CF1]">{person.contributions} posts</span>
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600">
                    <Star size={10} /> {person.badges}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </PageSection>

        <PageSection>
          <SectionHeader
            eyebrow="Community"
            title="Community Features"
            description="Everything you can do as a member of the Prasynx community."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {communityFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title}
                  className="group rounded-2xl border border-[#E2E8F0] bg-white p-6 transition hover:border-[#E8E0FF] hover:shadow-lg hover:-translate-y-1">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F3F0FF] text-[#6C4CF1] transition group-hover:bg-[#6C4CF1] group-hover:text-white">
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-slate-950">{feature.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{feature.desc}</p>
                  <p className="mt-2 text-[10px] font-bold text-[#6C4CF1]">{feature.members}</p>
                </div>
              );
            })}
          </div>
        </PageSection>

        <CtaBand
          title="Ready to Join?"
          description="Become part of the Prasynx community today and connect with education professionals worldwide."
          href="#"
          action="Join Free"
        />
      </PageMain>
    </SiteShell>
  );
}
