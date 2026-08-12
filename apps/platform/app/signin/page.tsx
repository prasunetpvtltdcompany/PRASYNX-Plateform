'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Users, BookOpen, School, ArrowRight, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import SiteShell from '../components/SiteShell';

const PORTALS_URL = process.env.NEXT_PUBLIC_PORTALS_URL ?? 'http://localhost:3000';

const portals = [
  {
    id: 'student',
    name: 'Student Portal',
    description: 'Access learning, assignments, attendance, exams, scholarships, internships, and career guidance.',
    icon: GraduationCap,
    color: '#3B82F6',
    bgLight: 'bg-blue-50',
    features: ['AI Teacher', 'Study Planner', 'Attendance', 'Exams', 'Career Guidance'],
    href: `${PORTALS_URL}/student/login`,
    buttonText: 'Continue as Student',
  },
  {
    id: 'parent',
    name: 'Parent Portal',
    description: "Track your child's academic journey, attendance, fees, and communication with teachers.",
    icon: Users,
    color: '#22C55E',
    bgLight: 'bg-green-50',
    features: ['Academic Reports', 'Attendance Tracking', 'Fee Management', 'Notifications', 'Teacher Communication'],
    href: `${PORTALS_URL}/parent/login`,
    buttonText: 'Continue as Parent',
  },
  {
    id: 'staff',
    name: 'Staff Portal',
    description: 'Manage classes, assignments, examinations, attendance, and student performance.',
    icon: BookOpen,
    color: '#F97316',
    bgLight: 'bg-orange-50',
    features: ['Lesson Planning', 'Attendance', 'Assignments', 'Exams', 'Analytics'],
    href: `${PORTALS_URL}/staff/login`,
    buttonText: 'Continue as Staff',
  },
  {
    id: 'management',
    name: 'Management Portal',
    description: 'Run the whole school - classes, staff, attendance, exams, timetables, assignments and finance.',
    icon: School,
    color: '#7C3AED',
    bgLight: 'bg-purple-50',
    features: ['Class Management', 'Attendance', 'Exams', 'Timetable', 'Finance'],
    href: `${PORTALS_URL}/management/login`,
    buttonText: 'Continue as Management',
  },
];

const stats = [
  { value: '50,000+', label: 'Students' },
  { value: '5,000+', label: 'Teachers' },
  { value: '1,000+', label: 'Institutions' },
  { value: '10,000+', label: 'Recruiters' },
];

export default function SignInPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [navigating, setNavigating] = useState(false);

  const handleSelect = (href: string, id: string) => {
    setSelectedId(id);
    setNavigating(true);
    setTimeout(() => {
      window.location.href = href;
    }, 500);
  };

  return (
    <SiteShell>
      <div className="relative min-h-screen overflow-hidden bg-white pt-20">
        {/* Gradient Mesh Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-96 -left-96 h-[800px] w-[800px] rounded-full bg-[#7C3AED]/5 blur-[150px]" />
          <div className="absolute -top-96 -right-96 h-[800px] w-[800px] rounded-full bg-[#8B5CF6]/5 blur-[150px]" />
          <div className="absolute top-1/3 left-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C3AED]/3 blur-[120px]" />
          <div className="absolute -bottom-96 left-1/4 h-[700px] w-[700px] rounded-full bg-[#7C3AED]/4 blur-[120px]" />
        </div>

        {/* Hero Section */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[#EDE9FE] bg-[#F5F3FF] px-4 py-1.5"
            >
              <Sparkles size={12} className="text-[#7C3AED]" />
              <span className="text-xs font-semibold text-[#7C3AED]">Powered by Prerana AI</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl font-black tracking-tight text-[#0F172A] sm:text-5xl lg:text-6xl"
            >
              Choose Your{' '}
              <span className="bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] bg-clip-text text-transparent">Portal</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mx-auto mt-4 max-w-2xl text-lg text-[#64748B]"
            >
              Select your role to access your personalized Prasynx workspace.
            </motion.p>
          </motion.div>

          {/* Role Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence>
              {portals.map((portal, i) => {
                const Icon = portal.icon;
                const isSelected = selectedId === portal.id;

                return (
                  <motion.div
                    key={portal.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: isSelected && navigating ? 1.04 : 1,
                    }}
                    transition={{ duration: 0.4, delay: i * 0.08, ease: 'easeOut' }}
                    className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 transition-all duration-300 hover:border-[#7C3AED]/30 hover:shadow-lg hover:shadow-[#7C3AED]/10 hover:-translate-y-0.5 ${
                      isSelected ? 'border-[#7C3AED] shadow-lg' : ''
                    }`}
                    onClick={() => !navigating && handleSelect(portal.href, portal.id)}
                  >
                    {/* Card top accent */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: `linear-gradient(90deg, ${portal.color}, ${portal.color}88)` }}
                    />

                    <div className={`pointer-events-none absolute inset-0 ${portal.bgLight} opacity-0 transition-opacity duration-300 group-hover:opacity-50 rounded-2xl`} />

                    <div className="relative z-10 flex h-full flex-col">
                      <div
                        className="mb-4 grid h-12 w-12 place-items-center rounded-xl transition-all duration-300 group-hover:scale-110"
                        style={{ background: `${portal.color}10`, color: portal.color }}
                      >
                        <Icon size={24} />
                      </div>

                      <h3 className="text-lg font-extrabold text-[#0F172A]">{portal.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{portal.description}</p>

                      <div className="mt-4 flex-1 space-y-2">
                        {portal.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2">
                            <CheckCircle2 size={12} className="shrink-0 text-green-500" />
                            <span className="text-xs font-medium text-[#64748B]">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition-all duration-300"
                        style={{ borderColor: `${portal.color}30`, color: portal.color, background: `${portal.color}08` }}
                      >
                        {portal.buttonText}
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Statistics Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="relative z-10 mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8"
        >
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#FAFAFA] px-8 py-6">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl font-black text-[#0F172A] sm:text-2xl">{stat.value}</div>
                  <div className="mt-0.5 text-xs font-medium text-[#64748B]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </SiteShell>
  );
}
