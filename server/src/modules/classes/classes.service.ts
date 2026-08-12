import { ClassesRepository } from './classes.repository';
import type { ClassWithSectionsDTO } from '@prasynx/types';

export class ClassesService {
  constructor(private repo: ClassesRepository) {}

  listWithSections(tenantId: string): Promise<ClassWithSectionsDTO[]> {
    return this.repo.listWithSections(tenantId);
  }

  getClass(tenantId: string, classId: string): Promise<ClassWithSectionsDTO> {
    return this.repo.getClass(tenantId, classId);
  }
}

export const classesService = new ClassesService(new ClassesRepository());