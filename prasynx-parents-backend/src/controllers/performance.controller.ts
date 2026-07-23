import { Response } from 'express';
import { performanceService } from '../services/performance.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class PerformanceController {
  async getPerformance(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await performanceService.getPerformance(student_id);
    sendSuccess(res, data);
  }
}
export const performanceController = new PerformanceController();
