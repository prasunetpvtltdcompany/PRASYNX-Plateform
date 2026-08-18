import { Response } from 'express';
import { feeService } from '../services/fee.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class FeeController {
  async getFeesSummary(req: AuthRequest, res: Response) {
    const { parent_id } = req.params;
    const data = await feeService.getFeesSummary(parent_id);
    sendSuccess(res, data);
  }

  async getFeesByStudent(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await feeService.getFeesByStudent(student_id);
    sendSuccess(res, data);
  }
}
export const feeController = new FeeController();
