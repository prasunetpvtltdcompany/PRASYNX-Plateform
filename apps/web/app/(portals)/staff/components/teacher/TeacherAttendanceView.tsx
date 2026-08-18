'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users, Check, Search,
  Loader2, Save, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { teacherApi } from '../../lib/dataService';
import { auth } from '../../lib/auth';

interface TeacherStudentAttendanceViewProps {
  session: any;
}

export function TeacherStudentAttendanceView({ session }: TeacherStudentAttendanceViewProps) {
  const teacher = session?.teacher || {};
  const user = session?.user || {};
  const teacherId = teacher?.id || user?.id;
  const orgId = auth.getOrganisationId();

  const [loading, setLoading] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { status: string; remarks: string }>>({});

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Get class_name and subject_name from selected IDs
  const selectedClass = useMemo(() => {
    const unique = new Map(classes.map((c: any) => [c.class_id, c]));
    return unique.get(selectedClassId);
  }, [classes, selectedClassId]);

  // Deduplicated list of classes for dropdown
  const uniqueClasses = useMemo(() => {
    const map = new Map<string, any>();
    classes.forEach((c: any) => {
      if (!map.has(c.class_id)) {
        map.set(c.class_id, { id: c.class_id, name: c.class_name });
      }
    });
    return Array.from(map.values());
  }, [classes]);

  // Subjects available for the selected class
  const subjectsForClass = useMemo(() => {
    if (!selectedClassId) return [];
    const map = new Map<string, any>();
    classes
      .filter((c: any) => c.class_id === selectedClassId)
      .forEach((c: any) => {
        if (c.subject_id && !map.has(c.subject_id)) {
          map.set(c.subject_id, { id: c.subject_id, name: c.subject_name });
        }
      });
    return Array.from(map.values());
  }, [classes, selectedClassId]);

  // Load metadata on mount
  useEffect(() => {
    async function loadMetadata() {
      if (!teacherId) return;
      setMetadataLoading(true);
      try {
        const [classRes, studentRes] = await Promise.all([
          teacherApi.getClasses(teacherId),
          teacherApi.getStudents(teacherId),
        ]);
        if (classRes.success) setClasses(classRes.data || []);
        else console.error('Failed to load classes:', classRes.error);
        if (studentRes.success) {
          const studentsData = studentRes.data?.data || studentRes.data || [];
          setAllStudents(Array.isArray(studentsData) ? studentsData : []);
        } else console.error('Failed to load students:', studentRes.error);
      } catch (err) {
        console.error('Error loading metadata:', err);
        toast.error('Failed to load class data');
      } finally {
        setMetadataLoading(false);
      }
    }
    loadMetadata();
  }, [teacherId]);

  // Filter students by selected class (by class_name) and set initial attendance records
  const students = useMemo(() => {
    if (!selectedClassId || allStudents.length === 0) return [];
    const className = selectedClass?.class_name || '';
    return allStudents.filter((s: any) => s.class_name === className);
  }, [selectedClassId, selectedClass, allStudents]);

  // Load existing attendance records
  useEffect(() => {
    async function loadRecords() {
      if (!selectedClassId || students.length === 0) {
        setAttendanceRecords({});
        return;
      }
      try {
        const params: any = { class_id: selectedClassId, date: selectedDate };
        if (selectedSubjectId) params.subject_id = selectedSubjectId;

        const query = new URLSearchParams(params).toString();
        const res = await teacherApi.getAttendance(teacherId);
        // Use the existing attendance data to pre-fill records
        const allAttendance = Array.isArray(res.data?.data || res.data) ? (res.data?.data || res.data) : [];
        const todayAttendance = allAttendance.filter((a: any) => a.date === selectedDate);

        const initialRecords: Record<string, { status: string; remarks: string }> = {};
        students.forEach((s: any) => {
          const existing = todayAttendance.find((a: any) => a.student_id === s.id);
          initialRecords[s.id] = {
            status: existing ? (existing.status === 'present' ? 'Present' : existing.status === 'absent' ? 'Absent' : existing.status === 'late' ? 'Late' : 'Present') : 'Present',
            remarks: existing?.notes || ''
          };
        });
        setAttendanceRecords(initialRecords);
      } catch (err) {
        console.error('Error loading attendance:', err);
      }
    }
    loadRecords();
  }, [selectedClassId, selectedSubjectId, selectedDate, students, teacherId]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    return students.filter((s: any) =>
      (s.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.roll_number || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const handleStatusChange = useCallback((studentId: string, status: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  }, []);

  const handleRemarkChange = useCallback((studentId: string, remarks: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks }
    }));
  }, []);

  const markAllAsPresent = () => {
    setAttendanceRecords(prev => {
      const next = { ...prev };
      students.forEach(s => { next[s.id] = { ...next[s.id], status: 'Present' }; });
      return next;
    });
    toast.success('Marked all students as Present');
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId) {
      toast.error('Please select a class');
      return;
    }

    try {
      setLoading(true);

      const records = students.map(s => {
        const rec = attendanceRecords[s.id] || { status: 'Present', remarks: '' };
        return {
          student_id: s.id,
          status: rec.status.toLowerCase(),
          notes: rec.remarks || '',
        };
      });

      const res = await teacherApi.markAttendance({
        records,
        class_id: selectedClassId,
        subject_id: selectedSubjectId || null,
        date: selectedDate,
      });

      if (res.success) {
        toast.success('Attendance submitted successfully!');
      } else {
        toast.error(res.error || 'Failed to save attendance');
      }
    } catch (err: any) {
      console.error('Error saving attendance:', err);
      toast.error('Failed to save attendance records');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'Present', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50', activeColor: 'bg-emerald-500 text-white border-emerald-500' },
    { value: 'Absent', color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/50', activeColor: 'bg-rose-500 text-white border-rose-500' },
    { value: 'Late', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/50', activeColor: 'bg-amber-500 text-white border-amber-500' },
    { value: 'Half Day', color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100/50', activeColor: 'bg-orange-500 text-white border-orange-500' },
    { value: 'Leave', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/50', activeColor: 'bg-blue-500 text-white border-blue-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Mark Attendance
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Submit daily student attendance rosters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-4 bg-white border border-gray-150/80 shadow-sm h-fit space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Filters
          </h3>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-500 uppercase">Date</label>
            <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="text-xs" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-500 uppercase">Class</label>
            <Select value={selectedClassId} onValueChange={(v) => v && setSelectedClassId(v)}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder={metadataLoading ? 'Loading...' : 'Select Class'} />
              </SelectTrigger>
              <SelectContent>
                {metadataLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                ) : uniqueClasses.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-4">No classes assigned</div>
                ) : (
                  uniqueClasses.map((c: any) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedClassId && subjectsForClass.length > 0 && (
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Subject (optional)</label>
              <Select value={selectedSubjectId} onValueChange={(v) => v && setSelectedSubjectId(v)}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="text-xs">All Subjects</SelectItem>
                  {subjectsForClass.map((sub: any) => (
                    <SelectItem key={sub.id} value={sub.id} className="text-xs">
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="pt-2">
            <Button
              onClick={handleSaveAttendance}
              disabled={loading || !selectedClassId}
              className="w-full text-xs font-semibold py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-md text-white border-0 flex items-center justify-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Attendance
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-white border border-gray-150/80 shadow-sm p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between mb-4 border-b border-gray-100 pb-3">
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs h-8 w-full"
                />
              </div>
              {students.length > 0 && (
                <button
                  type="button"
                  onClick={markAllAsPresent}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/50 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Mark All Present
                </button>
              )}
            </div>

            {metadataLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-xs text-gray-400 font-medium">Loading class data...</p>
              </div>
            ) : !selectedClassId ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Users className="w-12 h-12 opacity-25 mb-2" />
                <p className="text-xs font-medium">Select a class to load student roster.</p>
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Users className="w-12 h-12 opacity-25 mb-2" />
                <p className="text-xs font-medium">No students found for this class.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-gray-500 uppercase font-semibold text-[10px] bg-gray-50/50">
                      <th className="py-2 px-3 text-left w-16">Roll No</th>
                      <th className="py-2 px-3 text-left">Student Name</th>
                      <th className="py-2 px-3 text-center w-72">Status</th>
                      <th className="py-2 px-3 text-left w-52">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, i) => {
                      const rec = attendanceRecords[student.id] || { status: 'Present', remarks: '' };
                      return (
                        <tr key={student.id || i} className="border-b hover:bg-gray-50/30 transition-colors">
                          <td className="py-2 px-3 font-semibold text-gray-500">
                            {student.roll_number || `S-${String(i+1).padStart(2,'0')}`}
                          </td>
                          <td className="py-2 px-3 font-semibold text-gray-800">
                            {student.full_name}
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex justify-center gap-1">
                              {statusOptions.map(opt => {
                                const active = rec.status === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleStatusChange(student.id, opt.value)}
                                    className={`px-2 py-1 rounded-md text-[9px] font-bold border transition-all ${
                                      active ? opt.activeColor : opt.color
                                    }`}
                                  >
                                    {opt.value}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <Input
                              placeholder="Add optional notes..."
                              value={rec.remarks}
                              onChange={e => handleRemarkChange(student.id, e.target.value)}
                              className="h-7 text-xs"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
