import { StaffRepository } from './staff.repository';
import { NotFoundError } from '../../shared/errors/errors';
import type { CreateStaffInput } from '@prasynx/types';

export class StaffService {
  constructor(private repo: StaffRepository) {}

  list(tenantId: string) {
    return this.repo.list(tenantId);
  }

  async get(tenantId: string, id: string) {
    return this.repo.assertExists(tenantId, id);
  }

  async create(tenantId: string, input: CreateStaffInput) {
    const id = await this.repo.create(tenantId, input);
    const created = await this.repo.findById(tenantId, id);
    if (!created) throw new Error('Staff member was created but could not be loaded');
    return created;
  }

  async updateStatus(tenantId: string, id: string, status: string) {
    await this.repo.assertExists(tenantId, id);
    await this.repo.update(tenantId, id, { status });
    return this.repo.findById(tenantId, id);
  }

  async recordAttendance(tenantId: string, input: { staff_id: string; attendance_date: string; check_in?: string; check_out?: string; status?: string; remarks?: string }, userId: string) {
    const staff = await this.repo.assertExists(tenantId, input.staff_id);
    const row: Record<string, unknown> = {
      organisation_id: tenantId,
      staff_id: staff.id,
      attendance_date: input.attendance_date,
      check_in: input.check_in ?? null,
      check_out: input.check_out ?? null,
      status: input.status ?? 'present',
      remarks: input.remarks ?? null,
      marked_by: userId,
    };
    return this.repo.createAttendance(tenantId, row);
  }

  async createLeave(tenantId: string, input: { staff_id: string; leave_type?: string; from_date: string; to_date: string; reason?: string }) {
    const staff = await this.repo.assertExists(tenantId, input.staff_id);
    const row: Record<string, unknown> = {
      organisation_id: tenantId,
      staff_id: staff.id,
      leave_type: input.leave_type ?? 'casual',
      from_date: input.from_date,
      to_date: input.to_date,
      reason: input.reason ?? null,
      status: 'pending',
    };
    return this.repo.createLeave(tenantId, row);
  }

  async updateLeaveStatus(tenantId: string, id: string, input: { status: string; rejection_reason?: string }, reviewerId: string | undefined) {
    const existing = await this.repo.findLeave(tenantId, id);
    if (!existing) throw new NotFoundError('Leave request not found in this school');
    const updated = await this.repo.updateLeaveStatus(tenantId, id, {
      status: input.status,
      rejection_reason: input.rejection_reason ?? null,
      reviewed_by: reviewerId ?? null,
    });
    if (!updated) throw new NotFoundError('Leave request not found in this school');
    return updated;
  }

  listAttendance(tenantId: string) {
    return this.repo.listAttendance(tenantId);
  }

  listLeaves(tenantId: string) {
    return this.repo.listLeaves(tenantId);
  }

  listPayroll(tenantId: string) {
    return this.repo.listPayroll(tenantId);
  }

  listPayslips(tenantId: string) {
    return this.repo.listPayslips(tenantId);
  }
}

export const staffService = new StaffService(new StaffRepository());