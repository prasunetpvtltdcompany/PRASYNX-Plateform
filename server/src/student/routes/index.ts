import { Router, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { supabase } from '../lib/backend-common';
import { studentLoginController } from '../controllers/student-login.controller';
import { studentAnnouncementController } from '../controllers/student-announcement.controller';
import { studentLibraryController } from '../controllers/student-library.controller';
import { studentScholarshipController } from '../controllers/student-scholarship.controller';
import { studentEventController } from '../controllers/student-event.controller';
import { studentClubController } from '../controllers/student-club.controller';
import { studentMessageController } from '../controllers/student-message.controller';
import { studentComplaintController } from '../controllers/student-complaint.controller';
import { studentTeacherController } from '../controllers/student-teacher.controller';
import { studentCareerController } from '../controllers/student-career.controller';
import { studentFeePaymentController } from '../controllers/student-fee-payment.controller';
import { studentFeedbackController } from '../controllers/student-feedback.controller';
import { studentOnlineExamController } from '../controllers/student-online-exam.controller';
import { studentCanteenController } from '../controllers/student-canteen.controller';
import { studentPartTimeJobController } from '../controllers/student-part-time-job.controller';
import { studentHealthRecordsController } from '../controllers/student-health-records.controller';
import { studentHostelController } from '../controllers/student-hostel.controller';
import { studentTransportController } from '../controllers/student-transport.controller';
import { authenticate, authorize, enforceStudentAccess, enforceUserAccess } from '../middleware/auth';
import { auditLog } from '../middleware/audit';

const router = Router();

router.post('/login', (req, res) => studentLoginController.login(req, res));

// All routes below require authentication + student role
router.use(authenticate);
router.use(authorize('student'));
router.use(auditLog('student_action'));

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

const overrideBody = (field: string) => (req: AuthRequest, _res: Response, next: NextFunction) => {
  req.body[field] = req.user!.userId;
  next();
};

const enforceFeeOwnership = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { student_fee_id } = req.body;
  if (!student_fee_id) return res.status(400).json({ error: 'Required: student_fee_id' });
  const { data: fee } = await supabase.from('student_fees').select('student_id').eq('id', student_fee_id).maybeSingle();
  if (!fee) return res.status(404).json({ error: 'Fee record not found' });
  if (fee.student_id !== req.user!.userId) return res.status(403).json({ error: 'Access denied: fee record does not belong to you' });
  next();
};

