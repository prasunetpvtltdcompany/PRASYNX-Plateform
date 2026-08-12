import { describe, it, expect, beforeEach } from 'vitest';
import { AdmissionsService } from '../admissions.service';
import { AdmissionsRepository } from '../admissions.repository';
import { NotFoundError } from '../../../shared/errors/errors';
import type { AdmissionDTO } from '@prasynx/types';

const TENANT = '00000000-0000-0000-0000-00000000000a';
const FORM_ID = '00000000-0000-0000-0000-000000000101';

const dto: AdmissionDTO = {
  id: FORM_ID,
  organisation_id: TENANT,
  applicant_name: 'Kabir Test',
  applicant_email: 'kabir@test.prasynx.in',
  phone: null,
  applying_class: 'Grade 1',
  parent_name: 'Parent Test',
  parent_phone: null,
  status: 'pending',
  academic_year_id: null,
  academic_year: '2026-27',
  created_at: '2026-08-10T00:00:00.000Z',
};

function stubRepo(overrides: Partial<AdmissionsRepository> = {}): AdmissionsRepository {
  return {
    list: async () => [dto],
    findById: async (_t: string, id: string) => (id === FORM_ID ? dto : null),
    create: async () => FORM_ID,
    updateStatus: async () => {},
    remove: async () => {},
    assertExists: async (_t: string, id: string) =>
      id === FORM_ID ? dto : ((() => { throw new NotFoundError('Admission application not found in this school'); })() as AdmissionDTO),
    ...overrides,
  } as unknown as AdmissionsRepository;
}

describe('AdmissionsService', () => {
  let service: AdmissionsService;

  beforeEach(() => {
    service = new AdmissionsService(stubRepo());
  });

  it('lists admission applications', async () => {
    const list = await service.list(TENANT);
    expect(list).toHaveLength(1);
    expect(list[0].applicant_name).toBe('Kabir Test');
  });

  it('creates an application with default pending status', async () => {
    const created = await service.create(TENANT, { applicant_name: 'Kabir Test' });
    expect(created.status).toBe('pending');
    expect(created.applying_class).toBe('Grade 1');
  });

  it('updates status when changed', async () => {
    const svc = new AdmissionsService(
      stubRepo({
        findById: async (_t: string, id: string) => (id === FORM_ID ? { ...dto, status: 'accepted' as const } : null),
      }),
    );
    const updated = await svc.updateStatus(TENANT, FORM_ID, 'accepted');
    expect(updated.status).toBe('accepted');
  });

  it('does nothing when status is unchanged', async () => {
    let repoCalled = false;
    const svc = new AdmissionsService(
      stubRepo({
        updateStatus: async () => {
          repoCalled = true;
        },
      }),
    );
    const updated = await svc.updateStatus(TENANT, FORM_ID, 'pending');
    expect(updated.status).toBe('pending');
    expect(repoCalled).toBe(false);
  });

  it('throws NotFound for unknown application', async () => {
    await expect(service.get(TENANT, '00000000-0000-0000-0000-000000000999')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('removes an application', async () => {
    await expect(service.remove(TENANT, FORM_ID)).resolves.toBeUndefined();
  });
});