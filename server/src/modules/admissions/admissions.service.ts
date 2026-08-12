import { AdmissionsRepository } from './admissions.repository';
import type { AdmissionDTO, AdmissionStatus, CreateAdmissionInput } from '@prasynx/types';

export class AdmissionsService {
  constructor(private repo: AdmissionsRepository) {}

  list(tenantId: string): Promise<AdmissionDTO[]> {
    return this.repo.list(tenantId);
  }

  async create(tenantId: string, input: CreateAdmissionInput): Promise<AdmissionDTO> {
    const id = await this.repo.create(tenantId, input);
    const created = await this.repo.findById(tenantId, id);
    if (!created) throw new Error('Admission application was created but could not be loaded');
    return created;
  }

  async get(tenantId: string, id: string): Promise<AdmissionDTO> {
    return this.repo.assertExists(tenantId, id);
  }

  async updateStatus(tenantId: string, id: string, status: AdmissionStatus): Promise<AdmissionDTO> {
    const current = await this.repo.assertExists(tenantId, id);
    if (current.status === status) return current;
    await this.repo.updateStatus(tenantId, id, status);
    const updated = await this.repo.findById(tenantId, id);
    if (!updated) throw new Error('Admission application could not be loaded after status change');
    return updated;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.repo.assertExists(tenantId, id);
    await this.repo.remove(tenantId, id);
  }
}

export const admissionsService = new AdmissionsService(new AdmissionsRepository());