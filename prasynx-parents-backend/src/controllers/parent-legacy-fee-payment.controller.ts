import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';

export class ParentLegacyFeePaymentController {
  async pay(req: Request, res: Response) {
    const { student_fee_id, amount_paid, payment_method } = req.body;
    if (!student_fee_id || !amount_paid) return res.status(400).json({ error: 'Required: student_fee_id, amount_paid' });
    try {
      const { data, error } = await supabase.from('fee_payments').insert({
        student_fee_id, amount_paid: Number(amount_paid), payment_method: payment_method || 'UPI',
        transaction_id: `TXN-P${Date.now()}`, payment_date: new Date().toISOString(), status: 'completed'
      }).select();
      if (error) throw error;
      res.status(201).json(data?.[0]);
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }
}
export const parentLegacyFeePaymentController = new ParentLegacyFeePaymentController();
