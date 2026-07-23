import { Response } from 'express';
import { examService } from '../services/exam.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class ExamController {
  async createExam(req: AuthRequest, res: Response) {
    const data = await examService.createExam(req.body);
    sendCreated(res, data, 'Exam created');
  }

  async addExamQuestion(req: AuthRequest, res: Response) {
    const data = await examService.addExamQuestion(req.body);
    sendCreated(res, data, 'Question added');
  }

  async getExams(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const data = await examService.getExams(organisation_id);
    sendSuccess(res, data);
  }

  async updateExamStatus(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    const data = await examService.updateExamStatus(id, status);
    sendSuccess(res, data);
  }

  async deleteExamQuestion(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const data = await examService.deleteExamQuestion(id);
    sendSuccess(res, data);
  }

  async getExamSubmissions(req: AuthRequest, res: Response) {
    const { exam_id } = req.params;
    const data = await examService.getExamSubmissions(exam_id);
    sendSuccess(res, data);
  }

  async gradeExamSubmission(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { marks_obtained, feedback } = req.body;
    const data = await examService.gradeExamSubmission(id, marks_obtained, feedback);
    sendSuccess(res, data);
  }
}
export const examController = new ExamController();
