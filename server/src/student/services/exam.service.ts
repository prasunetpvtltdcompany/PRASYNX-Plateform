import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class ExamService {
  async getExams(studentId: string) {
    const { data, error } = await supabase.from('exams').select('*, schedules:exam_schedules(*)');
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getMarks(studentId: string) {
    const { data, error } = await supabase.from('grades').select('*').eq('student_id', studentId).order('created_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }
}
export const examService = new ExamService();
