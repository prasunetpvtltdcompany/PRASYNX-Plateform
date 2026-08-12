import { PromotionRepository } from './promotions.repository';
import type { CreatePromotionInput, PromotionDTO } from '@prasynx/types';
import { BadRequestError } from '../../shared/errors/errors';

export class PromotionService {
  constructor(private repo: PromotionRepository) {}

  list(tenantId: string): Promise<PromotionDTO[]> {
    return this.repo.list(tenantId);
  }

  async create(tenantId: string, input: CreatePromotionInput, userId: string): Promise<PromotionDTO> {
    const student = await this.repo.assertNotFound(tenantId, input.student_id);
    if (!input.to_class_id) throw new BadRequestError('Target class is required');
    const targetClass = await this.repo.getClass(tenantId, input.to_class_id);
    if (!targetClass) throw new BadRequestError('Target class does not exist in this school');

    const id = await this.repo.createHistory(tenantId, {
      organisation_id: tenantId,
      student_id: student.id,
      from_class_id: input.from_class_id || student.class_id || null,
      from_section_id: input.from_section_id || student.section_id || null,
      to_class_id: input.to_class_id,
      to_section_id: input.to_section_id || null,
      academic_year_id: input.academic_year_id || null,
      academic_year: input.academic_year || null,
      promoted_by: userId,
      remarks: input.remarks || null,
      promoted_at: new Date().toISOString(),
    });

    await this.repo.moveToClass(tenantId, student.id, input.to_class_id, input.to_section_id || null);
    return id;
  }
}

export const promotionService = new PromotionService(new PromotionRepository());