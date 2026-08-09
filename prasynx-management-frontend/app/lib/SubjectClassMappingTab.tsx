'use client';

import { useState } from 'react';
import { useApi } from './useApi';
import { classApi, subjectApi, staffApi, academicMgmtApi } from './dataService';
import { BookOpen, Plus, Trash2, Search, RefreshCw, GraduationCap, UserCheck, Loader2, BookMarked } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ModuleHeader } from './ModuleUi';

const CLR = { primary: '#6D4CFF' };

export default function SubjectClassMappingTab() {
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [assignSubject, setAssignSubject] = useState('');
  const [assignTeacher, setAssignTeacher] = useState('');
  const [saving, setSaving] = useState(false);

  const classes = useApi(() => classApi.getAll(), []);
  const subjects = useApi(() => subjectApi.getAll(), []);
  const teachers = useApi(() => staffApi.getAll({ role: 'teacher' }), []);
  const mappings = useApi(() => academicMgmtApi.getTeacherAssignments(), []);

  const refetchAll = () => {
    mappings.refetch();
    subjects.refetch();
    classes.refetch();
    teachers.refetch();
  };

  const filter = (arr: any[]) => {
    if (!search) return arr;
    const q = search.toLowerCase();
    return arr.filter((r: any) => JSON.stringify(r).toLowerCase().includes(q));
  };

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) {
      toast.error('Subject name is required');
      return;
    }
    setSaving(true);
    try {
      await subjectApi.create({ name: newSubjectName.trim(), code: newSubjectCode.trim() || null });
      toast.success('Subject created');
      setNewSubjectName('');
      setNewSubjectCode('');
      subjects.refetch();
    } catch (e: any) {
      toast.error(e.message || 'Failed to create subject');
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedClass) {
      toast.error('Select a class first');
      return;
    }
    if (!assignSubject) {
      toast.error('Select a subject to assign');
      return;
    }
    const existing = (mappings.data || []).find(
      (m: any) => m.class_id === selectedClass && m.subject_id === assignSubject
    );
    if (existing) {
      toast.error('This subject is already assigned to the class');
      return;
    }
    setSaving(true);
    try {
      await academicMgmtApi.createTeacherAssignment({
        class_id: selectedClass,
        subject_id: assignSubject,
        teacher_id: assignTeacher || null,
      });
      toast.success('Subject assigned to class');
      setAssignSubject('');
      setAssignTeacher('');
      mappings.refetch();
    } catch (e: any) {
      toast.error(e.message || 'Failed to assign subject');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (m: any) => {
    if (!confirm('Remove this subject from the class?')) return;
    try {
      await academicMgmtApi.deleteTeacherAssignment(m.id);
      toast.success('Assignment removed');
      mappings.refetch();
    } catch (e: any) {
      toast.error(e.message || 'Failed to remove assignment');
    }
  };

  const classMappings = selectedClass
    ? (mappings.data || []).filter((m: any) => m.class_id === selectedClass)
    : (mappings.data || []);

  const unassignedSubjects = (subjects.data || []).filter(
    (s: any) => !classMappings.some((m: any) => m.subject_id === s.id)
  );

  const subList = subjects.data || [];
  const assignedCount = new Set((mappings.data || []).map((m: any) => m.subject_id)).size;
  const coverageScore = subList.length ? Math.round((assignedCount / subList.length) * 100) : 0;

  return (
    <div className="p-6 space-y-5">
      <ModuleHeader
        icon={BookOpen}
        gradient="bg-gradient-to-br from-[#F59E0B] to-[#EF4444]"
        title="Subject Management"
        subtitle="Create subjects and assign them to classes"
        onRefresh={refetchAll}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Subject creation */}
        <div className="space-y-4">
          <div className="border border-gray-100 rounded-xl p-4">
            <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-2">
              <BookOpen size={14} className="text-[#6D4CFF]" />
              Create Subject
            </h3>
            <div className="space-y-2">
              <input
                value={newSubjectName}
                onChange={e => setNewSubjectName(e.target.value)}
                placeholder="Subject name (e.g. Mathematics)"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20"
              />
              <input
                value={newSubjectCode}
                onChange={e => setNewSubjectCode(e.target.value)}
                placeholder="Code (e.g. MATH)"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20"
              />
              <button
                onClick={handleCreateSubject}
                disabled={saving}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5A3EF0] disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Add Subject
              </button>
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl p-4">
            <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-2">
              <BookMarked size={14} className="text-[#6D4CFF]" />
              Subject Library
            </h3>
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search subjects..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20"
              />
            </div>
            <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
              {subjects.loading ? (
                <p className="text-xs text-gray-400 text-center py-6">Loading subjects...</p>
              ) : !filter(subjects.data || []).length ? (
                <p className="text-xs text-gray-400 text-center py-6">No subjects yet. Create one above.</p>
              ) : (
                filter(subjects.data || []).map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-gray-700 truncate">{s.name}</div>
                      {s.code && <div className="text-[10px] text-gray-400 uppercase">{s.code}</div>}
                    </div>
                    <Badge className="bg-[#6D4CFF]/10 text-[#6D4CFF] border border-[#6D4CFF]/20 text-[9px]">
                      {(mappings.data || []).filter((m: any) => m.subject_id === s.id).length} class(es)
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Middle: Assign form */}
        <div className="border border-gray-100 rounded-xl p-4">
          <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-2">
            <GraduationCap size={14} className="text-[#6D4CFF]" />
            Assign Subject to Class
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Class</label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20"
              >
                <option value="">Select a class...</option>
                {(classes.data || []).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Subject</label>
              <select
                value={assignSubject}
                onChange={e => setAssignSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20"
              >
                <option value="">Select a subject...</option>
                {unassignedSubjects.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}{s.code ? ` (${s.code})` : ''}</option>
                ))}
              </select>
              {unassignedSubjects.length === 0 && (subjects.data || []).length > 0 && (
                <p className="text-[10px] text-amber-600 mt-1">All subjects are already assigned to this class.</p>
              )}
            </div>

            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Teacher (optional)</label>
              <select
                value={assignTeacher}
                onChange={e => setAssignTeacher(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20"
              >
                <option value="">No teacher assigned...</option>
                {(teachers.data || []).map((t: any) => (
                  <option key={t.teacher_id || t.id} value={t.teacher_id || t.id}>{t.full_name || t.name || 'Unnamed'}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAssign}
              disabled={saving}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5A3EF0] disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
              Assign Subject
            </button>
          </div>
        </div>

        {/* Right: Current mappings */}
        <div className="border border-gray-100 rounded-xl p-4">
          <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-2">
            <BookMarked size={14} className="text-[#6D4CFF]" />
            Class-Subject Mappings {selectedClass ? '· Selected Class' : '(All Classes)'}
          </h3>
          <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
            {mappings.loading ? (
              <p className="text-xs text-gray-400 text-center py-8">Loading mappings...</p>
            ) : !classMappings.length ? (
              <p className="text-xs text-gray-400 text-center py-8">
                {selectedClass ? 'No subjects assigned to this class yet.' : 'No subject-class mappings yet.'}
              </p>
            ) : (
              classMappings.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-700 truncate">{m.subject?.name || 'Unknown subject'}</div>
                    <div className="text-[10px] text-gray-400 truncate">
                      {m.class?.name || 'Unknown class'}
                      {m.teacher?.full_name ? ` · ${m.teacher.full_name}` : ' · No teacher'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(m)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 flex-shrink-0"
                    title="Remove assignment"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
