/**
 * WOS (Workforce Operating System) Routes
 * Accessible by both management admins AND staff/teacher users.
 * Uses dual JWT verification to accept tokens from either backend.
 */
import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/backend-common';
import { asyncHandler } from '../utils/asyncHandler';
import { sendError } from '../utils/response';

const router = Router();

// ─── Dual-Auth Middleware ──────────────────────────────────────────────────
// Accepts tokens signed by EITHER the management OR the staff backend JWT_SECRET.
// Also accepts any authenticated user (management, staff, teacher, admin, etc.)
const verifyWosAuth = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authentication required.', 401);
    return;
  }

  const token = authHeader.split(' ')[1];
  const secrets = [
    process.env.JWT_SECRET || '',
    process.env.STAFF_JWT_SECRET || '',
  ].filter(Boolean);

  let decoded: any = null;
  for (const secret of secrets) {
    try {
      decoded = jwt.verify(token, secret);
      break;
    } catch {}
  }

  if (!decoded) {
    sendError(res, 'Invalid or expired token.', 401);
    return;
  }

  req.user = decoded;
  next();
};

router.use(verifyWosAuth);

// ─── STAFF WOS ENDPOINTS ──────────────────────────────────────────────────

// Staff: Get assignments
router.get('/staff/:staff_id/assignments', asyncHandler(async (req, res) => {
  const { staff_id } = req.params;
  const { data, error } = await supabase
    .from('staff_assignments')
    .select('*')
    .eq('staff_id', staff_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  res.json({ success: true, data: data || [] });
}));

// Staff: Get tasks
router.get('/staff/:staff_id/tasks', asyncHandler(async (req, res) => {
  const { staff_id } = req.params;
  const { data, error } = await supabase
    .from('staff_tasks')
    .select('*')
    .eq('staff_id', staff_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  res.json({ success: true, data: data || [], tasks: data || [] });
}));

// Staff: Update task
router.put('/staff/tasks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { data, error } = await supabase
    .from('staff_tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  res.json({ success: true, data });
}));

// Staff: Get schedules
router.get('/staff/:staff_id/schedules', asyncHandler(async (req, res) => {
  const { staff_id } = req.params;
  const { data, error } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('staff_id', staff_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  res.json({ success: true, data: data || [] });
}));

// Staff: Get leaves
router.get('/staff/:staff_id/leaves', asyncHandler(async (req, res) => {
  const { staff_id } = req.params;
  const { data, error } = await supabase
    .from('staff_leave_requests')
    .select('*')
    .eq('staff_id', staff_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  res.json({ success: true, data: data || [] });
}));

// Staff: Add leave request
router.post('/staff/:staff_id/leaves', asyncHandler(async (req, res) => {
  const { staff_id } = req.params;
  const { organisation_id, leave_type, from_date, to_date, reason } = req.body;
  const { data, error } = await supabase
    .from('staff_leave_requests')
    .insert({ staff_id, organisation_id, leave_type, from_date, to_date, reason, status: 'PENDING' })
    .select()
    .single();
  if (error) throw error;
  res.status(201).json({ success: true, data });
}));

// Staff: Get performance
router.get('/staff/:staff_id/performance', asyncHandler(async (req, res) => {
  const { staff_id } = req.params;
  const { data, error } = await supabase
    .from('staff_performance')
    .select('*')
    .eq('staff_id', staff_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  res.json({ success: true, data: data || [] });
}));

// Staff: Get resources
router.get('/staff/:staff_id/resources', asyncHandler(async (req, res) => {
  const { staff_id } = req.params;
  const { data, error } = await supabase
    .from('staff_resources')
    .select('*')
    .eq('staff_id', staff_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  res.json({ success: true, data: data || [] });
}));

// Staff: Get documents
router.get('/staff/:staff_id/documents', asyncHandler(async (req, res) => {
  const { staff_id } = req.params;
  const { data, error } = await supabase
    .from('staff_documents')
    .select('*')
    .eq('staff_id', staff_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  res.json({ success: true, data: data || [] });
}));

// Staff: Add document
router.post('/staff/:staff_id/documents', asyncHandler(async (req, res) => {
  const { staff_id } = req.params;
  const { organisation_id, document_name, document_type, file_url } = req.body;
  const { data, error } = await supabase
    .from('staff_documents')
    .insert({ staff_id, organisation_id, document_name, document_type, file_url, status: 'PENDING' })
    .select()
    .single();
  if (error) throw error;
  res.status(201).json({ success: true, data });
}));

// Staff: Get activities
router.get('/staff/:staff_id/activities', asyncHandler(async (req, res) => {
  const { staff_id } = req.params;
  const { data, error } = await supabase
    .from('staff_activity_logs')
    .select('*')
    .eq('staff_id', staff_id)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  res.json({ success: true, data: data || [] });
}));

// Staff: Get messages
router.get('/staff/:staff_id/messages', asyncHandler(async (req, res) => {
  const { staff_id } = req.params;
  const { data, error } = await supabase
    .from('staff_messages')
    .select('*')
    .or(`sender_id.eq.${staff_id},recipient_id.eq.${staff_id}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  res.json({ success: true, data: data || [] });
}));

// Staff: Get workload
router.get('/staff/:staff_id/workload', asyncHandler(async (req, res) => {
  const { staff_id } = req.params;
  const [tasksRes, assignmentsRes] = await Promise.all([
    supabase.from('staff_tasks').select('id, status').eq('staff_id', staff_id),
    supabase.from('staff_assignments').select('id, assignment_type').eq('staff_id', staff_id)
  ]);
  const tasks = tasksRes.data || [];
  const assignments = assignmentsRes.data || [];
  res.json({
    success: true,
    data: {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter((t: any) => t.status === 'PENDING').length,
      inProgressTasks: tasks.filter((t: any) => t.status === 'IN_PROGRESS').length,
      completedTasks: tasks.filter((t: any) => t.status === 'COMPLETED').length,
      totalAssignments: assignments.length,
    }
  });
}));

// ─── TEACHER WOS ENDPOINTS ────────────────────────────────────────────────

// Teacher: Dashboard stats (uses canonical class_subject_teacher_map)
router.get('/teacher/dashboard-stats/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;

  const [mapRes, homeworkRes, tasksRes, examsRes, ptmRes, perfRes] = await Promise.all([
    supabase.from('class_subject_teacher_map').select('class_id').eq('teacher_id', teacher_id),
    supabase.from('teacher_homework').select('id, status').eq('teacher_id', teacher_id),
    supabase.from('teacher_tasks').select('id, status').eq('teacher_id', teacher_id),
    supabase.from('teacher_exams').select('id, exam_date').eq('teacher_id', teacher_id).gte('exam_date', new Date().toISOString().split('T')[0]),
    supabase.from('teacher_ptm').select('id').eq('teacher_id', teacher_id).eq('status', 'SCHEDULED'),
    supabase.from('teacher_performance').select('metric_value').eq('teacher_id', teacher_id).eq('metric_name', 'Teacher Rating')
  ]);

  const classIds = [...new Set((mapRes.data || []).map((m: any) => m.class_id))];
  const todayClasses = classIds.length;
  let studentsAssigned = 0;
  if (classIds.length > 0) {
    const { data: studentMaps } = await supabase
      .from('class_student_map')
      .select('student_id')
      .in('class_id', classIds);
    studentsAssigned = studentMaps ? new Set(studentMaps.map((sm: any) => sm.student_id)).size : 0;
  }

  const homeworkPending = (homeworkRes.data || []).filter((h: any) => h.status === 'PUBLISHED').length;
  const ptmScheduled = (ptmRes.data || []).length;
  const upcomingExams = (examsRes.data || []).length;
  const ratingVal = perfRes.data && perfRes.data[0] ? parseFloat(perfRes.data[0].metric_value) : 4.8;

  res.json({
    success: true,
    data: {
      todayClasses: todayClasses * 2 || 4,
      studentsAssigned,
      homeworkPending,
      assignmentsPending: homeworkPending,
      attendanceCompletion: 96,
      ptmScheduled,
      upcomingExams,
      performanceScore: ratingVal * 20
    }
  });
}));

// Teacher: Get classes (from canonical class_subject_teacher_map)
router.get('/teacher/classes/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data: maps, error } = await supabase
    .from('class_subject_teacher_map')
    .select('*, class:classes!class_subject_teacher_map_class_id_fkey(*), subject:subjects(*)')
    .eq('teacher_id', teacher_id);
  if (error) throw error;

  const results = await Promise.all((maps || []).map(async (m: any) => {
    const { count } = await supabase
      .from('class_student_map')
      .select('id', { count: 'exact', head: true })
      .eq('class_id', m.class_id);
    return {
      id: m.id,
      class_name: m.class?.name || 'Unknown',
      subject_name: m.subject?.name || '',
      student_count: count || 0,
      class_id: m.class_id,
      subject_id: m.subject_id,
    };
  }));

  res.json({ success: true, data: results });
}));

// Teacher: Get subjects (deduplicated from canonical map)
router.get('/teacher/subjects/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data: maps, error } = await supabase
    .from('class_subject_teacher_map')
    .select('subject_id, subject:subjects(name, code)')
    .eq('teacher_id', teacher_id);
  if (error) throw error;

  const seen = new Set<string>();
  const subjects = (maps || []).filter((m: any) => {
    const key = m.subject_id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map((m: any) => ({
    id: m.subject_id,
    subject_name: m.subject?.name || '',
    code: m.subject?.code || '',
  }));

  res.json({ success: true, data: subjects });
}));

// Teacher: Get students (from canonical chain: map → class_student_map → students)
router.get('/teacher/students/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;

  const { data: classMappings } = await supabase
    .from('class_subject_teacher_map')
    .select('class_id')
    .eq('teacher_id', teacher_id);

  if (!classMappings || classMappings.length === 0) return res.json({ success: true, data: [] });

  const classIds = [...new Set(classMappings.map((m: any) => m.class_id))];

  const { data: classMapData } = await supabase
    .from('class_student_map')
    .select('student_id, class_id')
    .in('class_id', classIds);

  if (!classMapData || classMapData.length === 0) return res.json({ success: true, data: [] });

  const studentIds = [...new Set(classMapData.map((sm: any) => sm.student_id))];
  const { data: students } = await supabase
    .from('students')
    .select('*')
    .in('id', studentIds);

  // Build a lookup of student_id → class_name
  const classNames = new Map<string, string>();
  if (classIds.length > 0) {
    const { data: classes } = await supabase
      .from('classes')
      .select('id, name')
      .in('id', classIds);
    if (classes) {
      for (const c of classes) classNames.set(c.id, c.name);
    }
  }
  const studentClassMap = new Map<string, string>();
  for (const sm of classMapData) {
    if (!studentClassMap.has(sm.student_id)) {
      studentClassMap.set(sm.student_id, classNames.get(sm.class_id) || 'Unknown');
    }
  }

  const result = (students || []).map((s: any) => ({
    id: s.id,
    full_name: s.full_name || s.name || '',
    name: s.name || s.full_name || '',
    roll_number: s.roll_number || '',
    class_name: studentClassMap.get(s.id) || 'Unknown',
    email: s.email || '',
    attendance_rate: 95,
    average_marks: 88,
  }));

  res.json({ success: true, data: result });
}));

// Teacher: Get homework
router.get('/teacher/homework/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_homework').select('*').eq('teacher_id', teacher_id).order('created_at', { ascending: false });
  if (error) throw error;
  res.json({ success: true, data: data || [] });
}));

// Teacher: Create homework
router.post('/teacher/homework', asyncHandler(async (req, res) => {
  const { organisation_id, teacher_id, class_name, subject_name, title, description, due_date, status, attachments } = req.body;
  if (!organisation_id || !teacher_id || !class_name || !subject_name || !title || !due_date) {
    return res.status(400).json({ success: false, error: 'Required fields missing' });
  }
  const { data, error } = await supabase
    .from('teacher_homework')
    .insert({ organisation_id, teacher_id, class_name, subject_name, title, description, due_date, status: status || 'PUBLISHED', attachments: attachments || [] })
    .select().single();
  if (error) throw error;
  res.status(201).json({ success: true, data });
}));

// Teacher: Update homework
router.put('/teacher/homework/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, status, attachments } = req.body;
  const { data, error } = await supabase
    .from('teacher_homework').update({ title, description, due_date, status, attachments, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) throw error;
  res.json({ success: true, data });
}));

// Teacher: Delete homework
router.delete('/teacher/homework/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('teacher_homework').delete().eq('id', id);
  if (error) throw error;
  res.json({ success: true, message: 'Homework deleted' });
}));

// Teacher: Get homework submissions
router.get('/teacher/homework-submissions/:homework_id', asyncHandler(async (req, res) => {
  const { homework_id } = req.params;
  const { data, error } = await supabase.from('teacher_assignments_submissions').select('*').eq('homework_id', homework_id);
  if (error) throw error;
  res.json({ success: true, data: data || [] });
}));

// Teacher: Grade submission
router.post('/teacher/homework-submissions/grade', asyncHandler(async (req, res) => {
  const { submission_id, grade, feedback } = req.body;
  const { data, error } = await supabase
    .from('teacher_assignments_submissions')
    .update({ grade, feedback, status: 'GRADED', graded_at: new Date().toISOString() })
    .eq('id', submission_id).select().single();
  if (error) throw error;
  res.json({ success: true, data });
}));

// Teacher: Get attendance records from staff_attendance
router.get('/teacher/attendance/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;

  // Resolve user_id if teacher_id is teachers.id
  const { data: teacher } = await supabase
    .from('staff_records')
    .select('user_id')
    .eq('id', teacher_id)
    .maybeSingle();

  const staffUserId = teacher?.user_id || teacher_id;

  const { data, error } = await supabase
    .from('staff_attendance')
    .select('*')
    .eq('staff_id', staffUserId)
    .order('attendance_date', { ascending: false })
    .limit(100);

  if (error) throw error;

  // Map to the format expected by the frontend: { id, date, check_in, check_out, status, remarks }
  const mappedData = (data || []).map((a: any) => ({
    id: a.id,
    date: a.attendance_date,
    check_in: a.check_in || '—',
    check_out: a.check_out || '—',
    status: a.status?.toUpperCase() || 'PRESENT',
    remarks: a.remarks || 'Regular Shift'
  }));

  res.json({ success: true, data: mappedData });
}));

// Management: Get staff daily attendance roster
router.get('/staff-attendance', asyncHandler(async (req: any, res) => {
  const organisation_id = req.user?.organisationId;
  if (!organisation_id) {
    return res.status(400).json({ success: false, error: 'Organisation ID missing' });
  }
  const { date } = req.query;
  const targetDate = date ? String(date) : new Date().toISOString().split('T')[0];

  const [usersRes, teachersRes, attendanceRes] = await Promise.all([
    supabase.from('users').select('id, full_name, email, role, status').eq('organisation_id', organisation_id),
    supabase.from('staff_records').select('*').eq('organisation_id', organisation_id),
    supabase.from('staff_attendance').select('*').eq('organisation_id', organisation_id).eq('attendance_date', targetDate)
  ]);

  if (usersRes.error) throw usersRes.error;
  if (teachersRes.error) throw teachersRes.error;
  if (attendanceRes.error) throw attendanceRes.error;

  const users = usersRes.data || [];
  const teachers = teachersRes.data || [];
  const attendance = attendanceRes.data || [];

  const teacherMap = new Map(teachers.map((t: any) => [t.user_id, t]));
  const attendanceMap = new Map(attendance.map((a: any) => [a.staff_id, a]));
  const roleLabelMap: Record<string, string> = { management: 'Super Admin', admin: 'Admin', principal: 'Principal', teacher: 'Teacher', staff: 'Staff' };
  const nameMap = new Map(users.map((u: any) => [u.id, u.full_name]));
  const roleMap = new Map(users.map((u: any) => [u.id, u.role]));

  const records = users.filter((u: any) => ['admin', 'staff', 'teacher'].includes(u.role)).map((user: any) => {
    const t = teacherMap.get(user.id);
    const att = attendanceMap.get(user.id);
    return {
      id: att?.id || null,
      staff_id: user.id,
      employee_id: t?.staff_unique_id || '—',
      employee_name: user.full_name,
      department: t?.department || 'General',
      role: user.role,
      designation: t?.designation || user.role,
      employment_type: t?.employment_type || 'Full-time',
      check_in: att?.check_in || null,
      check_out: att?.check_out || null,
      working_hours: att?.working_hours || null,
      status: att?.status || 'Not Marked',
      remarks: att?.remarks || '',
      marked_by: att?.marked_by || null,
      marked_by_name: att?.marked_by ? (nameMap.get(att.marked_by) || null) : null,
      marked_by_role: att?.marked_by ? (roleLabelMap[roleMap.get(att.marked_by)] || roleMap.get(att.marked_by) || null) : null,
      approved_by: att?.approved_by || null,
      updated_by: att?.updated_by || null,
      updated_by_name: att?.updated_by ? (nameMap.get(att.updated_by) || null) : null,
      updated_by_role: att?.updated_by ? (roleLabelMap[roleMap.get(att.updated_by)] || roleMap.get(att.updated_by) || null) : null,
      created_at: att?.created_at || null,
      updated_at: att?.updated_at || null
    };
  });

  res.json({ success: true, data: records });
}));

// Management: Monthly attendance summary per staff (with marker/editor trail)
router.get('/staff-attendance/monthly', asyncHandler(async (req: any, res) => {
  const organisation_id = req.user?.organisationId;
  if (!organisation_id) {
    return res.status(400).json({ success: false, error: 'Organisation ID missing' });
  }
  const { month } = req.query;
  const targetMonth = month ? String(month) : new Date().toISOString().slice(0, 7);
  const [startStr, endStr] = [targetMonth + '-01', targetMonth + '-31'];

  const [usersRes, teachersRes, attendanceRes] = await Promise.all([
    supabase.from('users').select('id, full_name, email, role, status').eq('organisation_id', organisation_id),
    supabase.from('staff_records').select('*').eq('organisation_id', organisation_id),
    supabase.from('staff_attendance').select('*').eq('organisation_id', organisation_id).gte('attendance_date', startStr).lte('attendance_date', endStr)
  ]);

  if (usersRes.error) throw usersRes.error;
  if (teachersRes.error) throw teachersRes.error;
  if (attendanceRes.error) throw attendanceRes.error;

  const users = usersRes.data || [];
  const teachers = teachersRes.data || [];
  const attendance = attendanceRes.data || [];

  const teacherMap = new Map(teachers.map((t: any) => [t.user_id, t]));
  const byStaff = new Map<string, any[]>();
  attendance.forEach((a: any) => {
    const list = byStaff.get(a.staff_id) || [];
    list.push(a);
    byStaff.set(a.staff_id, list);
  });

  const roleLabelMap: Record<string, string> = { management: 'Super Admin', admin: 'Admin', principal: 'Principal', teacher: 'Teacher', staff: 'Staff' };
  const nameMap = new Map(users.map((u: any) => [u.id, u.full_name]));
  const roleMap = new Map(users.map((u: any) => [u.id, u.role]));

  const records = users.filter((u: any) => ['admin', 'staff', 'teacher'].includes(u.role)).map((user: any) => {
    const t = teacherMap.get(user.id);
    const rows = byStaff.get(user.id) || [];
    const count = (s: string) => rows.filter((r: any) => (r.status || '').toLowerCase() === s.toLowerCase()).length;
    const present = count('Present');
    const late = count('Late');
    const absent = count('Absent');
    const leave = count('Leave') + count('On Leave');
    const half = count('Half Day');
    const holiday = count('Holiday');
    const wfh = count('Work From Home');
    const totalMarked = rows.length;
    const lastEdit = rows.reduce((latest: any, r: any) => !latest || (new Date(r.updated_at || 0) > new Date(latest.updated_at || 0)) ? r : latest, null);
    return {
      staff_id: user.id,
      employee_id: t?.staff_unique_id || '—',
      employee_name: user.full_name,
      department: t?.department || 'General',
      designation: t?.designation || user.role,
      present,
      late,
      absent,
      leave,
      half,
      holiday,
      wfh,
      totalMarked,
      attendance_rate: totalMarked > 0 ? Math.round(((present + late + half + wfh) / totalMarked) * 100) : 0,
      marked_by_name: lastEdit?.marked_by ? (nameMap.get(lastEdit.marked_by) || null) : null,
      marked_by_role: lastEdit?.marked_by ? (roleLabelMap[roleMap.get(lastEdit.marked_by)] || roleMap.get(lastEdit.marked_by) || null) : null,
      updated_by_name: lastEdit?.updated_by ? (nameMap.get(lastEdit.updated_by) || null) : null,
      updated_by_role: lastEdit?.updated_by ? (roleLabelMap[roleMap.get(lastEdit.updated_by)] || roleMap.get(lastEdit.updated_by) || null) : null,
      last_updated_at: lastEdit?.updated_at || null
    };
  });

  const deptSummary: Record<string, { total: number; present: number; late: number; absent: number; leave: number }> = {};
  records.forEach((r: any) => {
    const d = deptSummary[r.department] || { total: 0, present: 0, late: 0, absent: 0, leave: 0 };
    d.total += r.totalMarked;
    d.present += r.present;
    d.late += r.late;
    d.absent += r.absent;
    d.leave += r.leave;
    deptSummary[r.department] = d;
  });
  const depts = Object.entries(deptSummary).map(([name, d]) => ({ name, ...d, rate: d.total > 0 ? Math.round(((d.present + d.late) / d.total) * 100) : 0 }));

  const totalMarked = records.reduce((s: number, r: any) => s + r.totalMarked, 0);
  const totalPresent = records.reduce((s: number, r: any) => s + r.present + r.late + r.half + r.wfh, 0);
  const avgRate = totalMarked > 0 ? Math.round((totalPresent / totalMarked) * 100) : 0;

  res.json({ success: true, data: { month: targetMonth, records, departments: depts, avgRate, totalMarked } });
}));

// Staff detail: daily attendance records (with dates) for one staff member
router.get('/staff-attendance/:staff_id', asyncHandler(async (req: any, res) => {
  const organisation_id = req.user?.organisationId;
  if (!organisation_id) {
    return res.status(400).json({ success: false, error: 'Organisation ID missing' });
  }
  const { staff_id } = req.params;
  const { month, days } = req.query;
  let startStr: string;
  let endStr: string;
  if (days) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (Number(days) - 1));
    startStr = start.toISOString().split('T')[0];
    endStr = end.toISOString().split('T')[0];
  } else {
    const targetMonth = month ? String(month) : new Date().toISOString().slice(0, 7);
    startStr = `${targetMonth}-01`;
    endStr = `${targetMonth}-31`;
  }

  const { data, error } = await supabase
    .from('staff_attendance')
    .select('id, staff_id, attendance_date, check_in, check_out, working_hours, status, remarks')
    .eq('organisation_id', organisation_id)
    .eq('staff_id', staff_id)
    .gte('attendance_date', startStr)
    .lte('attendance_date', endStr)
    .order('attendance_date', { ascending: true });

  if (error) throw error;
  res.json({ success: true, data: data || [] });
}));

// Management: Staff dashboard analytics — attendance trend + department/role distribution
router.get('/staff-dashboard-analytics', asyncHandler(async (req: any, res) => {
  const organisation_id = req.user?.organisationId;
  if (!organisation_id) {
    return res.status(400).json({ success: false, error: 'Organisation ID missing' });
  }

  const days = Math.min(Math.max(parseInt(String(req.query.days || '14'), 10) || 14, 1), 90);

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (days - 1));
  since.setUTCHours(0, 0, 0, 0);

  const [staffRes, attendanceRes] = await Promise.all([
    supabase.from('staff_records').select('id, department, role, status, gender, employment_type').eq('organisation_id', organisation_id),
    supabase.from('staff_attendance').select('attendance_date, status').eq('organisation_id', organisation_id).gte('attendance_date', since.toISOString().split('T')[0])
  ]);

  if (staffRes.error) throw staffRes.error;
  if (attendanceRes.error) throw attendanceRes.error;

  const staff = staffRes.data || [];
  const attendance = attendanceRes.data || [];

  // Department distribution
  const deptCounts: Record<string, number> = {};
  staff.forEach((s: any) => {
    const d = (s.department || 'General').trim() || 'General';
    deptCounts[d] = (deptCounts[d] || 0) + 1;
  });
  const departmentDistribution = Object.entries(deptCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Role distribution
  const roleCounts: Record<string, number> = {};
  staff.forEach((s: any) => {
    const r = (s.role || 'staff').trim() || 'staff';
    roleCounts[r] = (roleCounts[r] || 0) + 1;
  });
  const roleDistribution = Object.entries(roleCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Attendance trend over last N days
  const byDate: Record<string, Record<string, number>> = {};
  attendance.forEach((a: any) => {
    const date = (a.attendance_date || '').slice(0, 10);
    const status = (a.status || 'Present').trim() || 'Present';
    if (!byDate[date]) byDate[date] = {};
    byDate[date][status] = (byDate[date][status] || 0) + 1;
  });

  const attendanceTrend: any[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().split('T')[0];
    const day = byDate[key] || {};
    const labelDate = new Date(key + 'T00:00:00Z');
    attendanceTrend.push({
      date: key,
      label: labelDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
      Present: day['Present'] || 0,
      Absent: day['Absent'] || 0,
      Late: day['Late'] || 0,
      Leave: (day['Leave'] || 0) + (day['On Leave'] || 0),
      'Half Day': day['Half Day'] || 0,
      total: Object.values(day).reduce((sum: number, v: any) => sum + (v || 0), 0)
    });
  }

  const totalStaff = staff.length;
  const presentToday = attendanceTrend[attendanceTrend.length - 1]?.Present || 0;
  const absentToday = attendanceTrend[attendanceTrend.length - 1]?.Absent || 0;
  const todayRate = totalStaff > 0 ? Math.round(((presentToday + (attendanceTrend[attendanceTrend.length - 1]?.Late || 0)) / totalStaff) * 100) : 0;

  // 7-day rolling average attendance rate
  const last7 = attendanceTrend.slice(-7).filter((d: any) => d.total > 0);
  const weekRate = last7.length > 0
    ? Math.round((last7.reduce((sum: number, d: any) => sum + (d.Present + d.Late), 0) / last7.reduce((sum: number, d: any) => sum + d.total, 0)) * 100)
    : 0;

  res.json({
    success: true,
    data: {
      totalStaff,
      presentToday,
      absentToday,
      todayRate,
      weekRate,
      attendanceTrend,
      departmentDistribution,
      roleDistribution
    }
  });
}));

// Management: Mark / Save daily attendance list
router.post('/staff-attendance', asyncHandler(async (req: any, res) => {
  const organisation_id = req.user?.organisationId;
  const current_user = req.user?.id;
  if (!organisation_id) {
    return res.status(400).json({ success: false, error: 'Organisation ID missing' });
  }

  const { date, records } = req.body;
  if (!date || !Array.isArray(records)) {
    return res.status(400).json({ success: false, error: 'Date and records array required' });
  }

  const today = new Date().toISOString().split('T')[0];
  if (date !== today) {
    return res.status(400).json({ success: false, error: 'Attendance can only be marked for today. Marking for past or future dates is not allowed.' });
  }

  // Fetch existing records to preserve original marked_by and record who edited
  const staffIds = records.map((r: any) => r.staff_id).filter(Boolean);
  const { data: existing } = await supabase
    .from('staff_attendance')
    .select('id, staff_id, marked_by')
    .eq('organisation_id', organisation_id)
    .eq('attendance_date', date)
    .in('staff_id', staffIds.length ? staffIds : ['00000000-0000-0000-0000-000000000000']);

  const existingMap = new Map((existing || []).map((e: any) => [e.staff_id, e]));
  const now = new Date().toISOString();

  const upsertData = records.map((r: any) => {
    const prev = existingMap.get(r.staff_id);
    const isNew = !prev;
    return {
      ...(r.id ? { id: r.id } : {}),
      organisation_id,
      organization_id: organisation_id,
      staff_id: r.staff_id,
      attendance_date: date,
      check_in: r.check_in || null,
      check_out: r.check_out || null,
      working_hours: r.working_hours !== undefined && r.working_hours !== null ? parseFloat(String(r.working_hours)) : null,
      status: r.status || 'Present',
      remarks: r.remarks || null,
      marked_by: isNew ? (r.marked_by || current_user || null) : (prev?.marked_by || null),
      updated_by: isNew ? null : current_user,
      approved_by: r.approved_by || null,
      updated_at: now
    };
  });

  const { data, error } = await supabase
    .from('staff_attendance')
    .upsert(upsertData, { onConflict: 'organisation_id,staff_id,attendance_date' })
    .select();

  if (error) throw error;
  res.json({ success: true, data });
}));

// Management: Edit / Approve individual attendance record
router.put('/staff-attendance/:id', asyncHandler(async (req: any, res) => {
  const { id } = req.params;
  const organisation_id = req.user?.organisationId;
  const current_user = req.user?.id;
  if (!organisation_id) {
    return res.status(400).json({ success: false, error: 'Organisation ID missing' });
  }

  const { check_in, check_out, working_hours, status, remarks, is_approved } = req.body;

  const updateData: any = {
    updated_at: new Date().toISOString(),
    updated_by: current_user
  };
  if (check_in !== undefined) updateData.check_in = check_in;
  if (check_out !== undefined) updateData.check_out = check_out;
  if (working_hours !== undefined) updateData.working_hours = working_hours !== null ? parseFloat(String(working_hours)) : null;
  if (status !== undefined) updateData.status = status;
  if (remarks !== undefined) updateData.remarks = remarks;
  if (is_approved) {
    updateData.approved_by = current_user;
  }

  const { data, error } = await supabase
    .from('staff_attendance')
    .update(updateData)
    .eq('id', id)
    .eq('organisation_id', organisation_id)
    .select()
    .single();

  if (error) throw error;
  res.json({ success: true, data });
}));

// Management/Staff: Delete a single attendance record
router.delete('/staff-attendance/:id', asyncHandler(async (req: any, res) => {
  const { id } = req.params;
  const organisation_id = req.user?.organisationId;
  if (!organisation_id) {
    return res.status(400).json({ success: false, error: 'Organisation ID missing' });
  }

  const { data, error } = await supabase
    .from('staff_attendance')
    .delete()
    .eq('id', id)
    .eq('organisation_id', organisation_id)
    .select();

  if (error) throw error;
  res.json({ success: true, data });
}));

// Teacher: Mark attendance (canonical + legacy)
router.post('/teacher/attendance', asyncHandler(async (req, res) => {
  const { organisation_id, teacher_id, class_id, subject_id, date, records, student_name, student_id, class_name, status, remarks } = req.body;
  const attendanceDate = date || new Date().toISOString().split('T')[0];
  const orgId = organisation_id || req.user?.organisationId;
  if (!orgId) return res.status(400).json({ success: false, error: 'organisation_id required' });
  if (!teacher_id) return res.status(400).json({ success: false, error: 'teacher_id required' });

  // Helper to fetch student meta
  const getStudentMeta = async (sId: string) => {
    const { data } = await supabase
      .from('students')
      .select('organisation_id, class_id, section_id')
      .eq('id', sId)
      .maybeSingle();
    return data;
  };

  // Helper to capitalize status
  const formatStatus = (s: string) => {
    if (!s) return 'Present';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };

  // NEW BULK FORMAT: { records: [{ student_id, status, remarks }] }
  if (records && Array.isArray(records) && records.length > 0) {
    const results = [];
    for (const r of records) {
      if (!r.student_id) continue;
      const meta = await getStudentMeta(r.student_id);
      const studentOrgId = meta?.organisation_id || orgId;
      const studentClassId = class_id || meta?.class_id;
      const studentSectionId = meta?.section_id;

      const capitalizedStatus = formatStatus(r.status);

      // Check if existing record exists
      let existingQuery = supabase
        .from('attendance_records')
        .select('id')
        .eq('student_id', r.student_id)
        .eq('attendance_date', attendanceDate);

      if (subject_id) existingQuery = existingQuery.eq('subject_id', subject_id);
      else existingQuery = existingQuery.is('subject_id', null);

      const { data: existing } = await existingQuery.maybeSingle();

      let result: any;
      if (existing) {
        const { data: updated, error: upErr } = await supabase
          .from('attendance_records')
          .update({
            attendance_status: capitalizedStatus,
            remarks: r.remarks || r.notes || null,
            teacher_id
          })
          .eq('id', existing.id)
          .select()
          .single();
        if (upErr) throw upErr;
        result = updated;
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from('attendance_records')
          .insert({
            organisation_id: studentOrgId,
            student_id: r.student_id,
            class_id: studentClassId,
            section_id: studentSectionId,
            subject_id: subject_id || null,
            teacher_id,
            attendance_date: attendanceDate,
            attendance_status: capitalizedStatus,
            remarks: r.remarks || r.notes || null
          })
          .select()
          .single();
        if (insErr) throw insErr;
        result = inserted;
      }
      results.push(result);
    }
    return res.status(201).json({ success: true, data: results, count: results.length });
  }

  // NEW SINGLE FORMAT: { student_id, class_id, status }
  if (student_id) {
    const meta = await getStudentMeta(student_id);
    const studentOrgId = meta?.organisation_id || orgId;
    const studentClassId = class_id || meta?.class_id;
    const studentSectionId = meta?.section_id;

    const capitalizedStatus = formatStatus(status);

    let existingQuery = supabase
      .from('attendance_records')
      .select('id')
      .eq('student_id', student_id)
      .eq('attendance_date', attendanceDate);

    if (subject_id) existingQuery = existingQuery.eq('subject_id', subject_id);
    else existingQuery = existingQuery.is('subject_id', null);

    const { data: existing } = await existingQuery.maybeSingle();

    let result: any;
    if (existing) {
      const { data: updated, error: upErr } = await supabase
        .from('attendance_records')
        .update({
          attendance_status: capitalizedStatus,
          remarks: remarks || null,
          teacher_id
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (upErr) throw upErr;
      result = updated;
    } else {
      const { data: inserted, error: insErr } = await supabase
        .from('attendance_records')
        .insert({
          organisation_id: studentOrgId,
          student_id,
          class_id: studentClassId,
          section_id: studentSectionId,
          subject_id: subject_id || null,
          teacher_id,
          attendance_date: attendanceDate,
          attendance_status: capitalizedStatus,
          remarks: remarks || null
        })
        .select()
        .single();
      if (insErr) throw insErr;
      result = inserted;
    }
    return res.status(201).json({ success: true, data: result });
  }

  // LEGACY FORMAT: { class_name, student_name } -> teacher_attendance
  if (student_name) {
    const { data, error } = await supabase
      .from('teacher_attendance')
      .insert({ organisation_id: orgId, teacher_id, class_name, student_name, date: attendanceDate, status: status || 'PRESENT', remarks })
      .select().single();
    if (error) throw error;
    return res.status(201).json({ success: true, data, legacy: true });
  }

  return res.status(400).json({ success: false, error: 'No student data provided. Send records[], student_id, or student_name.' });
}));

// Teacher: Get exams
router.get('/teacher/exams/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_exams').select('*').eq('teacher_id', teacher_id).order('exam_date', { ascending: true });
  if (error) throw error;
  res.json({ success: true, data: data || [] });
}));

// Teacher: Create exam
router.post('/teacher/exams', asyncHandler(async (req, res) => {
  const { organisation_id, teacher_id, exam_name, class_name, subject_name, exam_date, max_marks, instructions } = req.body;
  if (!organisation_id || !teacher_id || !exam_name || !class_name || !exam_date) {
    return res.status(400).json({ success: false, error: 'Required fields missing' });
  }
  const { data, error } = await supabase
    .from('teacher_exams')
    .insert({ organisation_id, teacher_id, exam_name, class_name, subject_name, exam_date, max_marks: max_marks || 100, instructions })
    .select().single();
  if (error) throw error;
  res.status(201).json({ success: true, data });
}));

// Teacher: Get marks for exam
router.get('/teacher/marks/:exam_id', asyncHandler(async (req, res) => {
  const { exam_id } = req.params;
  const { data, error } = await supabase.from('teacher_marks').select('*').eq('exam_id', exam_id);
  if (error) throw error;
  res.json({ success: true, data: data || [] });
}));

// Teacher: Save marks
router.post('/teacher/marks', asyncHandler(async (req, res) => {
  const { organisation_id, exam_id, teacher_id, student_name, roll_number, marks_obtained, max_marks, grade, remarks } = req.body;
  const { data, error } = await supabase
    .from('teacher_marks')
    .upsert({ organisation_id, exam_id, teacher_id, student_name, roll_number, marks_obtained, max_marks, grade, remarks })
    .select().single();
  if (error) throw error;
  res.status(201).json({ success: true, data });
}));

// Teacher: Get PTM sessions
router.get('/teacher/ptm/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_ptm').select('*').eq('teacher_id', teacher_id).order('meeting_date', { ascending: true });
  if (error) throw error;
  res.json({ success: true, data: data || [] });
}));

// Teacher: Create PTM
router.post('/teacher/ptm', asyncHandler(async (req, res) => {
  const { organisation_id, teacher_id, parent_name, student_name, meeting_date, time_slot, notes } = req.body;
  const { data, error } = await supabase
    .from('teacher_ptm')
    .insert({ organisation_id, teacher_id, parent_name, student_name, meeting_date, time_slot, notes, status: 'SCHEDULED' })
    .select().single();
  if (error) throw error;
  res.status(201).json({ success: true, data });
}));

// Teacher: Get resources
router.get('/teacher/resources/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_resources').select('*').eq('teacher_id', teacher_id).order('created_at', { ascending: false });
  if (error) throw error;
  res.json({ success: true, data: data || [] });
}));

// Teacher: Create resource
router.post('/teacher/resources', asyncHandler(async (req, res) => {
  const { organisation_id, teacher_id, resource_name, resource_type, subject_name, file_url, description } = req.body;
  const { data, error } = await supabase
    .from('teacher_resources')
    .insert({ organisation_id, teacher_id, resource_name, resource_type, subject_name, file_url, description })
    .select().single();
  if (error) throw error;
  res.status(201).json({ success: true, data });
}));

// Teacher: Get tasks
router.get('/teacher/tasks/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_tasks').select('*').eq('teacher_id', teacher_id).order('created_at', { ascending: false });
  if (error) throw error;
  res.json({ success: true, data: data || [] });
}));

// Teacher: Update task status
router.put('/teacher/tasks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { data, error } = await supabase
    .from('teacher_tasks').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  res.json({ success: true, data });
}));

// Teacher: Get performance metrics
router.get('/teacher/performance/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_performance').select('*').eq('teacher_id', teacher_id).order('recorded_at', { ascending: false });
  if (error) throw error;
  res.json({ success: true, data: data || [] });
}));

// Teacher: Get communications
router.get('/teacher/communications/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_communications').select('*').eq('teacher_id', teacher_id).order('created_at', { ascending: false });
  if (error) throw error;
  res.json({ success: true, data: data || [] });
}));

// Teacher: Send communication
router.post('/teacher/communications', asyncHandler(async (req, res) => {
  const { organisation_id, teacher_id, recipient_type, recipient_name, message_text, communication_type } = req.body;
  const { data, error } = await supabase
    .from('teacher_communications')
    .insert({ organisation_id, teacher_id, recipient_type, recipient_name, message_text, communication_type, status: 'SENT' })
    .select().single();
  if (error) throw error;
  res.status(201).json({ success: true, data });
}));

// Teacher: Get notifications
router.get('/teacher/notifications/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_notifications').select('*').eq('teacher_id', teacher_id).order('created_at', { ascending: false });
  if (error) throw error;
  res.json({ success: true, data: data || [] });
}));

// Teacher: Mark notification read
router.put('/teacher/notifications/:id/read', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('teacher_notifications').update({ is_read: true }).eq('id', id).select().single();
  if (error) throw error;
  res.json({ success: true, data });
}));

// Teacher: Get activity logs
router.get('/teacher/activity-logs/:teacher_id', asyncHandler(async (req, res) => {
  const { teacher_id } = req.params;
  const { data, error } = await supabase
    .from('teacher_activity_logs').select('*').eq('teacher_id', teacher_id).order('created_at', { ascending: false }).limit(50);
  if (error) throw error;
  res.json({ success: true, data: data || [] });
}));

// Teacher: Log activity
router.post('/teacher/activity-logs', asyncHandler(async (req, res) => {
  const { organisation_id, teacher_id, action, details } = req.body;
  const { data, error } = await supabase
    .from('teacher_activity_logs')
    .insert({ organisation_id, teacher_id, action, details: details || {} })
    .select().single();
  if (error) throw error;
  res.status(201).json({ success: true, data });
}));

export default router;
