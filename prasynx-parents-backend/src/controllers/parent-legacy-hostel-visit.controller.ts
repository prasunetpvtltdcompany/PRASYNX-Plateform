import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';

export class ParentLegacyHostelVisitController {
  async create(req: Request, res: Response) {
    const { parent_id, student_id, requested_date, reason } = req.body;
    try {
      const { data, error } = await supabase.from('hostel_visit_requests').insert({ parent_id, student_id, requested_date, purpose: reason, status: 'pending' }).select();
      if (error) throw error;
      res.status(201).json(data?.[0]);
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }

  async getByParent(req: Request, res: Response) {
    const { parent_id } = req.params;
    try {
      const { data, error } = await supabase.from('hostel_visit_requests').select('*').eq('parent_id', parent_id).order('created_at', { ascending: false });
      if (error) throw error;
      res.json({ visits: data || [] });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }
}
export const parentLegacyHostelVisitController = new ParentLegacyHostelVisitController();
