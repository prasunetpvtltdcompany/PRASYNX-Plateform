import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class AttendanceService {
  private async getStudentMeta(studentId: string) {
    const { data, error } = await supabase
      .from('students')
      .select('organisation_id, class_id, section_id')
      .eq('id', studentId)
      .maybeSingle();
    if (error || !data) throw new BadRequestError('Student not found: ' + studentId);
    return data;
  }

  async markAttendance(data: { teacher_id: string; student_id: string; date: string; status: string; notes?: string }) {
    const { teacher_id, student_id, date, status, notes } = data;
    if (!teacher_id || !student_id || !date || !status) {
      throw new BadRequestError('Required fields: teacher_id, student_id, date, status');
    }
    const meta = await this.getStudentMeta(student_id);

    const { data: existing } = await supabase
      .from('attendance_records')
      .select('id')
      .eq('student_id', student_id)
      .eq('attendance_date', date)
      .is('subject_id', null)
      .maybeSingle();

    const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    let result: any;
    if (existing) {
      const { data: updated, error } = await supabase
        .from('attendance_records')
        .update({
          attendance_status: capitalizedStatus,
          remarks: notes || null,
          teacher_id
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw new BadRequestError(error.message);
      result = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('attendance_records')
        .insert({
          organisation_id: meta.organisation_id,
          student_id,
          class_id: meta.class_id,
          section_id: meta.section_id,
          teacher_id,
          attendance_date: date,
          attendance_status: capitalizedStatus,
          remarks: notes || null
        })
        .select()
        .single();
      if (error) throw new BadRequestError(error.message);
      result = inserted;
    }

    try {
      const { data: student } = await supabase.from('students').select('organisation_id, full_name').eq('id', student_id).single();
      if (student) {
        const { data: parents } = await supabase.from('parent_student_links').select('parent_id').eq('student_id', student_id);
        if (parents && parents.length > 0) {
          const notifications = parents.map((p: any) => ({
            user_id: p.parent_id, title: `Attendance Marked - ${student.full_name}`,
            message: `${student.full_name} was marked "${status}" on ${date}.`, type: status === 'absent' ? 'warning' : 'info', read: false,
          }));
          await supabase.from('notifications').insert(notifications);
        }
      }
    } catch (e) { console.error('[Attendance] Failed to notify parents:', e); }

    const mappedResult = {
      id: result.id,
      student_id: result.student_id,
      teacher_id: result.teacher_id,
      date: result.attendance_date,
      status: result.attendance_status.toLowerCase(),
      notes: result.remarks,
      created_at: result.created_at,
      organisation_id: result.organisation_id
    };

    return { attendance: mappedResult };
  }

  async bulkAttendance(data: { teacher_id: string; class_id: string; date: string; attendance_records: any[] }) {
    const { teacher_id, class_id, date, attendance_records } = data;
    if (!teacher_id || !class_id || !date || !attendance_records) {
      throw new BadRequestError('Required fields: teacher_id, class_id, date, attendance_records');
    }

    const results = [];
    for (const record of attendance_records) {
      const meta = await this.getStudentMeta(record.student_id);
      const capitalizedStatus = record.status.charAt(0).toUpperCase() + record.status.slice(1).toLowerCase();

      const { data: existing } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('student_id', record.student_id)
        .eq('attendance_date', date)
        .is('subject_id', null)
        .maybeSingle();

      let result: any;
      if (existing) {
        const { data: updated, error } = await supabase
          .from('attendance_records')
          .update({
            attendance_status: capitalizedStatus,
            remarks: record.notes || null,
            teacher_id
          })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw new BadRequestError(error.message);
        result = updated;
      } else {
        const { data: inserted, error } = await supabase
          .from('attendance_records')
          .insert({
            organisation_id: meta.organisation_id,
            student_id: record.student_id,
            class_id: meta.class_id,
            section_id: meta.section_id,
            teacher_id,
            attendance_date: date,
            attendance_status: capitalizedStatus,
            remarks: record.notes || null
          })
          .select()
          .single();
        if (error) throw new BadRequestError(error.message);
        result = inserted;
      }

      results.push({
        id: result.id,
        student_id: result.student_id,
        teacher_id: result.teacher_id,
        date: result.attendance_date,
        status: result.attendance_status.toLowerCase(),
        notes: result.remarks,
        created_at: result.created_at,
        organisation_id: result.organisation_id
      });
    }

    return { attendance: results };
  }

  async getAttendance(studentId: string) {
    const { data, error } = await supabase
      .from('attendance_records').select('*').eq('student_id', studentId)
      .order('attendance_date', { ascending: false });
    if (error) throw new BadRequestError(error.message);

    const mapped = (data || []).map((r: any) => ({
      id: r.id,
      student_id: r.student_id,
      teacher_id: r.teacher_id,
      date: r.attendance_date,
      status: r.attendance_status ? r.attendance_status.toLowerCase() : 'present',
      notes: r.remarks,
      created_at: r.created_at,
      organisation_id: r.organisation_id
    }));

    return { attendance: mapped };
  }

  async getAttendanceReport(studentId: string) {
    const { data, error } = await supabase
      .from('attendance_records').select('*').eq('student_id', studentId);
    if (error) throw new BadRequestError(error.message);

    const mapped = (data || []).map((r: any) => ({
      id: r.id,
      student_id: r.student_id,
      teacher_id: r.teacher_id,
      date: r.attendance_date,
      status: r.attendance_status ? r.attendance_status.toLowerCase() : 'present',
      notes: r.remarks,
      created_at: r.created_at,
      organisation_id: r.organisation_id
    }));

    const total = mapped.length;
    const present = mapped.filter((a: any) => a.status === 'present').length;
    const absent = mapped.filter((a: any) => a.status === 'absent').length;
    const late = mapped.filter((a: any) => a.status === 'late').length;
    return { total, present, absent, late, percentage: total > 0 ? Math.round((present / total) * 100) : 0, records: mapped };
  }
}
export const attendanceService = new AttendanceService();
