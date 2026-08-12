import type { CreateSchoolSubjectInput, SchoolSubjectDTO, UpdateSchoolSubjectInput } from '@prasynx/types';
import { db } from '../../infrastructure/database/supabase';
import { NotFoundError } from '../../shared/errors/errors';

const SUBJECT_COLUMNS = 'id,organisation_id,name,code,description,created_at';

export class SubjectsRepository {
  async list(tenantId: string): Promise<SchoolSubjectDTO[]> {
    const { data, error } = await db
      .from('subjects')
      .select(SUBJECT_COLUMNS)
      .eq('organisation_id', tenantId)
      .order('name');
    if (error) throw error;
    return (data as unknown as SchoolSubjectDTO[]) ?? [];
  }

  async findById(tenantId: string, id: string): Promise<SchoolSubjectDTO | null> {
    const { data, error } = await db
      .from('subjects')
      .select(SUBJECT_COLUMNS)
      .eq('id', id)
      .eq('organisation_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as SchoolSubjectDTO | null) ?? null;
  }

  async create(tenantId: string, input: CreateSchoolSubjectInput): Promise<string> {
    const row = {
      organisation_id: tenantId,
      name: input.name,
      code: input.code ?? null,
      description: input.description ?? null,
    };
    const { data, error } = await db.from('subjects').insert(row).select('id').single();
    if (error || !data) throw error ?? new Error('Subject could not be created');
    return data.id as string;
  }

  async update(tenantId: string, id: string, input: UpdateSchoolSubjectInput): Promise<void> {
    const changes: Record<string, unknown> = {};
    if (input.name !== undefined) changes.name = input.name;
    if (input.code !== undefined) changes.code = input.code || null;
    if (input.description !== undefined) changes.description = input.description || null;
    const { error } = await db.from('subjects').update(changes).eq('id', id).eq('organisation_id', tenantId);
    if (error) throw error;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const { error } = await db.from('subjects').delete().eq('id', id).eq('organisation_id', tenantId);
    if (error) throw error;
  }

  async assertExists(tenantId: string, id: string): Promise<SchoolSubjectDTO> {
    const found = await this.findById(tenantId, id);
    if (!found) throw new NotFoundError('Subject not found in this school');
    return found;
  }
}