import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';

export class ParentLegacyExamController {
  async getSchedules(req: Request, res: Response) {
    try {
      const { data, error } = await supabase.from('exam_schedules').select('*').order('date', { ascending: true }).limit(10);
      if (error) throw error;
      res.json({ schedules: data || [], results: [] });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }
}
export const parentLegacyExamController = new ParentLegacyExamController();
