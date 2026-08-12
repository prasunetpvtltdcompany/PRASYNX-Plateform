import { ForbiddenError, NotFoundError } from '../../shared/errors/errors';
import { requestDb } from '../../infrastructure/database/supabase';
import type {
  FeeItemRow,
  FeePaymentDTO,
  FeePaymentRow,
  FeeStructureDTO,
  FeeStructureRow,
  PaymentMethod,
  PaymentStatus,
  StudentFeeDTO,
  StudentFeeRow,
  StudentFeeStatus,
} from '@prasynx/types';

export interface FeeStructureRowWithItems extends FeeStructureRow {
  fee_items: FeeItemRow[];
}

export interface StudentFeeRowWithNames extends StudentFeeRow {
  students: { full_name: string } | null;
  fee_structures: { name: string } | null;
}

export interface FeePaymentRowWithNames extends FeePaymentRow {
  students: { full_name: string } | null;
}

export class FinanceRepository {
  async assertClassInTenant(tenantId: string, classId: string | null | undefined): Promise<void> {
    if (!classId) return;
    const { data } = await requestDb().from('classes').select('organisation_id').eq('id', classId).maybeSingle();
    if (!data) throw new NotFoundError('Class not found');
    if ((data as { organisation_id: string }).organisation_id !== tenantId) throw new ForbiddenError('Class does not belong to this school');
  }

  async assertStudentInTenant(tenantId: string, studentId: string): Promise<void> {
    const { data } = await requestDb().from('students').select('organisation_id').eq('id', studentId).maybeSingle();
    if (!data) throw new NotFoundError('Student not found');
    if ((data as { organisation_id: string }).organisation_id !== tenantId) throw new ForbiddenError('Student does not belong to this school');
  }

  async getFeeStructure(tenantId: string, feeStructureId: string): Promise<FeeStructureDTO> {
    const { data, error } = await requestDb()
      .from('fee_structures')
      .select('*, fee_items(*)')
      .eq('id', feeStructureId)
      .maybeSingle();
    if (error || !data) throw new NotFoundError('Fee structure not found');
    const row = data as FeeStructureRowWithItems;
    if (row.organisation_id !== tenantId) throw new ForbiddenError('Fee structure does not belong to this school');
    return { ...row, items: row.fee_items ?? [] };
  }

