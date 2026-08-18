import { Response } from 'express';
import { leaveService } from '../services/leave.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class LeaveController {
  async applyLeave(req: AuthRequest, res: Response) {
    const data = await leaveService.applyLeave(req.body);
    sendCreated(res, data, 'Leave applied');
  }

  async getLeave(req: AuthRequest, res: Response) {
    const { user_id } = req.params;
    const data = await leaveService.getLeave(user_id);
    sendSuccess(res, data);
  }
}
export const leaveController = new LeaveController();
