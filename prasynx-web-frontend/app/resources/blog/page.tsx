"use client";
import {
  Newspaper, Search, ArrowRight, Clock, User, Calendar, Eye, Heart, Bookmark,
  TrendingUp, Sparkles, Bell, Share2, Play, Star, BarChart3, Users, Download,
  Award, Quote, BookOpen, Monitor, Radio, Trophy, Zap, Shield, Globe, Layers,
  GraduationCap, Lightbulb, Microscope, Dna, MessageCircle, ChevronRight,
  Tag, Filter, ChevronLeft, Volume2, BookMarked, BookCopy, BookOpenText,
  Headphones, LifeBuoy, Code2, Wrench, Activity, Bot, LineChart, PieChart,
  ArrowUp, ArrowUpRight, Music, Video, Camera, Mail,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SiteShell from '../../components/SiteShell';
import { PageMain, CtaBand } from '../../components/MarketingSections';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
};

const stagger = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-30px' },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
};

const staggerChild = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
};

const featuredStory = {
  title: 'How AI Is Transforming Student Performance Analytics in 2026',
  excerpt: 'Discover how Prerana AI leverages advanced machine learning models to predict student outcomes with 94% accuracy, identify at-risk learners months in advance, and personalize educational pathways at unprecedented scale across 500+ institutions.',
  author: { name: 'Dr. Arjun Mehta', role: 'Head of Education', avatar: 'https://i.pravatar.cc/80?img=11' },
  date: 'June 10, 2026', readTime: '8 min read', category: 'AI & Innovation',
  image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=500&fit=crop',
  views: '12.4k', likes: '892',
};

