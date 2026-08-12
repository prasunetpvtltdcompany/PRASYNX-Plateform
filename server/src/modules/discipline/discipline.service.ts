import { DisciplineRepository } from './discipline.repository';
import type { CreateDisciplineIncidentInput, DisciplineIncidentDTO, UpdateDisciplineIncidentInput } from '@prasynx/types';

export class DisciplineService {
  constructor(private repo: DisciplineRepository) {}

  list(tenantId: string): Promise<DisciplineIncidentDTO[]> {
    return this.repo.list(tenantId);
  }

  async get(tenantId: string, id: string): Promise<DisciplineIncidentDTO> {
    return this.repo.assertExists(tenantId, id);
  }

  async create(tenantId: string, input: CreateDisciplineIncidentInput, reporter: string): Promise<DisciplineIncidentDTO> {
    const id = await this.repo.create(tenantId, input, reporter);
    const created = await this.repo.findById(tenantId, id);
    if (!created) throw new Error('Incident was created but could not be loaded');
    return created;
  }

  async update(tenantId: string, id: string, input: UpdateDisciplineIncidentInput, userId: string): Promise<DisciplineIncidentDTO> {
    await this.repo.assertExists(tenantId, id);
    const patch: Record<string, unknown> = {};
    if (input.status !== undefined) patch.status = input.status;
    if (input.action_taken !== undefined) patch.action_taken = input.action_taken;
    if (input.action_detail !== undefined) patch.action_detail = input.action_detail;
    if (input.resolution_notes !== undefined) patch.resolution_notes = input.resolution_notes;
    if (input.status === 'resolved') {
      patch.resolved_by = userId;
      patch.resolved_at = new Date().toISOString();
    }
    await this.repo.update(tenantId, id, patch);
    const updated = await this.repo.findById(tenantId, id);
    if (!updated) throw new Error('Incident could not be reloaded');
    await this.repo.addLog(tenantId, id, {
      log_type: input.status ? 'status' : 'action',
      to_value: input.status ?? input.action_detail,
      note: input.resolution_notes,
      created_by: userId,
    });
    return updated;
  }
}

export const disciplineService = new DisciplineService(new DisciplineRepository());