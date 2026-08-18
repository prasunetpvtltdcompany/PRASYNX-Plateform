import { Router, Request, Response } from 'express';
import { supabase } from '../../lib/backend-common';

const router = Router();

// GET /attendance/class/:class_id/:date - Get students and attendance for a class
router.get('/attendance/class/:class_id/:date', async (req: Request, res: Response) => {
  const { class_id, date } = req.params;
  try {
    const { data: students } = await supabase.from('students')
      .select('id, full_name, roll_number, class_id, section_id, sections:sections!students_section_id_fkey(name)')
      .eq('class_id', class_id).eq('status', 'active');
    const studentIds = (students || []).map(s => s.id);
    const { data: attendance } = studentIds.length > 0
      ? await supabase.from('attendance').select('*').in('student_id', studentIds).eq('date', date)
      : { data: [] };
    const mapped = (students || []).map((s: any) => ({
      ...s, student_class: '', section: (Array.isArray(s.sections) ? s.sections[0]?.name : s.sections?.name) || ''
    }));
    res.json({ students: mapped, attendance: attendance || [] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /attendance/toggle
router.post('/attendance/toggle', async (req: Request, res: Response) => {
  const { organisation_id, student_id, teacher_id, date, status } = req.body;
  if (!organisation_id || !student_id || !date || !status) {
    return res.status(400).json({ error: 'organisation_id, student_id, date, status required' });
  }
  try {
    const { data, error } = await supabase.from('attendance').upsert(
      { organisation_id, student_id, teacher_id: teacher_id || null, date, status },
      { onConflict: 'student_id,date' }
    ).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET /attendance/student/:student_id
router.get('/attendance/student/:student_id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('attendance').select('*')
      .eq('student_id', req.params.student_id).order('date', { ascending: false });
    if (error) throw error;
    const records = data || [];
    const present = records.filter(r => r.status === 'present').length;
    const total = records.length;
    res.json({ records, present, total, percentage: total ? Math.round((present / total) * 100) : 0 });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET /attendance/daily/:org_id/:date
router.get('/attendance/daily/:org_id/:date', async (req: Request, res: Response) => {
  const { org_id, date } = req.params;
  try {
    const [studentsRes, attendanceRes] = await Promise.all([
      supabase.from('students').select('id, full_name, roll_number, class_id, section_id, classes:classes!students_class_id_fkey(name), sections:sections!students_section_id_fkey(name)').eq('organisation_id', org_id),
      supabase.from('attendance').select('*, student:students(id, full_name, roll_number, class_id, classes:classes!students_class_id_fkey(name))').eq('organisation_id', org_id).eq('date', date)
    ]);
    const students = studentsRes.data || [];
    const attendance = attendanceRes.data || [];
    const marked = attendance.length;
    const present = attendance.filter((a: any) => a.status === 'present').length;
    const absent = attendance.filter((a: any) => a.status === 'absent').length;
    const late = attendance.filter((a: any) => a.status === 'late').length;
    const byClass: Record<string, { total: number; present: number; absent: number; late: number; marked: number }> = {};
    students.forEach(s => {
      const cls = (s as any).classes?.name || 'Unknown';
      if (!byClass[cls]) byClass[cls] = { total: 0, present: 0, absent: 0, late: 0, marked: 0 };
      byClass[cls].total++;
    });
    attendance.forEach((a: any) => {
      const cls = a.student?.classes?.name || 'Unknown';
      if (!byClass[cls]) byClass[cls] = { total: 0, present: 0, absent: 0, late: 0, marked: 0 };
      byClass[cls].marked++;
      if (a.status === 'present') byClass[cls].present++;
      else if (a.status === 'absent') byClass[cls].absent++;
      else if (a.status === 'late') byClass[cls].late++;
    });
    res.json({ date, totalStudents: students.length, marked, present, absent, late, byClass });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET /attendance-report/:org_id
router.get('/attendance-report/:org_id', async (req: Request, res: Response) => {
  try {
    const [studentsRes, attendanceRes] = await Promise.all([
      supabase.from('students').select('id, full_name, roll_number, class_id, section_id, classes:classes!students_class_id_fkey(name), sections:sections!students_section_id_fkey(name)').eq('organisation_id', req.params.org_id),
      supabase.from('attendance').select('*, student:students(id, full_name, roll_number, class_id, classes:classes!students_class_id_fkey(name))')
        .eq('organisation_id', req.params.org_id).order('date', { ascending: false }).limit(5000)
    ]);
    const students = studentsRes.data || [];
    const attendance = attendanceRes.data || [];
    const totalStudents = students.length;
    const totalRecords = attendance.length;
    const presentCount = attendance.filter((a: any) => a.status === 'present').length;
    const absentCount = attendance.filter((a: any) => a.status === 'absent').length;
    const lateCount = attendance.filter((a: any) => a.status === 'late').length;
    const excusedCount = attendance.filter((a: any) => a.status === 'excused').length;
    const overallPercentage = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;
    const attendanceByClass: Record<string, { present: number; total: number }> = {};
    attendance.forEach((a: any) => {
      const cls = a.student?.classes?.name || 'Unknown';
      if (!attendanceByClass[cls]) attendanceByClass[cls] = { present: 0, total: 0 };
      attendanceByClass[cls].total++;
      if (a.status === 'present') attendanceByClass[cls].present++;
    });
    const dailyAttendance: Record<string, { present: number; absent: number; late: number }> = {};
    attendance.forEach((a: any) => {
      const day = a.date || 'Unknown';
      if (!dailyAttendance[day]) dailyAttendance[day] = { present: 0, absent: 0, late: 0 };
      if (a.status === 'present') dailyAttendance[day].present++;
      else if (a.status === 'absent') dailyAttendance[day].absent++;
      else if (a.status === 'late') dailyAttendance[day].late++;
    });
    res.json({ totalStudents, totalRecords, presentCount, absentCount, lateCount, excusedCount, overallPercentage, attendanceByClass, dailyAttendance });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// GET /academic-report/:org_id
router.get('/academic-report/:org_id', async (req: Request, res: Response) => {
  try {
    const [studentsRes, gradesRes] = await Promise.all([
      supabase.from('students').select('id, full_name, roll_number, class_id, classes:classes!students_class_id_fkey(name)').eq('organisation_id', req.params.org_id),
      supabase.from('grades').select('*, student:students(id, full_name, roll_number, class_id, classes:classes!students_class_id_fkey(name))')
        .eq('organisation_id', req.params.org_id).order('created_at', { ascending: false }).limit(5000)
    ]);
    const students = studentsRes.data || [];
    const grades = gradesRes.data || [];
    const totalStudents = students.length;
    const totalGrades = grades.length;
    const gradeValues = grades.map((g: any) => parseFloat(g.grade)).filter((v: number) => !isNaN(v));
    const averageGrade = gradeValues.length > 0 ? Math.round((gradeValues.reduce((a: number, b: number) => a + b, 0) / gradeValues.length) * 10) / 10 : 0;
    const passCount = gradeValues.filter(v => v >= 40).length;
    const failCount = gradeValues.filter(v => v < 40).length;
    res.json({ totalStudents, totalGrades, averageGrade, passCount, failCount, passPercentage: gradeValues.length > 0 ? Math.round((passCount / gradeValues.length) * 100) : 0 });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
