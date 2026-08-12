import { SubjectsRepository } from './subjects.repository';
import type { CreateSchoolSubjectInput, SchoolSubjectDTO, UpdateSchoolSubjectInput } from '@prasynx/types';

export class SubjectsService {
  constructor(private repo: SubjectsRepository) {}

  list(tenantId: string): Promise<SchoolSubjectDTO[]> {
    return this.repo.list(tenantId);
  }

  async get(tenantId: string, id: string): Promise<SchoolSubjectDTO> {
    return this.repo.assertExists(tenantId, id);
  }

  async create(tenantId: string, input: CreateSchoolSubjectInput): Promise<SchoolSubjectDTO> {
    const id = await this.repo.create(tenantId, input);
    const created = await this.repo.findById(tenantId, id);
    if (!created) throw new Error('Subject was created but could not be loaded');
    return created;
  }

  async update(tenantId: string, id: string, input: UpdateSchoolSubjectInput): Promise<SchoolSubjectDTO> {
    await this.repo.assertExists(tenantId, id);
    await this.repo.update(tenantId, id, input);
    const updated = await this.repo.findById(tenantId, id);
    if (!updated) throw new Error('Subject could not be loaded after update');
    return updated;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.repo.assertExists(tenantId, id);
    await this.repo.remove(tenantId, id);
  }
}

export const subjectsService = new SubjectsService(new SubjectsRepository());