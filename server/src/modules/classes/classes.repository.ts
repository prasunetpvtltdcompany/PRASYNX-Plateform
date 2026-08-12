import type { ClassWithSectionsDTO, SectionDTO } from '@prasynx/types';
import { NotFoundError } from '../../shared/errors/errors';
import { requestDb } from '../../infrastructure/database/supabase';

export class ClassesRepository {
  async listWithSections(tenantId: string): Promise<ClassWithSectionsDTO[]> {
    const client = requestDb();
    const { data: classes, error } = await client
      .from('classes')
      .select('id,name,organisation_id,created_at')
      .eq('organisation_id', tenantId)
      .order('name');

    if (error) throw error;

    const { data: sections, error: sectionError } = await client
      .from('sections')
      .select('id,name,class_id,organisation_id')
      .eq('organisation_id', tenantId);
    if (sectionError) throw sectionError;

    const byClass = new Map<string, SectionDTO[]>();
    for (const sec of (sections as SectionDTO[]) ?? []) {
      const list = byClass.get(sec.class_id) ?? [];
      list.push(sec);
      byClass.set(sec.class_id, list);
    }

    return ((classes as ClassWithSectionsDTO[]) ?? []).map((c) => ({
      ...c,
      sections: byClass.get(c.id) ?? [],
    }));
  }

  async getClass(tenantId: string, classId: string): Promise<ClassWithSectionsDTO> {
    const classes = await this.listWithSections(tenantId);
    const found = classes.find((c) => c.id === classId);
    if (!found) throw new NotFoundError('Class not found in this school');
    return found;
  }
}