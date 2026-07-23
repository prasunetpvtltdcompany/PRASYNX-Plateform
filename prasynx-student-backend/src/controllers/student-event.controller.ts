import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendError } from '../utils/response';

export class StudentEventController {
  async getAll(req: Request, res: Response) {
    const { org_id } = req.params;
    try {
      const { data, error } = await supabase.from('events').select('*').eq('organisation_id', org_id).order('start_date', { ascending: true });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }
}
export const studentEventController = new StudentEventController();
