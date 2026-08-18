import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class TimetableService {
  async getByClass(classId: string) {
    const { data, error } = await       supabase.from('timetable_entries').select('*, staff_records(*), subjects(*)').eq('class_id', classId).order('day_of_week');
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getByStudent(studentId: string) {
    const { data: mapping } = await supabase.from('class_student_map').select('class_id').eq('student_id', studentId).maybeSingle();
    if (!mapping) return [];
    const { data, error } = await       supabase.from('timetable_entries').select('*, staff_records(*), subjects(*)').eq('class_id', mapping.class_id).order('day_of_week');
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }
}
export const timetableService = new TimetableService();
