import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class TimetableService {
  async getTimetable(teacherId: string) {
    const { data, error } = await supabase
      .from('timetable_entries')
      .select('*, class:classes!timetable_entries_class_id_fkey(*), subject:subjects(*)')
      .eq('teacher_id', teacherId)
      .order('day_of_week');
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getAdminTimetable(orgId: string) {
    const { data, error } = await supabase
      .from('timetable_entries')
      .select('*, class:classes!timetable_entries_class_id_fkey(*), subject:subjects(*), teacher:staff_records(*)')
      .eq('organisation_id', orgId)
      .order('day_of_week');
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async createAdminTimetable(data: { organisation_id: string; class_id: string; subject_id: string; teacher_id: string; day_of_week: number; start_time: string; end_time: string }) {
    const { data: result, error } = await supabase
      .from('timetable_entries')
      .insert(data)
      .select()
      .single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }
}
export const timetableService = new TimetableService();
