import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { supabase } from '../../config/database';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/errors';

const router = Router();
router.use(authenticate);

// Helper to get org-scoped client
const orgQuery = (orgId: string, table: string) =>
  supabase.from(table).select('*').eq('organisation_id', orgId);

// ==================== STAFF DIRECTORY ====================
router.get('/staff-directory/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase
    .from('users').select('*')
    .eq('organisation_id', orgId).order('full_name');
  if (error) throw new AppError(error.message, 500);
  const staff = (data || []).map((u: any) => ({
    id: u.id,
    full_name: u.full_name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.status || 'active',
    employee_code: u.employee_code,
    department_id: u.department_id,
    department_name: u.department_name,
    designation_name: u.designation_name || u.role,
    joined_at: u.created_at,
    avatar_url: u.avatar_url,
  }));
  res.json({ success: true, data: staff });
}));

router.get('/staff-stats/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
    const sb = supabase;
  const { data: allStaff } = await supabase.from('users').select('id, role, status').eq('organisation_id', orgId);
  const { data: depts } = await supabase.from('staff_departments').select('id').eq('organisation_id', orgId);
  const list = allStaff || [];
  const stats = {
    total_staff: list.length,
    teaching_staff: list.filter((s: any) => s.role === 'teacher').length,
    non_teaching_staff: list.filter((s: any) => s.role !== 'teacher').length,
    active_staff: list.filter((s: any) => s.status === 'active').length,
    on_leave: list.filter((s: any) => s.status === 'on_leave').length,
    new_joiners: list.filter((s: any) => {
      if (!s.created_at) return false;
      return Date.now() - new Date(s.created_at).getTime() < 30 * 24 * 60 * 60 * 1000;
    }).length,
    total_departments: depts?.length || 0,
  };
  res.json({ success: true, data: stats });
}));

// ==================== STAFF ATTENDANCE ====================
router.post('/staff-attendance/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { date, department_id } = req.body;
  let query = supabase.from('staff_attendance').select('*, users(full_name, email, department_name, designation_name)').eq('organisation_id', orgId);
  if (date) query = query.eq('date', date);
  if (department_id) query = query.eq('department_id', department_id);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data: data || [] });
}));

router.post('/staff-attendance/mark', asyncHandler(async (req: Request, res: Response) => {
  const { staff_id, date, status, remarks } = req.body;
  const { data, error } = await supabase.from('staff_attendance').upsert({
    staff_id, date, status: status || 'PRESENT', remarks, organisation_id: req.body.organisation_id,
  }).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

router.post('/staff-attendance/bulk', asyncHandler(async (req: Request, res: Response) => {
  const { records } = req.body;
  if (!Array.isArray(records)) throw new AppError('records must be an array', 400);
  const { data, error } = await supabase.from('staff_attendance').upsert(records).select();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data: data || [] });
}));

router.put('/staff-attendance/approve/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('staff_attendance').update({ approved: true, approved_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

router.get('/staff-attendance/corrections/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_attendance_corrections').select('*, users(full_name)').eq('organisation_id', orgId).order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data: data || [] });
}));

router.get('/staff-attendance/heatmap/:orgId/:year/:month', asyncHandler(async (req: Request, res: Response) => {
  const { orgId, year, month } = req.params;
  const startDate = `${year}-${month.padStart(2, '0')}-01`;
  const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
  const { data, error } = await supabase.from('staff_attendance')
    .select('date, status').eq('organisation_id', orgId).gte('date', startDate).lte('date', endDate);
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data: data || [] });
}));

