import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendError } from '../utils/response';

export class StudentCareerController {
  async getSessions(req: Request, res: Response) {
    const { org_id } = req.params;
    try {
      const { data, error } = await supabase.from('career_sessions').select('*').eq('organisation_id', org_id).order('session_date', { ascending: true });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async getInternships(req: Request, res: Response) {
    const { org_id } = req.params;
    try {
      const { data, error } = await supabase.from('internship_alerts').select('*').eq('organisation_id', org_id).order('posted_at', { ascending: false });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }
}
export const studentCareerController = new StudentCareerController();
