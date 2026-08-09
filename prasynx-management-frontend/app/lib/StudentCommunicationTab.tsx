'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useApi } from './useApi';
import { communicationApiV4 } from './dataService';
import {
  Bell, Megaphone, Sparkles, Send, Users, BarChart3, Search, RefreshCw,
  MessageSquare, CalendarClock, AlertTriangle, CheckCircle2, GraduationCap,
  FileText, UserCheck, Wallet, BookOpen, X, Bus,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

function SearchBox({ value, onChange, placeholder }: any) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF]/50 transition-shadow"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={13} />
        </button>
      )}
    </div>
  );
}

function useDebounced<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const TONES = ['formal', 'friendly', 'urgent', 'encouraging'] as const;
type Tone = typeof TONES[number];

const AI_INTENTS = [
  {
    key: 'fee_reminder', label: 'Fee Payment Reminder', icon: Wallet,
    subject: 'Fee Payment Reminder',
    tones: {
      formal: ({ name }: any) => `Dear ${name},\n\nThis is a gentle reminder that your school fee for the current term is due. Please complete the payment at the earliest to avoid any disruption to your classes. If you have already paid, kindly ignore this message.\n\nRegards,\nSchool Administration`,
      friendly: ({ name }: any) => `Hi ${name}!\n\nJust a friendly heads-up — your school fee is due soon. Please make sure to pay it on time so everything stays smooth. If you've already paid, ignore this message. Thanks! 😊`,
      urgent: ({ name }: any) => `ACTION REQUIRED — Fee Due\n\nDear ${name},\n\nYour school fee is now overdue. Kindly clear the pending amount immediately to continue attending classes without interruption. Contact the office if you have already paid.`,
      encouraging: ({ name }: any) => `Hi ${name},\n\nWe know you've got a lot on your plate, but don't let the fee reminder catch you off guard! Please clear your dues on time so you can keep focusing on your studies. We're proud of how far you've come. 💪`,
    },
  },
  {
    key: 'exam_schedule', label: 'Exam Schedule Notice', icon: GraduationCap,
    subject: 'Examination Schedule — Important',
    tones: {
      formal: ({ name }: any) => `Dear ${name},\n\nPlease note the upcoming examination schedule. Refer to the timetable posted on the notice board and prepare accordingly. Ensure you carry your admit card on each exam day.\n\nRegards,\nExamination Cell`,
      friendly: ({ name }: any) => `Hi ${name}! 📚\n\nThe exam schedule is out! Check the timetable on the notice board and start your prep. You've got this — make sure your admit card is ready for each day.`,
      urgent: ({ name }: any) => `IMPORTANT — Exam Dates Announced\n\nDear ${name},\n\nThe examination dates have been announced. All students must review the schedule immediately and report with admit cards. No exceptions on exam days.`,
      encouraging: ({ name }: any) => `Hi ${name}!\n\nExam season is here — and we believe in you! Review the schedule, plan your revision, and give it your best. Consistent effort beats last-minute cramming. You can do this! 🌟`,
    },
  },
  {
    key: 'holiday', label: 'Holiday / Vacation Notice', icon: CalendarClock,
    subject: 'Holiday Announcement',
    tones: {
      formal: ({ name }: any) => `Dear ${name},\n\nPlease be informed that the school will remain closed as per the announced holiday schedule. Regular classes will resume on the specified date. Plan your studies accordingly.\n\nRegards,\nSchool Administration`,
      friendly: ({ name }: any) => `Hi ${name}! 🎉\n\nGreat news — we have an upcoming holiday! School will be closed as per the schedule, and we'll see you back on the day classes resume. Enjoy your break and come back refreshed!`,
      urgent: ({ name }: any) => `NOTICE — School Closed\n\nDear ${name},\n\nPlease note the school is closed on the announced dates. Do not report to school during the holiday period. Classes resume as scheduled thereafter.`,
      encouraging: ({ name }: any) => `Hi ${name}!\n\nTake a well-deserved break during the upcoming holidays! Rest, recharge, and come back with fresh energy. Use some time to catch up on reading too — balance is key. 🌴`,
    },
  },
  {
    key: 'attendance', label: 'Attendance Alert', icon: UserCheck,
    subject: 'Attendance Reminder',
    tones: {
      formal: ({ name }: any) => `Dear ${name},\n\nOur records show that your attendance is below the required minimum. Consistent attendance is essential for academic progress. Kindly ensure regular presence in all classes.\n\nRegards,\nAttendance Office`,
      friendly: ({ name }: any) => `Hi ${name}! 👋\n\nWe noticed your attendance has dropped a little recently. We'd love to see you in class more often — every session matters! Let us know if there's anything we can help with.`,
      urgent: ({ name }: any) => `ATTENTION — Low Attendance\n\nDear ${name},\n\nYour attendance has fallen below the mandatory minimum. Please improve attendance immediately to remain eligible for examinations. Contact your class teacher today.`,
      encouraging: ({ name }: any) => `Hi ${name},\n\nWe miss seeing you in class! Let's work together to bring your attendance back up — small daily consistency makes a big difference. You're capable of great things. 💙`,
    },
  },
  {
    key: 'transport', label: 'Transport Update', icon: Bus,
    subject: 'Transport Service Update',
    tones: {
      formal: ({ name }: any) => `Dear ${name},\n\nPlease note an update to the school transport schedule. Timings and pickup points may be revised. Kindly check the updated route information on the notice board.\n\nRegards,\nTransport Office`,
      friendly: ({ name }: any) => `Hi ${name}! 🚌\n\nQuick transport update — route timings have changed slightly. Check the notice board for the new schedule so you're not left waiting at the stop!`,
      urgent: ({ name }: any) => `NOTICE — Transport Change\n\nDear ${name},\n\nSchool transport timings have been revised effective immediately. All students using the bus service must check the updated schedule before boarding.`,
      encouraging: ({ name }: any) => `Hi ${name}!\n\nA small update on school transport — please review the new timings so your mornings stay stress-free. We're here to make your commute smooth! 🚍`,
    },
  },
  {
    key: 'event', label: 'Event Invitation', icon: Sparkles,
    subject: 'You are Invited — School Event',
    tones: {
      formal: ({ name }: any) => `Dear ${name},\n\nYou are cordially invited to participate in the upcoming school event. Kindly register with your class teacher and be present on the scheduled date.\n\nRegards,\nEvents Committee`,
      friendly: ({ name }: any) => `Hi ${name}! 🎊\n\nWe've got an exciting event coming up and you're invited! Don't miss out — sign up with your class teacher and bring your best energy!`,
      urgent: ({ name }: any) => `LAST CALL — Event Registration\n\nDear ${name},\n\nRegistration for the upcoming school event closes soon. Confirm your participation with your class teacher immediately if you wish to take part.`,
      encouraging: ({ name }: any) => `Hi ${name},\n\nWe'd love to see you shine at our upcoming event! Participating is a great way to grow your confidence and make memories. Join in — you won't regret it! ✨`,
    },
  },
  {
    key: 'library', label: 'Library Book Due', icon: BookOpen,
    subject: 'Library Book Return Reminder',
    tones: {
      formal: ({ name }: any) => `Dear ${name},\n\nThis is to remind you that a library book issued to you is due for return. Kindly return or renew it at the earliest to avoid late fees.\n\nRegards,\nLibrary Office`,
      friendly: ({ name }: any) => `Hi ${name}! 📚\n\nJust a reminder — a library book borrowed by you is due soon. Return it on time (or renew it) so other students can enjoy it too. Thanks!`,
      urgent: ({ name }: any) => `REMINDER — Book Overdue\n\nDear ${name},\n\nA library book issued to you is overdue. Please return it immediately to avoid late fee charges. Contact the library if you need an extension.`,
      encouraging: ({ name }: any) => `Hi ${name},\n\nLove that you're reading! Just a friendly note that your borrowed book is due soon — return or renew it so the reading streak stays positive. 📖`,
    },
  },
  {
    key: 'praise', label: 'Recognition & Praise', icon: CheckCircle2,
    subject: 'Congratulations!',
    tones: {
      formal: ({ name }: any) => `Dear ${name},\n\nWe are pleased to recognize your commendable performance. Your dedication and hard work set a great example for your peers. Keep up the excellent work!\n\nRegards,\nSchool Administration`,
      friendly: ({ name }: any) => `Hi ${name}! 🏆\n\nYou did amazing and we wanted to celebrate you! Your effort really shows. Keep shining — we're so proud of everything you've achieved!`,
      urgent: ({ name }: any) => `SHOUT OUT — ${name}\n\nYour recent work deserves recognition! Your teachers are proud of your effort. Keep this momentum going — great things are ahead!`,
      encouraging: ({ name }: any) => `Hi ${name},\n\nWe see your hard work and we're cheering for you! Every step forward counts. Keep pushing — your future is bright. 🌟`,
    },
  },
  {
    key: 'meeting', label: 'Parent-Teacher Meeting', icon: MessageSquare,
    subject: 'Parent-Teacher Meeting Notice',
    tones: {
      formal: ({ name }: any) => `Dear ${name},\n\nPlease be informed that a parent-teacher meeting is scheduled. Kindly inform your parents/guardians to attend at the designated time.\n\nRegards,\nSchool Administration`,
      friendly: ({ name }: any) => `Hi ${name}! 👨‍👩‍👧\n\nParent-teacher meeting is coming up! Let your parents know the schedule so they can come meet your teachers and hear all about your progress.`,
      urgent: ({ name }: any) => `IMPORTANT — PTM This Week\n\nDear ${name},\n\nA parent-teacher meeting is scheduled this week. Parents/guardians are requested to attend without fail at the allotted time slot.`,
      encouraging: ({ name }: any) => `Hi ${name},\n\nYour parents are invited to meet your teachers soon — a great chance to showcase all your growth! Make sure they have the time slot handy. 💬`,
    },
  },
  {
    key: 'general', label: 'General Notice', icon: FileText,
    subject: 'Notice from School Office',
    tones: {
      formal: ({ name }: any) => `Dear ${name},\n\nPlease take note of the following information from the school office. For any clarifications, contact the administration.\n\nRegards,\nSchool Administration`,
      friendly: ({ name }: any) => `Hi ${name}! 📢\n\nQuick heads-up from the school office — please read the attached notice and stay tuned for updates. Reach out if you have questions!`,
      urgent: ({ name }: any) => `IMPORTANT NOTICE\n\nDear ${name},\n\nPlease read the following notice carefully and act on it promptly. Reach the school office for any clarifications.`,
      encouraging: ({ name }: any) => `Hi ${name},\n\nJust keeping you in the loop with the latest from school. Stay informed, stay awesome! 📬`,
    },
  },
];

