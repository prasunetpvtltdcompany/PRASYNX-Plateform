import { supabase } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class PromotionService {
  async getHistory(orgId: string) {
    const { data, error } = await supabase.from('promotion_history')
      .select('*, student:students(full_name, roll_number), from_class:classes!promotion_history_from_class_id_fkey(name), to_class:classes!promotion_history_to_class_id_fkey(name), academic_year_info:academic_years(name)')
      .eq('organisation_id', orgId).order('promoted_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return (data || []).map((r: any) => ({ ...r, year_label: r.academic_year_info?.name || r.academic_year || null }));
  }

  async promoteStudents(orgId: string, body: { academic_year_id: string; academic_year: string; from_class_id: string; to_class_id: string; student_ids: string[] }) {
    let { academic_year_id, academic_year, from_class_id, to_class_id, student_ids } = body;
    let dupBlocked: string | null = null;
    if (!student_ids?.length) throw new BadRequestError('student_ids required');
    if (!from_class_id || !to_class_id) throw new BadRequestError('from_class_id and to_class_id required');

    // Default to the active (current) academic year when none supplied
    let academicYearLabel = academic_year || null;
    if (!academic_year_id) {
      const { data: currentYear } = await supabase.from('academic_years').select('id, name').eq('organisation_id', orgId).eq('is_current', true).single();
      academic_year_id = currentYear?.id;
      academicYearLabel = academicYearLabel || currentYear?.name || null;
    }
    if (!academic_year_id && !academicYearLabel) throw new BadRequestError('No academic year selected and no active year found');

    // Reject students already promoted in the same academic year
    const { data: existing } = await supabase.from('promotion_history')
      .select('student_id, academic_year:academic_years(name)')
      .eq('organisation_id', orgId)
      .eq('academic_year_id', academic_year_id)
      .in('student_id', student_ids);
    const alreadyPromoted = new Set((existing || []).map((r: any) => r.student_id));
    const fresh = student_ids.filter((id: string) => !alreadyPromoted.has(id));
    if (!fresh.length) {
      throw new BadRequestError('All selected students are already promoted in this academic year');
    }
    if (fresh.length < student_ids.length) {
      const blocked = student_ids.filter((id: string) => alreadyPromoted.has(id));
      const { data: names } = await supabase.from('students').select('full_name').in('id', blocked);
      const nameMap = Object.fromEntries((names || []).map((n: any) => [n.id, n.full_name]));
      const dupNames = blocked.map((id: string) => nameMap[id] || id.slice(0, 8)).join(', ');
      // skip already-promoted; keep only fresh students for the operation
      student_ids = fresh;
      dupBlocked = dupNames;
    }

    const records = student_ids.map(student_id => ({
      organisation_id: orgId,
      student_id,
      from_class_id,
      to_class_id,
      academic_year_id,
      academic_year: academicYearLabel,
      promoted_by: null,
    }));

    const { data, error } = await supabase.from('promotion_history').insert(records).select();
    if (error) throw new BadRequestError(error.message);

    await supabase.from('class_student_map').delete().eq('class_id', from_class_id).in('student_id', student_ids);
    const enrollments = student_ids.map(student_id => ({ organisation_id: orgId, class_id: to_class_id, student_id }));
    await supabase.from('class_student_map').insert(enrollments);

    return { records: data || [], skipped: dupBlocked || null };
  }

  async getPromotionReport(orgId: string) {
    const { data: currentYear } = await supabase.from('academic_years').select('id').eq('organisation_id', orgId).eq('is_current', true).single();
    const { data: history, error } = await supabase.from('promotion_history')
      .select('*, student:students(full_name, roll_number), from_class:classes!promotion_history_from_class_id_fkey(name), to_class:classes!promotion_history_to_class_id_fkey(name)')
      .eq('organisation_id', orgId)
      .order('promoted_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return { current_year_id: currentYear?.id, promotions: history || [] };
  }
}

export const promotionService = new PromotionService();
