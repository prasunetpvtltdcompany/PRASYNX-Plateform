import type { CreateDisciplineIncidentInput, DisciplineIncidentDTO } from '@prasynx/types';
import { db } from '../../infrastructure/database/supabase';
import { NotFoundError } from '../../shared/errors/errors';

const INCIDENT_COLUMNS =
  'id,organisation_id,student_id,incident_type,title,description,severity,location,reported_by,reported_at,action_taken,action_detail,action_date,status,resolution_notes,resolved_by,resolved_at,evidence_url,created_at,updated_at';

export class DisciplineRepository {
  async list(tenantId: string): Promise<DisciplineIncidentDTO[]> {
    const { data, error } = await db
      .from('behavioral_incidents')
      .select(INCIDENT_COLUMNS)
      .eq('organisation_id', tenantId)
      .order('reported_at', { ascending: false });
    if (error) throw error;
    return (data as unknown as DisciplineIncidentDTO[]) ?? [];
  }

  async findById(tenantId: string, id: string): Promise<DisciplineIncidentDTO | null> {
    const { data, error } = await db
      .from('behavioral_incidents')
      .select(INCIDENT_COLUMNS)
      .eq('id', id)
      .eq('organisation_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as DisciplineIncidentDTO | null) ?? null;
  }

  async create(tenantId: string, input: CreateDisciplineIncidentInput, reporter: string): Promise<string> {
    const { data, error } = await db
      .from('behavioral_incidents')
      .insert({
        organisation_id: tenantId,
        student_id: input.student_id,
        incident_type: input.incident_type ?? 'general',
        title: input.title,
        description: input.description ?? null,
        severity: input.severity ?? 'low',
        location: input.location ?? null,
        reported_by: reporter,
        reported_at: new Date().toISOString(),
        action_taken: input.action_taken ?? null,
        status: input.status ?? 'open',
        evidence_url: input.evidence_url ?? null,
      })
      .select('id')
      .single();
    if (error || !data) throw error ?? new Error('Incident could not be recorded');
    return data.id as string;
  }

  async update(tenantId: string, id: string, patch: Record<string, unknown>): Promise<void> {
    const { error } = await db
      .from('behavioral_incidents')
      .update(patch)
      .eq('id', id)
      .eq('organisation_id', tenantId);
    if (error) throw error;
  }

  async addLog(tenantId: string, incidentId: string, log: Record<string, unknown>): Promise<void> {
    const { error } = await db.from('behavioral_incident_log').insert({
      incident_id: incidentId,
      organisation_id: tenantId,
      ...log,
    });
    if (error) throw error;
  }

  async assertExists(tenantId: string, id: string): Promise<DisciplineIncidentDTO> {
    const found = await this.findById(tenantId, id);
    if (!found) throw new NotFoundError('Incident not found in this school');
    return found;
  }
}