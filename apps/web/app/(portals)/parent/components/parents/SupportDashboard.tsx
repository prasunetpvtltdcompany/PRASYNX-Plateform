'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, FileText, DollarSign, Mail, CalendarCheck, HelpCircle,
  Phone, TicketCheck, MessagesSquare, Sparkles, X, ChevronRight,
  Send, Clock, Shield, CheckCircle2, AlertCircle, BookOpen,
  Star, Users, LifeBuoy,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface SupportDashboardProps {
  setActiveTab: (tab: string) => void;
  downloadReportCard: () => void;
  teachers: any[];
  submitLeave: () => void;
  submitMeeting: () => void;
  leaveForm: any;
  setLeaveForm: (f: any) => void;
  meetingForm: any;
  setMeetingForm: (f: any) => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};
const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const supportItems = [
  { icon: MessageSquare, label: 'Send Message', desc: 'Contact teachers or staff', color: '#6D4CFF', bg: '#F3F0FF', action: 'messages' as const },
  { icon: FileText, label: 'Download Report Card', desc: 'Access academic reports', color: '#22C55E', bg: '#F0FDF4', action: 'report' as const },
  { icon: DollarSign, label: 'Pay Fees', desc: 'Make online payments', color: '#F59E0B', bg: '#FFFBEB', action: 'payments' as const },
  { icon: Mail, label: 'Contact Teacher', desc: 'Send a direct message', color: '#3B82F6', bg: '#EFF6FF', action: 'messages' as const },
  { icon: CalendarCheck, label: 'Request Leave', desc: 'Apply for leave', color: '#EF4444', bg: '#FEF2F2', action: 'leave' as const },
  { icon: HelpCircle, label: 'Book Meeting', desc: 'Schedule parent-teacher meeting', color: '#8B5CF6', bg: '#F5F3FF', action: 'meeting' as const },
];