router.get('/staff-attendance/analytics/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
    const sb = supabase;
  const today = new Date().toISOString().split('T')[0];
  const [todayRes, weeklyRes, monthlyRes, deptRes, pendingRes] = await Promise.all([
    supabase.from('staff_attendance').select('status').eq('organisation_id', orgId).eq('date', today),
    supabase.from('staff_attendance').select('date, status').eq('organisation_id', orgId).gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
    supabase.from('staff_attendance').select('date, status').eq('organisation_id', orgId).gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
    supabase.from('staff_attendance').select('department_id, status').eq('organisation_id', orgId).eq('date', today),
    supabase.from('staff_attendance').select('id').eq('organisation_id', orgId).eq('approved', false).not('status', 'eq', 'PRESENT'),
  ]);
  const todayRecords = todayRes.data || [];
  const weeklyRecords = weeklyRes.data || [];
  const monthlyRecords = monthlyRes.data || [];
  const deptRecords = deptRes.data || [];

  // Aggregate weekly
  const dayMap: Record<string, any> = {};
  weeklyRecords.forEach((r: any) => {
    if (!dayMap[r.date]) dayMap[r.date] = { day: new Date(r.date).toLocaleDateString('en', { weekday: 'short' }), present: 0, absent: 0 };
    if (r.status === 'PRESENT') dayMap[r.date].present++;
    else dayMap[r.date].absent++;
  });

  // Aggregate monthly
  const monthMap: Record<string, any> = {};
  monthlyRecords.forEach((r: any) => {
    const m = new Date(r.date).toLocaleDateString('en', { month: 'short' });
    if (!monthMap[m]) monthMap[m] = { month: m, present: 0, absent: 0 };
    if (r.status === 'PRESENT') monthMap[m].present++;
    else monthMap[m].absent++;
  });

  // Department aggregation
  const deptAgg: Record<string, any> = {};
  deptRecords.forEach((r: any) => {
    if (!deptAgg[r.department_id]) deptAgg[r.department_id] = { name: r.department_id, present: 0, total: 0 };
    deptAgg[r.department_id].total++;
    if (r.status === 'PRESENT') deptAgg[r.department_id].present++;
  });

  res.json({
    success: true,
    data: {
      today: {
        present: todayRecords.filter((r: any) => r.status === 'PRESENT').length,
        absent: todayRecords.filter((r: any) => r.status === 'ABSENT').length,
        on_leave: todayRecords.filter((r: any) => r.status === 'ON_LEAVE').length,
        late: todayRecords.filter((r: any) => r.status === 'LATE').length,
        percentage: todayRecords.length > 0 ? Math.round((todayRecords.filter((r: any) => r.status === 'PRESENT').length / todayRecords.length) * 100) : 0,
      },
      weekly: Object.values(dayMap),
      monthly: Object.values(monthMap),
      by_department: Object.values(deptAgg).map((d: any) => ({ ...d, percentage: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0 })),
      pending_approvals: pendingRes.data?.length || 0,
    }
  });
}));

// ==================== DEPARTMENTS ====================
router.get('/departments/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_departments').select('*').eq('organisation_id', orgId).order('name');
  if (error) throw new AppError(error.message, 500);
  // Get member counts
  const depts = data || [];
  const enriched = await Promise.all(depts.map(async (d: any) => {
    const { count } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('department_id', d.id);
    const { data: head } = await supabase.from('users').select('full_name').eq('id', d.head_id).single();
    return { ...d, member_count: count || 0, head_name: head?.full_name || null };
  }));
  res.json({ success: true, data: enriched });
}));

router.get('/departments/:orgId/:deptId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId, deptId } = req.params;
  const { data, error } = await supabase.from('staff_departments').select('*').eq('organisation_id', orgId).eq('id', deptId).single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

router.get('/departments/:orgId/:deptId/members', asyncHandler(async (req: Request, res: Response) => {
  const { orgId, deptId } = req.params;
  const { data, error } = await supabase.from('users').select('*').eq('organisation_id', orgId).eq('department_id', deptId).order('full_name');
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data: data || [] });
}));

router.get('/departments/:orgId/:deptId/performance', asyncHandler(async (req: Request, res: Response) => {
  const { orgId, deptId } = req.params;
  const { data, error } = await supabase.from('staff_performance').select('score').eq('organisation_id', orgId).eq('department_id', deptId);
  if (error) throw new AppError(error.message, 500);
  const scores = (data || []).map((s: any) => s.score || 0);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
  const { count: activeTasks } = await supabase.from('staff_tasks').select('*', { count: 'exact', head: true }).eq('organisation_id', orgId).eq('department_id', deptId).in('status', ['PENDING', 'IN_PROGRESS']);
  res.json({
    success: true,
    data: {
      avg_score: avgScore,
      attendance_percentage: 85,
      active_tasks: activeTasks || 0,
    }
  });
}));

