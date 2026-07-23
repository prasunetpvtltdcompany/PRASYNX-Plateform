/**
 * @deprecated Use domain-specific services instead (dashboard, children, attendance, etc.)
 * Kept for backward compatibility. New code should import from individual services.
 */
import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class ParentService {
  async getDashboard(parentId: string, userId: string) {
    const { data: links, error: linksError } = await supabase
      .from('parent_student_links')
      .select('student:students(*)')
      .eq('parent_id', parentId);
    if (linksError) throw new BadRequestError(linksError.message);

    const studentIds = links?.map((l: any) => l.student_id) || [];

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

    const pendingFees = fees.data?.filter((f: any) => f.status === 'pending') || [];
    const attendanceWarnings = studentIds.map((sid: string) => {
      const ca = mappedAttendance.filter((r: any) => r.student_id === sid);
      const pct = ca.length ? Math.round((ca.filter((r: any) => r.status === 'present').length / ca.length) * 100) : 100;
      return { student_id: sid, attendancePercentage: pct, warning: pct < 85 ? 'Attendance below 85%' : null };
    });

    return {
      children: links?.map((l: any) => l.student) || [],
      recentAttendance: mappedAttendance,
      recentMarks: marks.data || [],
      pendingFees,
      upcomingExams: exams.data || [],
      notifications: notifications.data || [],
      attendanceWarnings
    };
  }

  async getChildren(parentId: string) {
    const { data, error } = await supabase
      .from('parent_student_links')
      .select('student:students(*)')
      .eq('parent_id', parentId);
    if (error) throw new BadRequestError(error.message);
    return data?.map((r: any) => r.student) || [];
  }

  async getAttendance(studentId: string) {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('student_id', studentId)
      .order('attendance_date', { ascending: false });
    if (error) throw new BadRequestError(error.message);

    const records = (data || []).map((r: any) => ({
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

    const present = records.filter((r: any) => r.status === 'present').length;
    const total = records.length;
    return { records, present, total, percentage: total ? Math.round((present / total) * 100) : 100 };
  }

  async getPerformance(studentId: string) {
    const { data: studentClasses, error: classError } = await supabase
      .from('class_student_map')
      .select('class_id')
      .eq('student_id', studentId);

    const classIds = studentClasses?.map(s => s.class_id) || [];

    const [gradesResult, examsResult] = await Promise.all([
      supabase.from('grades').select('*').eq('student_id', studentId).order('created_at', { ascending: false }),
      classIds.length > 0
        ? supabase.from('exam_schedules').select('*').in('class_id', classIds).order('date', { ascending: true }).limit(10)
        : supabase.from('exam_schedules').select('*').eq('id', 'none').order('date', { ascending: true }).limit(10)
    ]);
    return { grades: gradesResult.data || [], schedules: examsResult.data || [], results: gradesResult.data || [] };
  }

  async getAssignments(studentId: string) {
    const { data: studentClasses, error: classError } = await supabase
      .from('class_student_map')
      .select('class_id')
      .eq('student_id', studentId);

    const classIds = studentClasses?.map(s => s.class_id) || [];
    if (classIds.length === 0) return [];

    const [assignmentsResult, submissionsResult] = await Promise.all([
      supabase.from('assignments').select('*').in('class_id', classIds).order('due_date', { ascending: true }),
      supabase.from('assignment_submissions').select('*').eq('student_id', studentId)
    ]);
    const subs = submissionsResult.data || [];
    return (assignmentsResult.data || []).map((a: any) => {
      const sub = subs.find((s: any) => s.assignment_id === a.id);
      const overdue = a.due_date ? new Date(a.due_date) < new Date() : false;
      return { ...a, submitted: Boolean(sub), submission: sub, status: sub?.status || (overdue ? 'overdue' : 'pending') };
    });
  }

  async getTeachers(organisationId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('organisation_id', organisationId)
      .eq('role', 'teacher');
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getTransport(studentId: string) {
    const { data, error } = await supabase
      .from('transport_assignments')
      .select('*')
      .eq('student_id', studentId)
      .single();
    if (error && error.code !== 'PGRST116') throw new BadRequestError(error.message);
    return data || null;
  }

  async getHostel(studentId: string) {
    const { data, error } = await supabase
      .from('hostel_allocations')
      .select('*, room:hostel_rooms(*)')
      .eq('student_id', studentId)
      .single();
    if (error && error.code !== 'PGRST116') throw new BadRequestError(error.message);
    return data || null;
  }

  async getFeesSummary(parentId: string) {
    const { data: links, error: linksError } = await supabase
      .from('parent_student_links')
      .select('student_id')
      .eq('parent_id', parentId);
    if (linksError) throw new BadRequestError(linksError.message);

    const studentIds = links?.map((r: any) => r.student_id) || [];
    const [feesResult, documentsResult] = await Promise.all([
      supabase.from('student_fees').select('*, payments:fee_payments(*)').in('student_id', studentIds),
      supabase.from('documents').select('*').in('user_id', studentIds).in('document_type', ['Receipt', 'Tax Statement'])
    ]);

    const fees = feesResult.data || [];
    const totalDue = fees.reduce((s: number, f: any) => f.status === 'pending' ? s + parseFloat(f.amount || 0) : s, 0);
    const totalPaid = fees.reduce((s: number, f: any) => {
      return s + (f.payments?.reduce((ss: number, p: any) => ss + parseFloat(p.amount_paid || 0), 0) || 0);
    }, 0);
    const overdueCount = fees.filter((f: any) => f.status === 'overdue').length;

    return { studentFees: fees, feeDocuments: documentsResult.data || [], totalDue, totalPaid, overdueCount };
  }

  async getHealth(studentId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', studentId)
      .eq('document_type', 'Health Report')
      .order('issued_date', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return { reports: data || [] };
  }

  async getAnnouncements(orgId: string) {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('organisation_id', orgId)
      .order('published_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  // Messaging
  async sendMessage(data: { sender_id: string; recipient_id: string; message: string }) {
    const { data: result, error } = await supabase
      .from('direct_messages')
      .insert({ sender_id: data.sender_id, recipient_id: data.recipient_id, message: data.message })
      .select();
    if (error) throw new BadRequestError(error.message);
    return result?.[0];
  }

  async getConversation(userId: string, otherUserId: string) {
    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: true });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }
}

export const parentService = new ParentService();
