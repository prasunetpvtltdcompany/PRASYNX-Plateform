'use client';

import { useState, useMemo, useEffect } from 'react';
import { useApi } from './useApi';
import { timetableApi, classApi, subjectApi, staffApi, academicMgmtApi } from './dataService';
import { CalendarDays, Plus, Trash2, RefreshCw, Loader2, Clock, BookOpen, GraduationCap, Coffee } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ModuleHeader } from './ModuleUi';

const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const TIMESLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

export default function TimetableManagementTab() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [saving, setSaving] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  const classes = useApi(() => classApi.getAll(), []);
  const sections = useApi(() => timetableApi.getSections(selectedClass || undefined), [selectedClass]);
  const subjects = useApi(() => subjectApi.getAll(), []);
  const teachers = useApi(() => staffApi.getAll({ role: 'teacher' }), []);
  const mappings = useApi(() => academicMgmtApi.getTeacherAssignments(), []);
  const entries = useApi(
    () => timetableApi.getAll({ class_id: selectedClass || undefined, section_id: selectedSection || undefined }),
    [selectedClass, selectedSection]
  );

  const [draft, setDraft] = useState({ day: 1, start_time: '09:00', end_time: '10:00', subject_id: '', teacher_id: '', room: '', title: '' });

  useEffect(() => {
    if (selectedClass && !selectedSection) {
      const first = sections.data?.[0];
      if (first) setSelectedSection(first.id);
    }
  }, [selectedClass, sections.data]);

  const refetchAll = () => {
    entries.refetch();
    sections.refetch();
    subjects.refetch();
    classes.refetch();
    teachers.refetch();
    mappings.refetch();
  };

  const filteredSections = useMemo(() => (sections.data || []), [sections.data]);

  // Subjects assigned to the selected class (class-level mapping; section_id null inherits to all sections)
  const classAssignedSubjectIds = useMemo(() => {
    if (!selectedClass) return new Set<string>();
    const ids = new Set<string>();
    for (const m of mappings.data || []) {
      if (m.class_id === selectedClass && m.subject_id) ids.add(m.subject_id);
    }
    return ids;
  }, [selectedClass, mappings.data]);

  const classSubjects = useMemo(() => {
    return (subjects.data || []).filter((s: any) => classAssignedSubjectIds.has(s.id));
  }, [subjects.data, classAssignedSubjectIds]);

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const e of entries.data || []) {
      const key = `${e.day_of_week}_${(e.start_time || '').slice(0, 5)}`;
      if (!map[key]) map[key] = [];
      map[key].push(e);
    }
    return map;
  }, [entries.data]);

  const handleAdd = async () => {
    if (!selectedClass) { toast.error('Select a class first'); return; }
    if (!selectedSection) { toast.error('Select a section first'); return; }
    if (draft.start_time >= draft.end_time) { toast.error('End time must be after start time'); return; }
    if (isBreak) {
      if (!draft.title.trim()) { toast.error('Enter a break name (e.g. Lunch Break)'); return; }
    } else if (!draft.subject_id) {
      toast.error('Select a subject');
      return;
    }
    setSaving(true);
    try {
      await timetableApi.create({
        class_id: selectedClass,
        section_id: selectedSection,
        subject_id: isBreak ? null : draft.subject_id,
        teacher_id: isBreak ? null : draft.teacher_id || null,
        day_of_week: draft.day,
        start_time: draft.start_time,
        end_time: draft.end_time,
        room: draft.room || null,
        entry_type: isBreak ? 'break' : 'regular',
        title: isBreak ? draft.title.trim() : null,
      });
      toast.success(isBreak ? 'Break added to timetable' : 'Period added to timetable');
      setDraft({ day: 1, start_time: '09:00', end_time: '10:00', subject_id: '', teacher_id: '', room: '', title: '' });
      setIsBreak(false);
      entries.refetch();
    } catch (e: any) {
      toast.error(e.message || 'Failed to add period');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this period from the timetable?')) return;
    try {
      await timetableApi.remove(id);
      toast.success('Period removed');
      entries.refetch();
    } catch (e: any) {
      toast.error(e.message || 'Failed to remove period');
    }
  };

  const periodSlots = useMemo(() => {
    const slots = [...TIMESLOTS];
    for (const e of entries.data || []) {
      const t = (e.start_time || '').slice(0, 5);
      if (t && !slots.includes(t)) slots.push(t);
    }
    return slots.sort((a, b) => a.localeCompare(b));
  }, [entries.data]);

  const classObj = (classes.data || []).find((c: any) => c.id === selectedClass);
  const sectionObj = filteredSections.find((s: any) => s.id === selectedSection);

  const selectCls = 'w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 bg-white';

  const entryLabel = (e: any) => {
    if (e.entry_type === 'break') return e.title || 'Break';
    return e.subject?.name || '—';
  };

  const entryList = entries.data || [];
  const classesWithTT = new Set(entryList.map((e: any) => e.class_id)).size;
  const coverageScore = (classes.data || []).length ? Math.round((classesWithTT / (classes.data || []).length) * 100) : 0;

  return (
    <div className="p-6 space-y-5">
      <ModuleHeader
        icon={CalendarDays}
        gradient="bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]"
        title="Timetable Management"
        subtitle="Create and manage class timetables section-wise"
        onRefresh={refetchAll}
      />

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div>
          <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Class</label>
          <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSection(''); }} className={selectCls}>
            <option value="">Select a class...</option>
            {(classes.data || []).map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Section</label>
          <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className={selectCls}>
            <option value="">Select a section...</option>
            {filteredSections.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Context</label>
          <div className="flex items-center gap-2 h-full">
            <Badge className="bg-[#6D4CFF]/10 text-[#6D4CFF] border border-[#6D4CFF]/20 text-[10px]">
              {classObj?.name || 'No class'} {sectionObj ? `· Section ${sectionObj.name}` : ''}
            </Badge>
            <Badge className="bg-green-50 text-green-600 border border-green-200 text-[10px]">
              {(entries.data || []).length} periods
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Add period form */}
        <div className="space-y-4">
          <div className="border border-gray-100 rounded-xl p-4">
            <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Plus size={14} className="text-[#6D4CFF]" />
              Add Period
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2">
                <span className="text-[10px] font-semibold text-gray-500 uppercase">Period Type</span>
                <div className="flex gap-1">
                  <button onClick={() => setIsBreak(false)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition ${!isBreak ? 'bg-[#6D4CFF] text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
                    Period
                  </button>
                  <button onClick={() => setIsBreak(true)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition ${isBreak ? 'bg-amber-500 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
                    Break
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Day</label>
                <select value={draft.day} onChange={e => setDraft({ ...draft, day: Number(e.target.value) })} className={selectCls}>
                  {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={draft.start_time}
                    onChange={e => setDraft({ ...draft, start_time: e.target.value })}
                    className={selectCls}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">End Time</label>
                  <input
                    type="time"
                    value={draft.end_time}
                    onChange={e => setDraft({ ...draft, end_time: e.target.value })}
                    className={selectCls}
                  />
                </div>
              </div>

              {isBreak ? (
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Break Name</label>
                  <input
                    value={draft.title}
                    onChange={e => setDraft({ ...draft, title: e.target.value })}
                    placeholder="e.g. Short Break / Lunch Break"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Subject</label>
                    <select value={draft.subject_id} onChange={e => setDraft({ ...draft, subject_id: e.target.value })} className={selectCls}>
                      <option value="">Select a subject...</option>
                      {classSubjects.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}{s.code ? ` (${s.code})` : ''}</option>
                      ))}
                    </select>
                    {classSubjects.length === 0 && (subjects.data || []).length > 0 && (
                      <p className="text-[10px] text-amber-600 mt-1">No subjects assigned to this class yet. Assign subjects first.</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Teacher</label>
                    <select value={draft.teacher_id} onChange={e => setDraft({ ...draft, teacher_id: e.target.value })} className={selectCls}>
                      <option value="">No teacher...</option>
                      {(teachers.data || []).map((t: any) => (
                        <option key={t.teacher_id || t.id} value={t.teacher_id || t.id}>{t.full_name || t.name || 'Unnamed'}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Room</label>
                <input
                  value={draft.room}
                  onChange={e => setDraft({ ...draft, room: e.target.value })}
                  placeholder="e.g. Room 101"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20"
                />
              </div>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5A3EF0] disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : isBreak ? <Coffee size={14} /> : <Plus size={14} />}
                {isBreak ? 'Add Break' : 'Add Period'}
              </button>
            </div>
          </div>
        </div>

        {/* Weekly grid */}
        <div className="xl:col-span-3 border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-700 flex items-center gap-2">
              <CalendarDays size={14} className="text-[#6D4CFF]" />
              Weekly Schedule
              {classObj && <span className="text-[10px] font-semibold text-gray-400">{classObj.name}{sectionObj ? ` · Section ${sectionObj.name}` : ''}</span>}
            </h3>
            <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
              <Clock size={12} /> {(entries.data || []).length} periods
            </div>
          </div>

          {!selectedClass ? (
            <div className="p-12 text-center text-sm text-gray-400">
              <GraduationCap size={40} className="mx-auto mb-3 opacity-30" />
              Select a class and section to build the timetable
            </div>
          ) : entries.loading ? (
            <div className="p-12 text-center text-sm text-gray-400">Loading timetable...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-3 py-2.5 text-[10px] uppercase text-gray-400 font-semibold w-20">Time</th>
                    {DAYS.map(d => (
                      <th key={d.value} className="px-3 py-2.5 text-[10px] uppercase text-gray-400 font-semibold min-w-[130px]">
                        {d.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periodSlots.map(slot => {
                    const slotEntry = (entries.data || []).find((e: any) => (e.start_time || '').slice(0, 5) === slot);
                    const slotLabel = slotEntry?.end_time ? `${slot} – ${(slotEntry.end_time || '').slice(0, 5)}` : slot;
                    return (
                    <tr key={slot} className="border-b border-gray-50">
                      <td className="px-3 py-2 text-[10px] font-semibold text-gray-500 whitespace-nowrap">{slotLabel}</td>
                      {DAYS.map(d => {
                        const cellEntries = grouped[`${d.value}_${slot}`] || [];
                        return (
                          <td key={d.value} className="px-2 py-1.5 align-top">
                            {cellEntries.length > 0 ? (
                              <div className="space-y-1">
                                {cellEntries.map(e => {
                                  const isBrk = e.entry_type === 'break';
                                  return (
                                  <div key={e.id} className={`group relative rounded-lg border p-2 ${isBrk ? 'border-amber-200 bg-amber-50' : 'border-[#6D4CFF]/20 bg-[#6D4CFF]/5'}`}>
                                    <div className={`text-[11px] font-semibold leading-tight ${isBrk ? 'text-amber-700' : 'text-gray-800'}`}>
                                      {entryLabel(e)}
                                    </div>
                                    {!isBrk && (
                                      <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                                        <BookOpen size={10} />
                                        {e.teacher?.full_name ? `${e.teacher.full_name} (${e.teacher?.staff_unique_id || e.teacher_id || '—'})` : 'No teacher'}
                                      </div>
                                    )}
                                    {e.room && <div className="text-[9px] text-gray-400 mt-0.5">Room: {e.room}</div>}
                                    <button
                                      onClick={() => handleRemove(e.id)}
                                      className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 p-1 rounded-full bg-red-500 text-white shadow"
                                      title="Remove"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="h-full min-h-[42px] flex items-center justify-center rounded-lg bg-gray-50 text-[9px] text-gray-300">—</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    );
                  })}
                  {periodSlots.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-sm text-gray-400">
                        No periods yet. Use the Add Period form to build the timetable.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