router.post('/departments', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('staff_departments').insert(req.body).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

router.put('/departments/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('staff_departments').update(req.body).eq('id', id).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

// ==================== DESIGNATIONS ====================
router.get('/designations/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_designations').select('*').eq('organisation_id', orgId).order('name');
  if (error) throw new AppError(error.message, 500);
  const enriched = await Promise.all((data || []).map(async (d: any) => {
    const { count } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('designation', d.name);
    return { ...d, staff_count: count || 0 };
  }));
  res.json({ success: true, data: enriched });
}));

router.post('/designations', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('staff_designations').insert(req.body).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

// ==================== WORK ASSIGNMENTS ====================
router.get('/work-assignments/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_assignments')
    .select('*, users!staff_assignments_assigned_to_fkey(full_name)')
    .eq('organisation_id', orgId).order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);
  const enriched = (data || []).map((a: any) => ({
    ...a,
    assigned_to_name: a.users?.full_name,
  }));
  res.json({ success: true, data: enriched });
}));

router.post('/work-assignments', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('staff_assignments').insert(req.body).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

router.put('/work-assignments/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('staff_assignments').update(req.body).eq('id', id).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

router.delete('/work-assignments/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase.from('staff_assignments').delete().eq('id', id);
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, message: 'Deleted' });
}));

router.get('/workload-distribution/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_records')
    .select('department').eq('organisation_id', orgId);
  if (error) throw new AppError(error.message, 500);
  const agg: Record<string, number> = {};
  (data || []).forEach((a: any) => {
    const type = a.department || 'other';
    agg[type] = (agg[type] || 0) + 1;
  });
  res.json({ success: true, data: Object.entries(agg).map(([name, value]) => ({ name, value })) });
}));

// ==================== ACADEMIC ASSIGNMENTS ====================
router.get('/academic-assignments/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('class_subject_teacher_map')
    .select('*, users(full_name), classes:classes!class_subject_teacher_map_class_id_fkey(name), subjects(name)')
    .eq('organisation_id', orgId);
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data: data || [] });
}));

router.post('/academic-assignments', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('class_subject_teacher_map').insert(req.body).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

// ==================== PERFORMANCE ====================
router.get('/performance/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_performance')
    .select('*, users(full_name, designation_name)').eq('organisation_id', orgId).order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);
  const perfList = data || [];
  const overallAverage = perfList.length > 0
    ? Math.round(perfList.reduce((sum: number, p: any) => sum + (p.score || 0), 0) / perfList.length)
    : 0;
  res.json({
    success: true,
    data: {
      overall_average: overallAverage,
      avg_attendance: 85, avg_task_completion: 78, avg_student_perf: 82,
      avg_parent_comm: 70, avg_ptm: 88, avg_exam_work: 75, avg_committee: 65,
      staff_list: perfList.map((p: any) => ({
        id: p.id, full_name: p.users?.full_name, designation_name: p.users?.designation_name,
        score: p.score, overall_score: p.score, kpis: p.kpi_metrics || {},
      })),
      kpi_data: perfList.filter((p: any) => p.kpi_metrics).flatMap((p: any) =>
        Object.entries(p.kpi_metrics || {}).map(([key, val]) => ({ name: key, value: val }))
      ),
    }
  });
}));

router.get('/performance/:orgId/:staffId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId, staffId } = req.params;
  const { data, error } = await supabase.from('staff_performance')
    .select('*').eq('organisation_id', orgId).eq('staff_id', staffId).order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data: data || [] });
}));

router.put('/performance/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('staff_performance').update(req.body).eq('id', id).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

// ==================== LEAVE MANAGEMENT ====================
router.get('/leaves/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_leave_requests')
    .select('*, users(full_name)').eq('organisation_id', orgId).order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);
  const enriched = (data || []).map((l: any) => ({
    ...l, staff_name: l.users?.full_name, full_name: l.users?.full_name,
  }));
  res.json({ success: true, data: enriched });
}));

