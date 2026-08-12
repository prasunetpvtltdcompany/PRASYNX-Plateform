import { describe, it, expect, beforeEach } from 'vitest';
import { PromotionService } from '../promotions.service';
import { PromotionRepository } from '../promotions.repository';
import { BadRequestError } from '../../../shared/errors/errors';
import type { PromotionDTO } from '@prasynx/types';

const TENANT = '00000000-0000-0000-0000-00000000000a';
const STUDENT_ID = '00000000-0000-0000-0000-000000000111';
const CLASS_A = '00000000-0000-0000-0000-000000000101';
const CLASS_B = '00000000-0000-0000-0000-000000000102';
const USER_ID = '00000000-0000-0000-0000-0000000000ad';
const PROMO_ID = '00000000-0000-0000-0000-000000000222';

function stubRepo(overrides: Partial<PromotionRepository> = {}): PromotionRepository {
  return {
    list: async () => [],
    getStudent: async (_t: string, id: string) =>
      id === STUDENT_ID ? { id: STUDENT_ID, full_name: 'Anita', class_id: CLASS_A, section_id: null } : null,
    getClass: async (_t: string, id: string) => (id === CLASS_B ? { id: CLASS_B, name: 'Grade 6' } : null),
    createHistory: async () => ({ id: PROMO_ID, organisation_id: TENANT, student_id: STUDENT_ID, from_class_id: CLASS_A, to_class_id: CLASS_B } as PromotionDTO),
    moveToClass: async () => {},
    assertNotFound: async (_t: string, id: string) =>
      id === STUDENT_ID ? { id: STUDENT_ID, full_name: 'Anita', class_id: CLASS_A, section_id: null } : (() => { throw new Error('missing'); })(),
    ...overrides,
  } as unknown as PromotionRepository;
}

describe('PromotionService', () => {
  let service: PromotionService;

  beforeEach(() => {
    service = new PromotionService(stubRepo());
  });

  it('promotes a student and stores the history row', async () => {
    const promo = await service.create(TENANT, { student_id: STUDENT_ID, to_class_id: CLASS_B }, USER_ID);
    expect(promo.id).toBe(PROMO_ID);
    expect(promo.to_class_id).toBe(CLASS_B);
  });

  it('lists promotions', async () => {
    const svc = new PromotionService(stubRepo({ list: async () => [{ id: PROMO_ID, organisation_id: TENANT, student_id: STUDENT_ID, from_class_id: null, from_section_id: null, to_class_id: CLASS_B, to_section_id: null, academic_year_id: null, academic_year: null, promoted_by: null, remarks: null, promoted_at: null } as PromotionDTO] }));
    const list = await svc.list(TENANT);
    expect(list[0].id).toBe(PROMO_ID);
  });

  it('rejects promotion to a class outside the school', async () => {
    await expect(service.create(TENANT, { student_id: STUDENT_ID, to_class_id: '00000000-0000-0000-0000-000000000999' }, USER_ID)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });
});