import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendCreated, sendError } from '../utils/response';

export class StudentFeedbackController {
  async create(req: Request, res: Response) {
    const { student_id, category, rating, comments } = req.body;
    try {
      const { data, error } = await supabase.from('feedback').insert({ student_id, category, rating, comments }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }
}
export const studentFeedbackController = new StudentFeedbackController();
