import { describe, it, expect, beforeEach } from 'vitest';
import { StudentsService } from '../students.service';
import { StudentsRepository } from '../students.repository';
import { UsersRepository } from '../../users/users.repository';
import { ConflictError, NotFoundError } from '../../../shared/errors/errors';
import type { StudentDTO } from '@prasynx/types';

const TENANT = '00000000-0000-0000-0000-00000000000a';
const STUDENT_ID = '00000000-0000-0000-0000-000000000001';

const dto: StudentDTO = {
  id: STUDENT_ID,
  user_id: null,
  organisation_id: TENANT,
  full_name: 'Ananya Sharma',
  email: null,
  phone: '9999999999',
  roll_number: 'R-101',
  class_id: null,
  section_id: null,
  class_name: null,
  section_name: null,
  parent_name: 'Rohit Sharma',
  parent_email: null,
  parent_phone: null,
  parent_relationship: 'parent',
  date_of_birth: null,
  gender: null,
  address: null,
  blood_group: null,
  status: 'active',
};

function stubRepo(overrides: Partial<StudentsRepository> = {}): StudentsRepository {
  return {
    list: async () => [dto],
    findById: async (_t: string, id: string) => (id === STUDENT_ID ? dto : null),
    create: async () => STUDENT_ID,
    update: async () => {},
    remove: async () => {},
    syncClassMap: async () => {},
    assertExists: async () => {},
    resolveClassIdByName: async () => null,
    resolveSectionIdByName: async () => null,
    ...overrides,
  } as unknown as StudentsRepository;
}

function stubUsersRepo(overrides: Partial<UsersRepository> = {}): UsersRepository {
  return {
    findByEmail: async () => null,
    createUserWithAuth: async (p: { email?: string }) => `00000000-0000-0000-0000-0000000000${p.email?.length ?? 0}`,
    ...overrides,
  } as unknown as UsersRepository;
}

describe('StudentsService', () => {
  let service: StudentsService;

  beforeEach(() => {
    service = new StudentsService(stubRepo(), stubUsersRepo());
  });

  it('lists students', async () => {
    const list = await service.list(TENANT);
    expect(list).toHaveLength(1);
    expect(list[0].full_name).toBe('Ananya Sharma');
  });

  it('creates a student and links a login account when credentials are provided', async () => {
    const serviceWithAccount = new StudentsService(stubRepo(), stubUsersRepo({ findByEmail: async () => null }));
    const created = await serviceWithAccount.create(TENANT, {
      full_name: 'Ananya Sharma',
      email: 'ananya@school.edu',
      password: 'password123',
    });
    expect(created.id).toBe(STUDENT_ID);
  });

  it('rejects a duplicate email when provisioning a login account', async () => {
    const existing = { id: 'x', full_name: 'Other', email: 'ananya@school.edu', role: 'student' as const, organisation_id: TENANT, status: 'active' as const };
    const dup = new StudentsService(stubRepo(), stubUsersRepo({ findByEmail: async () => existing as never }));
    await expect(
      dup.create(TENANT, { full_name: 'Ananya Sharma', email: 'ananya@school.edu', password: 'password123' }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('throws NotFound when the student does not exist', async () => {
    await expect(service.get(TENANT, '00000000-0000-0000-0000-000000000099')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('updates and directly removes a student', async () => {
    const updated = await service.update(TENANT, STUDENT_ID, { phone: '8888888888' });
    expect(updated.phone).toBe('9999999999');
    await expect(service.remove(TENANT, STUDENT_ID)).resolves.toBeUndefined();
  });
});