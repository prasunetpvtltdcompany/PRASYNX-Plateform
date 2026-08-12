import type { PromotionDTO } from '@prasynx/types';
import { db } from '../../infrastructure/database/supabase';
import { NotFoundError } from '../../shared/errors/errors';

const PROMOTION_COLUMNS =
  'id,organisation_id,student_id,from_class_id,from_section_id,to_class_id,to_section_id,academic_year_id,academic_year,promoted_by,remarks,promoted_at,created_at';

export class PromotionRepository {
  async list(tenantId: string): Promise<PromotionDTO[]> {
    const { data, error } = await db
      .from('promotion_history')
      .select(PROMOTION_COLUMNS)
      .eq('organisation_id', tenantId)
      .order('promoted_at', { ascending: false });
    if (error) throw error;
    return (data as unknown as PromotionDTO[]) ?? [];
  }

  async getStudent(tenantId: string, studentId: string): Promise<{ id: string; full_name: string; class_id: string | null; section_id: string | null } | null> {
    const { data, error } = await db
      .from('students')
      .select('id,full_name,class_id,section_id')
      .eq('id', studentId)
      .eq('organisation_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return data as unknown as typeof data & { id: string } | null;
  }

  async getClass(tenantId: string, classId: string): Promise<{ id: string; name: string } | null> {
    const { data, error } = await db
      .from('classes')
      .select('id,name')
      .eq('id', classId)
      .eq('organisation_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return data as unknown as { id: string; name: string } | null;
  }

  async createHistory(tenantId: string, row: Record<string, unknown>): Promise<PromotionDTO> {
    const { data, error } = await db.from('promotion_history').insert(row).select(PROMOTION_COLUMNS).single();
    if (error || !data) throw error ?? new Error('Promotion could not be recorded');
    return data as unknown as PromotionDTO;
  }

  async moveToClass(tenantId: string, studentId: string, toClassId: string, toSectionId: string | null): Promise<void> {
    const { error: delErr } = await db
      .from('class_student_map')
      .delete()
      .eq('organisation_id', tenantId)
      .eq('student_id', studentId);
    if (delErr) throw delErr;
    const { error: insErr } = await db.from('class_student_map').insert({
      organisation_id: tenantId,
      class_id: toClassId,
      student_id: studentId,
    });
    if (insErr) throw insErr;
    const { error: updErr } = await db
      .from('students')
      .update({ class_id: toClassId, section_id: toSectionId })
      .eq('id', studentId)
      .eq('organisation_id', tenantId);
    if (updErr) throw updErr;
  }

  async assertNotFound(tenantId: string, studentId: string): Promise<{ id: string; full_name: string; class_id: string | null; section_id: string | null }> {
    const found = await this.getStudent(tenantId, studentId);
    if (!found) throw new NotFoundError('Student not found in this school');
    return found;
  }
}