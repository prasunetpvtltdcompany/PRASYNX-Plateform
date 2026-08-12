import { describe, it, expect, beforeEach } from 'vitest';
import { SubjectsService } from '../subjects.service';
import { SubjectsRepository } from '../subjects.repository';
import { NotFoundError } from '../../../shared/errors/errors';
import type { SchoolSubjectDTO } from '@prasynx/types';

const TENANT = '00000000-0000-0000-0000-00000000000a';
const ID = '00000000-0000-0000-0000-000000000111';

const dto: SchoolSubjectDTO = {
  id: ID,
  organisation_id: TENANT,
  name: 'Mathematics',
  code: 'MATH',
  description: 'Algebra & geometry',
  created_at: '2026-08-10T00:00:00.000Z',
};

function stubRepo(overrides: Partial<SubjectsRepository> = {}): SubjectsRepository {
  return {
    list: async () => [dto],
    findById: async (_t: string, id: string) => (id === ID ? dto : null),
    create: async () => ID,
    update: async () => {},
    remove: async () => {},
    assertExists: async (_t: string, id: string) =>
      id === ID ? dto : ((() => { throw new NotFoundError('Subject not found in this school'); })() as SchoolSubjectDTO),
    ...overrides,
  } as unknown as SubjectsRepository;
}

describe('SubjectsService', () => {
  let service: SubjectsService;

  beforeEach(() => {
    service = new SubjectsService(stubRepo());
  });

  it('lists subjects', async () => {
    const list = await service.list(TENANT);
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('Mathematics');
  });

  it('creates a subject', async () => {
    const created = await service.create(TENANT, { name: 'Physics' });
    expect(created.name).toBe('Mathematics');
  });

  it('updates a subject', async () => {
    const svc = new SubjectsService(
      stubRepo({ findById: async (_t: string, id: string) => (id === ID ? { ...dto, name: 'Maths' } : null) }),
    );
    const updated = await svc.update(TENANT, ID, { name: 'Maths' });
    expect(updated.name).toBe('Maths');
  });

  it('throws NotFound for unknown subject', async () => {
    await expect(service.get(TENANT, '00000000-0000-0000-0000-000000000999')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('removes a subject', async () => {
    await expect(service.remove(TENANT, ID)).resolves.toBeUndefined();
  });
});