import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';

export class ParentLegacyLeaveController {
  async create(req: Request, res: Response) {
    const { parent_id, student_id, leave_type, start_date, end_date, reason } = req.body;
    try {
      const { data, error } = await supabase.from('leave_applications').insert({ user_id: parent_id, student_id, requested_by: parent_id, leave_type, start_date, end_date, reason }).select();
      if (error) throw error;
      res.status(201).json(data?.[0]);
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }

  async getByParent(req: Request, res: Response) {
    const { parent_id } = req.params;
    try {
      const { data, error } = await supabase.from('leave_applications').select('*').eq('requested_by', parent_id).order('created_at', { ascending: false });
      if (error) throw error;
      res.json({ requests: data || [] });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }
}
export const parentLegacyLeaveController = new ParentLegacyLeaveController();
