import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendError } from '../utils/response';

export class StudentClubController {
  async getAll(req: Request, res: Response) {
    const { org_id } = req.params;
    try {
      const { data, error } = await supabase.from('clubs').select('*').eq('organisation_id', org_id).order('name');
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }
}
export const studentClubController = new StudentClubController();
