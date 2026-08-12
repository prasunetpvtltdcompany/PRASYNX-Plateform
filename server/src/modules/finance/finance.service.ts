import { FinanceRepository } from './finance.repository';
import { BadRequestError } from '../../shared/errors/errors';
import { enqueue } from '../../infrastructure/jobs/queue';
import { studentAccess, type Requester } from '../../shared/access/studentAccess';
import { PERMISSIONS } from '@prasynx/config';
import type {
  FeePaymentDTO,
  FeeStructureDTO,
  FeeStructureItemInput,
  Paginated,
  PaymentMethod,
  PaymentStatus,
  StudentFeeDTO,
  StudentFeeStatus,
} from '@prasynx/types';

const FEE_STATUSES: StudentFeeStatus[] = ['pending', 'partial', 'paid', 'overdue', 'waived'];

export class FinanceService {
  constructor(private repo: FinanceRepository) {}

  async createStructure(input: {
    tenantId: string;
    name: string;
    classId?: string | null;
    academicYear?: string | null;
    items: FeeStructureItemInput[];
  }): Promise<FeeStructureDTO> {
    await this.repo.assertClassInTenant(input.tenantId, input.classId);
    if (input.items.some((i) => i.amount <= 0)) throw new BadRequestError('Fee item amounts must be positive');
    const totalAmount = Number(input.items.reduce((sum, i) => sum + i.amount, 0).toFixed(2));
    return this.repo.createFeeStructure({
      organisation_id: input.tenantId,
      name: input.name,
      class_id: input.classId,
      academic_year: input.academicYear,
      total_amount: totalAmount,
      items: input.items,
    });
  }

  async listStructures(input: { tenantId: string; status?: string; page: number; pageSize: number }): Promise<Paginated<FeeStructureDTO>> {
    return this.repo.listFeeStructures(input.tenantId, input.status, input.page, input.pageSize);
  }

  async assignToStudents(input: {
    tenantId: string;
    feeStructureId: string;
    studentIds: string[];
    dueDate?: string | null;
  }): Promise<number> {
    for (const id of input.studentIds) {
      await this.repo.assertStudentInTenant(input.tenantId, id);
    }
    const rows = await this.repo.assignToStudents({ tenantId: input.tenantId, feeStructureId: input.feeStructureId, studentIds: input.studentIds, dueDate: input.dueDate });
    this.fanOutFeesAssigned(input.tenantId, input.studentIds);
    return rows.length;
  }

  async recordPayment(input: {
    tenantId: string;
    studentFeeId: string;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    transactionId?: string | null;
    receiptUrl?: string | null;
  }): Promise<{ payment: FeePaymentDTO; fee: StudentFeeDTO; status: StudentFeeStatus }> {
    const fee = await this.repo.getStudentFee(input.tenantId, input.studentFeeId);
    const newPaid = Number((fee.paid_amount + input.amountPaid).toFixed(2));
    if (newPaid > fee.total_amount + 0.0001) throw new BadRequestError('Payment exceeds the outstanding balance for this fee');

    const status: StudentFeeStatus =
      Math.abs(newPaid - fee.total_amount) < 0.0001 ? 'paid' : newPaid > 0 ? 'partial' : fee.status;

    const payment = await this.repo.insertPayment({
      organisation_id: input.tenantId,
      student_fee_id: fee.id,
      student_id: fee.student_id,
      amount_paid: input.amountPaid,
      payment_method: input.paymentMethod,
      transaction_id: input.transactionId ?? null,
      receipt_url: input.receiptUrl ?? null,
      status: 'completed' as PaymentStatus,
    });

    const updated = await this.repo.updateStudentFeePaid(fee.id, newPaid, status);
    const feeDTO: StudentFeeDTO = {
      id: updated.id,
      organisation_id: updated.organisation_id,
      student_id: updated.student_id,
      fee_structure_id: updated.fee_structure_id,
      total_amount: updated.total_amount,
      paid_amount: updated.paid_amount,
      due_date: updated.due_date,
      status: updated.status,
      created_at: updated.created_at,
      student_name: null,
      structure_name: null,
    };

    this.fanOutPaymentCompleted(input.tenantId, { ...payment, student_id: fee.student_id }, feeDTO);
    return { payment, fee: feeDTO, status };
  }

  async studentStatement(input: { requester: Requester; tenantId: string; studentId: string }): Promise<{ fees: StudentFeeDTO[]; totalCharged: number; totalPaid: number; outstanding: number }> {
    await this.repo.assertStudentInTenant(input.tenantId, input.studentId);
    await studentAccess.assertCanView(input.requester, input.studentId, PERMISSIONS.SCHOOL_FINANCE_VIEW);
    const fees = await this.repo.feesForStudent(input.tenantId, input.studentId);
    const totalCharged = Number(fees.reduce((s, f) => s + f.total_amount, 0).toFixed(2));
    const totalPaid = Number(fees.reduce((s, f) => s + f.paid_amount, 0).toFixed(2));
    return { fees, totalCharged, totalPaid, outstanding: Number((totalCharged - totalPaid).toFixed(2)) };
  }

  async feeDetail(input: { tenantId: string; studentFeeId: string }): Promise<{ fee: StudentFeeDTO; payments: FeePaymentDTO[] }> {
    const feeRow = await this.repo.getStudentFee(input.tenantId, input.studentFeeId);
    const fees = await this.repo.feesForStudent(input.tenantId, feeRow.student_id);
    const fee = fees.find((f) => f.id === feeRow.id) ?? {
      id: feeRow.id,
      organisation_id: feeRow.organisation_id,
      student_id: feeRow.student_id,
      fee_structure_id: feeRow.fee_structure_id,
      total_amount: feeRow.total_amount,
      paid_amount: feeRow.paid_amount,
      due_date: feeRow.due_date,
      status: feeRow.status,
      created_at: feeRow.created_at,
      student_name: null,
      structure_name: null,
    };
    const payments = await this.repo.paymentsForStudentFee(input.tenantId, input.studentFeeId);
    return { fee, payments };
  }

  private fanOutFeesAssigned(tenantId: string, studentIds: string[]): void {
    enqueue('finance.feesAssigned', { tenantId, studentIds });
  }

  private fanOutPaymentCompleted(tenantId: string, payment: { id: string; student_id: string; amount_paid: number }, fee: StudentFeeDTO): void {
    enqueue('finance.paymentCompleted', { tenantId, paymentId: payment.id, studentId: payment.student_id, amount: payment.amount_paid, feeStatus: fee.status });
  }

  // referenced by the controller for status normalization
  static readonly FEE_STATUSES = FEE_STATUSES;
}

export const financeService = new FinanceService(new FinanceRepository());