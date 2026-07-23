import { Response } from 'express';
import { feeService } from '../services/fee.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class FeeController {
  async getFees(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await feeService.getFees(student_id);
    sendSuccess(res, data);
  }
}
export const feeController = new FeeController();
