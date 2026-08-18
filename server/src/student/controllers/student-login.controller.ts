import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendError } from '../utils/response';

export class StudentLoginController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) return sendError(res, 'Email and password required', 400);

    const { data: user, error } = await supabase.from('users').select('id,full_name,email,password_hash,role,organisation_id,status').eq('email', email).single();
    if (error || !user) return sendError(res, 'User not found', 401);
    if (user.role !== 'student') return sendError(res, 'Unauthorized role', 403);
    if (user.status !== 'active') return sendError(res, 'Account is not active', 403);

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return sendError(res, 'Invalid credentials', 401);

    const { data: student } = await supabase.from('students').select('*').eq('user_id', user.id).eq('organisation_id', user.organisation_id).single();
    if (!student) return sendError(res, 'Student not found', 404);

    const { data: classMap } = await supabase.from('class_student_map').select('class_id, section_id').eq('student_id', student.id);
    const classIds = classMap?.map(c => c.class_id) || [];
    let teachers: any[] = [];
    if (classIds.length > 0) {
      const { data: cstm } = await supabase.from('class_subject_teacher_map').select('teacher_id').in('class_id', classIds);
      const teacherIds = [...new Set(cstm?.map(t => t.teacher_id) || [])];
      if (teacherIds.length > 0) {
        const { data: t } = await supabase.from('staff_records').select('*').in('id', teacherIds);
        teachers = t || [];
      }
    }

    // Compute class/section display names from the mapping (students table no
    // longer stores student_class / student_section text columns).
    let student_class = '';
    let section = '';
    if (classIds.length > 0) {
      const { data: cls } = await supabase.from('classes').select('name').in('id', classIds).limit(1);
      student_class = cls?.[0]?.name || '';
      const sectionIds = (classMap || []).map(c => c.section_id).filter(Boolean);
      if (sectionIds.length > 0) {
        const { data: secs } = await supabase.from('sections').select('name').in('id', sectionIds as string[]).limit(1);
        section = secs?.[0]?.name || '';
      }
    }

    sendSuccess(res, {
      user: { id: user.id, full_name: user.full_name, email: user.email, organisation_id: user.organisation_id },
      student: { ...student, student_class, section }, teachers
    });
  }
}
export const studentLoginController = new StudentLoginController();
