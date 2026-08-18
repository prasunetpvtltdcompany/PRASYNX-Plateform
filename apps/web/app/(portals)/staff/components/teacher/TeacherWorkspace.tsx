'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  School, BookOpen, Users, ClipboardList, FileText, ShieldCheck, Mail, MessageSquare, Sparkles, Check, X,
  Plus, CalendarDays, Loader2, ArrowRight, ArrowUpRight, Award, Trash2, Edit3, Send, CheckCircle2, AlertCircle,
  GraduationCap, BarChart3, UserCircle, Bell, FolderOpen, DollarSign, Calendar, UserCheck, Clock, Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import { teacherApi } from '../../lib/dataService';

// Dashboard View
export function TeacherDashboardView({
  teacherStats,
  teacherClasses,
  teacherSubjects,
  teacherStudents,
  localTasks,
  todaySchedule,
  timetable,
  teacherAttendanceHook,
  session,
  setActiveTab,
  setStudentSubTab,
  setParentSubTab,
  setShowAiSuiteModal,
  setShowCreateHomeworkModal,
  setShowCreateExamModal,
  setShowCreatePtmModal,
  setShowParentCommModal,
  generateQR
}: any) {
  const stats = teacherStats || {};
  const user = session?.user || {};
  const teacher = session?.teacher || {};
  const attendance = teacherAttendanceHook?.data;
  const allTimetable = timetable || [];

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay();
  const todayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today];

  const [leaveModal, setLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ type: 'SICK', start_date: '', end_date: '', reason: '' });

  const handleApplyLeave = () => {
    if (!leaveForm.start_date || !leaveForm.end_date || !leaveForm.reason) {
      toast.error('Please fill all leave fields');
      return;
    }
    toast.success('Leave request submitted for approval');
    setLeaveModal(false);
    setLeaveForm({ type: 'SICK', start_date: '', end_date: '', reason: '' });
  };

  return (
    <div className="space-y-5">
      {/* Teacher Info Header */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-150/80 shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            {(user.full_name || 'T')[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">{user.full_name || 'Teacher'}</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[11px] text-gray-500 font-medium">{teacher.subject || 'Staff'}</span>
              <span className="text-[9px] text-gray-300">|</span>
              <span className="text-[11px] text-gray-500 font-medium">ID: {teacher.id_number || user.id?.slice(0, 8) || '—'}</span>
              <span className="text-[9px] text-gray-300">|</span>
              <span className="text-[11px] text-emerald-600 font-semibold">{user.role || 'Teacher'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[9px] text-gray-400 font-semibold uppercase">Today</div>
            <div className="text-xs font-bold text-gray-800">{todaySchedule.length} classes</div>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-right">
            <div className="text-[9px] text-gray-400 font-semibold uppercase">Attendance</div>
            <div className="text-xs font-bold text-emerald-600">{stats.attendanceCompletion || 0}%</div>
          </div>
        </div>
      </div>

      {/* Salary & Leave Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-white border border-gray-150/80 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-emerald-500" />
            <h3 className="text-xs font-semibold text-gray-700">Salary Overview</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-emerald-50">
              <div className="text-[9px] text-emerald-600 font-semibold uppercase">Net Salary</div>
              <div className="text-lg font-bold text-gray-900 mt-0.5">₹{stats.salary?.net || '42,500'}</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <div className="text-[9px] text-blue-600 font-semibold uppercase">Allowances</div>
              <div className="text-lg font-bold text-gray-900 mt-0.5">₹{stats.salary?.allowances || '12,000'}</div>
            </div>
            <div className="p-3 rounded-lg bg-amber-50">
              <div className="text-[9px] text-amber-600 font-semibold uppercase">Deductions</div>
              <div className="text-lg font-bold text-gray-900 mt-0.5">₹{stats.salary?.deductions || '5,200'}</div>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <div className="text-[9px] text-purple-600 font-semibold uppercase">Next Pay</div>
              <div className="text-lg font-bold text-gray-900 mt-0.5">01 Jul 2026</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-gray-150/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-amber-500" />
              <h3 className="text-xs font-semibold text-gray-700">Leave Management</h3>
            </div>
            <button onClick={() => setLeaveModal(true)} className="text-[10px] bg-amber-500 hover:bg-amber-600 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
              <Plus size={12} /> Apply Leave
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-lg bg-green-50 text-center">
              <div className="text-lg font-bold text-green-700">12</div>
              <div className="text-[8px] text-green-600 font-semibold uppercase">Sick Leave</div>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-50 text-center">
              <div className="text-lg font-bold text-blue-700">18</div>
              <div className="text-[8px] text-blue-600 font-semibold uppercase">Casual Leave</div>
            </div>
            <div className="p-2.5 rounded-lg bg-purple-50 text-center">
              <div className="text-lg font-bold text-purple-700">5</div>
              <div className="text-[8px] text-purple-600 font-semibold uppercase">Earned Leave</div>
            </div>
          </div>
          {(localTasks || []).filter((t: any) => t.type === 'leave' || t.title?.toLowerCase().includes('leave')).slice(0, 3).map((lv: any, i: number) => (
            <div key={lv.id || i} className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
              <div>
                <div className="text-[10px] font-semibold text-gray-700">{lv.title || 'Leave Request'}</div>
                <div className="text-[9px] text-gray-400">{lv.created_at ? new Date(lv.created_at).toLocaleDateString() : ''}</div>
              </div>
              <Badge className={`text-[9px] font-medium ${lv.status === 'approved' ? 'bg-green-50 text-green-700' : lv.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                {lv.status || 'Pending'}
              </Badge>
            </div>
          ))}
        </Card>
      </div>

      {/* Full Weekly Timetable */}
      <Card className="bg-white border border-gray-150/85 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <CalendarDays size={14} className="text-indigo-600" />
          <h3 className="text-xs font-semibold text-gray-700">My Class Timetable — Full Week</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-gray-500 uppercase w-20">Time</th>
                {dayNames.map(d => (
                  <th key={d} className={`text-left py-2.5 px-3 text-[10px] font-semibold uppercase ${days[new Date().getDay() - 1] === d.toLowerCase() ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const times = [...new Set(allTimetable.map((t: any) => t.start_time))].sort();
                return times.length > 0 ? times.map((time: any, ti: number) => (
                  <tr key={ti} className={ti % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}>
                    <td className="py-2 px-3 text-[10px] font-semibold text-indigo-600 border-r border-gray-100">{time}</td>
                    {days.map(day => {
                      const slot = allTimetable.find((t: any) => t.day_of_week === day && t.start_time === time);
                      return (
                        <td key={day} className="py-2 px-3 border-r border-gray-50">
                          {slot ? (
                            <div>
                              <div className="text-[10px] font-semibold text-gray-800">{slot.subject?.name || slot.subject}</div>
                              <div className="text-[8px] text-gray-400">{slot.class?.class_name || slot.class_name} {slot.class?.section || ''} · {slot.room || '—'}</div>
                            </div>
                          ) : (
                            <span className="text-[9px] text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-xs">No timetable data available.</td></tr>
                );
              })()}
            </tbody>
          </table>
        </div>
      </Card>

      {/* My Attendance Log */}
      <Card className="bg-white border border-gray-150/85 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <UserCheck size={14} className="text-rose-600" />
          <h3 className="text-xs font-semibold text-gray-700">My Attendance Log</h3>
        </div>
        <div className="p-4">
          {attendance && Array.isArray(attendance) ? (
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-14 gap-1.5">
              {attendance.slice(0, 28).map((a: any, i: number) => (
                <div key={a.id || i} className={`p-2 rounded-lg text-center ${a.status === 'PRESENT' ? 'bg-emerald-50' : a.status === 'ABSENT' ? 'bg-red-50' : a.status === 'LATE' ? 'bg-amber-50' : 'bg-gray-50'}`}>
                  <div className="text-[9px] font-bold text-gray-700">{a.date ? new Date(a.date).getDate() : i + 1}</div>
                  <div className={`text-[7px] font-semibold uppercase ${a.status === 'PRESENT' ? 'text-emerald-600' : a.status === 'ABSENT' ? 'text-red-600' : a.status === 'LATE' ? 'text-amber-600' : 'text-gray-400'}`}>
                    {a.status || '—'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 text-xs font-semibold">
              No attendance records yet. Your attendance log will appear here once marked.
            </div>
          )}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-emerald-50 border border-emerald-200" /><span className="text-[9px] text-gray-500">Present</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-amber-50 border border-amber-200" /><span className="text-[9px] text-gray-500">Late</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-red-50 border border-red-200" /><span className="text-[9px] text-gray-500">Absent</span></div>
            <div className="ml-auto text-[10px] font-semibold text-gray-500">This Month: {stats.attendanceCompletion || 0}%</div>
          </div>
        </div>
      </Card>

      {/* Leave Application Modal */}
      {leaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setLeaveModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-900">Apply for Leave</h3>
              <button onClick={() => setLeaveModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase mb-1 block">Leave Type</label>
                <select value={leaveForm.type} onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option value="SICK">Sick Leave</option>
                  <option value="CASUAL">Casual Leave</option>
                  <option value="EARNED">Earned Leave</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase mb-1 block">Start Date</label>
                  <input type="date" value={leaveForm.start_date} onChange={e => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase mb-1 block">End Date</label>
                  <input type="date" value={leaveForm.end_date} onChange={e => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase mb-1 block">Reason</label>
                <textarea value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })} rows={3} placeholder="Enter reason for leave..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none" />
              </div>
              <button onClick={handleApplyLeave} className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors">
                Submit Leave Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// My Classes View
export function MyClassesView({ teacherClasses, teacherStudents }: any) {
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const clsList = teacherClasses || [];
  const studentList = teacherStudents || [];

  const getStudentsForClass = (clsName: string) => {
    return studentList.filter((s: any) => s.class_name === clsName);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1>My Assigned Classes</h1>
        <p>Manage and view roster details of classes currently assigned to you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {clsList.map((cls: any, i: number) => {
          const classStudents = getStudentsForClass(cls.class_name);
          return (
            <Card key={cls.id || i} className="p-5 bg-white border border-gray-150/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <Badge className="bg-indigo-50 text-indigo-700 font-bold border-none text-[10px]">
                    Grade {cls.class_name}
                  </Badge>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">Room: {cls.room_name || 'B-103'}</span>
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-1">{cls.subject_name || 'Subject Taught'}</h3>
                <p className="text-xs text-gray-400 font-semibold">Taught: Monday - Friday</p>
                <div className="mt-4 flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-gray-550 font-bold">Students Enrolled</span>
                  <span className="text-sm font-bold text-gray-800">{cls.student_count || classStudents.length || 0}</span>
                </div>
              </div>
              <Button size="sm" onClick={() => setSelectedClass(cls)} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-650 text-white text-xs font-bold rounded-xl">
                View Student Roster
              </Button>
            </Card>
          );
        })}
        {clsList.length === 0 && (
          <div className="col-span-3 py-10 text-center text-gray-400 font-semibold text-xs italic bg-white border border-dashed rounded-2xl">
            No active class assignments found.
          </div>
        )}
      </div>

      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setSelectedClass(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Student Roster: Grade {selectedClass.class_name}</h3>
                <p className="text-xs text-gray-400 font-semibold">{selectedClass.subject_name} &bull; Room {selectedClass.room_name || 'B-103'}</p>
              </div>
              <button onClick={() => setSelectedClass(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="overflow-y-auto flex-1 py-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-gray-450 uppercase font-bold text-left">
                    <th className="py-2.5">Roll No</th>
                    <th className="py-2.5">Name</th>
                    <th className="py-2.5">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {getStudentsForClass(selectedClass.class_name).map((std: any, idx: number) => (
                    <tr key={std.id || idx} className="border-b hover:bg-gray-50/50">
                      <td className="py-2.5 font-bold text-gray-500">{std.roll_number || idx + 1}</td>
                      <td className="py-2.5 font-semibold text-gray-800">{std.full_name || std.name}</td>
                      <td className="py-2.5 text-gray-400">{std.email || '—'}</td>
                    </tr>
                  ))}
                  {getStudentsForClass(selectedClass.class_name).length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-gray-400 font-semibold italic">No students registered in this class.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// My Subjects View
export function MySubjectsView({ teacherSubjects }: any) {
  const subList = teacherSubjects || [];
  const [syllabusProgress, setSyllabusProgress] = useState<Record<string, number>>({});

  const updateProgress = (id: string, progress: number) => {
    setSyllabusProgress(prev => ({ ...prev, [id]: progress }));
    toast.success(`Syllabus progress updated to ${progress}%`);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1>My Subjects & Curriculum</h1>
        <p>Track curriculum syllabus progress, topics taught, and academic benchmarks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {subList.map((sub: any, i: number) => {
          const currentProgress = syllabusProgress[sub.id] ?? sub.syllabus_progress ?? 60;
          return (
            <Card key={sub.id || i} className="p-5 bg-white border border-gray-150/80 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <Badge className="bg-purple-50 text-purple-750 font-bold border-none text-[10px]">{sub.subject_code || sub.code || 'SUB-01'}</Badge>
              </div>
              <h3 className="text-base font-bold text-gray-850">{sub.subject_name || sub.name}</h3>
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-bold text-gray-550">
                  <span>Syllabus Completed</span>
                  <span>{currentProgress}%</span>
                </div>
                <Progress value={currentProgress} className="h-1.5 bg-gray-100" />
              </div>
              <div className="pt-2 flex items-center justify-between border-t gap-2">
                <span className="text-[10px] text-gray-400 font-semibold">Change Progress:</span>
                <div className="flex gap-1">
                  {[40, 60, 80, 100].map(val => (
                    <button key={val} onClick={() => updateProgress(sub.id, val)} className={`px-2 py-1 rounded text-[10px] font-bold border ${currentProgress === val ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
        {subList.length === 0 && (
          <div className="col-span-3 py-10 text-center text-gray-400 font-semibold text-xs italic bg-white border border-dashed rounded-2xl">
            No active subject curriculum mappings found.
          </div>
        )}
      </div>
    </div>
  );
}

// My Students View
export function MyStudentsView({ teacherStudents }: any) {
  const studentList = teacherStudents || [];
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  const filtered = studentList.filter((s: any) => {
    const matchesSearch = s.full_name?.toLowerCase().includes(search.toLowerCase()) || s.roll_number?.toLowerCase().includes(search.toLowerCase());
    const matchesClass = classFilter === 'all' || s.class_name === classFilter;
    return matchesSearch && matchesClass;
  });

  const uniqueClasses = Array.from(new Set(studentList.map((s: any) => s.class_name)));

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1>My Students Directory</h1>
        <p>A central listing of students enrolled across all your academic classes.</p>
      </div>

      <div className="flex gap-4 items-center">
        <Input placeholder="Search students by name or roll number..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-md bg-white rounded-xl" />
        <Select value={classFilter} onValueChange={(val: any) => setClassFilter(val)}>
          <SelectTrigger className="w-48 bg-white rounded-xl"><SelectValue placeholder="Filter by class" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {uniqueClasses.map((clsName: any) => <SelectItem key={clsName} value={clsName}>Grade {clsName}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-white border border-gray-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-gray-450 uppercase font-bold text-left bg-gray-50/50">
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4 text-center">Avg Marks</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((std: any, idx: number) => (
                <tr key={std.id || idx} className="border-b hover:bg-gray-50/30">
                  <td className="py-3 px-4 font-bold text-gray-500">{std.roll_number || idx + 1}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{std.full_name || std.name}</td>
                  <td className="py-3 px-4 font-bold text-indigo-700">Grade {std.class_name || '10'}</td>
                  <td className="py-3 px-4 text-gray-450">{std.email || '—'}</td>
                  <td className="py-3 px-4 text-center font-bold text-purple-700">{std.average_marks || 0}%</td>
                  <td className="py-3 px-4 text-right">
                    <Button size="sm" variant="outline" className="text-xs h-7 border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-50" onClick={() => toast.info(`Direct Messaging to parents of ${std.full_name} is active in Messages tab.`)}>
                      Contact Parent
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400 font-semibold italic">No matching student records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}



// Homework View
export function HomeworkView({
  teacherClasses,
  teacherHomeworkHook,
  showCreateHomeworkModal,
  setShowCreateHomeworkModal,
  homeworkForm,
  setHomeworkForm,
  showViewSubmissionsModal,
  setShowViewSubmissionsModal,
  selectedHomeworkForSubmissions,
  setSelectedHomeworkForSubmissions,
  submissionsList,
  setSubmissionsList,
  showGradeSubmissionModal,
  setShowGradeSubmissionModal,
  selectedSubmission,
  setSelectedSubmission,
  gradeSubmissionForm,
  setGradeSubmissionForm
}: any) {
  const homeworkList = teacherHomeworkHook.data?.data || teacherHomeworkHook.data || [];

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeworkForm.title || !homeworkForm.class_name || !homeworkForm.subject_name || !homeworkForm.due_date) {
      toast.error('Fill in all required homework details.');
      return;
    }

    try {
      const res = await teacherApi.createHomework(homeworkForm);
      if (res.success || res.data) {
        toast.success('Homework assignment successfully created & published!');
        setShowCreateHomeworkModal(false);
        setHomeworkForm({ title: '', description: '', class_name: '', subject_name: '', due_date: '' });
        teacherHomeworkHook.refetch();
      } else {
        toast.error('Failed to create homework');
      }
    } catch {
      toast.error('Failed to create homework');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await teacherApi.deleteHomework(id);
      if (res.success) {
        toast.success('Homework successfully removed.');
        teacherHomeworkHook.refetch();
      }
    } catch {
      toast.error('Failed to delete homework');
    }
  };

  const handleViewSubmissions = async (hw: any) => {
    setSelectedHomeworkForSubmissions(hw);
    setShowViewSubmissionsModal(true);
    try {
      const res = await teacherApi.getSubmissions(hw.id);
      setSubmissionsList(res.success && res.data ? res.data?.data || res.data || [] : []);
    } catch {
      setSubmissionsList([]);
    }
  };

  const handleGradeSubmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await teacherApi.gradeSubmission({
        submission_id: selectedSubmission.id,
        grade: gradeSubmissionForm.grade,
        feedback: gradeSubmissionForm.feedback
      });

      if (res.success || res.data) {
        toast.success('Submission graded successfully!');
        setShowGradeSubmissionModal(false);
        // Refresh submissions
        const submissionsRes = await teacherApi.getSubmissions(selectedHomeworkForSubmissions.id);
        setSubmissionsList(submissionsRes.success && submissionsRes.data ? submissionsRes.data?.data || submissionsRes.data || [] : []);
      }
    } catch {
      toast.error('Failed to submit grades');
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1>Homework & Projects</h1>
        <p>Assign, review, grade, and track syllabus submissions from students.</p>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold">Assigned Homework</h3>
        <Button onClick={() => setShowCreateHomeworkModal(true)} className="bg-indigo-600 hover:bg-indigo-650 text-white font-bold rounded-xl text-xs h-9">
          <Plus size={14} className="mr-1" /> Create Homework
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {homeworkList.map((hw: any, i: number) => (
          <Card key={hw.id || i} className="p-5 bg-white border border-gray-150/80 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <Badge className="bg-indigo-50 text-indigo-700 font-bold border-none text-[10px]">Grade {hw.class_name}</Badge>
                <Badge className="bg-gray-100 text-gray-650 font-bold text-[9px] border-none uppercase">{hw.status}</Badge>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 leading-snug">{hw.title}</h3>
                <span className="text-[10px] text-gray-400 font-bold uppercase block mt-1">{hw.subject_name}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{hw.description || 'No description provided'}</p>
              <div className="text-[10px] text-gray-400 font-bold uppercase">Due Date: {new Date(hw.due_date).toLocaleDateString()}</div>
            </div>
            <div className="flex gap-2 mt-5 border-t pt-3.5">
              <Button size="sm" onClick={() => handleViewSubmissions(hw)} className="flex-1 bg-indigo-50 text-indigo-750 font-bold rounded-xl hover:bg-indigo-100">
                Submissions
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(hw.id)} className="text-rose-600 hover:bg-rose-50 rounded-xl px-2">
                <Trash2 size={15} />
              </Button>
            </div>
          </Card>
        ))}
        {homeworkList.length === 0 && (
          <div className="col-span-3 py-10 text-center text-gray-400 font-semibold text-xs italic bg-white border border-dashed rounded-2xl">
            No active homework logs found.
          </div>
        )}
      </div>

      {/* Create Homework Modal */}
      {showCreateHomeworkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowCreateHomeworkModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b mb-4">
              <h3 className="text-base font-bold text-gray-800">Publish Classroom Homework</h3>
              <button onClick={() => setShowCreateHomeworkModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreateHomework} className="space-y-4 text-xs font-bold text-gray-650">
              <div>
                <label className="block mb-1 text-gray-600">Homework Title</label>
                <Input value={homeworkForm.title} onChange={e => setHomeworkForm({ ...homeworkForm, title: e.target.value })} placeholder="e.g. Chapter 4 Equations Homework" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-gray-600">Select Class</label>
                  <Select value={homeworkForm.class_name} onValueChange={v => setHomeworkForm({ ...homeworkForm, class_name: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Class" /></SelectTrigger>
                    <SelectContent>
                      {teacherClasses.map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.class_name}>Grade {cls.class_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-1 text-gray-600">Subject</label>
                  <Select value={homeworkForm.subject_name} onValueChange={v => setHomeworkForm({ ...homeworkForm, subject_name: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Subject" /></SelectTrigger>
                    <SelectContent>
                      {teacherClasses.filter((c: any) => c.class_name === homeworkForm.class_name).map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.subject_name}>{cls.subject_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block mb-1 text-gray-600">Due Date</label>
                <Input type="date" value={homeworkForm.due_date} onChange={e => setHomeworkForm({ ...homeworkForm, due_date: e.target.value })} required />
              </div>
              <div>
                <label className="block mb-1 text-gray-600">Detailed Instructions</label>
                <textarea value={homeworkForm.description} onChange={e => setHomeworkForm({ ...homeworkForm, description: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-indigo-600 h-20 font-medium" placeholder="Specific problems, page numbers..." />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-650 text-white rounded-xl">Publish Homework</Button>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {showViewSubmissionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowViewSubmissionsModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b">
              <h3 className="text-base font-bold text-gray-800">Submissions Checklist</h3>
              <button onClick={() => setShowViewSubmissionsModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="overflow-y-auto flex-1 py-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-gray-450 uppercase font-bold text-left">
                    <th className="py-2.5">Student Name</th>
                    <th className="py-2.5">Date Submitted</th>
                    <th className="py-2.5">Attachment</th>
                    <th className="py-2.5">Grade Status</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissionsList.map((sub: any, i: number) => (
                    <tr key={sub.id || i} className="border-b hover:bg-gray-50/50">
                      <td className="py-2.5 font-semibold text-gray-800">{sub.student_name}</td>
                      <td className="py-2.5 text-gray-400">{new Date(sub.created_at).toLocaleDateString()}</td>
                      <td className="py-2.5">
                        <a href={sub.attachment_url || '#'} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline">
                          View Work PDF
                        </a>
                      </td>
                      <td className="py-2.5">
                        <Badge className={sub.status === 'GRADED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}>
                          {sub.status || 'SUBMITTED'} {sub.grade ? `(${sub.grade})` : ''}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right">
                        <Button size="sm" onClick={() => { setSelectedSubmission(sub); setGradeSubmissionForm({ grade: sub.grade || '', feedback: sub.feedback || '' }); setShowGradeSubmissionModal(true); }} className="bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 h-7 rounded-lg">
                          Enter Grade
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {submissionsList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-400 font-semibold italic">No submissions registered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Grade Submission Modal */}
      {showGradeSubmissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowGradeSubmissionModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b mb-4">
              <h3 className="text-base font-bold text-gray-800">Add Grade feedback</h3>
              <button onClick={() => setShowGradeSubmissionModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleGradeSubmissionSubmit} className="space-y-4 text-xs font-bold text-gray-650">
              <div>
                <label className="block mb-1 text-gray-600">Grade Score / Grade (e.g. A, B+, 90)</label>
                <Input value={gradeSubmissionForm.grade} onChange={e => setGradeSubmissionForm({ ...gradeSubmissionForm, grade: e.target.value })} placeholder="e.g. A+" required />
              </div>
              <div>
                <label className="block mb-1 text-gray-600">Review Comments</label>
                <textarea value={gradeSubmissionForm.feedback} onChange={e => setGradeSubmissionForm({ ...gradeSubmissionForm, feedback: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-indigo-600 h-20 font-medium" placeholder="Excellent work on equations..." />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-650 text-white rounded-xl">Save Grade</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Examinations View
export function ExamsView({
  teacherClasses,
  teacherExamsHook,
  showCreateExamModal,
  setShowCreateExamModal,
  teacherExamForm,
  setTeacherExamForm,
  showEnterMarksModal,
  setShowEnterMarksModal,
  selectedExamForMarks,
  setSelectedExamForMarks,
  marksList,
  setMarksList,
  marksFormList,
  setMarksFormList,
  teacherStudents
}: any) {
  const exams = teacherExamsHook.data?.data || teacherExamsHook.data || [];

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await teacherApi.createExam(teacherExamForm);
      if (res.success || res.data) {
        toast.success('Exam successfully created!');
        setShowCreateExamModal(false);
        setTeacherExamForm({ exam_name: '', class_name: '', subject_name: '', exam_date: '', max_marks: 100, instructions: '' });
        teacherExamsHook.refetch();
      }
    } catch {
      toast.error('Failed to create exam');
    }
  };

  const handleOpenMarksEntry = async (exam: any) => {
    setSelectedExamForMarks(exam);
    setShowEnterMarksModal(true);

    try {
      // Get existing marks
      const res = await teacherApi.getMarks(exam.id);
      const existing = res.success && res.data ? res.data?.data || res.data || [] : [];
      setMarksList(existing);

      // Load form list
      const students = teacherStudents.filter((s: any) => s.class_name === exam.class_name);
      const initialForm: Record<string, any> = {};

      students.forEach((s: any) => {
        const mark = existing.find((m: any) => m.roll_number === s.roll_number);
        initialForm[s.id] = {
          marks_obtained: mark ? mark.marks_obtained : 0,
          grade: mark ? mark.grade : 'A',
          remarks: mark ? mark.remarks : 'Good'
        };
      });

      setMarksFormList(initialForm);
    } catch {
      toast.error('Failed to load marks roster');
    }
  };

  const handleSaveMarksSubmit = async () => {
    const students = teacherStudents.filter((s: any) => s.class_name === selectedExamForMarks.class_name);
    try {
      for (const std of students) {
        const formObj = marksFormList[std.id] || { marks_obtained: 0, grade: 'A', remarks: '' };
        await teacherApi.saveMarks({
          exam_id: selectedExamForMarks.id,
          teacher_id: selectedExamForMarks.teacher_id,
          student_name: std.full_name,
          roll_number: std.roll_number,
          marks_obtained: Number(formObj.marks_obtained),
          max_marks: selectedExamForMarks.max_marks || 100,
          grade: formObj.grade,
          remarks: formObj.remarks
        });
      }

      toast.success('Examination marks logged successfully!');
      setShowEnterMarksModal(false);
    } catch {
      toast.error('Failed to save examination marks');
    }
  };

  const updateStudentMarkObj = (stdId: string, field: string, val: any) => {
    setMarksFormList((prev: any) => ({
      ...prev,
      [stdId]: {
        ...prev[stdId],
        [field]: val
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1>Examinations & Assessments</h1>
        <p>Schedule tests and quizzes, allocate duties, and register grading sheets.</p>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold">Upcoming Assessments</h3>
        <Button onClick={() => setShowCreateExamModal(true)} className="bg-indigo-600 hover:bg-indigo-650 text-white font-bold rounded-xl text-xs h-9">
          <Plus size={14} className="mr-1" /> Create Exam
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {exams.map((ex: any, i: number) => (
          <Card key={ex.id || i} className="p-5 bg-white border border-gray-150/80 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <Badge className="bg-purple-50 text-purple-750 font-bold border-none text-[10px]">Grade {ex.class_name}</Badge>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Max Marks: {ex.max_marks || 100}</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 leading-snug">{ex.exam_name}</h3>
                <span className="text-[10px] text-indigo-700 font-bold uppercase block mt-1">{ex.subject_name || 'Curriculum'}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{ex.instructions || 'No special instructions'}</p>
              <div className="text-[10px] text-gray-400 font-bold uppercase">Date: {new Date(ex.exam_date).toLocaleDateString()}</div>
            </div>
            <Button size="sm" onClick={() => handleOpenMarksEntry(ex)} className="w-full mt-5 bg-indigo-600 hover:bg-indigo-650 text-white text-xs font-bold rounded-xl">
              Enter Student Marks
            </Button>
          </Card>
        ))}
        {exams.length === 0 && (
          <div className="col-span-3 py-10 text-center text-gray-400 font-semibold text-xs italic bg-white border border-dashed rounded-2xl">
            No exams scheduled.
          </div>
        )}
      </div>

      {/* Create Exam Modal */}
      {showCreateExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowCreateExamModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b mb-4">
              <h3 className="text-base font-bold text-gray-800">Schedule Examination</h3>
              <button onClick={() => setShowCreateExamModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreateExam} className="space-y-4 text-xs font-bold text-gray-650">
              <div>
                <label className="block mb-1 text-gray-600">Exam Title</label>
                <Input value={teacherExamForm.exam_name} onChange={e => setTeacherExamForm({ ...teacherExamForm, exam_name: e.target.value })} placeholder="e.g. Mid-Term Geometry Test" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-gray-600">Select Class</label>
                  <Select value={teacherExamForm.class_name} onValueChange={v => setTeacherExamForm({ ...teacherExamForm, class_name: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Class" /></SelectTrigger>
                    <SelectContent>
                      {teacherClasses.map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.class_name}>Grade {cls.class_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-1 text-gray-600">Subject</label>
                  <Select value={teacherExamForm.subject_name} onValueChange={v => setTeacherExamForm({ ...teacherExamForm, subject_name: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Subject" /></SelectTrigger>
                    <SelectContent>
                      {teacherClasses.filter((c: any) => c.class_name === teacherExamForm.class_name).map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.subject_name}>{cls.subject_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-gray-600">Exam Date</label>
                  <Input type="date" value={teacherExamForm.exam_date} onChange={e => setTeacherExamForm({ ...teacherExamForm, exam_date: e.target.value })} required />
                </div>
                <div>
                  <label className="block mb-1 text-gray-600">Max Marks (Total)</label>
                  <Input type="number" value={teacherExamForm.max_marks} onChange={e => setTeacherExamForm({ ...teacherExamForm, max_marks: Number(e.target.value) || 100 })} required />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-gray-600">Syllabus / Special Instructions</label>
                <textarea value={teacherExamForm.instructions} onChange={e => setTeacherExamForm({ ...teacherExamForm, instructions: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-indigo-600 h-20 font-medium" placeholder="Formulas allowed, syllabus details..." />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-650 text-white rounded-xl">Create Exam</Button>
            </form>
          </div>
        </div>
      )}

      {/* Enter Marks Modal */}
      {showEnterMarksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowEnterMarksModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <h3 className="text-base font-bold text-gray-800">Enter Grades: {selectedExamForMarks.exam_name}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase">{selectedExamForMarks.subject_name} &bull; Max Marks: {selectedExamForMarks.max_marks || 100}</p>
              </div>
              <button onClick={() => setShowEnterMarksModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="overflow-y-auto flex-1 py-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-gray-450 uppercase font-bold text-left bg-gray-50/30">
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3 w-32">Marks Obtained</th>
                    <th className="py-2.5 px-3 w-28">Grade Letter</th>
                    <th className="py-2.5 px-3">Remarks / Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherStudents.filter((s: any) => s.class_name === selectedExamForMarks.class_name).map((std: any, idx: number) => {
                    const formObj = marksFormList[std.id] || { marks_obtained: 0, grade: 'A', remarks: '' };
                    return (
                      <tr key={std.id} className="border-b hover:bg-gray-50/50">
                        <td className="py-2.5 px-3 font-bold text-gray-500">{std.roll_number || idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-gray-800">{std.full_name}</td>
                        <td className="py-2.5 px-3">
                          <Input type="number" max={selectedExamForMarks.max_marks || 100} value={formObj.marks_obtained} onChange={e => updateStudentMarkObj(std.id, 'marks_obtained', Number(e.target.value))} className="h-7 text-xs rounded-lg" />
                        </td>
                        <td className="py-2.5 px-3">
                          <Select value={formObj.grade} onValueChange={v => updateStudentMarkObj(std.id, 'grade', v)}>
                            <SelectTrigger className="h-7 text-xs rounded-lg"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A+">A+</SelectItem>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B+">B+</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                              <SelectItem value="D">D</SelectItem>
                              <SelectItem value="F">F</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-2.5 px-3">
                          <Input placeholder="Excellent..." value={formObj.remarks} onChange={e => updateStudentMarkObj(std.id, 'remarks', e.target.value)} className="h-7 text-xs rounded-lg" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="pt-4 border-t flex gap-2">
              <Button onClick={handleSaveMarksSubmit} className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs h-9">
                Save All Marks
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Parent Communication & Broadcast View
export function ParentCommView({
  teacherClasses,
  teacherCommunicationsHook,
  showParentCommModal,
  setShowParentCommModal,
  parentCommForm,
  setParentCommForm
}: any) {
  const communicationsList = teacherCommunicationsHook.data?.data || teacherCommunicationsHook.data || [];

  const handleSendCommunication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentCommForm.recipient_name || !parentCommForm.message_text) {
      toast.error('Recipient and message body required');
      return;
    }

    try {
      const res = await teacherApi.sendCommunication(parentCommForm);
      if (res.success || res.data) {
        toast.success('Communication broadcast sent successfully!');
        setShowParentCommModal(false);
        setParentCommForm({ recipient_type: 'CLASS', recipient_name: '', message_text: '', communication_type: 'EMAIL' });
        teacherCommunicationsHook.refetch();
      }
    } catch {
      toast.error('Failed to send broadcast');
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1>Parent Communication Portal</h1>
        <p>Send emergency broadcasts, weekly summaries, and updates directly to parent phones.</p>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold">Sent Broadcast History</h3>
        <Button onClick={() => setShowParentCommModal(true)} className="bg-indigo-600 hover:bg-indigo-650 text-white font-bold rounded-xl text-xs h-9">
          <Plus size={14} className="mr-1" /> New Broadcast
        </Button>
      </div>

      <div className="space-y-3.5">
        {communicationsList.map((comm: any, i: number) => (
          <Card key={comm.id || i} className="p-4 bg-white border border-gray-150/80 shadow-sm flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
              <Mail size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center font-bold">
                <span className="text-xs text-gray-800">To: Class {comm.recipient_name || 'All Parents'}</span>
                <span className="text-[9px] text-gray-400">{new Date(comm.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{comm.message_text}</p>
              <div className="flex gap-2 mt-2 items-center">
                <Badge className="bg-indigo-50 text-indigo-600 border-none text-[8px] uppercase tracking-wider font-semibold">{comm.communication_type}</Badge>
                <Badge className="bg-emerald-50 text-emerald-700 border-none text-[8px] uppercase tracking-wider font-semibold">{comm.status}</Badge>
              </div>
            </div>
          </Card>
        ))}
        {communicationsList.length === 0 && (
          <div className="py-10 text-center text-gray-400 font-semibold text-xs italic bg-white border border-dashed rounded-2xl">
            No broadcast communications sent yet.
          </div>
        )}
      </div>

      {/* New Broadcast Modal */}
      {showParentCommModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowParentCommModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b mb-4">
              <h3 className="text-base font-bold text-gray-800">Broadcast Alert to Parents</h3>
              <button onClick={() => setShowParentCommModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSendCommunication} className="space-y-4 text-xs font-bold text-gray-650">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-gray-600">Select Class</label>
                  <Select value={parentCommForm.recipient_name} onValueChange={v => setParentCommForm({ ...parentCommForm, recipient_name: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Class" /></SelectTrigger>
                    <SelectContent>
                      {teacherClasses.map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.class_name}>Grade {cls.class_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-1 text-gray-600">Delivery Method</label>
                  <Select value={parentCommForm.communication_type} onValueChange={v => setParentCommForm({ ...parentCommForm, communication_type: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMAIL">Email Update</SelectItem>
                      <SelectItem value="SMS">Direct SMS Text</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block mb-1 text-gray-600">Message Content</label>
                <textarea value={parentCommForm.message_text} onChange={e => setParentCommForm({ ...parentCommForm, message_text: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-indigo-600 h-24 font-medium" placeholder="Dear Parents, this is an update regarding..." required />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-650 text-white rounded-xl">Send Broadcast</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// PTM Slots View
export function PtmView({
  teacherClasses,
  teacherPtmHook,
  showCreatePtmModal,
  setShowCreatePtmModal,
  ptmForm,
  setPtmForm,
  teacherStudents
}: any) {
  const ptmList = teacherPtmHook.data?.data || teacherPtmHook.data || [];

  const handleCreatePtm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await teacherApi.createPtm(ptmForm);
      if (res.success || res.data) {
        toast.success('PTM Slot Scheduled Successfully!');
        setShowCreatePtmModal(false);
        setPtmForm({ parent_name: '', student_name: '', meeting_date: '', time_slot: '', notes: '' });
        teacherPtmHook.refetch();
      }
    } catch {
      toast.error('Failed to schedule slot');
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1>PTM Center</h1>
        <p>Schedule Parent-Teacher Meetings slots, review logs, and add meeting notes.</p>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold">PTM Schedule Slots</h3>
        <Button onClick={() => setShowCreatePtmModal(true)} className="bg-indigo-600 hover:bg-indigo-650 text-white font-bold rounded-xl text-xs h-9">
          <Plus size={14} className="mr-1" /> Schedule Meeting
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {ptmList.map((ptm: any, i: number) => (
          <Card key={ptm.id || i} className="p-5 bg-white border border-gray-150/80 shadow-sm flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="flex justify-between items-center">
                <Badge className="bg-indigo-50 text-indigo-750 font-bold border-none text-[10px]">{ptm.time_slot}</Badge>
                <Badge className="bg-emerald-50 text-emerald-700 border-none text-[9px] uppercase font-semibold">{ptm.status}</Badge>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">{ptm.student_name}</h3>
                <span className="text-[10px] text-gray-400 font-bold uppercase block mt-0.5">Parent: {ptm.parent_name}</span>
              </div>
              <p className="text-xs text-gray-500 italic mt-2">"{ptm.notes || 'No notes added yet'}"</p>
              <div className="text-[10px] text-gray-400 font-bold uppercase">Date: {new Date(ptm.meeting_date).toLocaleDateString()}</div>
            </div>
          </Card>
        ))}
        {ptmList.length === 0 && (
          <div className="col-span-3 py-10 text-center text-gray-400 font-semibold text-xs italic bg-white border border-dashed rounded-2xl">
            No PTM sessions scheduled.
          </div>
        )}
      </div>

      {/* Create PTM Modal */}
      {showCreatePtmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowCreatePtmModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b mb-4">
              <h3 className="text-base font-bold text-gray-800">Schedule PTM slot</h3>
              <button onClick={() => setShowCreatePtmModal(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreatePtm} className="space-y-4 text-xs font-bold text-gray-650">
              <div>
                <label className="block mb-1 text-gray-600">Select Student</label>
                <Select value={ptmForm.student_name} onValueChange={v => {
                  const stdObj = teacherStudents.find((s: any) => s.full_name === v);
                  setPtmForm({ ...ptmForm, student_name: v, parent_name: stdObj?.parent_name || 'Parent' });
                }}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Student Name" /></SelectTrigger>
                  <SelectContent>
                    {teacherStudents.map((cls: any) => (
                      <SelectItem key={cls.id} value={cls.full_name}>{cls.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1 text-gray-600">Parent Name</label>
                <Input value={ptmForm.parent_name} readOnly placeholder="Parent Name" className="rounded-xl bg-gray-50 text-gray-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-gray-600">Meeting Date</label>
                  <Input type="date" value={ptmForm.meeting_date} onChange={e => setPtmForm({ ...ptmForm, meeting_date: e.target.value })} required />
                </div>
                <div>
                  <label className="block mb-1 text-gray-600">Time Slot</label>
                  <Input value={ptmForm.time_slot} onChange={e => setPtmForm({ ...ptmForm, time_slot: e.target.value })} placeholder="e.g. 04:30 PM - 05:00 PM" required />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-gray-600">Meeting Agenda / Agenda Notes</label>
                <textarea value={ptmForm.notes} onChange={e => setPtmForm({ ...ptmForm, notes: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-indigo-600 h-20 font-medium" placeholder="Review grade drops in Algebra..." />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-650 text-white rounded-xl">Schedule Meeting Slot</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// AI Study Resources Suite View
export function ResourcesView({
  teacherClasses,
  teacherResourcesHook,
  showAiSuiteModal,
  setShowAiSuiteModal,
  aiSuiteForm,
  setAiSuiteForm,
  aiSuiteResult,
  setAiSuiteResult,
  generatingAi,
  setGeneratingAi
}: any) {
  const resourcesList = teacherResourcesHook.data?.data || teacherResourcesHook.data || [];
  const [resForm, setResForm] = useState({ resource_name: '', resource_type: 'NOTES', subject_name: '', file_url: '', description: '' });

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resForm.resource_name || !resForm.subject_name || !resForm.file_url) {
      toast.error('Please input all necessary fields');
      return;
    }

    try {
      const res = await teacherApi.createResource(resForm);
      if (res.success || res.data) {
        toast.success('Study materials uploaded and registered!');
        setResForm({ resource_name: '', resource_type: 'NOTES', subject_name: '', file_url: '', description: '' });
        teacherResourcesHook.refetch();
      }
    } catch {
      toast.error('Upload failed');
    }
  };

  const handleRunAiSuite = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingAi(true);
    setAiSuiteResult('');

    try {
      let res;
      if (aiSuiteForm.toolType === 'lesson') {
        res = await teacherApi.generateLesson({
          title: aiSuiteForm.topic || 'Lesson Plan',
          subject_id: aiSuiteForm.subject || 'Syllabus',
          class_id: aiSuiteForm.grade || '10',
          topic: aiSuiteForm.topic,
          duration: Number(aiSuiteForm.duration),
          objectives: ['Students will list key variables', 'Students will formulate quadratic models'],
          content: 'Quadratic Equation Model content detail explanation here...',
          materials: ['Whiteboard', 'Calculators', 'Syllabus PDF']
        });
      } else if (aiSuiteForm.toolType === 'quiz') {
        res = await teacherApi.generateQuiz({
          title: aiSuiteForm.topic || 'Quiz Sheet',
          subject_id: aiSuiteForm.subject || 'Syllabus',
          class_id: aiSuiteForm.grade || '10',
          topic: aiSuiteForm.topic,
          difficulty: aiSuiteForm.difficulty,
          count: Number(aiSuiteForm.count)
        });
      } else {
        res = await teacherApi.generateContent({
          title: aiSuiteForm.topic || 'Study Notes',
          content_type: 'NOTES',
          subject_id: aiSuiteForm.subject || 'Syllabus',
          class_id: aiSuiteForm.grade || '10',
          topic: aiSuiteForm.topic,
          content: 'Detailed explanation text of the study notes generator...'
        });
      }

      if (res.success && res.data) {
        // Output clean generated formatted result
        const generated = res.data;
        let md = `# AI Generated ${aiSuiteForm.toolType.toUpperCase()}\n\n`;
        md += `**Topic:** ${generated.title || generated.topic || aiSuiteForm.topic}\n`;
        md += `**Subject:** ${generated.subject_id || aiSuiteForm.subject}\n`;
        md += `**Difficulty/Duration:** ${generated.difficulty || generated.duration || 'Standard'}\n\n`;
        md += `## Material Content & Questions:\n\n`;

        if (Array.isArray(generated.questions)) {
          generated.questions.forEach((q: any, idx: number) => {
            md += `**Q${idx + 1}. ${q.question}**\n`;
            if (Array.isArray(q.options)) {
              q.options.forEach((opt: string) => {
                md += `- ${opt}\n`;
              });
            }
            md += `*Correct Answer:* ${q.correctAnswer}\n`;
            md += `*Explanation:* ${q.explanation}\n\n`;
          });
        } else {
          md += `${generated.content || generated.description || 'Details generated successfully.'}\n`;
        }

        setAiSuiteResult(md);
        toast.success('AI Lesson Materials Compiled Successfully!');
      } else {
        toast.error('Failed to trigger AI generation');
      }
    } catch {
      toast.error('AI Suite Generator failed');
    } finally {
      setGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1>Curriculum & AI Lesson Suite</h1>
        <p>Upload study notes, or generate quizzes, lesson plans, and summaries with Prerana AI Suite.</p>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold">Study Resources Library</h3>
        <Button onClick={() => setShowAiSuiteModal(true)} className="bg-indigo-600 hover:bg-indigo-650 text-white font-bold rounded-xl text-xs h-9">
          <Sparkles size={14} className="mr-1" /> AI Lesson Builder Suite
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Resource */}
        <div>
          <Card className="p-5 bg-white border border-gray-150/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold border-b pb-2">Upload study Guide</h3>
            <form onSubmit={handleCreateResource} className="space-y-4 text-xs font-bold text-gray-650">
              <div>
                <label className="block mb-1 text-gray-600">Material Title</label>
                <Input value={resForm.resource_name} onChange={e => setResForm({ ...resForm, resource_name: e.target.value })} placeholder="e.g. Intro to Trigonometry PDF" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-gray-600">Type</label>
                  <Select value={resForm.resource_type} onValueChange={v => setResForm({ ...resForm, resource_type: v || '' })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NOTES">Study Notes</SelectItem>
                      <SelectItem value="SYLLABUS">Syllabus PDF</SelectItem>
                      <SelectItem value="PAPER">Sample Paper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-1 text-gray-600">Subject</label>
                  <Select value={resForm.subject_name} onValueChange={v => setResForm({ ...resForm, subject_name: v || '' })}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Subject" /></SelectTrigger>
                    <SelectContent>
                      {teacherClasses.map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.subject_name}>{cls.subject_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block mb-1 text-gray-600">Hosted URL (PDF / Document Link)</label>
                <Input value={resForm.file_url} onChange={e => setResForm({ ...resForm, file_url: e.target.value })} placeholder="https://storage.co/guide.pdf" required />
              </div>
              <div>
                <label className="block mb-1 text-gray-600">Description</label>
                <textarea value={resForm.description} onChange={e => setResForm({ ...resForm, description: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-indigo-600 h-16 font-medium" placeholder="Brief details about resources..." />
              </div>
              <Button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl">Register Material</Button>
            </form>
          </Card>
        </div>

        {/* List Resources */}
        <div className="lg:col-span-2 space-y-3">
          {resourcesList.map((res: any, i: number) => (
            <Card key={res.id || i} className="p-4 bg-white border border-gray-150/80 shadow-sm flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-800">{res.resource_name}</h3>
                  <span className="text-[9px] text-gray-400 font-bold block uppercase mt-0.5">{res.subject_name} &bull; {res.resource_type}</span>
                  <p className="text-[10px] text-gray-500 mt-1">{res.description || 'No description provided'}</p>
                </div>
              </div>
              <a href={res.file_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] transition-all">
                Download
              </a>
            </Card>
          ))}
          {resourcesList.length === 0 && (
            <div className="py-12 text-center text-gray-400 font-semibold text-xs italic bg-white border border-dashed rounded-2xl">
              No study guide files registered yet.
            </div>
          )}
        </div>
      </div>

      {/* AI Suite Builder Dialog */}
      {showAiSuiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowAiSuiteModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 shadow-2xl flex flex-col md:flex-row gap-6 max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Form Side */}
            <div className="w-full md:w-1/2 flex flex-col">
              <div className="flex justify-between items-center pb-4 border-b mb-4">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-indigo-650" /> Prerana AI Teaching Suite
                </h3>
                <button onClick={() => setShowAiSuiteModal(false)} className="md:hidden"><X size={20} className="text-gray-400" /></button>
              </div>
              <form onSubmit={handleRunAiSuite} className="space-y-4 text-xs font-bold text-gray-650 flex-1 overflow-y-auto pr-1">
                <div>
                  <label className="block mb-1 text-gray-600">Select Tool</label>
                  <Select value={aiSuiteForm.toolType} onValueChange={v => setAiSuiteForm({ ...aiSuiteForm, toolType: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lesson">Lesson Plan Generator</SelectItem>
                      <SelectItem value="quiz">Interactive Quiz Builder</SelectItem>
                      <SelectItem value="notes">Lecture Notes Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-1 text-gray-600">Topic Title</label>
                  <Input value={aiSuiteForm.topic} onChange={e => setAiSuiteForm({ ...aiSuiteForm, topic: e.target.value })} placeholder="e.g. Solve Quadratic Equations by Factoring" required />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1 text-gray-600">Select Class</label>
                    <Select value={aiSuiteForm.grade} onValueChange={v => setAiSuiteForm({ ...aiSuiteForm, grade: v })}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Class" /></SelectTrigger>
                      <SelectContent>
                        {teacherClasses.map((cls: any) => (
                          <SelectItem key={cls.id} value={cls.class_name}>Grade {cls.class_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-600">Subject</label>
                    <Select value={aiSuiteForm.subject} onValueChange={v => setAiSuiteForm({ ...aiSuiteForm, subject: v })}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Subject" /></SelectTrigger>
                      <SelectContent>
                        {teacherClasses.filter((c: any) => c.class_name === aiSuiteForm.grade).map((cls: any) => (
                          <SelectItem key={cls.id} value={cls.subject_name}>{cls.subject_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {aiSuiteForm.toolType === 'lesson' && (
                  <div>
                    <label className="block mb-1 text-gray-600">Duration (Minutes)</label>
                    <Input type="number" value={aiSuiteForm.duration} onChange={e => setAiSuiteForm({ ...aiSuiteForm, duration: Number(e.target.value) })} />
                  </div>
                )}

                {aiSuiteForm.toolType === 'quiz' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block mb-1 text-gray-600">Questions Count</label>
                      <Input type="number" value={aiSuiteForm.count} onChange={e => setAiSuiteForm({ ...aiSuiteForm, count: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="block mb-1 text-gray-600">Difficulty</label>
                      <Select value={aiSuiteForm.difficulty} onValueChange={v => setAiSuiteForm({ ...aiSuiteForm, difficulty: v })}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block mb-1 text-gray-600">Extra Prompts / Specific Requirements (Optional)</label>
                  <textarea value={aiSuiteForm.extraPrompt} onChange={e => setAiSuiteForm({ ...aiSuiteForm, extraPrompt: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-indigo-600 h-16 font-medium" placeholder="e.g. Include real-world physics examples..." />
                </div>
                <Button type="submit" disabled={generatingAi} className="w-full bg-indigo-600 hover:bg-indigo-650 text-white rounded-xl h-10">
                  {generatingAi ? <><Loader2 size={14} className="animate-spin mr-1" /> Generating...</> : 'Generate Lesson Resource'}
                </Button>
              </form>
            </div>

            {/* Results Side */}
            <div className="w-full md:w-1/2 flex flex-col border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 max-h-full">
              <div className="flex justify-between items-center pb-4 border-b mb-4">
                <h3 className="text-base font-bold text-gray-800">Generated Lesson Materials</h3>
                <button onClick={() => setShowAiSuiteModal(false)} className="hidden md:block"><X size={20} className="text-gray-400" /></button>
              </div>
              <div className="flex-1 bg-gray-50 border rounded-2xl p-4 overflow-y-auto text-xs font-medium text-gray-700 whitespace-pre-wrap leading-relaxed select-text">
                {generatingAi ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-10">
                    <Loader2 size={32} className="animate-spin text-indigo-650" />
                    <p className="font-semibold text-gray-400">Prerana AI is compiling custom quiz materials and structuring plans...</p>
                  </div>
                ) : aiSuiteResult ? (
                  <div>
                    {aiSuiteResult}
                    <div className="mt-4 pt-4 border-t flex gap-2">
                      <Button onClick={() => { navigator.clipboard.writeText(aiSuiteResult); toast.success('Copied to clipboard'); }} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-xl h-8">
                        Copy to Clipboard
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-1.5 py-10">
                    <Sparkles size={28} className="text-gray-300" />
                    <p className="font-bold">Generated quiz worksheets and syllabus summaries will output here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
