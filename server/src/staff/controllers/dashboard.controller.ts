import { Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class DashboardController {
  async getDashboard(req: AuthRequest, res: Response) {
    const { teacher_id } = req.params;
    const data = await dashboardService.getDashboard(teacher_id);
    sendSuccess(res, data);
  }
}
export const dashboardController = new DashboardController();
