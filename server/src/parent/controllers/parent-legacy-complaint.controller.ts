import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';

export class ParentLegacyComplaintController {
  async getByParent(req: Request, res: Response) {
    const { parent_id } = req.params;
    try {
      const { data, error } = await supabase.from('complaints').select('*').eq('filed_by', parent_id).order('created_at', { ascending: false });
      if (error) throw error;
      res.json({ complaints: data || [] });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }

  async create(req: Request, res: Response) {
    const { parent_id, student_id, complaint_type, title, description } = req.body;
    try {
      const { data, error } = await supabase.from('complaints').insert({ filed_by: parent_id, student_id, complaint_type, title, description, status: 'pending' }).select();
      if (error) throw error;
      res.status(201).json(data?.[0]);
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }
}
export const parentLegacyComplaintController = new ParentLegacyComplaintController();
