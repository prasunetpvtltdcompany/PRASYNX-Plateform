import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendError } from '../utils/response';

export class StudentScholarshipController {
  async getByStudent(req: Request, res: Response) {
    const { student_id } = req.params;
    try {
      const { data, error } = await supabase.from('scholarships').select('*').eq('student_id', student_id).order('created_at', { ascending: false });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }
}
export const studentScholarshipController = new StudentScholarshipController();