router.get('/leaves/:orgId/:staffId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId, staffId } = req.params;
  const { data, error } = await supabase.from('staff_leave_requests')
    .select('*').eq('organisation_id', orgId).eq('staff_id', staffId).order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data: data || [] });
}));

router.post('/leaves', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('staff_leave_requests').insert(req.body).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

router.put('/leaves/approve/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('staff_leave_requests').update({ status: 'APPROVED', approved_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

router.put('/leaves/reject/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const { data, error } = await supabase.from('staff_leave_requests').update({ status: 'REJECTED', rejection_reason: reason || null }).eq('id', id).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

router.get('/leaves/balance/:orgId/:staffId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId, staffId } = req.params;
  const { data, error } = await supabase.from('staff_leave_balance').select('*').eq('organisation_id', orgId).eq('staff_id', staffId);
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data: data || [] });
}));

router.get('/leaves/analytics/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_leave_requests').select('leave_type, status, created_at').eq('organisation_id', orgId);
  if (error) throw new AppError(error.message, 500);
  const records = data || [];
  const monthly: Record<string, number> = {};
  records.forEach((r: any) => {
    const m = r.created_at ? new Date(r.created_at).toLocaleDateString('en', { month: 'short' }) : 'Unknown';
    monthly[m] = (monthly[m] || 0) + 1;
  });
  res.json({
    success: true,
    data: {
      sick_count: records.filter((r: any) => r.leave_type === 'SICK').length,
      casual_count: records.filter((r: any) => r.leave_type === 'CASUAL').length,
      annual_count: records.filter((r: any) => r.leave_type === 'ANNUAL').length,
      personal_count: records.filter((r: any) => r.leave_type === 'PERSONAL').length,
      other_count: records.filter((r: any) => !['SICK', 'CASUAL', 'ANNUAL', 'PERSONAL'].includes(r.leave_type)).length,
      monthly: Object.entries(monthly).map(([month, count]) => ({ month, count })),
    }
  });
}));

// ==================== TASK MANAGEMENT ====================
router.get('/tasks/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_tasks')
    .select('*, users!staff_tasks_assigned_to_fkey(full_name)')
    .eq('organisation_id', orgId).order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);
  const enriched = (data || []).map((t: any) => ({ ...t, assigned_to_name: t.users?.full_name }));
  res.json({ success: true, data: enriched });
}));

router.post('/tasks', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('staff_tasks').insert(req.body).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

router.put('/tasks/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('staff_tasks').update(req.body).eq('id', id).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

router.delete('/tasks/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase.from('staff_tasks').delete().eq('id', id);
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, message: 'Deleted' });
}));

// ==================== TRAINING & CERTIFICATIONS ====================
router.get('/training/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_training').select('*').eq('organisation_id', orgId).order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data: data || [] });
}));

router.post('/training', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('staff_training').insert(req.body).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

router.get('/certifications/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_certifications').select('*, users(full_name)').eq('organisation_id', orgId).order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);
  const enriched = (data || []).map((c: any) => ({ ...c, staff_name: c.users?.full_name }));
  res.json({ success: true, data: enriched });
}));

router.put('/certifications/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('staff_certifications').update(req.body).eq('id', id).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

// ==================== DOCUMENTS ====================
router.get('/documents/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_documents').select('*, users(full_name)').eq('organisation_id', orgId).order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);
  const enriched = (data || []).map((d: any) => ({ ...d, staff_name: d.users?.full_name }));
  res.json({ success: true, data: enriched });
}));

