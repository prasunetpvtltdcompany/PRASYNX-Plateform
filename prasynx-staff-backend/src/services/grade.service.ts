import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class GradeService {
  async addGrade(data: { teacher_id: string; student_id: string; subject: string; grade: string; semester?: string; notes?: string }) {
    const { teacher_id, student_id, subject, grade, semester, notes } = data;
    if (!teacher_id || !student_id || !subject || !grade) {
      throw new BadRequestError('Required fields: teacher_id, student_id, subject, grade');
    }
    const { data: result, error } = await supabase
      .from('grades')
      .insert({ teacher_id, student_id, subject, grade, semester: semester || 'current', notes: notes || null })
      .select().single();
    if (error) throw new BadRequestError(error.message);
    return { grade: result };
  }

  async getGrades(studentId: string) {
    const { data, error } = await supabase
      .from('grades').select('*').eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return { grades: data || [] };
  }
}
export const gradeService = new GradeService();
