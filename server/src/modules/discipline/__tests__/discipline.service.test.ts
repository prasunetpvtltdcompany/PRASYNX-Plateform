import { describe, it, expect, beforeEach } from 'vitest';
import { DisciplineService } from '../discipline.service';
import { DisciplineRepository } from '../discipline.repository';
import { NotFoundError } from '../../../shared/errors/errors';

const TENANT = '00000000-0000-0000-0000-00000000000a';
const INCIDENT_ID = '00000000-0000-0000-0000-000000000111';
const STUDENT_ID = '00000000-0000-0000-0000-000000000101';
const USER_ID = '00000000-0000-0000-0000-0000000000ad';

const dto = {
  id: INCIDENT_ID,
  organisation_id: TENANT,
  student_id: STUDENT_ID,
  title: 'Late arrival',
  status: 'open',
  severity: 'low',
  reported_by: USER_ID,
  created_at: '2026-08-10T00:00:00.000Z',
};

function stubRepo(overrides: Partial<DisciplineRepository> = {}): DisciplineRepository {
  return {
    list: async () => [dto],
    findById: async (_t: string, id: string) => (id === INCIDENT_ID ? dto : null),
    create: async () => INCIDENT_ID,
    update: async () => {},
    addLog: async () => {},
    assertExists: async (_t: string, id: string) =>
      id === INCIDENT_ID ? dto : ((() => { throw new NotFoundError('Incident not found in this school'); })() as typeof dto),
    ...overrides,
  } as unknown as DisciplineRepository;
}

describe('DisciplineService', () => {
  let service: DisciplineService;

  beforeEach(() => {
    service = new DisciplineService(stubRepo());
  });

  it('lists incidents', async () => {
    const list = await service.list(TENANT);
    expect(list[0].title).toBe('Late arrival');
  });

  it('creates an incident', async () => {
    const created = await service.create(TENANT, { student_id: STUDENT_ID, title: 'Repeated homework default' }, USER_ID);
    expect(created.title).toBe('Late arrival');
  });

  it('resolves an incident and logs it', async () => {
    const logs: unknown[] = [];
    const svc = new DisciplineService(
      stubRepo({ addLog: async (_t: string, _i: string, log: unknown) => { logs.push(log); } }),
    );
    await svc.update(TENANT, INCIDENT_ID, { status: 'resolved', resolution_notes: 'Parent informed' }, USER_ID);
    expect(logs).toHaveLength(1);
  });

  it('throws NotFound for unknown incident', async () => {
    await expect(service.get(TENANT, '00000000-0000-0000-0000-000000000999')).rejects.toBeInstanceOf(NotFoundError);
  });
});