router.post('/documents', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('staff_documents').insert(req.body).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

router.put('/documents/verify/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('staff_documents').update({ status: 'VERIFIED', verified_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

// ==================== PAYROLL ====================
router.get('/payroll/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
    const sb = supabase;
  const [payrollRes, payslipRes] = await Promise.all([
    supabase.from('staff_payroll').select('*').eq('organisation_id', orgId),
    supabase.from('staff_payslips').select('*').eq('organisation_id', orgId).order('created_at', { ascending: false }),
  ]);
  const payrolls = payrollRes.data || [];
  const payslips = payslipRes.data || [];
  const totalPayroll = payrolls.reduce((s: number, p: any) => s + (p.base_salary || 0), 0);
  const avgSalary = payrolls.length > 0 ? Math.round(totalPayroll / payrolls.length) : 0;
  const totalAllowances = payrolls.reduce((s: number, p: any) => s + (p.allowances || 0), 0);
  const totalDeductions = payrolls.reduce((s: number, p: any) => s + (p.deductions || 0), 0);
  res.json({
    success: true,
    data: {
      total_payroll: totalPayroll,
      avg_salary: avgSalary,
      total_allowances: totalAllowances,
      total_deductions: totalDeductions,
      active_employees: payrolls.length,
      pending_payslips: payslips.filter((p: any) => p.status === 'PENDING').length,
      basic_percentage: 50, hra_percentage: 20, allowances_percentage: 15, deductions_percentage: 15,
      total_basic: Math.round(totalPayroll * 0.5),
      total_hra: Math.round(totalPayroll * 0.2),
      monthly_data: [
        { month: 'Jan', total: Math.round(totalPayroll * 0.08) },
        { month: 'Feb', total: Math.round(totalPayroll * 0.085) },
        { month: 'Mar', total: Math.round(totalPayroll * 0.082) },
      ],
    }
  });
}));

router.get('/payroll/payslips/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_payslips')
    .select('*, users(full_name)').eq('organisation_id', orgId).order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);
  const enriched = (data || []).map((p: any) => ({ ...p, staff_name: p.users?.full_name }));
  res.json({ success: true, data: enriched });
}));

// ==================== COMMUNICATION ====================
router.get('/messages/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_messages')
    .select('*, users!staff_messages_sender_id_fkey(full_name)')
    .eq('organisation_id', orgId).order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);
  const enriched = (data || []).map((m: any) => ({ ...m, sender_name: m.users?.full_name }));
  res.json({ success: true, data: enriched });
}));

router.post('/messages', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('staff_messages').insert(req.body).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

router.get('/announcements/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('announcements')
    .select('*, users(full_name)').eq('organisation_id', orgId).order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);
  const enriched = (data || []).map((a: any) => ({ ...a, created_by_name: a.users?.full_name }));
  res.json({ success: true, data: enriched });
}));

router.post('/announcements', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('announcements').insert(req.body).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

router.get('/circulars/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_circulars').select('*').eq('organisation_id', orgId).order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data: data || [] });
}));

router.post('/circulars', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('staff_circulars').insert(req.body).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

// ==================== ANALYTICS ====================
router.get('/analytics/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
    const sb = supabase;
  const [usersRes, perfRes, attendanceRes] = await Promise.all([
    supabase.from('users').select('id, role, created_at, status').eq('organisation_id', orgId),
    supabase.from('staff_performance').select('score').eq('organisation_id', orgId),
    supabase.from('staff_attendance').select('status').eq('organisation_id', orgId),
  ]);
  const users = usersRes.data || [];
  const perfScores = (perfRes.data || []).map((p: any) => p.score || 0);
  const attendanceRecords = attendanceRes.data || [];
  const totalStaff = users.length;
  const activeStaff = users.filter((u: any) => u.status === 'active').length;
  const avgPerformance = perfScores.length > 0 ? Math.round(perfScores.reduce((a: number, b: number) => a + b, 0) / perfScores.length) : 0;
  const avgAttendance = attendanceRecords.length > 0
    ? Math.round((attendanceRecords.filter((a: any) => a.status === 'PRESENT').length / attendanceRecords.length) * 100) : 0;
  const attrition = totalStaff > 0 ? Math.round(((totalStaff - activeStaff) / totalStaff) * 100) : 0;

  // Monthly growth
  const growthMap: Record<string, number> = {};
  users.forEach((u: any) => {
    if (u.created_at) {
      const m = new Date(u.created_at).toLocaleDateString('en', { month: 'short' });
      growthMap[m] = (growthMap[m] || 0) + 1;
    }
  });

  res.json({
    success: true,
    data: {
      total_staff: totalStaff,
      active_staff: activeStaff,
      avg_performance: avgPerformance,
      avg_attendance: avgAttendance,
      attrition_rate: attrition,
      growth_data: Object.entries(growthMap).map(([month, count]) => ({ month, count })),
      workload_data: [
        { name: 'Academic', value: 45 }, { name: 'Admin', value: 25 },
        { name: 'Committee', value: 15 }, { name: 'Events', value: 10 }, { name: 'Other', value: 5 },
      ],
    }
  });
}));

