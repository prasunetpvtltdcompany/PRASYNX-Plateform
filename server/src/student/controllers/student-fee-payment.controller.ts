import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

export class StudentFeePaymentController {
  async pay(req: Request, res: Response) {
    const { student_fee_id, amount_paid, payment_method, transaction_id } = req.body;
    try {
      const { data: fee } = await supabase.from('student_fees').select('*').eq('id', student_fee_id).single();
      if (!fee) return sendError(res, 'Fee record not found', 404);
      const { data, error } = await supabase.from('fee_payments').insert({
        student_fee_id, amount_paid, payment_method, transaction_id,
        payment_date: new Date().toISOString().slice(0, 10), status: 'completed'
      }).select().single();
      if (error) throw error;
      const totalPaid = Number(fee.amount) || 0;
      const afterPayment = totalPaid - Number(amount_paid);
      await supabase.from('student_fees').update({ status: afterPayment <= 0 ? 'paid' : 'partial' }).eq('id', student_fee_id);
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async getReceipt(req: Request, res: Response) {
    const { payment_id } = req.params;
    try {
      const { data, error } = await supabase.from('fee_payments').select('*, student_fee:student_fees(*), student:students(full_name, roll_number, class_id, classes:classes!students_class_id_fkey(name))').eq('id', payment_id).single();
      if (error || !data) return sendError(res, 'Receipt not found', 404);
      sendSuccess(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async getPaymentHistory(req: Request, res: Response) {
    const { student_id } = req.params;
    try {
      const feeIds = (await supabase.from('student_fees').select('id').eq('student_id', student_id)).data?.map(f => f.id) || [];
      if (feeIds.length === 0) return sendSuccess(res, []);
      const { data, error } = await supabase.from('fee_payments').select('*, student_fee:student_fees(*)').in('student_fee_id', feeIds).order('payment_date', { ascending: false });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }
}
export const studentFeePaymentController = new StudentFeePaymentController();
