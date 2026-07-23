import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';

export class ParentLegacyCanteenController {
  async createOrder(req: Request, res: Response) {
    const { parent_id, student_id, order_items, amount, scheduled_for } = req.body;
    try {
      const { data, error } = await supabase.from('canteen_orders').insert({ parent_id, student_id, order_items, amount, scheduled_for }).select();
      if (error) throw error;
      res.status(201).json(data?.[0]);
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }

  async getOrders(req: Request, res: Response) {
    const { parent_id } = req.params;
    try {
      const { data, error } = await supabase.from('canteen_orders').select('*').eq('parent_id', parent_id).order('ordered_at', { ascending: false });
      if (error) throw error;
      res.json({ orders: data || [] });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }

  async getBalance(req: Request, res: Response) {
    const { student_id } = req.params;
    try {
      const { data, error } = await supabase.from('canteen_balances').select('*').eq('student_id', student_id).single();
      if (error && error.code !== 'PGRST116') throw error;
      res.json({ balance: data?.balance || 0 });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }
}
export const parentLegacyCanteenController = new ParentLegacyCanteenController();
