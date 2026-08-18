import { Router } from 'express';
import { supabase } from '../lib/backend-common';
import { parentLoginController } from '../controllers/parent-login.controller';
import { parentLegacyTeacherController } from '../controllers/parent-legacy-teacher.controller';
import { parentLegacyExamController } from '../controllers/parent-legacy-exam.controller';
import { parentLegacyFeeController } from '../controllers/parent-legacy-fee.controller';
import { parentLegacyComplaintController } from '../controllers/parent-legacy-complaint.controller';
import { parentLegacyPtmController } from '../controllers/parent-legacy-ptm.controller';
import { parentLegacyHostelVisitController } from '../controllers/parent-legacy-hostel-visit.controller';
import { parentLegacyCanteenController } from '../controllers/parent-legacy-canteen.controller';
import { parentLegacyVaccinationController } from '../controllers/parent-legacy-vaccination.controller';
import { parentLegacyEmergencyController } from '../controllers/parent-legacy-emergency.controller';
import { parentLegacyBusController } from '../controllers/parent-legacy-bus.controller';
import { parentLegacyLeaveController } from '../controllers/parent-legacy-leave.controller';
import { parentLegacyFeePaymentController } from '../controllers/parent-legacy-fee-payment.controller';
import { parentLegacyPartTimeJobController } from '../controllers/parent-legacy-part-time-job.controller';
import { parentLegacyMessageController } from '../controllers/parent-legacy-message.controller';
import { authenticate, authorize, enforceUserAccess, enforceParentChildAccess } from '../middleware/auth';
import { auditLog } from '../middleware/audit';

const router = Router();

router.post('/login', (req, res) => parentLoginController.login(req, res));

// All routes below require authentication + parent role
router.use(authenticate);
router.use(authorize('parent'));
router.use(auditLog('parent_action'));

// URL param org_id/organisation_id must match JWT
router.param('org_id', (req: any, res, next, value) => {
  if (value && value !== req.user?.organisationId) {
    return res.status(403).json({ error: 'Tenant access denied' });
  }
  next();
});
router.param('organisation_id', (req: any, res, next, value) => {
  if (value && value !== req.user?.organisationId) {
    return res.status(403).json({ error: 'Tenant access denied' });
  }
  next();
});

