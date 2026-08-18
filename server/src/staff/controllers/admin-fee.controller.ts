import { Response } from 'express';
import { adminFeeService } from '../services/admin-fee.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class AdminFeeController {
  async getAdminFees(req: AuthRequest, res: Response) {
    const { org_id } = req.params;
    const data = await adminFeeService.getAdminFees(org_id);
    sendSuccess(res, data);
  }

  async createAdminFee(req: AuthRequest, res: Response) {
    const data = await adminFeeService.createAdminFee(req.body);
    sendCreated(res, data, 'Fee created');
  }
}
export const adminFeeController = new AdminFeeController();
