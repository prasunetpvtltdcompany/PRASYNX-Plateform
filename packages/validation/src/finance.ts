import { z } from 'zod';
import { dateOnlySchema, uuidSchema } from './common';

export const paymentMethodSchema = z.enum(['cash', 'card', 'bank_transfer', 'online', 'cheque']);

export const feeItemSchema = z.object({
  item_name: z.string().trim().min(1, { message: 'Item name is required' }).max(200),
  amount: z.coerce.number().min(0, { message: 'Amount cannot be negative' }).max(100000000),
});

export const createFeeStructureSchema = z.object({
  name: z.string().trim().min(1, { message: 'Fee structure name is required' }).max(200),
  class_id: uuidSchema.optional().nullable(),
  academic_year: z.string().max(20).optional().nullable(),
  items: z.array(feeItemSchema).min(1, { message: 'At least one fee item is required' }).max(100),
});

export const assignFeeStructureSchema = z.object({
  fee_structure_id: uuidSchema,
  student_ids: z.array(uuidSchema).min(1).max(500),
  due_date: dateOnlySchema.optional().nullable(),
});

export const recordPaymentSchema = z.object({
  student_fee_id: uuidSchema,
  amount_paid: z.coerce.number().positive({ message: 'Amount must be positive' }).max(100000000),
  payment_method: paymentMethodSchema,
  transaction_id: z.string().max(200).optional().nullable(),
  receipt_url: z.string().max(1000).optional().nullable(),
});

export const feeStructureQuerySchema = z.object({
  status: z.enum(['active', 'archived']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
});

export const studentFeeQuerySchema = z.object({
  student_id: uuidSchema.optional(),
  status: z.enum(['pending', 'partial', 'paid', 'overdue', 'waived']).optional(),
});