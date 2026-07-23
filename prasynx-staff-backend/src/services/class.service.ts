import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class ClassService {
  async getClasses(teacherId: string) {
    const { data, error } = await supabase
      .from('class_subject_teacher_map')
      .select('*, class:classes(*), subject:subjects(*)')
      .eq('teacher_id', teacherId);
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getAdminClasses(orgId: string) {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('organisation_id', orgId)
      .order('class_name');
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async createAdminClass(data: { organisation_id: string; class_name: string; section?: string }) {
    const { data: result, error } = await supabase
      .from('classes')
      .insert({ organisation_id: data.organisation_id, class_name: data.class_name, section: data.section || null })
      .select()
      .single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }
}
export const classService = new ClassService();
