import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';

export class ParentLegacyVaccinationController {
  async getByStudent(req: Request, res: Response) {
    const { student_id } = req.params;
    try {
      const { data, error } = await supabase.from('vaccinations').select('*').eq('student_id', student_id).order('vaccination_date', { ascending: false });
      if (error) throw error;
      res.json({ vaccinations: data || [] });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }
}
export const parentLegacyVaccinationController = new ParentLegacyVaccinationController();
