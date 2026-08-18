import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class PerformanceService {
  async getPerformance(studentId: string) {
    const { data: studentClasses, error: classError } = await supabase
      .from('class_student_map')
      .select('class_id')
      .eq('student_id', studentId);

    if (classError) throw new BadRequestError(classError.message);

    const classIds = studentClasses?.map(s => s.class_id) || [];

    const [gradesResult, examsResult] = await Promise.all([
      supabase.from('grades').select('*').eq('student_id', studentId).order('created_at', { ascending: false }),
      classIds.length > 0
        ? supabase.from('exam_schedules').select('*').in('class_id', classIds).order('date', { ascending: true }).limit(10)
        : supabase.from('exam_schedules').select('*').eq('id', 'none').order('date', { ascending: true }).limit(10)
    ]);

    if (gradesResult.error) throw new BadRequestError(gradesResult.error.message);
    if (examsResult.error) throw new BadRequestError(examsResult.error.message);

    return { grades: gradesResult.data || [], schedules: examsResult.data || [], results: gradesResult.data || [] };
  }
}
export const performanceService = new PerformanceService();
