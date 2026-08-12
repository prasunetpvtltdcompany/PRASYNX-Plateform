import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FinanceService } from '../finance.service';
import { FinanceRepository } from '../finance.repository';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../shared/errors/errors';

vi.mock('../../../shared/access/studentAccess', () => {
  return {
    studentAccess: {
      assertCanView: vi.fn(async () => {}),
      canView: vi.fn(async () => true),
      studentIdForUser: vi.fn(async () => '00000000-0000-0000-0000-0000000000s1'),
      studentIdsForParent: vi.fn(async () => []),
    },
  };
});

const ORG = '00000000-0000-0000-0000-00000000000a';
const CLASS = '00000000-0000-0000-0000-0000000000c1';
const STUDENT = '00000000-0000-0000-0000-0000000000s1';
const STRUCTURE = '00000000-0000-0000-0000-0000000000f1';
const STUDENT_FEE = '00000000-0000-0000-0000-0000000000f2';

const structure = () => ({
  id: STRUCTURE,
  organisation_id: ORG,
  name: 'Term 1',
  class_id: CLASS,
  academic_year: '2026',
  total_amount: 2500,
  status: 'active',
  created_at: '2026-07-01T00:00:00.000Z',
  items: [
    { id: 'i1', fee_structure_id: STRUCTURE, item_name: 'Tuition', amount: 2000 },
    { id: 'i2', fee_structure_id: STRUCTURE, item_name: 'Books', amount: 500 },
  ],
});

function stubRepo(): FinanceRepository {
  return {
    assertClassInTenant: async (tenantId: string, classId: string | null | undefined) => {
      if (tenantId !== ORG || (classId && classId !== CLASS)) throw new ForbiddenError('Class does not belong to this school');
    },
    assertStudentInTenant: async (tenantId: string, studentId: string) => {
      if (tenantId !== ORG || studentId !== STUDENT) throw new ForbiddenError('Student does not belong to this school');
    },
    getFeeStructure: async (tenantId: string, id: string) => {
      if (id !== STRUCTURE) throw new NotFoundError();
      if (tenantId !== ORG) throw new ForbiddenError('Fee structure does not belong to this school');
      return structure();
    },
    listFeeStructures: async (tenantId: string) => ({ data: tenantId === ORG ? [structure()] : [], total: 1, page: 1, pageSize: 20, totalPages: 1 }),
    createFeeStructure: async (input: {
      organisation_id: string;
      name: string;
      class_id?: string | null;
      academic_year?: string | null;
      total_amount: number;
      items: Array<{ item_name: string; amount: number }>;
    }) => ({ id: STRUCTURE, organisation_id: input.organisation_id, name: input.name, class_id: input.class_id, academic_year: input.academic_year, total_amount: input.total_amount, status: 'active', created_at: '', items: input.items.map((i, idx) => ({ id: `i${idx}`, fee_structure_id: STRUCTURE, item_name: i.item_name, amount: i.amount })) }),
    assignToStudents: async () => [
      { id: STUDENT_FEE, organisation_id: ORG, student_id: STUDENT, fee_structure_id: STRUCTURE, total_amount: 2500, paid_amount: 0, due_date: null, status: 'pending', created_at: '' },
    ],
    getStudentFee: async (tenantId: string, id: string) => {
      if (id !== STUDENT_FEE) throw new NotFoundError();
      if (tenantId !== ORG) throw new ForbiddenError('Student fee record does not belong to this school');
      return { id: STUDENT_FEE, organisation_id: ORG, student_id: STUDENT, fee_structure_id: STRUCTURE, total_amount: 2500, paid_amount: 0, due_date: null, status: 'pending', created_at: '' };
    },
    insertPayment: async (input: {
      organisation_id: string;
      student_fee_id: string;
      student_id: string;
      amount_paid: number;
      payment_method: string;
      transaction_id?: string | null;
      receipt_url?: string | null;
      status: string;
    }) => ({
      id: 'p1',
      organisation_id: input.organisation_id,
      student_fee_id: input.student_fee_id,
      student_id: input.student_id,
      amount_paid: input.amount_paid,
      payment_method: input.payment_method,
      transaction_id: input.transaction_id,
      payment_date: '2026-08-10T00:00:00.000Z',
      receipt_url: input.receipt_url,
      status: input.status,
    }),
    updateStudentFeePaid: async (id: string, paidAmount: number, status: string) => ({
      id: id ?? STUDENT_FEE,
      organisation_id: ORG,
      student_id: STUDENT,
      fee_structure_id: STRUCTURE,
      total_amount: 2500,
      paid_amount: paidAmount,
      due_date: null,
      status,
      created_at: '',
    }),
    feesForStudent: async () => [
      { id: STUDENT_FEE, organisation_id: ORG, student_id: STUDENT, fee_structure_id: STRUCTURE, total_amount: 2500, paid_amount: 1000, due_date: null, status: 'partial', created_at: '', student_name: 'Ada', structure_name: 'Term 1' },
    ],
    paymentsForStudentFee: async () => [],
  } as unknown as FinanceRepository;
}

describe('FinanceService', () => {
  let svc: FinanceService;

  beforeEach(() => {
    svc = new FinanceService(stubRepo());
  });

  it('creates a fee structure and computes the total from items', async () => {
    const dto = await svc.createStructure({
      tenantId: ORG,
      name: 'Term 1',
      items: [
        { item_name: 'Tuition', amount: 2000 },
        { item_name: 'Books', amount: 500 },
      ],
    });
    expect(dto.total_amount).toBe(2500);
    expect(dto.items).toHaveLength(2);
  });

  it('rejects non-positive fee item amounts', async () => {
    await expect(
      svc.createStructure({ tenantId: ORG, name: 'X', items: [{ item_name: 'Bad', amount: 0 }] }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('assigns a structure to students', async () => {
    const assigned = await svc.assignToStudents({ tenantId: ORG, feeStructureId: STRUCTURE, studentIds: [STUDENT] });
    expect(assigned).toBe(1);
  });

  it('records a payment and moves status to paid when fully settled', async () => {
    const result = await svc.recordPayment({ tenantId: ORG, studentFeeId: STUDENT_FEE, amountPaid: 2500, paymentMethod: 'online' });
    expect(result.status).toBe('paid');
    expect(result.fee.paid_amount).toBe(2500);
  });

  it('rejects overpayment', async () => {
    await expect(svc.recordPayment({ tenantId: ORG, studentFeeId: STUDENT_FEE, amountPaid: 5000, paymentMethod: 'cash' })).rejects.toBeInstanceOf(BadRequestError);
  });

  it('scopes student statements by guardian/self rule', async () => {
    const st = await svc.studentStatement({ requester: { role: 'parent', userId: 'user-parent', tenantId: ORG }, tenantId: ORG, studentId: STUDENT });
    expect(st.outstanding).toBe(1500);
  });
});