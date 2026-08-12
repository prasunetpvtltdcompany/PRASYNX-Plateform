'use client';

import { useState, useEffect } from 'react';
import { useApi, EmptyState } from './useApi';
import { academicMgmtApi, teacherWorkforceApi } from './dataService';
import {
  CalendarDays, Layers, BookOpen, UserCheck, Users, GraduationCap, School,
  Plus, Edit3, Trash2, X, Check, Search, RefreshCw, ArrowUpDown
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const CLR = { primary: '#6D4CFF', success: '#10B981', danger: '#EF4444', warning: '#F59E0B' };

const MODES = [
  { key: 'academic-years', label: 'Academic Years', icon: CalendarDays },
  { key: 'sections', label: 'Sections', icon: Layers },
  { key: 'class-subjects', label: 'Class Subjects', icon: BookOpen },
  { key: 'teacher-assignments', label: 'Teacher Assignments', icon: UserCheck },
  { key: 'class-teachers', label: 'Class Teachers', icon: School },
  { key: 'enrollments', label: 'Enrollments', icon: Users },
];

function DataTable({ columns, data, loading, onAction }: any) {
  if (loading) return <div className="text-center py-8 text-gray-400 text-xs">Loading...</div>;
  if (!data?.length) return <div className="text-center py-8 text-gray-400 text-xs">No records found</div>;
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {columns.map((col: any) => (
              <th key={col.key} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row: any, i: number) => (
            <tr key={row.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              {columns.map((col: any) => (
                <td key={col.key} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CrudModal({ open, onClose, title, fields, values, onChange, onSubmit, loading }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>
        <div className="space-y-4">
          {fields.map((field: any) => (
            <div key={field.key}>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  value={values[field.key] || ''}
                  onChange={e => onChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF]"
                >
                  <option value="">Select...</option>
                  {(field.options || []).map((o: any) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!values[field.key]} onChange={e => onChange(field.key, e.target.checked)} className="rounded border-gray-300" />
                  <span className="text-xs text-gray-600">{field.label}</span>
                </label>
              ) : (
                <input
                  type={field.type || 'text'}
                  value={values[field.key] || ''}
                  onChange={e => onChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF]"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={onSubmit} disabled={loading} className="flex-1 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#6D4CFF] hover:bg-[#5B3FDD] disabled:opacity-50">
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AcademicManagementTab() {
  const [mode, setMode] = useState('academic-years');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; title: string; fields: any[]; values: any; onSubmit: (vals: any) => void } | null>(null);

  const years = useApi(() => academicMgmtApi.getAcademicYears(), []);
  const sections = useApi(() => academicMgmtApi.getSections(), []);
  const classSubjects = useApi(() => academicMgmtApi.getClassSubjects(), []);
  const teacherAssignments = useApi(() => academicMgmtApi.getTeacherAssignments(), []);
  const classTeachers = useApi(() => academicMgmtApi.getClassTeachers(), []);
  const enrollments = useApi(() => academicMgmtApi.getEnrollments(), []);

  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [teacherAssignmentsList, setTeacherAssignmentsList] = useState<any[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  const fetchTeacherAssignments = () => {
    if (!selectedTeacherId) {
      setTeacherAssignmentsList([]);
      return;
    }
    setLoadingAssignments(true);
    teacherWorkforceApi.getAssignments(selectedTeacherId)
      .then(res => {
        if (res && res.success && Array.isArray(res.data)) setTeacherAssignmentsList(res.data);
      })
      .catch(() => {})
      .finally(() => setLoadingAssignments(false));
  };

  useEffect(() => {
    fetchTeacherAssignments();
  }, [selectedTeacherId]);

  // Sub-fetch for section/class/teacher/subject options
  const classes = useApi<any[]>(() => import('./dataService').then(m => m.classApi.getAll()).catch(() => ({ success: false, data: [] })), []);
  const subjects = useApi<any[]>(() => import('./dataService').then(m => m.subjectApi.getAll()).catch(() => ({ success: false, data: [] })), []);
  const teachers = useApi<any[]>(() => import('./dataService').then(m => m.staffApi.getAll()).catch(() => ({ success: false, data: [] })), []);
  const students = useApi<any[]>(() => import('./dataService').then(m => m.studentApi.getAll()).catch(() => ({ success: false, data: [] })), []);

  const filter = (arr: any[]) => {
    if (!search) return arr;
    const q = search.toLowerCase();
    return arr.filter((r: any) => JSON.stringify(r).toLowerCase().includes(q));
  };

  const closeModal = () => setModal(null);

  const openCreateModal = (title: string, fields: any[], defaults: any, onSave: (vals: any) => Promise<void>) => {
    const vals = { ...defaults };
    setModal({
      open: true, title, fields,
      values: vals,
      onSubmit: async (updated: any) => {
        await onSave(updated);
        closeModal();
      }
    });
  };

  const handleFieldChange = (key: string, value: any) => {
    if (!modal) return;
    setModal({ ...modal, values: { ...modal.values, [key]: value } });
  };

  const handleModalSubmit = async () => {
    if (!modal) return;
    await modal.onSubmit(modal.values);
  };

  const renderContent = () => {
    switch (mode) {
      case 'academic-years': return renderAcademicYears();
      case 'sections': return renderSections();
      case 'class-subjects': return renderClassSubjects();
      case 'teacher-assignments': return renderTeacherAssignments();
      case 'class-teachers': return renderClassTeachers();
      case 'enrollments': return renderEnrollments();
      default: return null;
    }
  };

  const navBar = (
    <div className="flex gap-1 mb-6 p-1 bg-gray-50 rounded-xl w-fit overflow-x-auto">
      {MODES.map(n => (
        <button key={n.key} onClick={() => setMode(n.key)}
          className={`px-4 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${mode === n.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
          <n.icon size={12} className="inline mr-1.5" /> {n.label}
        </button>
      ))}
    </div>
  );

  // ── Academic Years ──────────────────────────────────────
  const renderAcademicYears = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
        </div>
        <button onClick={() => openCreateModal('Create Academic Year', [
          { key: 'name', label: 'Name', placeholder: 'e.g. 2026-2027' },
          { key: 'start_date', label: 'Start Date', type: 'date' },
          { key: 'end_date', label: 'End Date', type: 'date' },
        ], {}, async (vals) => {
          await academicMgmtApi.createAcademicYear(vals);
          toast.success('Academic year created');
          years.refetch();
        })} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD]">
          <Plus size={14} /> Add Year
        </button>
      </div>
      <DataTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'start_date', label: 'Start', render: (r: any) => r.start_date?.split('T')[0] },
          { key: 'end_date', label: 'End', render: (r: any) => r.end_date?.split('T')[0] },
          { key: 'is_current', label: 'Status', render: (r: any) => r.is_current ? <Badge className="bg-green-100 text-green-700">Active</Badge> : <Badge className="bg-gray-100 text-gray-500">Inactive</Badge> },
          { key: 'status', label: 'State', render: (r: any) => <Badge className={r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>{r.status}</Badge> },
          { key: 'actions', label: '', render: (r: any) => (
            <div className="flex gap-1">
              {!r.is_current && <button onClick={async () => { await academicMgmtApi.setActiveAcademicYear(r.id); years.refetch(); toast.success('Active year updated'); }} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Set Active"><Check size={14} /></button>}
              <button onClick={() => openCreateModal('Edit Academic Year', [
                { key: 'name', label: 'Name' },
                { key: 'start_date', label: 'Start Date', type: 'date' },
                { key: 'end_date', label: 'End Date', type: 'date' },
              ], { name: r.name, start_date: r.start_date?.split('T')[0], end_date: r.end_date?.split('T')[0] }, async (vals) => {
                await academicMgmtApi.updateAcademicYear(r.id, vals);
                toast.success('Updated');
                years.refetch();
              })} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="Edit"><Edit3 size={14} /></button>
              <button onClick={async () => { if (confirm('Delete?')) { await academicMgmtApi.deleteAcademicYear(r.id); years.refetch(); toast.success('Deleted'); } }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Delete"><Trash2 size={14} /></button>
            </div>
          )},
        ]}
        data={filter(years.data || [])}
        loading={years.loading}
      />
    </>
  );

  // ── Sections ────────────────────────────────────────────
  const renderSections = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
        </div>
        <button onClick={() => openCreateModal('Create Section', [
          { key: 'class_id', label: 'Class', type: 'select', options: (classes.data || []).map((c: any) => ({ value: c.id, label: c.name })) },
          { key: 'name', label: 'Section Name', placeholder: 'e.g. A, B, C' },
          { key: 'capacity', label: 'Capacity', type: 'number', placeholder: '40' },
        ], {}, async (vals) => {
          await academicMgmtApi.createSection(vals);
          toast.success('Section created');
          sections.refetch();
        })} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD]">
          <Plus size={14} /> Add Section
        </button>
      </div>
      <DataTable
        columns={[
          { key: 'name', label: 'Section' },
          { key: 'class', label: 'Class', render: (r: any) => r.class?.name || '-' },
          { key: 'capacity', label: 'Capacity' },
          { key: 'room_number', label: 'Room' },
          { key: 'actions', label: '', render: (r: any) => (
            <div className="flex gap-1">
              <button onClick={() => openCreateModal('Edit Section', [
                { key: 'name', label: 'Name' },
                { key: 'capacity', label: 'Capacity', type: 'number' },
                { key: 'room_number', label: 'Room Number' },
              ], { name: r.name, capacity: r.capacity, room_number: r.room_number }, async (vals) => {
                await academicMgmtApi.updateSection(r.id, vals);
                toast.success('Updated');
                sections.refetch();
              })} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Edit3 size={14} /></button>
              <button onClick={async () => { if (confirm('Delete?')) { await academicMgmtApi.deleteSection(r.id); sections.refetch(); toast.success('Deleted'); } }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
            </div>
          )},
        ]}
        data={filter(sections.data || [])}
        loading={sections.loading}
      />
    </>
  );

  // ── Class-Subject ───────────────────────────────────────
  const renderClassSubjects = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
        </div>
        <button onClick={() => openCreateModal('Assign Subject to Class', [
          { key: 'class_id', label: 'Class', type: 'select', options: (classes.data || []).map((c: any) => ({ value: c.id, label: c.name })) },
          { key: 'subject_id', label: 'Subject', type: 'select', options: (subjects.data || []).map((s: any) => ({ value: s.id, label: s.name })) },
          { key: 'is_mandatory', label: 'Mandatory', type: 'checkbox' },
          { key: 'max_students', label: 'Max Students', type: 'number', placeholder: 'Optional' },
        ], { is_mandatory: true }, async (vals) => {
          await academicMgmtApi.createClassSubject(vals);
          toast.success('Subject assigned to class');
          classSubjects.refetch();
        })} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD]">
          <Plus size={14} /> Assign Subject
        </button>
      </div>
      <DataTable
        columns={[
          { key: 'class', label: 'Class', render: (r: any) => r.class?.name || '-' },
          { key: 'subject', label: 'Subject', render: (r: any) => r.subject?.name || '-' },
          { key: 'is_mandatory', label: 'Mandatory', render: (r: any) => r.is_mandatory ? <Badge className="bg-green-100 text-green-700">Yes</Badge> : <Badge className="bg-gray-100 text-gray-500">No</Badge> },
          { key: 'max_students', label: 'Max' },
          { key: 'actions', label: '', render: (r: any) => (
            <div className="flex gap-1">
              <button onClick={() => openCreateModal('Edit Class Subject', [
                { key: 'is_mandatory', label: 'Mandatory', type: 'checkbox' },
                { key: 'max_students', label: 'Max Students', type: 'number' },
              ], { is_mandatory: r.is_mandatory, max_students: r.max_students }, async (vals) => {
                await academicMgmtApi.updateClassSubject(r.id, vals);
                toast.success('Updated');
                classSubjects.refetch();
              })} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Edit3 size={14} /></button>
              <button onClick={async () => { if (confirm('Delete?')) { await academicMgmtApi.deleteClassSubject(r.id); classSubjects.refetch(); toast.success('Deleted'); } }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
            </div>
          )},
        ]}
        data={filter(classSubjects.data || [])}
        loading={classSubjects.loading}
      />
    </>
  );

  // ── Teacher Assignments ─────────────────────────────────
  const renderTeacherAssignments = () => {
    const activeTeacher = teachers.data?.find((t: any) => t.id === selectedTeacherId);

    const handleAssignWork = () => {
      openCreateModal('Create New Teacher Assignment', [
        {
          key: 'assignment_type',
          label: 'Assignment Type',
          type: 'select',
          options: [
            { value: 'ACADEMIC', label: 'Academic Assignment' },
            { value: 'CLASS_TEACHER', label: 'Class Teacher Assignment' },
            { value: 'EXAM', label: 'Examination Assignment' },
            { value: 'CLUB', label: 'Club Assignment' },
            { value: 'EVENT', label: 'Event Assignment' },
            { value: 'HOUSE', label: 'House Assignment' },
            { value: 'MENTORSHIP', label: 'Student Mentorship' },
            { value: 'COMMITTEE', label: 'Committee Assignment' }
          ]
        },
        { key: 'assignment_name', label: 'Assignment Name / Title', placeholder: 'e.g. Grade 5A - Mathematics, Science Club, etc.' },
        { key: 'target_id', label: 'Target ID / Reference Code (optional)', placeholder: 'e.g. club_id, class_id' }
      ], {}, async (vals) => {
        if (!vals.assignment_type || !vals.assignment_name) {
          toast.error('Required fields missing.');
          return;
        }
        const res = await teacherWorkforceApi.createAssignment({
          teacher_id: selectedTeacherId,
          assignment_type: vals.assignment_type,
          assignment_name: vals.assignment_name,
          target_id: vals.target_id || null
        });
        if (res.success || (res as any).id) {
          toast.success('Work Assigned successfully!');
          fetchTeacherAssignments();
        } else {
          toast.error(res.error || 'Failed to assign work');
        }
      });
    };

    const handleDeleteAssignment = async (id: string) => {
      if (!confirm('Are you sure you want to delete this assignment?')) return;
      const res = await teacherWorkforceApi.deleteAssignment(id);
      if (res.success) {
        toast.success('Assignment deleted successfully');
        fetchTeacherAssignments();
      } else {
        toast.error(res.error || 'Failed to delete assignment');
      }
    };

    return (
      <div className="space-y-6">
        <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Select Teacher:</span>
            <select
              value={selectedTeacherId}
              onChange={e => setSelectedTeacherId(e.target.value)}
              className="w-full md:w-64 px-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20"
            >
              <option value="">Choose Teacher...</option>
              {(teachers.data || []).map((t: any) => (
                <option key={t.id} value={t.id}>{t.full_name} ({t.staff_unique_id})</option>
              ))}
            </select>
          </div>

          {selectedTeacherId && (
            <button onClick={handleAssignWork} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD]">
              <Plus size={14} /> Assign New Duty
            </button>
          )}
        </div>

        {selectedTeacherId ? (
          <div className="space-y-6">
            {/* Teacher Details & Mini Statistics */}
            <div className="p-6 bg-white border border-gray-100 rounded-2xl flex flex-col md:flex-row justify-between gap-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{activeTeacher?.full_name}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Code: {activeTeacher?.staff_unique_id} &bull; Dept: {activeTeacher?.department || 'Academics'} &bull; Subject: {activeTeacher?.subject || 'N/A'}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-xl min-w-[100px]">
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">Total Duties</span>
                  <span className="text-base font-bold text-gray-800">{teacherAssignmentsList.length}</span>
                </div>
              </div>
            </div>

            {/* Assignments List */}
            <DataTable
              columns={[
                { key: 'assignment_type', label: 'Type', render: (r: any) => <Badge className="bg-indigo-50 text-indigo-700">{r.assignment_type}</Badge> },
                { key: 'assignment_name', label: 'Duty Name / Description' },
                { key: 'target_id', label: 'Reference ID', render: (r: any) => r.target_id || '-' },
                { key: 'created_at', label: 'Assigned Date', render: (r: any) => r.created_at?.split('T')[0] },
                { key: 'actions', label: '', render: (r: any) => (
                  <button onClick={() => handleDeleteAssignment(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Delete Duty">
                    <Trash2 size={14} />
                  </button>
                )}
              ]}
              data={teacherAssignmentsList}
              loading={loadingAssignments}
            />
          </div>
        ) : (
          <EmptyState message="Please select a teacher from the dropdown to manage and view assignments." />
        )}
      </div>
    );
  };

  // ── Class Teachers ──────────────────────────────────────
  const renderClassTeachers = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
        </div>
        <button onClick={() => openCreateModal('Assign Class Teacher', [
          { key: 'class_id', label: 'Class', type: 'select', options: (classes.data || []).map((c: any) => ({ value: c.id, label: c.name })) },
          { key: 'teacher_id', label: 'Teacher', type: 'select', options: (teachers.data || []).map((t: any) => ({ value: t.id, label: t.full_name })) },
        ], {}, async (vals) => {
          await academicMgmtApi.assignClassTeacher(vals);
          toast.success('Class teacher assigned');
          classTeachers.refetch();
        })} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD]">
          <Plus size={14} /> Assign Class Teacher
        </button>
      </div>
      <DataTable
        columns={[
          { key: 'class', label: 'Class', render: (r: any) => r.class?.name || '-' },
          { key: 'teacher', label: 'Teacher', render: (r: any) => r.teacher?.full_name || '-' },
          { key: 'staff_unique_id', label: 'Code', render: (r: any) => r.teacher?.staff_unique_id || '-' },
          { key: 'actions', label: '', render: (r: any) => (
            <div className="flex gap-1">
              <button onClick={async () => { if (confirm('Remove class teacher?')) { await academicMgmtApi.removeClassTeacher(r.class_id); classTeachers.refetch(); toast.success('Removed'); } }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
            </div>
          )},
        ]}
        data={filter(classTeachers.data || [])}
        loading={classTeachers.loading}
      />
    </>
  );

  // ── Enrollments ─────────────────────────────────────────
  const renderEnrollments = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
        </div>
        <button onClick={() => openCreateModal('Enroll Student', [
          { key: 'class_id', label: 'Class', type: 'select', options: (classes.data || []).map((c: any) => ({ value: c.id, label: c.name })) },
          { key: 'student_id', label: 'Student', type: 'select', options: (students.data || []).map((s: any) => ({ value: s.id, label: s.full_name })) },
        ], {}, async (vals) => {
          await academicMgmtApi.enrollStudent(vals);
          toast.success('Student enrolled');
          enrollments.refetch();
        })} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD]">
          <Plus size={14} /> Enroll Student
        </button>
      </div>
      <DataTable
        columns={[
          { key: 'class', label: 'Class', render: (r: any) => r.class?.name || '-' },
          { key: 'student', label: 'Student', render: (r: any) => r.student?.full_name || '-' },
          { key: 'roll_number', label: 'Roll No', render: (r: any) => r.student?.roll_number || '-' },
          { key: 'actions', label: '', render: (r: any) => (
            <div className="flex gap-1">
              <button onClick={async () => { if (confirm('Remove student from class?')) { await academicMgmtApi.removeEnrollment(r.class_id, r.student_id); enrollments.refetch(); toast.success('Removed'); } }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
            </div>
          )},
        ]}
        data={filter(enrollments.data || [])}
        loading={enrollments.loading}
      />
    </>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Academic Management</h2>
          <p className="text-xs text-gray-500">Manage academic years, sections, subjects, teacher assignments, and student enrollments</p>
        </div>
        <button onClick={() => { years.refetch(); sections.refetch(); classSubjects.refetch(); teacherAssignments.refetch(); classTeachers.refetch(); enrollments.refetch(); }} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400" title="Refresh All">
          <RefreshCw size={16} />
        </button>
      </div>
      {navBar}
      {renderContent()}
      <CrudModal
        open={!!modal}
        onClose={closeModal}
        title={modal?.title || ''}
        fields={modal?.fields || []}
        values={modal?.values || {}}
        onChange={handleFieldChange}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
