import { describe, it, expect, beforeEach } from 'vitest';
import { StaffService } from '../staff.service';
import { StaffRepository } from '../staff.repository';
import { NotFoundError } from '../../../shared/errors/errors';
import type { StaffRecordDTO } from '@prasynx/types';

const TENANT = '00000000-0000-0000-0000-00000000000a';
const STAFF_ID = '00000000-0000-0000-0000-000000000111';
const USER_ID = '00000000-0000-0000-0000-0000000000ad';

const dto: StaffRecordDTO = {
  id: STAFF_ID,
  organisation_id: TENANT,
  user_id: null,
  full_name: 'Ravi Kumar',
  email: 'ravi@school.edu',
  phone: null,
  staff_unique_id: null,
  subject: null,
  assigned_class: null,
  qualification: null,
  join_date: null,
  department: null,
  designation: 'Teacher',
  experience_years: null,
  gender: null,
  date_of_birth: null,
  address: null,
  city: null,
  state: null,
  country: null,
  postal_code: null,
  salary: null,
  employment_type: null,
  reporting_manager: null,
  status: 'active',
  role: null,
  created_at: '2026-08-10T00:00:00.000Z',
};

function stubRepo(overrides: Partial<StaffRepository> = {}): StaffRepository {
  return {
    list: async () => [dto],
    findById: async (_t: string, id: string) => (id === STAFF_ID ? dto : null),
    create: async () => STAFF_ID,
    update: async () => {},
    assertExists: async (_t: string, id: string) =>
      id === STAFF_ID ? dto : ((() => { throw new NotFoundError('Staff member not found in this school'); })() as typeof dto),
    listAttendance: async () => [],
    createAttendance: async () => STAFF_ID,
    listLeaves: async () => [],
    createLeave: async () => STAFF_ID,
    findLeave: async (_t: string, id: string) =>
      id === STAFF_ID ? { id, staff_id: STAFF_ID, leave_type: 'casual', status: 'pending' } : null,
    updateLeaveStatus: async (_t: string, id: string, patch: { status: string }) => ({
      id,
      staff_id: STAFF_ID,
      leave_type: 'casual',
      status: patch.status,
    }),
    listPayroll: async () => [],
    listPayslips: async () => [],
    ...overrides,
  } as unknown as StaffRepository;
}

describe('StaffService', () => {
  let service: StaffService;

  beforeEach(() => {
    service = new StaffService(stubRepo());
  });

  it('lists staff members', async () => {
    const list = await service.list(TENANT);
    expect(list).toHaveLength(1);
    expect(list[0].full_name).toBe('Ravi Kumar');
  });

  it('creates a staff member', async () => {
    const created = await service.create(TENANT, { full_name: 'Priya Sharma' });
    expect(created.full_name).toBe('Ravi Kumar');
  });

  it('updates status to inactive', async () => {
    const svc = new StaffService(stubRepo({ findById: async (_t: string, id: string) => (id === STAFF_ID ? { ...dto, status: 'inactive' } : null) }));
    const updated = await svc.updateStatus(TENANT, STAFF_ID, 'inactive');
    expect(updated?.status).toBe('inactive');
  });

  it('records attendance for an existing member', async () => {
    const id = await service.recordAttendance(
      TENANT,
      { staff_id: STAFF_ID, attendance_date: '2026-08-11', status: 'present' },
      USER_ID,
    );
    expect(id).toBe(STAFF_ID);
  });

  it('rejects records for unknown staff', async () => {
    await expect(
      service.recordAttendance(TENANT, { staff_id: '00000000-0000-0000-0000-000000000999', attendance_date: '2026-08-11' }, USER_ID),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('approves a pending leave request', async () => {
    const updated = await service.updateLeaveStatus(TENANT, STAFF_ID, { status: 'approved' }, USER_ID);
    expect(updated.status).toBe('approved');
  });

  it('rejects a leave request with a reason', async () => {
    const updated = await service.updateLeaveStatus(TENANT, STAFF_ID, { status: 'rejected', rejection_reason: 'No cover available' }, USER_ID);
    expect(updated.status).toBe('rejected');
  });

  it('throws for an unknown leave request', async () => {
    await expect(
      service.updateLeaveStatus(TENANT, '00000000-0000-0000-0000-000000000999', { status: 'approved' }, USER_ID),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});