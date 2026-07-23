import { Response } from 'express';
import { marksService } from '../services/marks.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class MarksController {
  async getExamResults(req: AuthRequest, res: Response) {
    const result = await marksService.getExamResults(req.params.exam_id);
    sendSuccess(res, result);
  }
  async enterMarks(req: AuthRequest, res: Response) {
    const result = await marksService.enterMarks(req.params.org_id, req.body);
    sendCreated(res, result, 'Marks entered');
  }
  async publishResults(req: AuthRequest, res: Response) {
    const result = await marksService.publishResults(req.params.exam_id);
    sendSuccess(res, result, 'Results published');
  }
  async getStudentPerformance(req: AuthRequest, res: Response) {
    const result = await marksService.getStudentPerformance(req.params.org_id, req.params.student_id);
    sendSuccess(res, result);
  }
  async getClassPerformance(req: AuthRequest, res: Response) {
    const result = await marksService.getClassPerformance(req.params.org_id, req.params.class_id);
    sendSuccess(res, result);
  }
  async getGradeSummary(req: AuthRequest, res: Response) {
    const result = await marksService.getGradeSummary(req.params.org_id);
    sendSuccess(res, result);
  }
  async getRankings(req: AuthRequest, res: Response) {
    const result = await marksService.getRankings(req.params.org_id, req.params.exam_id);
    sendSuccess(res, result);
  }
  async getReportCard(req: AuthRequest, res: Response) {
    const result = await marksService.getReportCard(req.params.org_id, req.params.student_id, req.params.exam_id);
    sendSuccess(res, result);
  }
}

export const marksController = new MarksController();