const articles = [
  { title: 'Multi-Tenant Architecture: The Future of Education Management', excerpt: 'Why educational groups and franchises are adopting multi-tenant platforms to unify operations across campuses while maintaining independence.', author: { name: 'Priya Sharma', role: 'Product Manager', avatar: 'https://i.pravatar.cc/80?img=12' }, date: 'June 5, 2026', readTime: '6 min', category: 'Platform', image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop', views: '8.2k', likes: '534', featured: true },
  { title: '5 Ways Parent Engagement Improves Student Outcomes', excerpt: 'Research-backed strategies for increasing parent involvement using modern communication tools.', author: { name: 'Sarah Mitchell', role: 'Education Researcher', avatar: 'https://i.pravatar.cc/80?img=13' }, date: 'May 28, 2026', readTime: '5 min', category: 'Best Practices', image: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=600&h=400&fit=crop', views: '6.1k', likes: '423' },
  { title: 'Complete Guide to Digital Transformation in Education', excerpt: 'A step-by-step framework for institutions planning their digital transformation from assessment to full deployment.', author: { name: 'Rahul Verma', role: 'CTO', avatar: 'https://i.pravatar.cc/80?img=14' }, date: 'May 20, 2026', readTime: '12 min', category: 'Guides', image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&h=400&fit=crop', views: '9.4k', likes: '678' },
  { title: 'Security Best Practices for Education Data Platforms', excerpt: 'How Prasynx ensures data security and compliance with GDPR, FERPA, and other regulations.', author: { name: 'Ananya Reddy', role: 'Security Lead', avatar: 'https://i.pravatar.cc/80?img=15' }, date: 'May 15, 2026', readTime: '7 min', category: 'Security', image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=400&fit=crop', views: '5.7k', likes: '389' },
  { title: 'The Rise of Unified Education Operating Systems', excerpt: 'Why institutions are moving from fragmented software to unified platforms connecting every stakeholder.', author: { name: 'Vikram Patel', role: 'CEO', avatar: 'https://i.pravatar.cc/80?img=16' }, date: 'May 8, 2026', readTime: '10 min', category: 'Industry Trends', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop', views: '11.2k', likes: '745' },
  { title: 'Prerana AI: Inside the Engine Powering Personalized Learning', excerpt: 'A technical deep-dive into the AI architecture, training models, and recommendation algorithms.', author: { name: 'Dr. Neha Gupta', role: 'AI Research Lead', avatar: 'https://i.pravatar.cc/80?img=17' }, date: 'May 1, 2026', readTime: '15 min', category: 'AI & Innovation', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop', views: '15.3k', likes: '1.2k' },
  { title: 'How Institutions Reduced Dropout Rates by 40% with AI', excerpt: 'Case study on how predictive analytics and early intervention workflows transformed student retention.', author: { name: 'Rajesh Kumar', role: 'Customer Success', avatar: 'https://i.pravatar.cc/80?img=18' }, date: 'Apr 25, 2026', readTime: '8 min', category: 'Institution Success', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop', views: '7.8k', likes: '567' },
  { title: 'The Mobile-First Revolution in Education Technology', excerpt: 'How mobile apps are bridging the gap between institutions, parents, and students in emerging markets.', author: { name: 'Aisha Patel', role: 'Mobile Product Lead', avatar: 'https://i.pravatar.cc/80?img=19' }, date: 'Apr 18, 2026', readTime: '6 min', category: 'Digital Learning', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop', views: '6.5k', likes: '432' },
  { title: 'Education Data Privacy: A 2026 Compliance Guide', excerpt: 'Navigate the complex landscape of GDPR, FERPA, COPPA, and emerging data privacy regulations.', author: { name: 'Arun Singh', role: 'Compliance Officer', avatar: 'https://i.pravatar.cc/80?img=20' }, date: 'Apr 10, 2026', readTime: '11 min', category: 'Security', image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=400&fit=crop', views: '4.9k', likes: '312' },
];

const trendingTopics = [
  { icon: Zap, label: 'AI & Innovation', count: '48 articles', color: '#7C3AED' },
  { icon: GraduationCap, label: 'Education Technology', count: '62 articles', color: '#8B5CF6' },
  { icon: Microscope, label: 'Research', count: '34 articles', color: '#A855F7' },
  { icon: TrendingUp, label: 'Career Growth', count: '27 articles', color: '#6D28D9' },
  { icon: Shield, label: 'Product Updates', count: '41 articles', color: '#7C3AED' },
  { icon: Trophy, label: 'Institution Success', count: '39 articles', color: '#9333EA' },
  { icon: Star, label: 'Student Success', count: '53 articles', color: '#8B5CF6' },
  { icon: BookOpen, label: 'Digital Learning', count: '45 articles', color: '#A855F7' },
];

const editorsPicks = [
  { title: 'The AI Tutor Revolution: How Prerana AI Is Reshaping Classrooms', excerpt: 'An in-depth exploration of how AI-powered tutoring systems are augmenting teachers and personalizing learning at scale.', author: 'Dr. Arjun Mehta', image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=700&h=450&fit=crop', readTime: '12 min' },
  { title: 'From Legacy to Cloud: The Biggest Education Digital Transformation of 2026', excerpt: 'Inside the story of how a university group migrated 200,000+ students from legacy systems to Prasynx in 6 months.', author: 'Vikram Patel', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&h=450&fit=crop', readTime: '10 min' },
  { title: 'Why 500+ Institutions Chose a Unified Education OS Over Point Solutions', excerpt: 'The market forces, technology shifts, and operational benefits driving the move toward unified education platforms.', author: 'Priya Sharma', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&h=450&fit=crop', readTime: '8 min' },
];

const researchPapers = [
  { icon: Microscope, title: 'AI Predictive Models for Student Performance', desc: '94% accuracy in predicting academic outcomes using ensemble ML models.', authors: 'Dr. Mehta, Dr. Sharma', downloads: '2,400', date: 'May 2026' },
  { icon: Dna, title: 'Multi-Tenant Architecture in EdTech Platforms', desc: 'Comparative analysis of data isolation, scalability, and performance patterns.', authors: 'Verma, Singh, Reddy', downloads: '1,800', date: 'Apr 2026' },
  { icon: Lightbulb, title: 'Privacy-Preserving Analytics in Education', desc: 'Techniques for analytics on sensitive data while maintaining GDPR compliance.', authors: 'Dr. Chen, Sharma', downloads: '1,400', date: 'Mar 2026' },
  { icon: BarChart3, title: 'Impact of Parent Engagement on Student Success', desc: 'Longitudinal study across 50 institutions showing 23% attendance improvement.', authors: 'Dr. Mitchell, Dr. Kumar', downloads: '3,100', date: 'Feb 2026' },
];

const caseStudies = [
  { institution: 'Delhi Public School Group', type: '12 Campuses', metric: '74%', metricLabel: 'Efficiency Gain', image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=500&h=350&fit=crop', logo: 'https://images.unsplash.com/photo-1562774053-701939374585?w=80&h=80&fit=crop&crop=center', before: 'Manual records, 12 separate systems', after: 'Unified OS, real-time analytics across all campuses' },
  { institution: 'Mumbai University College of Engineering', type: '8,000+ Students', metric: '85%', metricLabel: 'Faster Grade Processing', image: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=500&h=350&fit=crop', logo: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=80&h=80&fit=crop&crop=center', before: 'Legacy system, 2-week grade processing', after: 'Digital gradebook, real-time publishing' },
  { institution: 'Oakridge International Schools', type: '3 Countries', metric: '3x', metricLabel: 'Cross-Campus Collaboration', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=500&h=350&fit=crop', logo: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=80&h=80&fit=crop&crop=center', before: 'Fragmented systems per country', after: 'Unified platform, multi-curriculum support' },
];

const videos = [
  { title: 'Product Walkthrough: Prasynx Education OS 4.0', duration: '12:34', views: '4.2k', presenter: 'Product Team', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop' },
  { title: 'Webinar: AI in Education — The Next Frontier', duration: '45:00', views: '2.8k', presenter: 'Dr. Arjun Mehta', image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=250&fit=crop' },
  { title: 'Expert Interview: Building the Future of EdTech', duration: '28:15', views: '1.9k', presenter: 'Vikram Patel', image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=250&fit=crop' },
  { title: 'Getting Started: Admin Dashboard Deep Dive', duration: '18:45', views: '6.1k', presenter: 'Training Team', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=250&fit=crop' },
];

const authors = [
  { name: 'Dr. Arjun Mehta', role: 'Head of Education', articles: '48', followers: '3.2k', specialization: 'AI in Education', avatar: 'https://i.pravatar.cc/80?img=11' },
  { name: 'Priya Sharma', role: 'Product Manager', articles: '36', followers: '2.1k', specialization: 'Product Strategy', avatar: 'https://i.pravatar.cc/80?img=12' },
  { name: 'Sarah Mitchell', role: 'Education Researcher', articles: '29', followers: '1.8k', specialization: 'Learning Science', avatar: 'https://i.pravatar.cc/80?img=13' },
  { name: 'Rahul Verma', role: 'CTO', articles: '52', followers: '4.5k', specialization: 'Platform Architecture', avatar: 'https://i.pravatar.cc/80?img=14' },
];

const sidebarArticles = [
  { title: 'AI Predictions for Education in 2027', views: '15.3k', date: '3 days ago' },
  { title: 'How to Choose the Right Education OS', views: '11.8k', date: '1 week ago' },
  { title: 'The ROI of Digital Transformation in Schools', views: '9.2k', date: '2 weeks ago' },
  { title: 'Understanding AI Ethics in Student Data', views: '8.7k', date: '3 weeks ago' },
  { title: 'Mobile Learning: Trends Shaping 2026', views: '7.4k', date: '1 month ago' },
];

const stats = [
  { icon: Newspaper, value: '500+', label: 'Articles Published' },
  { icon: Users, value: '50K+', label: 'Monthly Readers' },
  { icon: Eye, value: '1M+', label: 'Total Views' },
  { icon: Microscope, value: '100+', label: 'Research Reports' },
  { icon: BarChart3, value: '95%', label: 'Engagement Rate' },
];

function ArticleCard({ article, index }: { article: typeof articles[0]; index: number }) {
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  return (
    <motion.article {...staggerChild} transition={{ delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#7C3AED]/5 hover:border-[#E8E0FF]">
      <div className="relative h-48 overflow-hidden sm:h-56">
        <img src={article.image} alt={article.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="absolute top-3 left-3">
          <span className="inline-block rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold text-[#7C3AED] shadow-sm">
            {article.category}
          </span>
        </div>
        <button onClick={(e) => { e.preventDefault(); setSaved(!saved); }}
          className={`absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full backdrop-blur-sm transition ${
            saved ? 'bg-[#7C3AED] text-white' : 'bg-white/80 text-slate-400 hover:bg-white hover:text-[#7C3AED]'
          }`}>
          <Bookmark size={13} fill={saved ? 'white' : 'none'} />
        </button>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 mb-3">
          <span className="flex items-center gap-1.5"><img src={article.author.avatar} alt="" className="h-5 w-5 rounded-full" />{article.author.name}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock size={11} />{article.readTime}</span>
          <span>·</span>
          <span><Calendar size={11} /> {article.date}</span>
        </div>
        <h3 className="text-base font-black leading-snug text-slate-950 transition group-hover:text-[#7C3AED]">{article.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 line-clamp-2">{article.excerpt}</p>
        <div className="mt-4 flex items-center justify-between border-t border-[#F1F5F9] pt-3">
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
            <span className="flex items-center gap-1"><Eye size={11} />{article.views}</span>
            <button onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
              className={`flex items-center gap-1 transition ${liked ? 'text-red-500' : 'hover:text-red-400'}`}>
              <Heart size={11} fill={liked ? 'currentColor' : 'none'} />{article.likes}
            </button>
          </div>
          <Link href="#" className="flex items-center gap-1 text-[10px] font-bold text-[#7C3AED] transition hover:gap-1.5">
            Read <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function FloatingCard({ className, icon: Icon, label, value, color }: { className: string; icon: any; label: string; value: string; color: string }) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' }}
      className={`absolute flex items-center gap-3 rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl px-4 py-3 shadow-xl shadow-black/5 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: `${color}15`, color }}>
        <Icon size={16} />
      </span>
      <div>
        <p className="text-[10px] font-bold text-slate-400">{label}</p>
        <p className="text-sm font-black text-slate-950">{value}</p>
      </div>
    </motion.div>
  );
}

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [email, setEmail] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [subscribed, setSubscribed] = useState(false);

  const categories = ['All', ...Array.from(new Set(articles.map(a => a.category)))];
  const filtered = activeCategory === 'All' ? articles : articles.filter(a => a.category === activeCategory);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % editorsPicks.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <SiteShell>
      <PageMain>
        {/* ===== HERO SECTION ===== */}
        <section className="relative overflow-hidden px-4 pt-20 pb-16 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#7C3AED]/8 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[#8B5CF6]/10 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(124,58,237,0.08)_1px,transparent_0)] bg-size-[36px_36px]" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E8E0FF] bg-white/80 px-4 py-2 text-sm font-extrabold text-[#4F2DB8] shadow-sm">
                  <Sparkles className="h-4 w-4 text-[#7C3AED]" />
                  Prasynx Insights
                </div>
                <p className="mb-4 text-xs font-bold text-slate-500">Trusted by 50,000+ learners and institutions</p>
                <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl xl:text-7xl">
                  The Future of{' '}
                  <span className="bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">
                    AI-Powered Education
                  </span>
                </h1>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  Explore insights, research, innovation, product updates, success stories, and the future of learning technology from the Prasynx team and industry leaders.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link href="#articles"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#7C3AED]/25 transition hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]">
                    Explore Articles <ArrowRight size={16} />
                  </Link>
                  <Link href="#newsletter"
                    className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white/80 px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#7C3AED] hover:text-[#7C3AED] hover:shadow-md">
                    <Bell size={16} /> Subscribe
                  </Link>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { value: '500+', label: 'Articles' },
                    { value: '50K+', label: 'Readers' },
                    { value: '100+', label: 'Research Reports' },
                    { value: '95%', label: 'Engagement Rate' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl border border-[#E2E8F0] bg-white/70 backdrop-blur-sm px-4 py-3 text-center shadow-sm">
                      <div className="text-lg font-black text-[#7C3AED]">{s.value}</div>
                      <div className="text-[10px] font-bold text-slate-500">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative hidden lg:col-span-2 lg:block">
                <div className="relative mx-auto h-[420px] w-[380px]">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#7C3AED]/20 via-[#8B5CF6]/10 to-[#A855F7]/20" />
                  <div className="absolute inset-2 rounded-2xl border border-[#E8E0FF] bg-white/60 backdrop-blur-sm overflow-hidden shadow-2xl">
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#7C3AED] text-white"><Bot size={16} /></span>
                        <span className="text-sm font-black text-slate-950">Prerana AI</span>
                      </div>
                      <div className="h-32 rounded-xl bg-gradient-to-br from-[#7C3AED]/10 to-[#8B5CF6]/10 p-3 border border-[#E8E0FF]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-2 w-2 rounded-full bg-green-400" />
                          <span className="text-[10px] font-bold text-slate-400">Active Learning</span>
                        </div>
                        <div className="space-y-1.5">
                          {['Analyzing student performance...', 'Generating personalized path...', '94% prediction accuracy'].map((t, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="h-1.5 flex-1 rounded-full bg-[#F1F5F9] overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7]" style={{ width: `${60 + i * 20}%` }} />
                              </div>
                              <span className="text-[8px] font-bold text-slate-400">{t}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-[#F3F0FF] p-2.5 text-center border border-[#E8E0FF]">
                          <LineChart size={14} className="mx-auto text-[#7C3AED]" />
                          <p className="mt-1 text-[9px] font-bold text-slate-500">Analytics</p>
                        </div>
                        <div className="rounded-xl bg-[#F3F0FF] p-2.5 text-center border border-[#E8E0FF]">
                          <GraduationCap size={14} className="mx-auto text-[#8B5CF6]" />
                          <p className="mt-1 text-[9px] font-bold text-slate-500">Students</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#E8E0FF] bg-[#F8FAFF] p-2.5">
                        <img src="https://i.pravatar.cc/24?img=1" alt="" className="h-6 w-6 rounded-full" />
                        <div className="flex-1">
                          <div className="h-2 w-24 rounded-full bg-[#E2E8F0]" />
                          <div className="mt-1 h-1.5 w-32 rounded-full bg-[#F1F5F9]" />
                        </div>
                        <Zap size={12} className="text-[#7C3AED]" />
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-28 w-28 rounded-full bg-gradient-to-br from-[#7C3AED]/20 to-[#A855F7]/20 blur-2xl" />
                  </div>
                  <FloatingCard icon={Newspaper} label="Latest Article" value="AI in Education" color="#7C3AED" className="-right-20 top-8" />
                  <FloatingCard icon={Eye} label="Trending" value="12.4K views" color="#8B5CF6" className="-left-20 bottom-16" />
                  <FloatingCard icon={Sparkles} label="AI Research" value="New Paper" color="#A855F7" className="-right-16 bottom-8" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SEARCH EXPERIENCE ===== */}
        <section className="px-4 sm:px-6 lg:px-8 -mt-4 mb-8">
          <div className="mx-auto max-w-7xl">
            <div className="group relative mx-auto max-w-2xl">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#7C3AED]/20 via-[#8B5CF6]/20 to-[#A855F7]/20 opacity-0 blur-xl transition group-focus-within:opacity-100" />
              <div className="relative flex items-center rounded-2xl border border-[#E2E8F0] bg-white shadow-sm transition-all group-focus-within:border-[#7C3AED] group-focus-within:shadow-lg group-focus-within:shadow-[#7C3AED]/10">
                <Search className="ml-5 h-5 w-5 shrink-0 text-slate-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, research papers, case studies, AI insights..."
                  className="w-full border-0 bg-transparent px-4 py-4 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" />
                <div className="mr-3 flex items-center gap-1.5">
                  <button className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1.5 text-[10px] font-bold text-slate-400 transition hover:border-[#7C3AED] hover:text-[#7C3AED]">
                    <Volume2 size={12} />
                  </button>
                </div>
              </div>
              {searchQuery && (
                <div className="absolute top-full left-0 right-0 z-20 mt-2 rounded-2xl border border-[#E2E8F0] bg-white shadow-xl">
                  <div className="p-3">
                    <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Popular Searches</p>
                    {['AI analytics', 'student performance', 'multi-tenant', 'parent engagement', 'security compliance'].map((s) => (
                      <button key={s} onClick={() => setSearchQuery(s)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-[#F3F0FF] hover:text-[#7C3AED]">
                        <TrendingUp size={12} className="text-slate-300" /> {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ===== TRENDING TOPICS ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-8 flex items-center justify-between">
              <div>
                <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                  <TrendingUp size={12} /> Trending Topics
                </span>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Explore by Topic</h2>
              </div>
              <Link href="#" className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#7C3AED] transition hover:text-[#6D28D9]">
                View All <ArrowRight size={13} />
              </Link>
            </motion.div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {trendingTopics.map((topic) => {
                const Icon = topic.icon;
                return (
                  <motion.button key={topic.label} {...stagger}
                    onClick={() => setActiveCategory(topic.label === 'AI & Innovation' ? 'AI & Innovation' : topic.label)}
                    className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-4 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
                    style={{ hover: { borderColor: topic.color } } as any}>
                    <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl transition group-hover:scale-110"
                      style={{ background: `${topic.color}12`, color: topic.color }}>
                      <Icon size={18} />
                    </span>
                    <p className="mt-2 text-[11px] font-bold text-slate-950">{topic.label}</p>
                    <p className="text-[9px] font-bold text-slate-400">{topic.count}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== FEATURED STORY + SIDEBAR ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-4">
              <div className="lg:col-span-3">
                <motion.div {...fadeUp}
                  className="group relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-[#7C3AED]/10 hover:-translate-y-1">
                  <div className="grid lg:grid-cols-5">
                    <div className="relative lg:col-span-2 h-56 lg:h-full min-h-[280px] overflow-hidden">
                      <img src={featuredStory.image} alt={featuredStory.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-3 py-1.5 text-[10px] font-bold text-white shadow-lg">
                          <Sparkles size={11} /> Featured Story
                        </span>
                      </div>
                    </div>
                    <div className="lg:col-span-3 flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                      <span className="inline-block w-fit rounded-full bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED] mb-3">{featuredStory.category}</span>
                      <h2 className="text-xl font-black leading-tight text-slate-950 sm:text-2xl lg:text-3xl transition group-hover:text-[#7C3AED]">{featuredStory.title}</h2>
                      <p className="mt-4 text-sm leading-relaxed text-slate-600">{featuredStory.excerpt}</p>
                      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                        <span className="flex items-center gap-2">
                          <img src={featuredStory.author.avatar} alt="" className="h-7 w-7 rounded-full" />
                          {featuredStory.author.name}
                        </span>
                        <span className="flex items-center gap-1"><Clock size={12} />{featuredStory.readTime}</span>
                        <span className="flex items-center gap-1"><Calendar size={12} />{featuredStory.date}</span>
                        <span className="flex items-center gap-1"><Eye size={12} />{featuredStory.views}</span>
                      </div>
                      <div className="mt-6 flex items-center gap-3">
                        <Link href="#"
                          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
                          Read Article <ArrowRight size={13} />
                        </Link>
                        <button className="rounded-full border border-[#E2E8F0] px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:border-[#7C3AED] hover:text-[#7C3AED]">
                          <Share2 size={13} className="inline mr-1" /> Share
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* ===== SIDEBAR ===== */}
              <aside className="hidden lg:block">
                <div className="sticky top-28 space-y-6">
                  <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                    <h3 className="flex items-center gap-2 text-xs font-black text-slate-950 mb-3">
                      <TrendingUp size={14} className="text-[#7C3AED]" /> Trending Now
                    </h3>
                    <div className="space-y-2">
                      {sidebarArticles.map((item, i) => (
                        <Link key={item.title} href="#"
                          className="flex items-start gap-3 rounded-xl p-2 transition hover:bg-[#F3F0FF]">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#F1F5F9] text-[10px] font-black text-[#7C3AED]">{i + 1}</span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-950 leading-tight">{item.title}</p>
                            <p className="text-[9px] font-bold text-slate-400 mt-0.5"><Eye size={9} className="inline" /> {item.views}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-[#7C3AED]/5 to-[#8B5CF6]/10 p-5 shadow-sm">
                    <h3 className="text-xs font-black text-slate-950 mb-3">📬 Get Weekly Updates</h3>
                    <p className="text-[10px] text-slate-500 mb-3">Stay ahead with AI insights and research.</p>
                    <input type="email" placeholder="Your email"
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white/90 px-3 py-2.5 text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#F3F0FF] mb-2" />
                    <button className="w-full rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] py-2.5 text-xs font-bold text-white transition hover:shadow-md">
                      Subscribe
                    </button>
                  </div>
                  <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                    <h3 className="flex items-center gap-2 text-xs font-black text-slate-950 mb-3">
                      <Tag size={13} className="text-[#7C3AED]" /> Categories
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {categories.filter(c => c !== 'All').map((cat) => (
                        <button key={cat} onClick={() => setActiveCategory(cat)}
                          className={`rounded-full px-3 py-1.5 text-[9px] font-bold transition ${
                            activeCategory === cat ? 'bg-[#7C3AED] text-white' : 'bg-[#F1F5F9] text-slate-600 hover:bg-[#F3F0FF] hover:text-[#7C3AED]'
                          }`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ===== LATEST ARTICLES ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12" id="articles">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                  <Newspaper size={12} /> Latest Insights
                </span>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Latest Articles</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-4 py-2 text-[10px] font-bold transition ${
                      activeCategory === cat
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white shadow-sm'
                        : 'bg-white border border-[#E2E8F0] text-slate-600 hover:border-[#7C3AED] hover:text-[#7C3AED]'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((article, i) => (
                <ArticleCard key={article.title} article={article} index={i} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="#"
                className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-6 py-3 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#7C3AED] hover:text-[#7C3AED] hover:shadow-md">
                Load More Articles <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ===== BLOG STATISTICS ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-[#1a1040] p-8 sm:p-12 shadow-2xl">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#7C3AED]/15 blur-3xl" />
                <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#8B5CF6]/10 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] bg-size-[24px_24px]" />
              </div>
              <div className="relative">
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/80 backdrop-blur">
                  <BarChart3 size={14} className="text-[#A855F7]" /> By the Numbers
                </div>
                <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
                  {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div key={stat.label} {...stagger}
                        className="text-center rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:bg-white/10 hover:-translate-y-1">
                        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#7C3AED]/30 to-[#A855F7]/30 text-white">
                          <Icon size={22} />
                        </span>
                        <div className="mt-3 text-3xl font-black text-white">{stat.value}</div>
                        <div className="text-xs font-bold text-white/60">{stat.label}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== EDITOR'S PICKS ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-8">
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-700">
                <Star size={12} /> Editor&apos;s Picks
              </span>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Handpicked for You</h2>
            </motion.div>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7C3AED]/5 via-[#8B5CF6]/5 to-[#A855F7]/5 border border-[#E8E0FF] p-1">
              <div className="grid gap-1 lg:grid-cols-3">
                {editorsPicks.map((pick, i) => (
                  <motion.div key={pick.title} {...stagger} transition={{ delay: i * 0.1 }}
                    className="group relative overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#7C3AED]/10 cursor-pointer">
                    <div className="relative h-48 overflow-hidden">
                      <img src={pick.image} alt={pick.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="inline-block rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-[9px] font-bold text-[#7C3AED] mb-2">Editor&apos;s Pick</span>
                        <h3 className="text-sm font-black text-white leading-tight">{pick.title}</h3>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs leading-relaxed text-slate-500 line-clamp-2">{pick.excerpt}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">By {pick.author}</span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><Clock size={10} />{pick.readTime}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== AI RESEARCH SECTION ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-8 flex items-center justify-between">
              <div>
                <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                  <Microscope size={12} /> Research & Innovation Hub
                </span>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Latest Research</h2>
              </div>
              <Link href="/resources/research"
                className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#7C3AED] transition hover:text-[#6D28D9]">
                View All Research <ArrowRight size={13} />
              </Link>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {researchPapers.map((paper) => {
                const Icon = paper.icon;
                return (
                  <motion.div key={paper.title} {...stagger}
                    className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 transition hover:border-[#E8E0FF] hover:shadow-lg hover:-translate-y-1">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#7C3AED]/10 to-[#A855F7]/10 text-[#7C3AED] mb-3">
                      <Icon size={18} />
                    </span>
                    <h3 className="text-sm font-bold text-slate-950">{paper.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{paper.desc}</p>
                    <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <span>{paper.authors}</span>
                      <span>·</span>
                      <span>{paper.date}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-[#F1F5F9] pt-3">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <Download size={10} /> {paper.downloads} downloads
                      </span>
                      <Link href="#"
                        className="flex items-center gap-1 text-[10px] font-bold text-[#7C3AED] transition hover:text-[#6D28D9]">
                        Read <ArrowRight size={10} />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== CASE STUDIES SECTION ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-8 flex items-center justify-between">
              <div>
                <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                  <Trophy size={12} /> Success Stories
                </span>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Institution Case Studies</h2>
              </div>
              <Link href="/resources/case-studies"
                className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#7C3AED] transition hover:text-[#6D28D9]">
                View All <ArrowRight size={13} />
              </Link>
            </motion.div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {caseStudies.map((cs) => (
                <motion.div key={cs.institution} {...stagger}
                  className="group relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-xl hover:border-[#E8E0FF]">
                  <div className="relative h-40 overflow-hidden">
                    <img src={cs.image} alt={cs.institution} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                      <img src={cs.logo} alt="" className="h-6 w-6 rounded-full border border-white/50 shadow-sm object-cover" />
                      <div>
                        <span className="text-[10px] font-bold text-white/80">{cs.type}</span>
                        <h3 className="text-sm font-black text-white">{cs.institution}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl font-black text-[#7C3AED]">{cs.metric}</span>
                      <span className="text-[10px] font-bold text-slate-500">{cs.metricLabel}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-red-50 p-2.5 border border-red-100">
                        <p className="text-[9px] font-bold text-red-400">Before</p>
                        <p className="text-[10px] font-semibold text-red-600 mt-0.5">{cs.before}</p>
                      </div>
                      <div className="rounded-xl bg-green-50 p-2.5 border border-green-100">
                        <p className="text-[9px] font-bold text-green-400">After</p>
                        <p className="text-[10px] font-semibold text-green-600 mt-0.5">{cs.after}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== VIDEO INSIGHTS SECTION ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-8 flex items-center justify-between">
              <div>
                <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                  <Video size={12} /> Watch & Learn
                </span>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Video Insights</h2>
              </div>
              <Link href="/resources/webinars"
                className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#7C3AED] transition hover:text-[#6D28D9]">
                All Videos <ArrowRight size={13} />
              </Link>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {videos.map((video) => (
                <motion.div key={video.title} {...stagger}
                  className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm transition hover:-translate-y-1.5 hover:shadow-xl cursor-pointer">
                  <div className="relative h-40 overflow-hidden">
                    <img src={video.image} alt={video.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition group-hover:bg-black/40">
                      <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition group-hover:scale-110 group-hover:bg-white">
                        <Play size={22} className="ml-0.5 text-[#7C3AED]" />
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2 rounded-md bg-black/70 backdrop-blur-sm px-2 py-1 text-[10px] font-bold text-white">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xs font-bold text-slate-950 leading-tight">{video.title}</h3>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span>{video.presenter}</span>
                      <span className="flex items-center gap-1"><Eye size={10} />{video.views}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== POPULAR AUTHORS ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mb-8">
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-[#F3F0FF] px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                <Users size={12} /> Meet Our Experts
              </span>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Popular Authors</h2>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {authors.map((author) => (
                <motion.div key={author.name} {...stagger}
                  className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 text-center transition hover:-translate-y-1 hover:shadow-lg hover:border-[#E8E0FF]">
                  <div className="relative mx-auto w-fit">
                    <img src={author.avatar} alt={author.name} className="h-16 w-16 rounded-full border-2 border-[#E8E0FF] object-cover" />
                    <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-[#7C3AED] text-[8px] text-white shadow-sm border-2 border-white">
                      <Award size={8} />
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-slate-950">{author.name}</h3>
                  <p className="text-[10px] font-bold text-[#7C3AED]">{author.role}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{author.specialization}</p>
                  <div className="mt-3 flex items-center justify-center gap-3 border-t border-[#F1F5F9] pt-3">
                    <div className="text-center">
                      <p className="text-xs font-black text-slate-950">{author.articles}</p>
                      <p className="text-[8px] font-bold text-slate-400">Articles</p>
                    </div>
                    <div className="h-6 w-px bg-[#E2E8F0]" />
                    <div className="text-center">
                      <p className="text-xs font-black text-slate-950">{author.followers}</p>
                      <p className="text-[8px] font-bold text-slate-400">Followers</p>
                    </div>
                  </div>
                  <button className="mt-3 w-full rounded-xl border border-[#E2E8F0] py-2 text-[10px] font-bold text-slate-600 transition hover:border-[#7C3AED] hover:text-[#7C3AED] hover:bg-[#F3F0FF]">
                    Follow
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TESTIMONIAL ROTATOR ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7C3AED]/5 via-[#8B5CF6]/5 to-[#A855F7]/5 border border-[#E8E0FF] p-8 sm:p-12">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#7C3AED]/10 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#8B5CF6]/10 blur-3xl" />
              </div>
              <div className="relative">
                <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#E8E0FF] bg-white/80 px-3 py-1 text-[10px] font-bold text-[#7C3AED]">
                  <Quote size={12} /> What Readers Say
                </span>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { text: 'The AI analytics articles have completely changed how we approach student performance tracking at our university.', name: 'Dr. Suresh Kumar', role: 'VIT University', avatar: 'https://i.pravatar.cc/60?img=21' },
                    { text: 'I look forward to every new post. The research papers alone are worth their weight in gold for our curriculum team.', name: 'Anita Desai', role: 'Ryan International', avatar: 'https://i.pravatar.cc/60?img=22' },
                    { text: 'Best education technology publication I follow. The depth of analysis and practical insights are unmatched.', name: 'Rajiv Mehta', role: 'Education Trust Group', avatar: 'https://i.pravatar.cc/60?img=23' },
                  ].map((t) => (
                    <div key={t.name} className="rounded-2xl border border-[#E2E8F0] bg-white/80 backdrop-blur-sm p-5">
                      <div className="flex items-center gap-1 text-amber-400 mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (<Star key={s} size={12} fill="currentColor" />))}
                      </div>
                      <p className="text-xs italic leading-relaxed text-slate-600">&ldquo;{t.text}&rdquo;</p>
                      <div className="mt-3 flex items-center gap-2.5">
                        <img src={t.avatar} alt="" className="h-8 w-8 rounded-full" />
                        <div>
                          <p className="text-[11px] font-bold text-slate-950">{t.name}</p>
                          <p className="text-[9px] font-bold text-slate-400">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== NEWSLETTER SECTION ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-12" id="newsletter">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] p-8 sm:p-12 shadow-2xl">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-size-[24px_24px]" />
              </div>
              <div className="relative grid items-center gap-8 lg:grid-cols-2">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-bold text-white/90 backdrop-blur-sm">
                    <Bell size={12} /> Never miss an update
                  </div>
                  <h2 className="text-3xl font-black text-white leading-tight sm:text-4xl">
                    Stay Ahead of the Future of Education
                  </h2>
                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80">
                    Get weekly insights, research, AI trends, and product updates directly in your inbox.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full rounded-xl border border-white/20 bg-white/15 px-11 py-3.5 text-sm font-semibold text-white outline-none placeholder:text-white/50 transition focus:bg-white/20 focus:border-white/40 backdrop-blur-sm" />
                    </div>
                    <button onClick={() => { setSubscribed(true); }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-[#7C3AED] shadow-lg transition hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]">
                      {subscribed ? 'Subscribed!' : 'Subscribe Now'} <ArrowRight size={16} />
                    </button>
                  </div>
                  {subscribed && (
                    <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-3 text-xs font-bold text-green-200">
                      ✓ You&apos;re subscribed! Check your inbox for a confirmation email.
                    </motion.p>
                  )}
                </div>
                <div className="hidden lg:block">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Sparkles, text: 'Weekly AI Insights' },
                      { icon: Microscope, text: 'Research Reports' },
                      { icon: TrendingUp, text: 'Industry Trends' },
                      { icon: Star, text: 'Exclusive Content' },
                    ].map((benefit) => {
                      const Icon = benefit.icon;
                      return (
                        <div key={benefit.text}
                          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/20 text-white">
                            <Icon size={15} />
                          </span>
                          <span className="text-xs font-bold text-white">{benefit.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </PageMain>
    </SiteShell>
  );
}
