import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class AttendanceService {
  async getAttendance(studentId: string) {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });
    if (error) throw new BadRequestError(error.message);
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
    const present = records.filter((r: any) => r.status === 'present').length;
    const absent = records.filter((r: any) => r.status === 'absent').length;
    const late = records.filter((r: any) => r.status === 'late').length;
    const total = records.length;

    // Build monthly statistics dynamically
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = new Map<string, { present: number; absent: number; late: number; total: number; index: number }>();

    records.forEach((r: any) => {
      if (!r.date) return;
      const d = new Date(r.date);
      if (isNaN(d.getTime())) return;
      const mIndex = d.getUTCMonth();
      const year = d.getUTCFullYear();
      const key = `${year}-${String(mIndex + 1).padStart(2, '0')}`;

      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { present: 0, absent: 0, late: 0, total: 0, index: mIndex });
      }

      const stats = monthlyMap.get(key)!;
      stats.total++;
      if (r.status === 'present') stats.present++;
      else if (r.status === 'absent') stats.absent++;
      else if (r.status === 'late') stats.late++;
    });

    const monthly = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, stats]) => ({
        month: monthNames[stats.index],
        rate: stats.total ? Math.round((stats.present / stats.total) * 100) : 100,
        present: stats.present,
        absent: stats.absent,
        late: stats.late,
        days: stats.total
      }));

    return {
      records,
      present,
      absent,
      late,
      total,
      percentage: total ? Math.round((present / total) * 100) : 100,
      monthly
    };
  }
}
export const attendanceService = new AttendanceService();
