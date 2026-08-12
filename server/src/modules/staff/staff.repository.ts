import type { CreateStaffInput, StaffRecordDTO } from '@prasynx/types';
import { db } from '../../infrastructure/database/supabase';
import { NotFoundError } from '../../shared/errors/errors';

const STAFF_COLUMNS =
  'id,organisation_id,user_id,staff_unique_id,full_name,email,phone,subject,assigned_class,qualification,join_date,department,designation,experience_years,gender,date_of_birth,address,city,state,country,postal_code,salary,employment_type,reporting_manager,status,role,created_at';
const ATTENDANCE_COLUMNS =
  'id,organisation_id,staff_id,attendance_date,check_in,check_out,working_hours,status,remarks,marked_by,approved,approved_at,created_at';
const LEAVE_COLUMNS =
  'id,organisation_id,staff_id,leave_type,from_date,to_date,reason,status,rejection_reason,reviewed_by,approved_at,created_at';
const PAYROLL_COLUMNS = 'id,organisation_id,staff_id,base_salary,allowances,deductions,net_salary,pay_frequency,components,created_at';
const PAYSLIP_COLUMNS =
  'id,organisation_id,staff_id,month,year,gross_pay,deductions,net_pay,status,paid_at,payment_method,created_at';

export class StaffRepository {
  async list(tenantId: string): Promise<StaffRecordDTO[]> {
    const { data, error } = await db
      .from('staff_records')
      .select(STAFF_COLUMNS)
      .eq('organisation_id', tenantId)
      .order('full_name');
    if (error) throw error;
    return (data as unknown as StaffRecordDTO[]) ?? [];
  }

  async findById(tenantId: string, id: string): Promise<StaffRecordDTO | null> {
    const { data, error } = await db
      .from('staff_records')
      .select(STAFF_COLUMNS)
      .eq('id', id)
      .eq('organisation_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as StaffRecordDTO | null) ?? null;
  }

  async create(tenantId: string, input: CreateStaffInput): Promise<string> {
    const { data, error } = await db
      .from('staff_records')
      .insert({ organisation_id: tenantId, ...input })
      .select('id')
      .single();
    if (error || !data) throw error ?? new Error('Staff member could not be created');
    return data.id as string;
  }

  async update(tenantId: string, id: string, patch: Record<string, unknown>): Promise<void> {
    const { error } = await db
      .from('staff_records')
      .update(patch)
      .eq('id', id)
      .eq('organisation_id', tenantId);
    if (error) throw error;
  }

  async assertExists(tenantId: string, id: string): Promise<StaffRecordDTO> {
    const found = await this.findById(tenantId, id);
    if (!found) throw new NotFoundError('Staff member not found in this school');
    return found;
  }

  async listAttendance(tenantId: string): Promise<Array<Record<string, unknown>>> {
    const { data, error } = await db
      .from('staff_attendance')
      .select(ATTENDANCE_COLUMNS)
      .eq('organisation_id', tenantId)
      .order('attendance_date', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async createAttendance(tenantId: string, row: Record<string, unknown>): Promise<string> {
    const { data, error } = await db.from('staff_attendance').insert(row).select('id').single();
    if (error || !data) throw error ?? new Error('Attendance could not be recorded');
    return data.id as string;
  }

  async listLeaves(tenantId: string): Promise<Array<Record<string, unknown>>> {
    const { data, error } = await db
      .from('staff_leave_requests')
      .select(LEAVE_COLUMNS)
      .eq('organisation_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async createLeave(tenantId: string, row: Record<string, unknown>): Promise<string> {
    const { data, error } = await db.from('staff_leave_requests').insert(row).select('id').single();
    if (error || !data) throw error ?? new Error('Leave request could not be created');
    return data.id as string;
  }

  async findLeave(tenantId: string, id: string): Promise<Record<string, unknown> | null> {
    const { data, error } = await db
      .from('staff_leave_requests')
      .select(LEAVE_COLUMNS)
      .eq('id', id)
      .eq('organisation_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return data ?? null;
  }

  async updateLeaveStatus(
    tenantId: string,
    id: string,
    patch: { status: string; rejection_reason?: string | null; reviewed_by: string | null },
  ): Promise<Record<string, unknown> | null> {
    const changes: Record<string, unknown> = { status: patch.status, reviewed_by: patch.reviewed_by, approved_at: new Date().toISOString() };
    if (patch.rejection_reason !== undefined) changes.rejection_reason = patch.rejection_reason;
    const { data, error } = await db
      .from('staff_leave_requests')
      .update(changes)
      .eq('id', id)
      .eq('organisation_id', tenantId)
      .select()
      .single();
    if (error || !data) throw error ?? new Error('Leave request could not be updated');
    return data;
  }

  async listPayroll(tenantId: string): Promise<Array<Record<string, unknown>>> {
    const { data, error } = await db
      .from('staff_payroll')
      .select(PAYROLL_COLUMNS)
      .eq('organisation_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async listPayslips(tenantId: string): Promise<Array<Record<string, unknown>>> {
    const { data, error } = await db
      .from('staff_payslips')
      .select(PAYSLIP_COLUMNS)
      .eq('organisation_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
}