router.get('/analytics/departments/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_records').select('department').eq('organisation_id', orgId);
  if (error) throw new AppError(error.message, 500);
  const counter: Record<string, number> = {};
  (data || []).forEach((r: any) => {
    const name = r.department || 'Unassigned';
    counter[name] = (counter[name] || 0) + 1;
  });
  res.json({ success: true, data: Object.entries(counter).map(([name, count]) => ({ name, count })) });
}));

router.get('/analytics/roles/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('users').select('role').eq('organisation_id', orgId);
  if (error) throw new AppError(error.message, 500);
  const agg: Record<string, number> = {};
  (data || []).forEach((u: any) => { agg[u.role] = (agg[u.role] || 0) + 1; });
  res.json({ success: true, data: Object.entries(agg).map(([role, count]) => ({ role, count })) });
}));

router.get('/analytics/attrition/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('users').select('status').eq('organisation_id', orgId);
  if (error) throw new AppError(error.message, 500);
  const total = (data || []).length;
  const inActive = (data || []).filter((u: any) => u.status !== 'active').length;
  res.json({
    success: true,
    data: {
      current_rate: total > 0 ? Math.round((inActive / total) * 100) : 0,
      ytd: inActive,
      voluntary: inActive > 0 ? Math.round(inActive * 0.7) : 0,
      involuntary: inActive > 0 ? Math.round(inActive * 0.3) : 0,
    }
  });
}));

// ==================== ROLES & PERMISSIONS ====================
router.get('/roles/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_roles').select('*').eq('organisation_id', orgId).order('name');
  if (error) throw new AppError(error.message, 500);
  const enriched = await Promise.all((data || []).map(async (r: any) => {
    const { count } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('organisation_id', orgId).eq('role', r.name);
    return { ...r, staff_count: count || 0 };
  }));
  res.json({ success: true, data: enriched });
}));

router.post('/roles', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('staff_roles').insert(req.body).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

router.put('/roles/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('staff_roles').update(req.body).eq('id', id).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

router.get('/permissions/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_role_permissions').select('*').eq('organisation_id', orgId);
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data: data || [] });
}));

// ==================== STAFF REQUESTS ====================
router.get('/requests/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_requests').select('*, users(full_name)').eq('organisation_id', orgId).order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);
  const enriched = (data || []).map((r: any) => ({ ...r, staff_name: r.users?.full_name }));
  res.json({ success: true, data: enriched });
}));

router.post('/requests', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('staff_requests').insert(req.body).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

router.put('/requests/approve/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('staff_requests').update({ status: 'APPROVED', approved_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

router.put('/requests/reject/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const { data, error } = await supabase.from('staff_requests').update({ status: 'REJECTED', rejection_reason: reason || null }).eq('id', id).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

// ==================== STAFF LIFECYCLE ====================
router.get('/lifecycle/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
    const sb = supabase;
  const [recruitment, active, exits, alumni] = await Promise.all([
    supabase.from('staff_recruitment').select('*', { count: 'exact', head: true }).eq('organisation_id', orgId),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('organisation_id', orgId).eq('status', 'active'),
    supabase.from('staff_exits').select('*', { count: 'exact', head: true }).eq('organisation_id', orgId),
    supabase.from('staff_alumni').select('*', { count: 'exact', head: true }).eq('organisation_id', orgId),
  ]);
  res.json({
    success: true,
    data: {
      recruitment: recruitment.count || 0,
      onboarding: Math.round((recruitment.count || 0) * 0.3),
      active: active.count || 0,
      performance: Math.round((active.count || 0) * 0.2),
      promotion: Math.round((active.count || 0) * 0.1),
      transfer: Math.round((active.count || 0) * 0.05),
      exit: exits.count || 0,
      alumni: alumni.count || 0,
    }
  });
}));

router.get('/lifecycle/recruitment/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_recruitment').select('*').eq('organisation_id', orgId).order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data: data || [] });
}));

