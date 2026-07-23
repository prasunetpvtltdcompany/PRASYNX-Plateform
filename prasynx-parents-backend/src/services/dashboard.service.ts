import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class DashboardService {
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
}
export const dashboardService = new DashboardService();
