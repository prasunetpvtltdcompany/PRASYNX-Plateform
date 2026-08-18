import { supabase } from '../config/database';
export class DashboardService {
  async getDashboard(studentId: string) {
    const [attendance, assignmentsRes, recentMarks, examsRes, feeStatus] = await Promise.all([
      supabase.from('attendance').select('*').eq('student_id', studentId),
      supabase.from('assignments').select('*').eq('status', 'active'),
      supabase.from('grades').select('*').eq('student_id', studentId).limit(5),
      supabase.from('exam_schedules').select('*'),
      supabase.from('student_fees').select('*').eq('student_id', studentId)
    ]);
    const attendanceCount = attendance.data?.length || 0;
    const presentCount = attendance.data?.filter((a: any) => a.status === 'present').length || 0;
    const attendancePercentage = attendanceCount > 0 ? Math.round((presentCount / attendanceCount) * 100) : 0;
    return {
      attendance: { total: attendanceCount, present: presentCount, percentage: attendancePercentage },
      assignments: assignmentsRes.data || [],
      recentMarks: recentMarks.data || [],
      upcomingExams: examsRes.data || [],
      fees: feeStatus.data || []
    };
  }
}
export const dashboardService = new DashboardService();
