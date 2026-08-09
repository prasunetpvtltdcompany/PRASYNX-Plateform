import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendError } from '../utils/response';

export class StudentTeacherController {
  async getAll(req: Request, res: Response) {
    const { organisation_id } = req.params;
    try {
      const { data, error } = await supabase.from('staff_records').select('*').eq('organisation_id', organisation_id);
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }
}
export const studentTeacherController = new StudentTeacherController();
