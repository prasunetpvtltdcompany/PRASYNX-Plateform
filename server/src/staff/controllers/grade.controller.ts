import { Response } from 'express';
import { gradeService } from '../services/grade.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class GradeController {
  async addGrade(req: AuthRequest, res: Response) {
    const data = await gradeService.addGrade(req.body);
    sendCreated(res, data, 'Grade added');
  }

  async getGrades(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await gradeService.getGrades(student_id);
    sendSuccess(res, data);
  }
}
export const gradeController = new GradeController();
