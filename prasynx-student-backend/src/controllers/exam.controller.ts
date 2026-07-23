import { Response } from 'express';
import { examService } from '../services/exam.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class ExamController {
  async getExams(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await examService.getExams(student_id);
    sendSuccess(res, data);
  }

  async getMarks(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await examService.getMarks(student_id);
    sendSuccess(res, data);
  }
}
export const examController = new ExamController();
