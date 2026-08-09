import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';

export class ParentLegacyTeacherController {
  async getByStudent(req: Request, res: Response) {
    const { student_id } = req.params;
    try {
      const { data: classMap } = await supabase.from('class_student_map').select('class_id').eq('student_id', student_id);
      const classIds = classMap?.map(c => c.class_id) || [];
      let teachers: any[] = [];
      if (classIds.length > 0) {
        const { data: cstm } = await supabase.from('class_subject_teacher_map').select('teacher:staff_records(*)').in('class_id', classIds);
        teachers = cstm?.map((row: any) => row.teacher).filter(Boolean) || [];
      }
      res.json({ teachers });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }

  async getByOrganisation(req: Request, res: Response) {
    const { organisation_id } = req.params;
    try {
      const { data, error } = await supabase.from('users').select('id, full_name, email').eq('organisation_id', organisation_id).eq('role', 'teacher');
      if (error) throw error;
      res.json(data || []);
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }
}
export const parentLegacyTeacherController = new ParentLegacyTeacherController();
