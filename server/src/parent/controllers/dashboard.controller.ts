import { Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class DashboardController {
  async getDashboard(req: AuthRequest, res: Response) {
    const { parent_id } = req.params;
    const userId = (req.query.user_id as string) || parent_id;
    const data = await dashboardService.getDashboard(parent_id, userId);
    sendSuccess(res, data);
  }
}
export const dashboardController = new DashboardController();