const MODES = [
  { key: 'ai', label: 'AI Composer', icon: Sparkles },
  { key: 'compose', label: 'Direct Message', icon: Send },
  { key: 'announce', label: 'Announcement', icon: Megaphone },
  { key: 'logs', label: 'Audit Log', icon: BarChart3 },
];

const TYPE_STYLE: any = {
  info: { label: 'Info', variant: 'secondary' },
  success: { label: 'Success', variant: 'success' },
  warning: { label: 'Warning', variant: 'warning' },
  error: { label: 'Error', variant: 'destructive' },
};

export default function StudentCommunicationTab({ students }: { students: any }) {
  const [mode, setMode] = useState('ai');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search, 200);
  const [sending, setSending] = useState(false);

  const studentList = useMemo(() => (Array.isArray(students?.data) ? students.data : []), [students?.data]);

  const [intent, setIntent] = useState('fee_reminder');
  const [tone, setTone] = useState<Tone>('friendly');
  const [recipientMode, setRecipientMode] = useState<'all' | 'class' | 'students'>('all');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [draft, setDraft] = useState({ subject: '', body: '' });

  const [direct, setDirect] = useState({ subject: '', body: '', type: 'info' });
  const [announce, setAnnounce] = useState({ title: '', content: '', target_role: 'student' });

  const logs = useApi(() => communicationApiV4.getLogs(), []);
  const stats = useApi(() => communicationApiV4.getStats(), []);

  useEffect(() => { setSearch(''); }, [mode]);

  const classes = useMemo(() => {
    const m: Record<string, string> = {};
    studentList.forEach((s: any) => {
      const label = s.class_name || s.class || s.student_class || s.class_info?.name;
      if (label) m[s.class_id || label] = label;
    });
    return Object.entries(m).map(([id, label]) => ({ id, label }));
  }, [studentList]);

  const studentsInClass = useMemo(
    () => studentList.filter((s: any) => (s.class_id || s.class_name || s.class || s.student_class) === selectedClass),
    [studentList, selectedClass],
  );

  const recipients = useMemo(() => {
    if (recipientMode === 'all') return studentList;
    if (recipientMode === 'class') return studentsInClass;
    return studentList.filter((s: any) => selectedStudents.includes(s.id));
  }, [recipientMode, studentList, studentsInClass, selectedStudents]);

  const classCounts = useMemo(() => {
    const m: Record<string, number> = {};
    studentList.forEach((s: any) => {
      const label = s.class_name || s.class || s.student_class || s.class_info?.name || 'Unassigned';
      m[label] = (m[label] || 0) + 1;
    });
    return m;
  }, [studentList]);

  const aiIntent = AI_INTENTS.find(i => i.key === intent) || AI_INTENTS[0];

  const firstName = (s: any) => (s.full_name || 'Student').split(' ')[0];

  const generateDraft = () => {
    const ctx = {
      name: recipientMode === 'students' && recipients.length === 1 ? firstName(recipients[0]) : 'Student',
    };
    const t = aiIntent.tones[tone];
    setDraft({ subject: aiIntent.subject, body: typeof t === 'function' ? t(ctx) : t });
    setMode('ai');
  };

  const classStat = (id: string) => classCounts[id] || 0;

  const handleSendAi = async () => {
    if (!draft.subject || !draft.body) { toast.error('Generate a draft first'); return; }
    setSending(true);
    try {
      const title = draft.subject;
      const message = draft.body;
      if (recipientMode === 'all') {
        const res = await communicationApiV4.sendAnnouncement({ title, content: message, target_role: 'student', sender_type: 'management' });
        if (!res.success) { toast.error(res.error || 'Failed to send'); return; }
        toast.success(`Announcement broadcast to ${studentList.length} students`);
      } else if (recipientMode === 'class') {
        const res = await communicationApiV4.sendAnnouncement({ title, content: message, target_role: 'student', target_class_id: selectedClass, sender_type: 'management' });
        if (!res.success) { toast.error(res.error || 'Failed to send'); return; }
        toast.success(`Announcement sent to ${studentsInClass.length} students in ${classes.find(c => c.id === selectedClass)?.label || 'class'}`);
      } else {
        const withUser = recipients.filter((s: any) => s.user_id);
        if (!withUser.length) { toast.error('Selected students have no portal login — add credentials first'); return; }
        let ok = 0;
        for (const s of withUser) {
          const res = await communicationApiV4.sendNotification({ user_id: s.user_id, title, message, type: 'info', sender_type: 'management' });
          if (res.success) ok++;
        }
        toast.success(`Notification sent to ${ok} student(s)`);
      }
      logs.refetch(); stats.refetch();
    } finally { setSending(false); }
  };

  const handleSendDirect = async () => {
    if (!direct.subject || !direct.body) { toast.error('Subject and message required'); return; }
    setSending(true);
    try {
      const withUser = recipients.filter((s: any) => s.user_id);
      if (!withUser.length) { toast.error('No selected students have a portal login yet — generate credentials in the Student Directory'); return; }
      let ok = 0;
      for (const s of withUser) {
        const res = await communicationApiV4.sendNotification({ user_id: s.user_id, title: direct.subject, message: direct.body, type: direct.type, sender_type: 'management' });
        if (res.success) ok++;
      }
      toast.success(`Notification delivered to ${ok} student inbox(es)`);
      setDirect({ subject: '', body: '', type: 'info' });
      logs.refetch(); stats.refetch();
    } finally { setSending(false); }
  };

  const handleSendAnnounce = async () => {
    if (!announce.title || !announce.content) { toast.error('Title and content required'); return; }
    setSending(true);
    try {
      const res = await communicationApiV4.sendAnnouncement({ title: announce.title, content: announce.content, target_role: announce.target_role, sender_type: 'management' });
      if (!res.success) { toast.error(res.error || 'Failed to send announcement'); return; }
      toast.success(`Announcement published for ${announce.target_role === 'parent' ? 'parents' : announce.target_role === 'student' ? 'students' : 'everyone'}`);
      setAnnounce({ title: '', content: '', target_role: 'student' });
      logs.refetch(); stats.refetch();
    } finally { setSending(false); }
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const renderRecipientBar = () => (
    <div className="p-3 rounded-xl border border-gray-100 bg-gray-50/60 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-semibold text-gray-500">Recipients</span>
        {[
          { key: 'all', label: `All Students (${studentList.length})` },
          { key: 'class', label: 'By Class' },
          { key: 'students', label: 'Specific Students' },
        ].map(o => (
          <button key={o.key} onClick={() => setRecipientMode(o.key as any)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${recipientMode === o.key ? 'bg-[#6D4CFF] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-[#6D4CFF]/40'}`}>
            {o.label}
          </button>
        ))}
      </div>
      {recipientMode === 'class' && (
        <div className="flex flex-wrap gap-1.5">
          {classes.map(c => (
            <button key={c.id} onClick={() => setSelectedClass(c.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${selectedClass === c.id ? 'bg-[#6D4CFF] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-[#6D4CFF]/40'}`}>
              {c.label} · {classStat(c.id)}
            </button>
          ))}
        </div>
      )}
      {recipientMode === 'students' && (
        <>
          <SearchBox value={search} onChange={setSearch} placeholder="Search students by name, roll, class..." />
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
            {studentList
              .filter((s: any) => !debouncedSearch || [s.full_name, s.roll_number, s.class_name, s.class, s.student_class].some(f => (f || '').toLowerCase().includes(debouncedSearch.toLowerCase())))
              .map((s: any) => {
                const sel = selectedStudents.includes(s.id);
                return (
                  <button key={s.id} onClick={() => toggleStudent(s.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors flex items-center gap-1.5 ${sel ? 'bg-[#6D4CFF] text-white border-[#6D4CFF]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#6D4CFF]/40'}`}>
                    {!s.user_id && <AlertTriangle size={10} className="opacity-60" />}
                    {s.full_name || 'Unknown'}
                    <span className="opacity-60">· {(s.roll_number || s.class_name || s.class || s.student_class || '—')}</span>
                  </button>
                );
              })}
            {studentList.filter((s: any) => !debouncedSearch || [s.full_name, s.roll_number, s.class_name, s.class, s.student_class].some(f => (f || '').toLowerCase().includes(debouncedSearch.toLowerCase()))).length === 0 && (
              <p className="text-[10px] text-gray-400 py-2">No students match your search.</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <span>{selectedStudents.length} selected</span>
            {selectedStudents.length > 0 && (
              <button onClick={() => setSelectedStudents([])} className="text-red-400 hover:text-red-500 font-semibold">Clear</button>
            )}
          </div>
        </>
      )}
      <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
        <Users size={11} className="text-[#6D4CFF]" />
        {recipients.length} student(s) will receive this · {recipients.filter((s: any) => !s.user_id).length} without portal login
      </div>
    </div>
  );

  const renderAiComposer = () => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 space-y-4">
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white"><Sparkles size={15} /></div>
            <div>
              <h4 className="text-xs font-bold text-gray-800">AI Message Composer</h4>
              <p className="text-[9px] text-gray-400">Pick an intent and tone — the AI drafts a student-ready message instantly</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-2 mb-4">
            {AI_INTENTS.map(i => (
              <button key={i.key} onClick={() => setIntent(i.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all ${intent === i.key ? 'border-[#6D4CFF] bg-[#6D4CFF10] text-[#5A3EF0]' : 'border-gray-100 bg-gray-50/60 text-gray-600 hover:border-[#6D4CFF]/30'}`}>
                <i.icon size={13} className="shrink-0" />
                <span className="text-[10px] font-semibold leading-tight">{i.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-semibold text-gray-500">Tone</span>
            {TONES.map(t => (
              <button key={t} onClick={() => setTone(t)}
                className={`px-3 py-1 rounded-lg text-[10px] font-semibold capitalize transition-colors ${tone === t ? 'bg-[#6D4CFF] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-[#6D4CFF]/40'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={generateDraft} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-[11px] font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity">
              <Sparkles size={13} /> Generate Draft
            </button>
            <span className="text-[9px] text-gray-400">{aiIntent.label} · {tone} tone</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-800">Generated Message</h4>
            {recipients.length > 0 && (
              <Badge className="text-[9px]"><Users size={10} className="inline mr-1" />{recipients.length} recipients</Badge>
            )}
          </div>
          <input value={draft.subject} onChange={e => setDraft({ ...draft, subject: e.target.value })} placeholder="Subject line" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700" />
          <textarea value={draft.body} onChange={e => setDraft({ ...draft, body: e.target.value })} rows={6} placeholder="Message body..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 resize-none leading-relaxed" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setDraft({ subject: aiIntent.subject, body: '' })} className="px-3 py-2 rounded-lg border border-gray-200 text-[10px] font-semibold text-gray-500 hover:bg-gray-50">Reset</button>
            <button onClick={handleSendAi} disabled={sending || !draft.subject || !draft.body} className="px-4 py-2 rounded-lg bg-[#6D4CFF] text-white text-[10px] font-semibold flex items-center gap-1.5 hover:bg-[#5B3FDD] disabled:opacity-50">
              <Send size={12} /> {sending ? 'Sending...' : recipientMode === 'all' ? 'Broadcast to All' : recipientMode === 'class' ? 'Send to Class' : 'Send to Selected'}
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {renderRecipientBar()}
        <div className="p-4 rounded-2xl bg-[#F5F3FF] border border-[#6D4CFF20]">
          <h4 className="text-[11px] font-bold text-[#5A3EF0] mb-2 flex items-center gap-1.5"><Sparkles size={12} /> AI Composer Tips</h4>
          <ul className="space-y-1.5 text-[10px] text-gray-500 leading-relaxed">
            <li>• Choose an intent to get a pre-written, professional template</li>
            <li>• Switch tones for formal, friendly, urgent, or encouraging messaging</li>
            <li>• Target all students, a class, or specific individuals</li>
            <li>• Students without a portal login (⚠) can't receive direct notifications</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderDirect = () => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#6D4CFF15] flex items-center justify-center text-[#6D4CFF]"><Send size={15} /></div>
          <div>
            <h4 className="text-xs font-bold text-gray-800">Send Direct Notification</h4>
            <p className="text-[9px] text-gray-400">Deliver to individual student inboxes (requires portal login)</p>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Subject</label>
          <input value={direct.subject} onChange={e => setDirect({ ...direct, subject: e.target.value })} placeholder="e.g. Reminder: Submit science project" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Message</label>
          <textarea value={direct.body} onChange={e => setDirect({ ...direct, body: e.target.value })} rows={6} placeholder="Write your message here..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 resize-none" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Type</label>
          <select value={direct.type} onChange={e => setDirect({ ...direct, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
            <option value="info">Info</option><option value="success">Success</option><option value="warning">Warning</option><option value="error">Error</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button onClick={handleSendDirect} disabled={sending || !direct.subject || !direct.body} className="px-4 py-2 rounded-lg bg-[#6D4CFF] text-white text-[10px] font-semibold flex items-center gap-1.5 hover:bg-[#5B3FDD] disabled:opacity-50">
            <Send size={12} /> {sending ? 'Sending...' : `Send to ${recipients.filter((s: any) => s.user_id).length} student(s)`}
          </button>
        </div>
      </div>
      <div className="space-y-4">{renderRecipientBar()}</div>
    </div>
  );

  const renderAnnounce = () => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F59E0B15] flex items-center justify-center text-[#F59E0B]"><Megaphone size={15} /></div>
          <div>
            <h4 className="text-xs font-bold text-gray-800">Post Announcement</h4>
            <p className="text-[9px] text-gray-400">Publish a school-wide notice visible to students, parents, and staff</p>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Title</label>
          <input value={announce.title} onChange={e => setAnnounce({ ...announce, title: e.target.value })} placeholder="e.g. Annual Sports Day — Volunteers Needed" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Content</label>
          <textarea value={announce.content} onChange={e => setAnnounce({ ...announce, content: e.target.value })} rows={7} placeholder="Write the full announcement..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 resize-none" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Target Audience</label>
          <select value={announce.target_role} onChange={e => setAnnounce({ ...announce, target_role: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
            <option value="student">Students</option><option value="parent">Parents</option><option value="all">Everyone</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button onClick={handleSendAnnounce} disabled={sending || !announce.title || !announce.content} className="px-4 py-2 rounded-lg bg-[#F59E0B] text-white text-[10px] font-semibold flex items-center gap-1.5 hover:bg-[#D97706] disabled:opacity-50">
            <Megaphone size={12} /> {sending ? 'Publishing...' : 'Publish Announcement'}
          </button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#F59E0B20]">
          <h4 className="text-[11px] font-bold text-[#D97706] mb-2 flex items-center gap-1.5"><Megaphone size={12} /> Announcement Tips</h4>
          <ul className="space-y-1.5 text-[10px] text-gray-500 leading-relaxed">
            <li>• Announcements appear on the notice board for all audiences</li>
            <li>• Use for events, schedule changes, and school-wide updates</li>
            <li>• Keep titles short and clear for quick scanning</li>
          </ul>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <h4 className="text-[11px] font-bold text-gray-700 mb-3">Recent Announcements</h4>
          {(logs.data || []).filter((l: any) => l.channel === 'announcement').slice(0, 4).map((l: any) => (
            <div key={l.id} className="py-2 border-b border-gray-50 last:border-0">
              <div className="text-[11px] font-semibold text-gray-700 truncate">{l.subject}</div>
              <div className="text-[9px] text-gray-400 mt-0.5 line-clamp-1">{l.message}</div>
            </div>
          ))}
          {(logs.data || []).filter((l: any) => l.channel === 'announcement').length === 0 && (
            <p className="text-[10px] text-gray-400 text-center py-4">No announcements yet.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderLogs = () => {
    const filtered = (logs.data || []).filter((r: any) =>
      !debouncedSearch || JSON.stringify(r).toLowerCase().includes(debouncedSearch.toLowerCase()));
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
          <SearchBox value={search} onChange={setSearch} placeholder="Search audit trail by subject, message, channel, status..." />
          <button onClick={() => { logs.refetch(); stats.refetch(); }} className="px-3 py-2 rounded-lg border border-gray-200 text-[10px] font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-1.5"><RefreshCw size={12} /> Refresh</button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Time', 'Channel', 'Subject', 'Message', 'To', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: any) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3"><Badge className="bg-blue-100 text-blue-700 capitalize">{r.channel || '—'}</Badge></td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{r.subject || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 max-w-[220px] truncate">{r.message || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{r.receiver_type || '—'}</td>
                  <td className="px-4 py-3"><Badge className={r.status === 'sent' ? 'bg-green-100 text-green-700' : r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>{r.status || '—'}</Badge></td>
                </tr>
              ))}
              {filtered.length === 0 && !logs.loading && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No communication records yet — send your first message above.</td></tr>
              )}
              {logs.loading && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const st = stats.data || {};
  const statCards = [
    { icon: MessageSquare, label: 'Total Communications', value: st.total ?? (logs.data || []).length, color: '#6D4CFF', bg: '#F5F3FF' },
    { icon: Megaphone, label: 'Announcements', value: (st.byChannel?.announcement ?? 0) || (logs.data || []).filter((l: any) => l.channel === 'announcement').length, color: '#F59E0B', bg: '#FFFBEB' },
    { icon: Bell, label: 'Notifications', value: (st.byChannel?.notification ?? 0) || (logs.data || []).filter((l: any) => l.channel === 'notification').length, color: '#3B82F6', bg: '#EFF6FF' },
    { icon: Users, label: 'Students Reached', value: studentList.length, color: '#22C55E', bg: '#F0FDF4' },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white"><MessageSquare size={20} /></div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Student Communication</h1>
            <p className="text-xs text-gray-500">Send AI-crafted messages, notifications, and announcements to students</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 anim-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className={`p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover-lift anim-fade-up delay-${i + 1}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.bg, color: c.color }}><Icon size={17} /></div>
                  <div>
                    <div className="text-xl font-extrabold text-gray-900">{c.value ?? 0}</div>
                    <div className="text-[10px] text-gray-400 font-medium">{c.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      <div className="flex gap-1 flex-wrap p-1 bg-gray-100/60 rounded-xl">
        {MODES.map(n => (
          <button key={n.key} onClick={() => setMode(n.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${mode === n.key ? 'bg-white text-[#6D4CFF] shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'}`}>
            <n.icon size={14} />
            {n.label}
          </button>
        ))}
      </div>

      {mode === 'ai' && renderAiComposer()}
      {mode === 'compose' && renderDirect()}
      {mode === 'announce' && renderAnnounce()}
      {mode === 'logs' && renderLogs()}
      </div>
    </div>
  );
}
