'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CheckCircle2, AlertCircle, X, Clock,
  Search, Users, Loader2, Download, AlertTriangle, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '../../lib/supabase';

export function ManagementAttendanceView() {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);

  // Selected filters
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lowAttendanceThreshold, setLowAttendanceThreshold] = useState<number>(75);

  // Fetch classes and sections on mount
  useEffect(() => {
    async function loadMeta() {
      try {
        const { data: classData } = await supabase.from('classes').select('*');
        setClasses(classData || []);

        const { data: sectionData } = await supabase.from('sections').select('*');
        setSections(sectionData || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadMeta();
  }, []);

  // Filter sections based on selected class
  const filteredSections = useMemo(() => {
    if (selectedClass === 'all') return [];
    return sections.filter(s => s.class_id === selectedClass);
  }, [selectedClass, sections]);

  // Reset section when class changes
  useEffect(() => {
    setSelectedSection('all');
  }, [selectedClass]);

  // Load all student profiles and compute summaries from records
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: studentData, error: stuErr } = await supabase
        .from('students')
        .select('id, full_name, roll_number, class_id, section_id, classes(name), sections(name)');
      if (stuErr) throw stuErr;

      const currentStudents = studentData || [];
      setStudents(currentStudents);

      // Fetch all attendance records and compute summaries client-side
      const studentIds = currentStudents.map((s: any) => s.id);
      let recordsMap: Record<string, any[]> = {};
      if (studentIds.length > 0) {
        const { data: allRecords, error: recErr } = await supabase
          .from('attendance_records')
          .select('*')
          .in('student_id', studentIds);
        if (!recErr && allRecords) {
          recordsMap = allRecords.reduce((acc: Record<string, any[]>, r: any) => {
            if (!acc[r.student_id]) acc[r.student_id] = [];
            acc[r.student_id].push(r);
            return acc;
          }, {});
        }
      }

      const computedSummaries = currentStudents.map((s: any) => {
        const records = recordsMap[s.id] || [];
        const present = records.filter((r: any) => r.attendance_status?.toLowerCase() === 'present').length;
        const absent = records.filter((r: any) => r.attendance_status?.toLowerCase() === 'absent').length;
        const late = records.filter((r: any) => r.attendance_status?.toLowerCase() === 'late').length;
        const total = records.length;
        return {
          student_id: s.id,
          total_present: present,
          total_absent: absent,
          total_late: late,
          attendance_percentage: total > 0 ? Math.round((present / total) * 100) : 0,
        };
      });
      setSummaries(computedSummaries);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load management attendance data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Subscribe to attendance records changes
    const channel = supabase
      .channel('management_attendance_sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records'
        },
        (payload: any) => {
          console.log("Realtime records update received:", payload);
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  // Process data for rendering student analytics list
  const processedStudents = useMemo(() => {
    return students.map(s => {
      const summary = summaries.find(sum => sum.student_id === s.id) || {
        total_present: 0,
        total_absent: 0,
        total_late: 0,
        total_leave: 0,
        attendance_percentage: 0
      };

      const total = summary.total_present + summary.total_absent + summary.total_late + summary.total_leave;
      
      return {
        id: s.id,
        rollNumber: s.roll_number || '—',
        fullName: s.full_name,
        classId: s.class_id,
        className: s.classes?.name || '—',
        sectionId: s.section_id,
        sectionName: s.sections?.name || '—',
        present: summary.total_present,
        absent: summary.total_absent,
        late: summary.total_late,
        leave: summary.total_leave,
        total,
        percentage: Math.round(Number(summary.attendance_percentage || 0))
      };
    });
  }, [students, summaries]);

  // Apply filters
  const filteredStudents = useMemo(() => {
    return processedStudents.filter(s => {
      const matchClass = selectedClass === 'all' || s.classId === selectedClass;
      const matchSection = selectedSection === 'all' || s.sectionId === selectedSection;
      const matchSearch = !searchQuery || 
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchSection && matchSearch;
    });
  }, [processedStudents, selectedClass, selectedSection, searchQuery]);

  // Low attendance list
  const lowAttendanceStudents = useMemo(() => {
    return processedStudents.filter(s => s.total > 0 && s.percentage < lowAttendanceThreshold);
  }, [processedStudents, lowAttendanceThreshold]);

  // Compute school-wide KPI aggregates based on active filters
  const aggregates = useMemo(() => {
    const activeList = filteredStudents;
    const totalPercentageSum = activeList.reduce((sum, s) => sum + s.percentage, 0);
    const avgPercentage = activeList.length > 0 ? Math.round(totalPercentageSum / activeList.length) : 0;

    const totalPresent = activeList.reduce((sum, s) => sum + s.present, 0);
    const totalAbsent = activeList.reduce((sum, s) => sum + s.absent, 0);
    const totalLate = activeList.reduce((sum, s) => sum + s.late, 0);
    const totalLeave = activeList.reduce((sum, s) => sum + s.leave, 0);

    return {
      avgPercentage,
      totalPresent,
      totalAbsent,
      totalLate,
      totalLeave,
      count: activeList.length
    };
  }, [filteredStudents]);

  // Export CSV function
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) {
      toast.error('No records available to export');
      return;
    }

    const headers = ['Roll No', 'Full Name', 'Class', 'Section', 'Present Days', 'Absent Days', 'Late Days', 'Leave Days', 'Total Days', 'Attendance Rate %'];
    const rows = filteredStudents.map(s => [
      s.rollNumber,
      s.fullName,
      s.className,
      s.sectionName,
      s.present,
      s.absent,
      s.late,
      s.leave,
      s.total,
      `${s.percentage}%`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Attendance Report exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Overall Attendance Rate', value: `${aggregates.avgPercentage}%`, icon: TrendingUp, color: '#6D4CFF', bg: '#F3F0FF' },
          { label: 'Total Present Markings', value: aggregates.totalPresent, icon: CheckCircle2, color: '#10B981', bg: '#F0FDF4' },
          { label: 'Total Absent Markings', value: aggregates.totalAbsent, icon: X, color: '#EF4444', bg: '#FEF2F2' },
          { label: 'Low Attendance Roster', value: lowAttendanceStudents.length, icon: AlertTriangle, color: '#F59E0B', bg: '#FFFBEB' }
        ].map((kpi, i) => (
          <Card key={i} className="p-4 bg-white border border-gray-150/80 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: kpi.bg, color: kpi.color }}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-gray-400 font-semibold uppercase">{kpi.label}</div>
              <div className="text-xl font-black text-gray-800 mt-0.5">{kpi.value}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        {/* Left Side: Student list with filters */}
        <Card className="p-5 bg-white border border-gray-150/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Attendance Roster</h3>
              <p className="text-xs text-gray-400 mt-0.5">Filter by class and section to analyze percentages.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="text-xs font-semibold py-1.5 px-3 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100/50 border border-indigo-200 shadow-none flex items-center gap-1 cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Filters row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Class filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Class</label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs bg-white outline-none focus:border-[#6D4CFF]"
              >
                <option value="all">All Classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Section filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Section</label>
              <select
                value={selectedSection}
                onChange={e => setSelectedSection(e.target.value)}
                disabled={selectedClass === 'all'}
                className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs bg-white outline-none focus:border-[#6D4CFF] disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="all">All Sections</option>
                {filteredSections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Search</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Student name/roll no..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs h-9"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <p className="text-xs text-gray-400 font-medium">Fetching roster analytics...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Users className="w-12 h-12 opacity-25 mx-auto mb-2" />
              <p className="text-xs font-medium">No student records match selected filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-gray-500 uppercase font-semibold text-[10px] bg-gray-50/50">
                    <th className="py-2 px-3 text-left w-20">Roll No</th>
                    <th className="py-2 px-3 text-left">Name</th>
                    <th className="py-2 px-3 text-center">Class</th>
                    <th className="py-2 px-3 text-center">Section</th>
                    <th className="py-2 px-3 text-center">P / A / L</th>
                    <th className="py-2 px-3 text-center w-24">Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, idx) => (
                    <tr key={s.id || idx} className="border-b hover:bg-gray-50/30 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-gray-500">{s.rollNumber}</td>
                      <td className="py-2.5 px-3 font-semibold text-gray-800">{s.fullName}</td>
                      <td className="py-2.5 px-3 text-center text-gray-500">{s.className}</td>
                      <td className="py-2.5 px-3 text-center text-gray-500">{s.sectionName}</td>
                      <td className="py-2.5 px-3 text-center text-gray-600 font-medium">
                        {s.present}d / {s.absent}d / {s.late}d
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge
                          className={`text-[9px] font-bold py-0.5 border ${
                            s.total === 0 ? 'bg-gray-50 text-gray-500 border-gray-200' :
                            s.percentage >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            s.percentage >= 75 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {s.total === 0 ? 'No Data' : `${s.percentage}%`}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Right Side: Low Attendance Warnings */}
        <div className="space-y-4">
          <Card className="p-4 bg-white border border-gray-150/80 shadow-sm space-y-3">
            <div>
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Attendance Warnings
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Students below the alert threshold rate.</p>
            </div>

            {/* Threshold slider value input */}
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border">
              <span className="text-[10px] font-semibold text-gray-500">Alert Threshold</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={lowAttendanceThreshold}
                  onChange={e => setLowAttendanceThreshold(Number(e.target.value))}
                  className="w-10 text-center h-6 text-xs border rounded bg-white font-bold"
                  min="0"
                  max="100"
                />
                <span className="text-xs font-bold text-gray-500">%</span>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {loading ? (
                <div className="text-center py-10 text-xs text-gray-400">Loading alerts...</div>
              ) : lowAttendanceStudents.length === 0 ? (
                <div className="text-center py-10 text-xs text-gray-400">No student warnings.</div>
              ) : (
                lowAttendanceStudents.map((s, idx) => (
                  <div key={s.id || idx} className="p-3 bg-rose-50/50 hover:bg-rose-50 border border-rose-100 rounded-xl transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[11px] font-bold text-gray-800">{s.fullName}</span>
                      <span className="text-[10px] font-black text-rose-600 bg-rose-100/50 px-1.5 py-0.5 rounded-md">{s.percentage}%</span>
                    </div>
                    <div className="text-[9px] text-gray-400 mt-0.5">
                      Class: {s.className} ({s.sectionName}) · Absents: {s.absent}d
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
