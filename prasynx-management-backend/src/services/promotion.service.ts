import { supabase } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class PromotionService {
  async getHistory(orgId: string) {
    const { data, error } = await supabase.from('promotion_history')
      .select('*, student:students(full_name, roll_number), from_class:classes!from_class_id(name), to_class:classes!to_class_id(name), academic_year:academic_years(name)')
      .eq('organisation_id', orgId).order('promoted_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async promoteStudents(orgId: string, body: { academic_year_id: string; from_class_id: string; to_class_id: string; student_ids: string[] }) {
    const { academic_year_id, from_class_id, to_class_id, student_ids } = body;
    if (!student_ids?.length) throw new BadRequestError('student_ids required');

    const records = student_ids.map(student_id => ({
      organisation_id: orgId,
      student_id,
      from_class_id,
      to_class_id,
      academic_year_id,
      promoted_by: null,
    }));

    const { data, error } = await supabase.from('promotion_history').insert(records).select();
    if (error) throw new BadRequestError(error.message);

    await supabase.from('class_student_map').delete().eq('class_id', from_class_id).in('student_id', student_ids);
    const enrollments = student_ids.map(student_id => ({ organisation_id: orgId, class_id: to_class_id, student_id }));
    await supabase.from('class_student_map').insert(enrollments);

    return data || [];
  }

  async getPromotionReport(orgId: string) {
    const { data: currentYear } = await supabase.from('academic_years').select('id').eq('organisation_id', orgId).eq('is_current', true).single();
    const { data: history, error } = await supabase.from('promotion_history')
      .select('*, student:students(full_name, roll_number), from_class:classes!from_class_id(name), to_class:classes!to_class_id(name)')
      .eq('organisation_id', orgId)
      .order('promoted_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return { current_year_id: currentYear?.id, promotions: history || [] };
  }
}

export const promotionService = new PromotionService();
