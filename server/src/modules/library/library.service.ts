import { LibraryRepository } from './library.repository';
import type { CreateLibraryBookInput, LibraryBookDTO } from '@prasynx/types';

export class LibraryService {
  constructor(private repo: LibraryRepository) {}

  list(tenantId: string): Promise<LibraryBookDTO[]> {
    return this.repo.list(tenantId);
  }

  async get(tenantId: string, id: string): Promise<LibraryBookDTO> {
    return this.repo.assertExists(tenantId, id);
  }

  async create(tenantId: string, input: CreateLibraryBookInput): Promise<LibraryBookDTO> {
    const id = await this.repo.create(tenantId, input);
    const created = await this.repo.findById(tenantId, id);
    if (!created) throw new Error('Book was created but could not be loaded');
    return created;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.repo.assertExists(tenantId, id);
    await this.repo.remove(tenantId, id);
  }
}

export const libraryService = new LibraryService(new LibraryRepository());