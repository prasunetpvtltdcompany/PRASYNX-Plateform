import { Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

/**
 * Dashboard Controller
 * 
 * Handles all dashboard and overview endpoints.
 * Functions: getDashboard
 */
export class DashboardController {
  async getDashboard(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const stats = await dashboardService.getDashboardStats(organisation_id);
    sendSuccess(res, stats);
  }
}

export const dashboardController = new DashboardController();
