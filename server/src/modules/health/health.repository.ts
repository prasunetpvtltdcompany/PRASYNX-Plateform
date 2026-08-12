import type { CreateHealthRecordInput, HealthRecordDTO } from '@prasynx/types';
import { db } from '../../infrastructure/database/supabase';
import { NotFoundError } from '../../shared/errors/errors';

const COLUMNS = 'id,organisation_id,student_id,record_type,title,description,value,recorded_by,recorded_at,created_at';

export class HealthRepository {
  async list(tenantId: string): Promise<HealthRecordDTO[]> {
    const { data, error } = await db
      .from('health_records')
      .select(COLUMNS)
      .eq('organisation_id', tenantId)
      .order('recorded_at', { ascending: false, nullsFirst: false });
    if (error) throw error;
    return (data as unknown as HealthRecordDTO[]) ?? [];
  }

  async findById(tenantId: string, id: string): Promise<HealthRecordDTO | null> {
    const { data, error } = await db
      .from('health_records')
      .select(COLUMNS)
      .eq('id', id)
      .eq('organisation_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as HealthRecordDTO | null) ?? null;
  }

  async create(tenantId: string, input: CreateHealthRecordInput, recordedBy: string | undefined): Promise<string> {
    const row = {
      organisation_id: tenantId,
      student_id: input.student_id,
      record_type: input.record_type,
      title: input.title,
      description: input.description ?? null,
      value: input.value ?? null,
      recorded_by: recordedBy ?? null,
      recorded_at: new Date().toISOString(),
    };
    const { data, error } = await db.from('health_records').insert(row).select('id').single();
    if (error || !data) throw error ?? new Error('Health record could not be created');
    return data.id as string;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const { error } = await db.from('health_records').delete().eq('id', id).eq('organisation_id', tenantId);
    if (error) throw error;
  }

  async assertExists(tenantId: string, id: string): Promise<HealthRecordDTO> {
    const found = await this.findById(tenantId, id);
    if (!found) throw new NotFoundError('Health record not found in this school');
    return found;
  }
}