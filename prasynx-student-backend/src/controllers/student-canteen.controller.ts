import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

export class StudentCanteenController {
  async getByStudent(req: Request, res: Response) {
    const { student_id } = req.params;
    try {
      const [balanceRes, ordersRes] = await Promise.all([
        supabase.from('canteen_balances').select('balance').eq('student_id', student_id).maybeSingle(),
        supabase.from('canteen_orders').select('*').eq('student_id', student_id).order('created_at', { ascending: false }).limit(20)
      ]);
      sendSuccess(res, { balance: balanceRes.data?.balance || 0, orders: ordersRes.data || [] });
    } catch (e: any) { sendError(res, e.message); }
  }

  async createOrder(req: Request, res: Response) {
    const { student_id, items, amount } = req.body;
    if (!student_id || !items || !amount) return sendError(res, 'Required: student_id, items, amount', 400);
    try {
      const { data, error } = await supabase.from('canteen_orders').insert({
        student_id, order_items: items, amount: Number(amount), status: 'pending', ordered_at: new Date().toISOString()
      }).select();
      if (error) throw error;
      sendCreated(res, data?.[0]);
    } catch (e: any) { sendError(res, e.message); }
  }
}
export const studentCanteenController = new StudentCanteenController();
