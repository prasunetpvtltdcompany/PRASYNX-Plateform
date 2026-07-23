import { Response } from 'express';
import { homeworkService } from '../services/homework.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class HomeworkController {
  async getHomework(req: AuthRequest, res: Response) {
    const result = await homeworkService.getHomework(req.params.org_id);
    sendSuccess(res, result);
  }
  async getHomeworkById(req: AuthRequest, res: Response) {
    const result = await homeworkService.getHomeworkById(req.params.id);
    sendSuccess(res, result);
  }
  async createHomework(req: AuthRequest, res: Response) {
    const result = await homeworkService.createHomework(req.params.org_id, req.body);
    sendCreated(res, result, 'Homework created');
  }
  async updateHomework(req: AuthRequest, res: Response) {
    const result = await homeworkService.updateHomework(req.params.id, req.body);
    sendSuccess(res, result);
  }
  async deleteHomework(req: AuthRequest, res: Response) {
    await homeworkService.deleteHomework(req.params.id);
    sendSuccess(res, { message: 'Deleted' });
  }
  async getSubmissions(req: AuthRequest, res: Response) {
    const result = await homeworkService.getSubmissions(req.params.homework_id);
    sendSuccess(res, result);
  }
  async submitHomework(req: AuthRequest, res: Response) {
    const result = await homeworkService.submitHomework(req.params.org_id, req.body);
    sendCreated(res, result, 'Submitted');
  }
  async gradeSubmission(req: AuthRequest, res: Response) {
    const result = await homeworkService.gradeSubmission(req.params.id, req.body);
    sendSuccess(res, result, 'Graded');
  }
  async getPerformance(req: AuthRequest, res: Response) {
    const result = await homeworkService.getPerformance(req.params.org_id);
    sendSuccess(res, result);
  }
}

export const homeworkController = new HomeworkController();