router.get('/children/:parent_id', enforceUserAccess('parent_id'), async (req, res) => {
  const { parent_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('parent_student_links')
      .select('student:students(*)')
      .eq('parent_id', parent_id);

    if (error) throw error;
    res.json({ students: data?.map((row: any) => row.student) || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/dashboard/:parent_id', enforceUserAccess('parent_id'), async (req, res) => {
  const { parent_id } = req.params;

  try {
    const { data: links, error: linksError } = await supabase
      .from('parent_student_links')
      .select('student:students(*)')
      .eq('parent_id', parent_id);

    if (linksError) throw linksError;

    const studentIds = links?.map((link: any) => link.student_id) || [];
    const userId = (req.query.user_id as string) || parent_id;

    const { data: classData } = studentIds.length > 0
      ? await supabase.from('class_student_map').select('class_id').in('student_id', studentIds)
      : { data: [] };
    const dashboardClassIds = [...new Set(classData?.map((c: any) => c.class_id) || [])];

    const [attendance, marks, fees, exams, notifications] = await Promise.all([
      supabase.from('attendance_records').select('*').in('student_id', studentIds).order('attendance_date', { ascending: false }),
      supabase.from('grades').select('*').in('student_id', studentIds).order('created_at', { ascending: false }).limit(10),
      supabase.from('student_fees').select('*').in('student_id', studentIds),
      dashboardClassIds.length > 0
        ? supabase.from('exam_schedules').select('*').in('class_id', dashboardClassIds).order('date', { ascending: true }).limit(10)
        : supabase.from('exam_schedules').select('*').eq('id', 'none').order('date', { ascending: true }).limit(10),
      supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    ]);

    const mappedAttendance = (attendance.data || []).map((r: any) => ({
      id: r.id,
      student_id: r.student_id,
      teacher_id: r.teacher_id,
      date: r.attendance_date,
      status: r.attendance_status ? r.attendance_status.toLowerCase() : 'present',
      notes: r.remarks,
      created_at: r.created_at,
      organisation_id: r.organisation_id,
      class_id: r.class_id,
      section_id: r.section_id,
      subject_id: r.subject_id
    }));

    const pendingFees = fees.data?.filter((fee: any) => fee.status === 'pending') || [];
    const attendanceWarnings = studentIds.map((studentId: string) => {
      const childAttendance = mappedAttendance.filter((record: any) => record.student_id === studentId);
      const presentCount = childAttendance.filter((record: any) => record.status === 'present').length;
      const totalCount = childAttendance.length;
      const percentage = totalCount ? Math.round((presentCount / totalCount) * 100) : 100;
      return {
        student_id: studentId,
        attendancePercentage: percentage,
        warning: percentage < 85 ? 'Attendance below 85%' : null
      };
    });

    res.json({
      children: links?.map((link: any) => link.student) || [],
      recentAttendance: mappedAttendance,
      recentMarks: marks.data || [],
      pendingFees,
      upcomingExams: exams.data || [],
      notifications: notifications.data || [],
      attendanceWarnings
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/teachers/:student_id', enforceParentChildAccess(), (req, res) => parentLegacyTeacherController.getByStudent(req, res));

router.get('/attendance/:student_id', enforceParentChildAccess(), async (req, res) => {
  const { student_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('student_id', student_id)
      .order('date', { ascending: false });

    if (error) throw error;
    const records = (data || []).map((r: any) => ({
      id: r.id,
      student_id: r.student_id,
      teacher_id: r.teacher_id,
      date: r.date,
      status: r.status ? r.status.toLowerCase() : 'present',
      notes: r.notes,
      created_at: r.created_at,
      organisation_id: r.organisation_id,
      academic_year_id: r.academic_year_id
    }));
    const present = records.filter((record: any) => record.status === 'present').length;
    const total = records.length;
    const percentage = total ? Math.round((present / total) * 100) : 100;
    res.json({ records, present, total, percentage });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/performance/:student_id', enforceParentChildAccess(), async (req, res) => {
  const { student_id } = req.params;

  try {
    const { data: studentClasses, error: classError } = await supabase
      .from('class_student_map')
      .select('class_id')
      .eq('student_id', student_id);

    if (classError) throw classError;

    const classIds = studentClasses?.map(s => s.class_id) || [];

    const [gradesResult, examsResult] = await Promise.all([
      supabase.from('grades').select('*').eq('student_id', student_id).order('created_at', { ascending: false }),
      classIds.length > 0
        ? supabase.from('exam_schedules').select('*').in('class_id', classIds)
        : supabase.from('exam_schedules').select('*').eq('id', 'none')
    ]);

    if (gradesResult.error) throw gradesResult.error;
    if (examsResult.error) throw examsResult.error;

    res.json({
      grades: gradesResult.data || [],
      schedules: examsResult.data || [],
      results: gradesResult.data || []
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/exams/:student_id', enforceParentChildAccess(), (req, res) => parentLegacyExamController.getSchedules(req, res));

router.get('/transport/:student_id', enforceParentChildAccess(), async (req, res) => {
  const { student_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('transport_assignments')
      .select('*')
      .eq('student_id', student_id)
      .maybeSingle();

    if (error) throw error;
    res.json(data || null);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/hostel/:student_id', enforceParentChildAccess(), async (req, res) => {
  const { student_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('hostel_allocations')
      .select('*, room:hostel_rooms(*)')
      .eq('student_id', student_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.json(data || null);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/announcements/:org_id', async (req, res) => {
  const { org_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('organisation_id', org_id)
      .order('published_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/assignments/:student_id', enforceParentChildAccess(), async (req, res) => {
  const { student_id } = req.params;

  try {
    const { data: studentClasses, error: classError } = await supabase
      .from('class_student_map')
      .select('class_id')
      .eq('student_id', student_id);

    if (classError) throw classError;

    const classIds = studentClasses?.map(s => s.class_id) || [];
    if (classIds.length === 0) return res.json({ assignments: [] });

    const [assignmentsResult, submissionsResult] = await Promise.all([
      supabase.from('assignments').select('*').in('class_id', classIds).order('due_date', { ascending: true }),
      supabase.from('assignment_submissions').select('*').eq('student_id', student_id)
    ]);

    if (assignmentsResult.error) throw assignmentsResult.error;
    if (submissionsResult.error) throw submissionsResult.error;

    const submissions = submissionsResult.data || [];
    const assignments = (assignmentsResult.data || []).map((assignment: any) => {
      const submission = submissions.find((item: any) => item.assignment_id === assignment.id);
      const isOverdue = assignment.due_date ? new Date(assignment.due_date) < new Date() : false;
      return {
        ...assignment,
        submitted: Boolean(submission),
        submission,
        status: submission?.status || (isOverdue ? 'overdue' : 'pending')
      };
    });

    res.json({ assignments });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/fees-summary/:parent_id', enforceUserAccess('parent_id'), async (req, res) => {
  const { parent_id } = req.params;

  try {
    const { data: links, error: linksError } = await supabase
      .from('parent_student_links')
      .select('student_id')
      .eq('parent_id', parent_id);

    if (linksError) throw linksError;

    const studentIds = links?.map((row: any) => row.student_id) || [];
    const [feesResult, documentsResult] = await Promise.all([
      supabase.from('student_fees').select('*, payments:fee_payments(*)').in('student_id', studentIds),
      supabase.from('documents').select('*').in('user_id', studentIds).in('document_type', ['Receipt', 'Tax Statement'])
    ]);

    if (feesResult.error) throw feesResult.error;
    if (documentsResult.error) throw documentsResult.error;

    const fees = feesResult.data || [];
    const feeDocuments = documentsResult.data || [];
    const totalDue = fees.reduce((sum: number, fee: any) => fee.status === 'pending' ? sum + parseFloat(fee.amount || 0) : sum, 0);
    const totalPaid = fees.reduce((sum: number, fee: any) => {
      const paid = fee.payments?.reduce((subSum: number, payment: any) => subSum + parseFloat(payment.amount_paid || 0), 0) || 0;
      return sum + paid;
    }, 0);
    const overdueCount = fees.filter((fee: any) => fee.status === 'overdue').length;

    res.json({ studentFees: fees, feeDocuments, totalDue, totalPaid, overdueCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/fees/:student_id', enforceParentChildAccess(), async (req, res) => {
  const { student_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('student_fees')
      .select('*')
      .eq('student_id', student_id)
      .order('due_date', { ascending: false });
    if (error) throw error;
    const fees = data || [];
    const totalDue = fees.reduce((sum: number, fee: any) => fee.status === 'pending' ? sum + parseFloat(fee.amount || 0) : sum, 0);
    const totalPaid = fees.reduce((sum: number, fee: any) => sum + parseFloat(fee.paid_amount || 0), 0);
    const overdueCount = fees.filter((fee: any) => fee.status === 'overdue').length;
    res.json({ studentFees: fees, totalDue, totalPaid, overdueCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/fees/:student_id', enforceParentChildAccess(), async (req, res) => {
  const { student_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('student_fees')
      .select('*')
      .eq('student_id', student_id)
      .order('due_date', { ascending: false });
    if (error) throw error;
    const fees = data || [];
    const totalDue = fees.reduce((sum: number, fee: any) => fee.status === 'pending' ? sum + parseFloat(fee.amount || 0) : sum, 0);
    const totalPaid = fees.reduce((sum: number, fee: any) => sum + parseFloat(fee.paid_amount || 0), 0);
    const overdueCount = fees.filter((fee: any) => fee.status === 'overdue').length;
    res.json({ studentFees: fees, totalDue, totalPaid, overdueCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/fee-documents/:parent_id', enforceUserAccess('parent_id'), (req, res) => parentLegacyFeeController.getDocuments(req, res));

router.get('/notifications/:parent_id', enforceUserAccess('parent_id'), async (req, res) => {
  const { parent_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', parent_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ notifications: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/complaints/:parent_id', enforceUserAccess('parent_id'), (req, res) => parentLegacyComplaintController.getByParent(req, res));

router.get('/ptm-bookings/:parent_id', enforceUserAccess('parent_id'), (req, res) => parentLegacyPtmController.getBookings(req, res));

router.post('/hostel-visit', async (req: any, res) => {
  const { data: link } = await supabase
    .from('parent_student_links')
    .select('id')
    .eq('parent_id', req.user.userId)
    .eq('student_id', req.body.student_id)
    .maybeSingle();
  if (!link) {
    return res.status(403).json({ success: false, error: 'This student is not linked to your account' });
  }
  parentLegacyHostelVisitController.create(req, res);
});

router.get('/hostel-visits/:parent_id', enforceUserAccess('parent_id'), (req, res) => parentLegacyHostelVisitController.getByParent(req, res));

router.post('/canteen-order', async (req: any, res) => {
  const { data: link } = await supabase
    .from('parent_student_links')
    .select('id')
    .eq('parent_id', req.user.userId)
    .eq('student_id', req.body.student_id)
    .maybeSingle();
  if (!link) {
    return res.status(403).json({ success: false, error: 'This student is not linked to your account' });
  }
  parentLegacyCanteenController.createOrder(req, res);
});

router.get('/canteen/orders/:parent_id', enforceUserAccess('parent_id'), (req, res) => parentLegacyCanteenController.getOrders(req, res));

router.get('/canteen/balance/:student_id', enforceParentChildAccess(), (req, res) => parentLegacyCanteenController.getBalance(req, res));

router.get('/health/:student_id', enforceParentChildAccess(), async (req, res) => {
  const { student_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', student_id)
      .eq('document_type', 'Health Report')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ reports: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/vaccinations/:student_id', enforceParentChildAccess(), (req, res) => parentLegacyVaccinationController.getByStudent(req, res));

router.get('/emergency-contacts/:org_id', (req, res) => parentLegacyEmergencyController.getContacts(req, res));

router.get('/bus-location/student/:student_id', enforceParentChildAccess(), (req, res) => parentLegacyBusController.getLocation(req, res));

router.post('/messages', async (req, res) => {
  const { sender_id, recipient_id, message } = req.body;
  if (!sender_id || !recipient_id || !message) {
    return res.status(400).json({ error: 'Required: sender_id, recipient_id, message' });
  }
  try {
    const { data, error } = await supabase.from('direct_messages')
      .insert({ sender_id, recipient_id, message })
      .select();
    if (error) throw error;
    res.status(201).json(data?.[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/messages/:user_id/:other_user_id', async (req, res) => {
  const { user_id, other_user_id } = req.params;
  try {
    const { data, error } = await supabase.from('direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${user_id},recipient_id.eq.${other_user_id}),and(sender_id.eq.${other_user_id},recipient_id.eq.${user_id})`)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/conversations/:user_id', enforceUserAccess('user_id'), (req, res) => parentLegacyMessageController.getConversations(req, res));

router.patch('/messages/:id/read', (req, res) => parentLegacyMessageController.markRead(req, res));

router.get('/unread-count/:user_id', enforceUserAccess('user_id'), (req, res) => parentLegacyMessageController.getUnreadCount(req, res));

router.get('/teachers/:organisation_id', (req, res) => parentLegacyTeacherController.getByOrganisation(req, res));

router.post('/complaint', async (req: any, res) => {
  const { data: link } = await supabase
    .from('parent_student_links')
    .select('id')
    .eq('parent_id', req.user.userId)
    .eq('student_id', req.body.student_id)
    .maybeSingle();
  if (!link) {
    return res.status(403).json({ success: false, error: 'This student is not linked to your account' });
  }
  parentLegacyComplaintController.create(req, res);
});

router.post('/ptm-booking', async (req: any, res) => {
  const { data: link } = await supabase
    .from('parent_student_links')
    .select('id')
    .eq('parent_id', req.user.userId)
    .eq('student_id', req.body.student_id)
    .maybeSingle();
  if (!link) {
    return res.status(403).json({ success: false, error: 'This student is not linked to your account' });
  }
  parentLegacyPtmController.createBooking(req, res);
});

router.post('/leave-application', async (req: any, res) => {
  const { data: link } = await supabase
    .from('parent_student_links')
    .select('id')
    .eq('parent_id', req.user.userId)
    .eq('student_id', req.body.student_id)
    .maybeSingle();
  if (!link) {
    return res.status(403).json({ success: false, error: 'This student is not linked to your account' });
  }
  parentLegacyLeaveController.create(req, res);
});

router.get('/leave-requests/:parent_id', enforceUserAccess('parent_id'), (req, res) => parentLegacyLeaveController.getByParent(req, res));

router.post('/fee-payments', (req, res) => parentLegacyFeePaymentController.pay(req, res));

router.get('/part-time-jobs/:organisation_id', (req, res) => parentLegacyPartTimeJobController.getAll(req, res));

router.post('/part-time-jobs/apply', (req, res) => parentLegacyPartTimeJobController.apply(req, res));

router.get('/part-time-jobs/applications/:user_id', enforceUserAccess('user_id'), (req, res) => parentLegacyPartTimeJobController.getMyApplications(req, res));

export default router;