router.get('/dashboard/:student_id', enforceStudentAccess(), async (req, res) => {
  const { student_id } = req.params;

  try {
    const [attendance, upcomingAssignments, recentMarks, upcomingExams, feeStatus] = await Promise.all([
      supabase.from('attendance_records').select('*').eq('student_id', student_id),
      supabase.from('assignments').select('*').eq('status', 'active'),
      supabase.from('grades').select('*').eq('student_id', student_id).limit(5),
      supabase.from('exam_schedules').select('*'),
      supabase.from('student_fees').select('*').eq('student_id', student_id)
    ]);

    const attendanceCount = attendance.data?.length || 0;
    const presentCount = attendance.data?.filter((a: any) => a.attendance_status?.toLowerCase() === 'present').length || 0;
    const attendancePercentage = attendanceCount > 0 ? Math.round((presentCount / attendanceCount) * 100) : 0;

    res.json({
      attendance: { total: attendanceCount, present: presentCount, percentage: attendancePercentage },
      assignments: upcomingAssignments.data || [],
      recentMarks: recentMarks.data || [],
      upcomingExams: upcomingExams.data || [],
      fees: feeStatus.data || []
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/timetable/:class_id', async (req, res) => {
  const { class_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('timetable_entries')
      .select('*, staff_records(*), subjects(*)')
      .eq('class_id', class_id)
      .order('day_of_week');

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/timetable/student/:student_id', enforceStudentAccess(), async (req, res) => {
  const { student_id } = req.params;

  try {
    const { data: student } = await supabase
      .from('students')
      .select('class_id')
      .eq('id', student_id)
      .maybeSingle();

    if (!student?.class_id) return res.json([]);

    const { data: classes } = await supabase
      .from('classes')
      .select('id')
      .eq('id', student.class_id)
      .maybeSingle();

    if (!classes?.id) return res.json([]);

    const { data, error } = await supabase
      .from('timetable_entries')
      .select('*, staff_records(*), subjects(*)')
      .eq('class_id', classes.id)
      .order('day_of_week');

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/assignments/:student_id', enforceStudentAccess(), async (req, res) => {
  const { student_id } = req.params;

  try {
    const { data: assignments, error: assignError } = await supabase
      .from('assignments')
      .select('*, submissions:assignment_submissions(*)')
      .eq('status', 'active');

    if (assignError) throw assignError;

    const enhanced = (assignments || []).map((assignment: any) => {
      const submission = assignment.submissions?.find((s: any) => s.student_id === student_id) || null;
      return { ...assignment, submission_status: submission ? submission.status : 'pending', submission };
    });

    res.json(enhanced);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/assignments/:assignment_id/submit', async (req: AuthRequest, res: Response) => {
  const { assignment_id } = req.params;
  const { submission_text, file_url } = req.body;

  if (!submission_text && !file_url) {
    return res.status(400).json({ error: 'Required: submission_text or file_url' });
  }

  try {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .insert({
        assignment_id,
        student_id: req.user!.userId,
        submission_text,
        file_url,
        submitted_at: new Date()
      })
      .select();

    if (error) throw error;
    res.status(201).json(data?.[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/attendance/:student_id', enforceStudentAccess(), async (req, res) => {
  const { student_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('student_id', student_id)
      .order('attendance_date', { ascending: false });

    if (error) throw error;

    const mapped = (data || []).map((r: any) => ({
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

    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/qr-attendance/scan', async (req: AuthRequest, res: Response) => {
  const { qr_data } = req.body;

  if (!qr_data) {
    return res.status(400).json({ error: 'Required field: qr_data' });
  }

  const student_id = req.user!.userId;

  try {
    let parsed: any;
    try {
      parsed = typeof qr_data === 'string' ? JSON.parse(qr_data) : qr_data;
    } catch {
      return res.status(400).json({ error: 'Invalid QR code data' });
    }

    const { token, teacher_id } = parsed;

    if (!token || !teacher_id) {
      return res.status(400).json({ error: 'Invalid QR code format' });
    }

    const { data: session, error: sessionError } = await supabase
      .from('qr_sessions')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .maybeSingle();

    if (!session) {
      return res.status(404).json({ error: 'QR session not found or expired' });
    }

    if (new Date(session.expires_at) < new Date()) {
      await supabase.from('qr_sessions').update({ is_active: false }).eq('id', session.id);
      return res.status(410).json({ error: 'QR code has expired' });
    }

    const today = new Date().toISOString().slice(0, 10);

    const { data: existing } = await supabase
      .from('attendance_records')
      .select('id, attendance_status')
      .eq('student_id', student_id)
      .eq('attendance_date', today)
      .maybeSingle();

    if (existing) {
      return res.json({
        success: true,
        message: 'Attendance already recorded for today',
        attendance: {
          id: existing.id,
          status: existing.attendance_status.toLowerCase()
        },
        alreadyMarked: true
      });
    }

    const { data: student, error: studErr } = await supabase
      .from('students')
      .select('organisation_id, class_id, section_id')
      .eq('id', student_id)
      .maybeSingle();
    if (studErr || !student) return res.status(404).json({ error: 'Student not found' });

    const { data: attendance, error: attendError } = await supabase
      .from('attendance_records')
      .insert({
        organisation_id: student.organisation_id,
        student_id,
        class_id: student.class_id,
        section_id: student.section_id,
        subject_id: session.subject_id || null,
        teacher_id,
        attendance_date: today,
        attendance_status: 'Present',
        remarks: `QR scan - ${session.subject || 'N/A'}`,
      })
      .select()
      .maybeSingle();

    if (attendError) throw attendError;

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      attendance: attendance ? {
        id: attendance.id,
        student_id: attendance.student_id,
        teacher_id: attendance.teacher_id,
        date: attendance.attendance_date,
        status: attendance.attendance_status.toLowerCase(),
        notes: attendance.remarks
      } : null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/marks/:student_id', enforceStudentAccess(), async (req, res) => {
  const { student_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('student_id', student_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/exams/:student_id', enforceStudentAccess(), async (req, res) => {
  try {
    const [examsRes, schedulesRes] = await Promise.all([
      supabase.from('exams').select('*'),
      supabase.from('exam_schedules').select('*')
    ]);
    if (examsRes.error) throw examsRes.error;
    const exams = (examsRes.data || []).map((exam: any) => ({
      ...exam,
      schedules: (schedulesRes.data || []).filter((s: any) => s.exam_id === exam.id)
    }));
    res.json(exams);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/exam-result/:exam_id/:student_id', enforceStudentAccess(), (req, res) => studentOnlineExamController.getExamResult(req, res));

router.get('/fees/:student_id', enforceStudentAccess(), async (req, res) => {
  const { student_id } = req.params;

  try {
    const [feesRes, paymentsRes] = await Promise.all([
      supabase.from('student_fees').select('*').eq('student_id', student_id),
      supabase.from('fee_payments').select('*')
    ]);
    if (feesRes.error) throw feesRes.error;
    const fees = (feesRes.data || []).map((fee: any) => ({
      ...fee,
      payments: (paymentsRes.data || []).filter((p: any) => p.student_fee_id === fee.id)
    }));
    res.json(fees);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/messages', overrideBody('sender_id'), (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.body.recipient_id || !req.body.message) {
    return res.status(400).json({ error: 'Required: recipient_id, message' });
  }
  next();
}, (req, res) => studentMessageController.send(req, res));

router.get('/messages/:student_id/:teacher_id', enforceStudentAccess(), (req, res) => studentMessageController.getMessages(req, res));

router.post('/complaints', overrideBody('filed_by'), (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.body.complaint_type || !req.body.title) {
    return res.status(400).json({ error: 'Required: complaint_type, title' });
  }
  next();
}, (req, res) => studentComplaintController.create(req, res));

router.get('/announcements/:student_id/:org_id', enforceStudentAccess(), (req, res) => studentAnnouncementController.getAll(req, res));

router.get('/library/:user_id', enforceUserAccess(), (req, res) => studentLibraryController.getByUser(req, res));

router.get('/certificates/:user_id', enforceUserAccess(), (req, res) => studentLibraryController.getCertificates(req, res));

router.get('/scholarships/:student_id', enforceStudentAccess(), (req, res) => studentScholarshipController.getByStudent(req, res));

router.get('/clubs/:org_id', (req, res) => studentClubController.getAll(req, res));

router.get('/career-sessions/:org_id', (req, res) => studentCareerController.getSessions(req, res));

router.get('/internships/:org_id', (req, res) => studentCareerController.getInternships(req, res));

router.get('/hostel/:student_id', enforceStudentAccess(), (req, res) => studentHostelController.getByStudent(req, res));

router.get('/transport/:student_id', enforceStudentAccess(), (req, res) => studentTransportController.getByStudent(req, res));

router.post('/fee-payments', enforceFeeOwnership, (req, res) => studentFeePaymentController.pay(req, res));

router.post('/feedback', overrideBody('student_id'), (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.body.category || req.body.rating == null) {
    return res.status(400).json({ error: 'Required: category, rating' });
  }
  next();
}, (req, res) => studentFeedbackController.create(req, res));

router.get('/exam-questions/:exam_id', (req, res) => studentOnlineExamController.getQuestions(req, res));

router.post('/exam-submissions', overrideBody('student_id'), (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.body.exam_id || !req.body.answers) {
    return res.status(400).json({ error: 'Required: exam_id, answers' });
  }
  next();
}, (req, res) => studentOnlineExamController.submitExam(req, res));

router.get('/events/:org_id', (req, res) => studentEventController.getAll(req, res));

router.get('/receipt/:payment_id', (req, res) => studentFeePaymentController.getReceipt(req, res));

router.get('/payment-history/:student_id', enforceStudentAccess(), (req, res) => studentFeePaymentController.getPaymentHistory(req, res));

router.get('/conversations/:user_id', enforceUserAccess(), (req, res) => studentMessageController.getConversations(req, res));

router.patch('/messages/:id/read', (req, res) => studentMessageController.markRead(req, res));

router.get('/unread-count/:user_id', enforceUserAccess(), (req, res) => studentMessageController.getUnreadCount(req, res));

router.get('/teachers/:organisation_id', (req, res) => studentTeacherController.getAll(req, res));

router.get('/canteen/:student_id', enforceStudentAccess(), (req, res) => studentCanteenController.getByStudent(req, res));

router.post('/canteen-orders', overrideBody('student_id'), (req, res) => studentCanteenController.createOrder(req, res));

router.get('/health/:student_id', enforceStudentAccess(), async (req, res) => {
  const { student_id } = req.params;
  try {
    const [reportsRes, vaccinesRes, medicalRes, checkupsRes, medicationsRes, moodRes, covidRes, emergencyRes, healthRecordsRes] = await Promise.all([
      supabase.from('documents').select('*').eq('student_id', student_id).eq('document_type', 'Health Report').order('created_at', { ascending: false }),
      supabase.from('vaccinations').select('*').eq('student_id', student_id).order('vaccination_date', { ascending: false, nullsFirst: true }),
      supabase.from('health_medical_records').select('*').eq('student_id', student_id).order('record_date', { ascending: false }),
      supabase.from('health_checkups').select('*').eq('student_id', student_id).order('checkup_date', { ascending: false, nullsFirst: true }),
      supabase.from('health_medications').select('*').eq('student_id', student_id).order('created_at', { ascending: false }),
      supabase.from('health_mood_logs').select('*').eq('student_id', student_id).order('created_at', { ascending: false }),
      supabase.from('health_covid_tracking').select('*').eq('student_id', student_id).order('created_at', { ascending: false }),
      supabase.from('health_emergency_contacts').select('*').eq('student_id', student_id),
      supabase.from('health_records').select('*').eq('student_id', student_id).eq('recorded_by', 'Student').order('recorded_at', { ascending: false })
    ]);
    const healthRecords = healthRecordsRes.data || [];
    res.json({
      reports: reportsRes.data || [],
      vaccinations: vaccinesRes.data || [],
      medicalRecords: [...healthRecords, ...(medicalRes.data || [])],
      checkups: checkupsRes.data || [],
      medications: medicationsRes.data || [],
      moodLogs: moodRes.data || [],
      covidTracking: covidRes.data || [],
      emergencyContacts: emergencyRes.data || []
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/health/medical-records', overrideBody('student_id'), (req, res) => studentHealthRecordsController.createMedicalRecord(req, res));

router.post('/health/checkups', overrideBody('student_id'), (req, res) => studentHealthRecordsController.createCheckup(req, res));

router.post('/health/medications', overrideBody('student_id'), (req, res) => studentHealthRecordsController.createMedication(req, res));

router.post('/health/vaccinations', overrideBody('student_id'), (req, res) => studentHealthRecordsController.createVaccination(req, res));

router.post('/health/emergency', overrideBody('student_id'), (req, res) => studentHealthRecordsController.createEmergencyContact(req, res));

router.post('/health/counseling', overrideBody('student_id'), (req, res) => studentHealthRecordsController.createCounseling(req, res));

router.post('/health/mood', overrideBody('student_id'), (req, res) => studentHealthRecordsController.logMood(req, res));

router.post('/health/covid', overrideBody('student_id'), (req, res) => studentHealthRecordsController.reportCovid(req, res));

router.patch('/health/covid/:id/resolve', (req, res) => studentHealthRecordsController.resolveCovid(req, res));

router.get('/health/emergency/:student_id', enforceStudentAccess(), (req, res) => studentHealthRecordsController.getEmergency(req, res));

router.get('/part-time-jobs/:organisation_id', (req, res) => studentPartTimeJobController.getAll(req, res));

router.post('/part-time-jobs/apply', overrideBody('applicant_id'), (req, res) => studentPartTimeJobController.apply(req, res));

router.get('/part-time-jobs/applications/:user_id', enforceUserAccess(), (req, res) => studentPartTimeJobController.getMyApplications(req, res));

export default router;
