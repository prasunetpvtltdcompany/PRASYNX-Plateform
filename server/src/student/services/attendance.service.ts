import { supabase } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class AttendanceService {
  async getByStudent(studentId: string) {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('student_id', studentId)
      .order('attendance_date', { ascending: false });
    if (error) throw new BadRequestError(error.message);

    return (data || []).map((r: any) => ({
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
  }

  async scanQr(data: { student_id: string; qr_data: string }) {
    let parsed: any;
    try { parsed = typeof data.qr_data === 'string' ? JSON.parse(data.qr_data) : data.qr_data; } catch { throw new BadRequestError('Invalid QR code data'); }
    const { token, teacher_id } = parsed;
    if (!token || !teacher_id) throw new BadRequestError('Invalid QR code format');
    const { data: session } = await supabase.from('qr_sessions').select('*').eq('token', token).eq('is_active', true).single();
    if (!session) throw new NotFoundError('QR session not found or expired');
    if (new Date(session.expires_at) < new Date()) {
      await supabase.from('qr_sessions').update({ is_active: false }).eq('id', session.id);
      throw new BadRequestError('QR code has expired');
    }
    const today = new Date().toISOString().slice(0, 10);
    const { data: existing } = await supabase
      .from('attendance_records')
      .select('id, attendance_status')
      .eq('student_id', data.student_id)
      .eq('attendance_date', today)
      .maybeSingle();

    if (existing) {
      return { 
        success: true, 
        message: 'Attendance already recorded for today', 
        attendance: {
          id: existing.id,
          status: existing.attendance_status.toLowerCase()
        }, 
        alreadyMarked: true 
      };
    }

    const { data: student, error: studErr } = await supabase
      .from('students')
      .select('organisation_id, class_id, section_id')
      .eq('id', data.student_id)
      .maybeSingle();
    if (studErr || !student) throw new NotFoundError('Student not found');

    const { data: attendance, error: attendError } = await supabase
      .from('attendance_records')
      .insert({
        organisation_id: student.organisation_id,
        student_id: data.student_id,
        class_id: student.class_id,
        section_id: student.section_id,
        subject_id: session.subject_id || null,
        teacher_id,
        attendance_date: today,
        attendance_status: 'Present',
        remarks: `QR scan - ${session.subject || 'N/A'}`
      })
      .select()
      .single();

    if (attendError) throw new BadRequestError(attendError.message);
    
    return { 
      success: true, 
      message: 'Attendance marked successfully', 
      attendance: {
        id: attendance.id,
        student_id: attendance.student_id,
        teacher_id: attendance.teacher_id,
        date: attendance.attendance_date,
        status: attendance.attendance_status.toLowerCase(),
        notes: attendance.remarks
      } 
    };
  }
}
export const attendanceService = new AttendanceService();