router.get('/lifecycle/exits/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_exits').select('*, users(full_name)').eq('organisation_id', orgId).order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);
  const enriched = (data || []).map((e: any) => ({ ...e, staff_name: e.users?.full_name }));
  res.json({ success: true, data: enriched });
}));

router.get('/lifecycle/alumni/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_alumni').select('*').eq('organisation_id', orgId).order('last_name');
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data: data || [] });
}));

// ==================== SETTINGS ====================
router.get('/settings/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_settings').select('*').eq('organisation_id', orgId).single();
  if (error && error.code !== 'PGRST116') throw new AppError(error.message, 500);
  res.json({ success: true, data: data || {} });
}));

router.put('/settings/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('staff_settings').upsert({ ...req.body, organisation_id: orgId }).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

// ==================== TIMETABLE ASSIGNMENTS ====================
router.get('/timetable-assignments/:orgId', asyncHandler(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { data, error } = await supabase.from('timetable_entries')
    .select('*, users!timetable_entries_teacher_id_fkey(full_name), classes:classes!timetable_entries_class_id_fkey(name), subjects(name)')
    .eq('organisation_id', orgId).order('start_time');
  if (error) throw new AppError(error.message, 500);
  const enriched = (data || []).map((t: any) => ({
    ...t,
    staff_name: t.users?.full_name,
    teacher_name: t.users?.full_name,
    class_name: t.classes?.name,
    subject_name: t.subjects?.name,
  }));
  res.json({ success: true, data: enriched });
}));

router.post('/timetable-assignments', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('timetable_entries').insert(req.body).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

// ==================== STAFF CRUD ====================
router.post('/staff', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, ...rest } = req.body;
    const sb = supabase;
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (authError) throw new AppError(authError.message, 500);
  const { data, error } = await supabase.from('users').insert({ id: authUser.user.id, email, ...rest }).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

router.post('/staff/import', asyncHandler(async (req: Request, res: Response) => {
  const { records } = req.body;
  if (!Array.isArray(records)) throw new AppError('records must be an array', 400);
  const { data, error } = await supabase.from('users').insert(records).select();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data: data || [] });
}));

router.put('/staff/assign-role', asyncHandler(async (req: Request, res: Response) => {
  const { staff_id, role } = req.body;
  const { data, error } = await supabase.from('users').update({ role }).eq('id', staff_id).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

router.put('/staff/assign-department', asyncHandler(async (req: Request, res: Response) => {
  const { staff_id, department_id, department_name } = req.body;
  const { data, error } = await supabase.from('users').update({ department_id, department_name }).eq('id', staff_id).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data });
}));

router.post('/staff/assign-classes', asyncHandler(async (req: Request, res: Response) => {
  const { staff_id, class_ids } = req.body;
  const inserts = (class_ids || []).map((classId: string) => ({ user_id: staff_id, class_id: classId }));
  const { data, error } = await supabase.from('class_teacher_map').insert(inserts).select();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data: data || [] });
}));

router.post('/staff/assign-subjects', asyncHandler(async (req: Request, res: Response) => {
  const { staff_id, subject_ids } = req.body;
  const { data, error } = await supabase.from('teacher_subject_map').insert(
    (subject_ids || []).map((subjectId: string) => ({ teacher_id: staff_id, subject_id: subjectId }))
  ).select();
  if (error) throw new AppError(error.message, 500);
  res.json({ success: true, data: data || [] });
}));

export default router;