  async listFeeStructures(tenantId: string, status: string | undefined, page: number, pageSize: number): Promise<{ data: FeeStructureDTO[]; total: number; page: number; pageSize: number; totalPages: number }> {
    let query = requestDb()
      .from('fee_structures')
      .select('*, fee_items(*)', { count: 'exact' })
      .eq('organisation_id', tenantId)
      .order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const from = (page - 1) * pageSize;
    const { data, error, count } = await query.range(from, from + pageSize - 1);
    if (error) throw error;
    const items = ((data as FeeStructureRowWithItems[]) ?? []).map((r) => ({ ...r, items: r.fee_items ?? [] }));
    const total = count ?? items.length;
    return { data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async createFeeStructure(input: {
    organisation_id: string;
    name: string;
    class_id?: string | null;
    academic_year?: string | null;
    total_amount: number;
    items: Array<{ item_name: string; amount: number }>;
  }): Promise<FeeStructureDTO> {
    const { data, error } = await requestDb()
      .from('fee_structures')
      .insert({
        organisation_id: input.organisation_id,
        name: input.name,
        class_id: input.class_id,
        academic_year: input.academic_year,
        total_amount: input.total_amount,
      })
      .select()
      .single();
    if (error || !data) throw error ?? new NotFoundError('Fee structure could not be created');
    const structure = data as FeeStructureRow;

    const items = await this.insertItems(structure.id, input.items);
    return { ...structure, items };
  }

  private async insertItems(feeStructureId: string, items: Array<{ item_name: string; amount: number }>): Promise<FeeItemRow[]> {
    if (!items.length) return [];
    const { data, error } = await requestDb()
      .from('fee_items')
      .insert(items.map((i) => ({ fee_structure_id: feeStructureId, item_name: i.item_name, amount: i.amount })))
      .select();
    if (error) throw error;
    return (data as FeeItemRow[]) ?? [];
  }

  async assignToStudents(input: {
    tenantId: string;
    feeStructureId: string;
    studentIds: string[];
    dueDate?: string | null;
  }): Promise<StudentFeeRow[]> {
    const structure = await this.getFeeStructure(input.tenantId, input.feeStructureId);
    const rows = input.studentIds.map((studentId) => ({
      organisation_id: input.tenantId,
      student_id: studentId,
      fee_structure_id: structure.id,
      total_amount: structure.total_amount,
      paid_amount: 0,
      due_date: input.dueDate ?? null,
      status: 'pending' as StudentFeeStatus,
    }));
    const { data, error } = await requestDb().from('student_fees').insert(rows).select();
    if (error) throw error;
    return (data as StudentFeeRow[]) ?? [];
  }

  async getStudentFee(tenantId: string, studentFeeId: string): Promise<StudentFeeRow> {
    const { data, error } = await requestDb()
      .from('student_fees')
      .select('*')
      .eq('id', studentFeeId)
      .maybeSingle();
    if (error || !data) throw new NotFoundError('Student fee record not found');
    const row = data as StudentFeeRow;
    if (row.organisation_id !== tenantId) throw new ForbiddenError('Student fee record does not belong to this school');
    return row;
  }

  async insertPayment(input: {
    organisation_id: string;
    student_fee_id: string;
    student_id: string;
    amount_paid: number;
    payment_method: PaymentMethod;
    transaction_id?: string | null;
    receipt_url?: string | null;
    status: PaymentStatus;
  }): Promise<FeePaymentRow> {
    const { data, error } = await requestDb().from('fee_payments').insert(input).select().single();
    if (error || !data) throw error ?? new NotFoundError('Payment could not be recorded');
    return data as FeePaymentRow;
  }

  async updateStudentFeePaid(studentFeeId: string, paidAmount: number, status: StudentFeeStatus): Promise<StudentFeeRow> {
    const { data, error } = await requestDb()
      .from('student_fees')
      .update({ paid_amount: paidAmount, status })
      .eq('id', studentFeeId)
      .select()
      .single();
    if (error || !data) throw error ?? new NotFoundError('Student fee record could not be updated');
    return data as StudentFeeRow;
  }

  async feesForStudent(tenantId: string, studentId: string): Promise<StudentFeeDTO[]> {
    const { data, error } = await requestDb()
      .from('student_fees')
      .select('*, students(full_name), fee_structures(name)')
      .eq('organisation_id', tenantId)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data as StudentFeeRowWithNames[]) ?? []).map((r) => ({
      id: r.id,
      organisation_id: r.organisation_id,
      student_id: r.student_id,
      fee_structure_id: r.fee_structure_id,
      total_amount: r.total_amount,
      paid_amount: r.paid_amount,
      due_date: r.due_date,
      status: r.status,
      created_at: r.created_at,
      student_name: r.students?.full_name ?? null,
      structure_name: r.fee_structures?.name ?? null,
    }));
  }

  async paymentsForStudentFee(tenantId: string, studentFeeId: string): Promise<FeePaymentDTO[]> {
    const { data, error } = await requestDb()
      .from('fee_payments')
      .select('*, students(full_name)')
      .eq('organisation_id', tenantId)
      .eq('student_fee_id', studentFeeId)
      .order('payment_date', { ascending: false });
    if (error) throw error;
    return ((data as FeePaymentRowWithNames[]) ?? []).map((r) => ({
      id: r.id,
      organisation_id: r.organisation_id,
      student_fee_id: r.student_fee_id,
      student_id: r.student_id,
      amount_paid: r.amount_paid,
      payment_method: r.payment_method,
      transaction_id: r.transaction_id,
      payment_date: r.payment_date,
      receipt_url: r.receipt_url,
      status: r.status,
      student_name: r.students?.full_name ?? null,
    }));
  }
}