import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendError } from '../utils/response';

export class StudentTransportController {
  async getByStudent(req: Request, res: Response) {
    const { student_id } = req.params;
    try {
      const { data, error } = await supabase.from('transport_assignments').select('*, vehicle:transport_vehicles(*), route:transport_routes(*)').eq('student_id', student_id).single();
      if (error && error.code !== 'PGRST116') throw error;
      sendSuccess(res, data || null);
    } catch (e: any) { sendError(res, e.message); }
  }
}
export const studentTransportController = new StudentTransportController();
