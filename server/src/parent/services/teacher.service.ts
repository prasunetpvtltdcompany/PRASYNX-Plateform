import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class TeacherService {
  async getTeachers(organisationId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('organisation_id', organisationId)
      .eq('role', 'teacher');
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }
}
export const teacherService = new TeacherService();
