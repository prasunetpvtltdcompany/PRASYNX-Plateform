import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';

export class ParentLegacyFeeController {
  async getDocuments(req: Request, res: Response) {
    const { parent_id } = req.params;
    try {
      const { data: links } = await supabase.from('parent_student_links').select('student_id').eq('parent_id', parent_id);
      const studentIds = links?.map((row: any) => row.student_id) || [];
      const { data, error } = await supabase.from('documents').select('*').in('user_id', studentIds).in('document_type', ['Receipt', 'Tax Statement']).order('issued_date', { ascending: false });
      if (error) throw error;
      res.json({ documents: data || [] });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }
}
export const parentLegacyFeeController = new ParentLegacyFeeController();
