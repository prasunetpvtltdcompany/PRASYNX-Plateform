import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendCreated, sendError } from '../utils/response';

export class StudentComplaintController {
  async create(req: Request, res: Response) {
    const { filed_by, complaint_type, title, description } = req.body;
    try {
      const { data, error } = await supabase.from('complaints').insert({ filed_by, complaint_type, title, description }).select();
      if (error) throw error;
      sendCreated(res, data?.[0]);
    } catch (e: any) { sendError(res, e.message); }
  }
}
export const studentComplaintController = new StudentComplaintController();