export function SupportDashboard({
  setActiveTab, downloadReportCard, teachers, submitLeave, submitMeeting,
  leaveForm, setLeaveForm, meetingForm, setMeetingForm,
}: SupportDashboardProps) {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const faqs = [
    { q: 'How do I download my child\'s report card?', a: 'Go to Support → Download Report Card, or visit the Fees & Payments section to access all academic documents.' },
    { q: 'How can I book a parent-teacher meeting?', a: 'Click on "Book Meeting" in the support cards below. Select your preferred teacher, date, and time slot.' },
    { q: 'What should I do in case of an emergency?', a: 'Call the school emergency number: 108. You can also raise an urgent ticket through the support system.' },
    { q: 'How do I apply for leave?', a: 'Use the "Request Leave" option below. Fill in the leave type, dates, and reason. The school will review and respond.' },
  ];

  const handleAction = (action: string) => {
    switch (action) {
      case 'messages': setActiveTab('messages'); break;
      case 'payments': setActiveTab('payments'); break;
      case 'report': downloadReportCard(); break;
      case 'leave': setShowLeaveModal(true); break;
      case 'meeting': setShowMeetingModal(true); break;
    }
  };

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">
      {/* ===== HERO ===== */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#6D4CFF] via-[#7C5CFF] to-[#4F2DB8]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.12)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(124,58,237,0.15)_0%,transparent_50%)]" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#A855F7]/15 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#6366F1]/15 rounded-full blur-[80px]" />
        <motion.div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full bg-white/10"
              animate={{ opacity: [0.1, 0.4, 0.1], y: [0, -(10 + (i % 3) * 8), 0], x: [0, (i % 2 === 0 ? 1 : -1) * 10, 0] }}
              transition={{ duration: 4 + (i % 3) * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
              style={{ width: `${2 + (i % 3) * 2}px`, height: `${2 + (i % 3) * 2}px`, top: `${10 + (i * 12) % 80}%`, left: `${5 + (i * 15) % 90}%` }} />
          ))}
        </motion.div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <LifeBuoy className="w-3.5 h-3.5 text-purple-200" />
              <span className="text-[10px] font-semibold text-purple-100 uppercase tracking-wider">Support Center</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">How Can We Help?</h1>
          <p className="text-sm text-white/80 mt-1 max-w-xl">Access support resources, raise tickets, request leave, book meetings, and get answers to common questions.</p>
          <div className="flex flex-wrap gap-3 mt-5">
            {[
              { icon: LifeBuoy, label: 'Support Options', value: '6', color: '#6D4CFF' },
              { icon: Clock, label: 'Response Time', value: '< 2hrs', color: '#10B981' },
              { icon: Star, label: 'Satisfaction', value: '98%', color: '#F59E0B' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
                <div><span className="text-[10px] text-purple-200/70 block">{item.label}</span><span className="text-sm font-bold text-white">{item.value}</span></div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ===== QUICK ACTION CARDS ===== */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {supportItems.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i} whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={() => handleAction(s.action)}
              className="rounded-2xl border border-gray-100 bg-white p-5 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#6D4CFF]/20 transition-all duration-200 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-all group-hover:scale-110" style={{ background: s.bg, color: s.color }}><Icon className="w-5.5 h-5.5" /></div>
                <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-[#6D4CFF] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-semibold text-sm text-gray-800 group-hover:text-[#6D4CFF] transition-colors">{s.label}</h3>
              <p className="text-xs text-gray-400 mt-1">{s.desc}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ===== FAQ SECTION ===== */}
      <motion.div variants={fadeUp}>
        <Card className="p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><HelpCircle className="w-4 h-4 text-[#6D4CFF]" />Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between p-3.5 text-left hover:bg-gray-50/50 transition-all">
                  <span className="text-sm font-medium text-gray-700">{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${faqOpen === i ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence>
                  {faqOpen === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="px-3.5 pb-3.5 text-xs text-gray-500 leading-relaxed border-t border-gray-50 pt-3">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* ===== CTA SECTION ===== */}
      <motion.div variants={fadeUp}>
        <Card className="p-6 bg-gradient-to-br from-[#6D4CFF] to-[#4F2DB8] text-white border-0 overflow-hidden relative">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#A855F7]/15 rounded-full blur-[60px]" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-[#6366F1]/15 rounded-full blur-[60px]" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg">Need Help?</h3>
              <p className="text-sm text-white/80 mt-1">Our support team is available 24/7 to assist you with any concerns.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="bg-white text-[#6D4CFF] hover:bg-white/90 rounded-xl text-xs h-9 gap-1.5 shadow-lg"
                onClick={() => toast.info('Connecting to live chat...')}>
                <MessagesSquare className="w-4 h-4" /> Live Chat
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl text-xs h-9 gap-1.5"
                onClick={() => toast.success('Ticket raised successfully. We\'ll get back to you soon.')}>
                <TicketCheck className="w-4 h-4" /> Raise Ticket
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl text-xs h-9 gap-1.5"
                onClick={() => toast.info('Calling school...')}>
                <Phone className="w-4 h-4" /> Call School
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ===== LEAVE MODAL ===== */}
      <AnimatePresence>
        {showLeaveModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
            onClick={() => setShowLeaveModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-100" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FEF2F2] to-[#FEE2E2] flex items-center justify-center"><CalendarCheck className="w-5 h-5 text-[#EF4444]" /></div>
                  <div><h3 className="font-bold text-lg">Request Leave</h3><p className="text-[11px] text-gray-400">Submit leave application</p></div>
                </div>
                <button onClick={() => setShowLeaveModal(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"><X size={18} className="text-gray-400" /></button>
              </div>
              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Leave Type</label>
                  <Select value={leaveForm.type || ''} onValueChange={v => setLeaveForm({ ...leaveForm, type: v || 'sick' })}>
                    <SelectTrigger className="w-full rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="personal">Personal Leave</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Start Date</label>
                    <Input type="date" value={leaveForm.start_date} onChange={e => setLeaveForm({ ...leaveForm, start_date: e.target.value })} className="rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">End Date</label>
                    <Input type="date" value={leaveForm.end_date} onChange={e => setLeaveForm({ ...leaveForm, end_date: e.target.value })} className="rounded-xl" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Reason</label>
                  <textarea value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-[#6D4CFF] focus:bg-white focus:ring-2 focus:ring-[rgba(109,76,255,0.1)] min-h-[80px] transition-all resize-none"
                    placeholder="Describe your reason for leave..." />
                </div>
                <Button onClick={() => { submitLeave(); setShowLeaveModal(false); }}
                  className="w-full bg-gradient-to-r from-[#6D4CFF] to-[#8B6FFF] text-white rounded-xl h-10 text-sm font-semibold shadow-[0_4px_12px_rgba(109,76,255,0.25)] hover:shadow-[0_6px_16px_rgba(109,76,255,0.35)] transition-all">
                  Submit Request
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MEETING MODAL ===== */}
      <AnimatePresence>
        {showMeetingModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
            onClick={() => setShowMeetingModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-100" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center"><HelpCircle className="w-5 h-5 text-[#6D4CFF]" /></div>
                  <div><h3 className="font-bold text-lg">Book Meeting</h3><p className="text-[11px] text-gray-400">Schedule parent-teacher meeting</p></div>
                </div>
                <button onClick={() => setShowMeetingModal(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"><X size={18} className="text-gray-400" /></button>
              </div>
              <div className="space-y-3.5">
                {teachers.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Teacher</label>
                    <Select value={meetingForm.teacher_id || ''} onValueChange={v => setMeetingForm({ ...meetingForm, teacher_id: v || '' })}>
                      <SelectTrigger className="w-full rounded-xl"><SelectValue placeholder="Select teacher" /></SelectTrigger>
                      <SelectContent>
                        {teachers.map((t: any) => (
                          <SelectItem key={t.user_id} value={t.user_id}>{t.full_name} {t.subject ? `(${t.subject})` : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Date</label>
                    <Input type="date" value={meetingForm.date} onChange={e => setMeetingForm({ ...meetingForm, date: e.target.value })} className="rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Time</label>
                    <Input type="time" value={meetingForm.time} onChange={e => setMeetingForm({ ...meetingForm, time: e.target.value })} className="rounded-xl" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Reason (optional)</label>
                  <textarea value={meetingForm.reason} onChange={e => setMeetingForm({ ...meetingForm, reason: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-[#6D4CFF] focus:bg-white focus:ring-2 focus:ring-[rgba(109,76,255,0.1)] min-h-[60px] transition-all resize-none"
                    placeholder="What would you like to discuss?" />
                </div>
                <Button onClick={() => { submitMeeting(); setShowMeetingModal(false); }}
                  className="w-full bg-gradient-to-r from-[#6D4CFF] to-[#8B6FFF] text-white rounded-xl h-10 text-sm font-semibold shadow-[0_4px_12px_rgba(109,76,255,0.25)] hover:shadow-[0_6px_16px_rgba(109,76,255,0.35)] transition-all">
                  Book Meeting
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
