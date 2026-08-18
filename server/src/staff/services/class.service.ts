import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class ClassService {
  async getClasses(teacherId: string) {
    const { data, error } = await supabase
      .from('class_subject_teacher_map')
      .select('*, class:classes!class_subject_teacher_map_class_id_fkey(*), subject:subjects(*)')
      .eq('teacher_id', teacherId);
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getAdminClasses(orgId: string) {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('organisation_id', orgId)
      .order('name');
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async createAdminClass(data: { organisation_id: string; class_name: string; section?: string }) {
    const { data: result, error } = await supabase
      .from('classes')
      .insert({ organisation_id: data.organisation_id, name: data.class_name })
      .select()
      .single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }
}
export const classService = new ClassService();
