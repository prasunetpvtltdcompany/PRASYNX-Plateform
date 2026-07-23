import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendError } from '../utils/response';

export class StudentLibraryController {
  async getByUser(req: Request, res: Response) {
    const { user_id } = req.params;
    try {
      const { data, error } = await supabase.from('documents').select('*').eq('user_id', user_id).in('document_type', ['E-Book', 'Notes', 'Past Paper', 'Video Lecture', 'Health Record']);
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async getCertificates(req: Request, res: Response) {
    const { user_id } = req.params;
    try {
      const { data, error } = await supabase.from('documents').select('*').eq('user_id', user_id).in('document_type', ['Certificate', 'Bonafide']);
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }
}
export const studentLibraryController = new StudentLibraryController();
