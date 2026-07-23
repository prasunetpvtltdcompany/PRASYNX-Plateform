import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendError } from '../utils/response';

export class StudentAnnouncementController {
  async getAll(req: Request, res: Response) {
    const { org_id } = req.params;
    try {
      const { data, error } = await supabase.from('announcements').select('*').eq('organisation_id', org_id).order('published_at', { ascending: false });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }
}
export const studentAnnouncementController = new StudentAnnouncementController();
