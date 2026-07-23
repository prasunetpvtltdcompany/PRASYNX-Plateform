import { Response } from 'express';
import { healthService } from '../services/health.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class HealthController {
  async getHealth(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await healthService.getHealth(student_id);
    sendSuccess(res, data);
  }
}
export const healthController = new HealthController();
