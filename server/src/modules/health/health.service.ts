import { HealthRepository } from './health.repository';
import type { CreateHealthRecordInput, HealthRecordDTO } from '@prasynx/types';

export class HealthService {
  constructor(private repo: HealthRepository) {}

  list(tenantId: string): Promise<HealthRecordDTO[]> {
    return this.repo.list(tenantId);
  }

  async get(tenantId: string, id: string): Promise<HealthRecordDTO> {
    return this.repo.assertExists(tenantId, id);
  }

  async create(tenantId: string, input: CreateHealthRecordInput, recordedBy: string | undefined): Promise<HealthRecordDTO> {
    const id = await this.repo.create(tenantId, input, recordedBy);
    const created = await this.repo.findById(tenantId, id);
    if (!created) throw new Error('Health record was created but could not be loaded');
    return created;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.repo.assertExists(tenantId, id);
    await this.repo.remove(tenantId, id);
  }
}

export const healthService = new HealthService(new HealthRepository());