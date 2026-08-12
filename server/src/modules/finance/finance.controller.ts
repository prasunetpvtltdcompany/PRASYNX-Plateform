import type { Request, Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { financeService } from './finance.service';
import {
  createFeeStructureSchema,
  assignFeeStructureSchema,
  recordPaymentSchema,
  feeStructureQuerySchema,
  studentFeeQuerySchema,
} from '@prasynx/validation';
import type { Role } from '@prasynx/types';

export class FinanceController {
  createStructure = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as ReturnType<typeof createFeeStructureSchema.parse>;
    if (!body) throw new BadRequestError('Invalid request body');

    const structure = await financeService.createStructure({
      tenantId: req.user!.tenantId ?? '',
      name: body.name,
      classId: body.class_id,
      academicYear: body.academic_year,
      items: body.items,
    });

    res.status(201).json({ structure });
  });

  listStructures = asyncHandler(async (req: Request, res: Response) => {
    const query = req.validated?.query as ReturnType<typeof feeStructureQuerySchema.parse>;
    if (!query) throw new BadRequestError('Invalid query');

    const structures = await financeService.listStructures({
      tenantId: req.user!.tenantId ?? '',
      status: query.status,
      page: query.page,
      pageSize: query.pageSize,
    });

    res.status(200).json({ structures });
  });

  assignToStudents = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as ReturnType<typeof assignFeeStructureSchema.parse>;
    if (!body) throw new BadRequestError('Invalid request body');

    const assigned = await financeService.assignToStudents({
      tenantId: req.user!.tenantId ?? '',
      feeStructureId: body.fee_structure_id,
      studentIds: body.student_ids,
      dueDate: body.due_date,
    });

    res.status(201).json({ assigned });
  });

  recordPayment = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as ReturnType<typeof recordPaymentSchema.parse>;
    if (!body) throw new BadRequestError('Invalid request body');

    const result = await financeService.recordPayment({
      tenantId: req.user!.tenantId ?? '',
      studentFeeId: body.student_fee_id,
      amountPaid: body.amount_paid,
      paymentMethod: body.payment_method,
      transactionId: body.transaction_id,
      receiptUrl: body.receipt_url,
    });

    res.status(201).json(result);
  });

  studentStatement = asyncHandler(async (req: Request, res: Response) => {
    const query = req.validated?.query as ReturnType<typeof studentFeeQuerySchema.parse>;
    if (!query?.student_id) throw new BadRequestError('student_id is required');

    const statement = await financeService.studentStatement({
      requester: { role: req.user!.role as Role, userId: req.user!.userId, tenantId: req.user!.tenantId },
      tenantId: req.user!.tenantId ?? '',
      studentId: query.student_id,
    });

    res.status(200).json({ statement });
  });

  feeDetail = asyncHandler(async (req: Request, res: Response) => {
    const detail = await financeService.feeDetail({ tenantId: req.user!.tenantId ?? '', studentFeeId: req.params.studentFeeId });
    res.status(200).json({ ...detail });
  });
}

export const financeController = new FinanceController();