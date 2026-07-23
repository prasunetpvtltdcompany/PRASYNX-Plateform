import { Response } from 'express';
import { adminUserService } from '../services/admin-user.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class AdminUserController {
  async getAdminUsers(req: AuthRequest, res: Response) {
    const { org_id } = req.params;
    const data = await adminUserService.getAdminUsers(org_id);
    sendSuccess(res, data);
  }

  async createAdminUser(req: AuthRequest, res: Response) {
    const data = await adminUserService.createAdminUser(req.body);
    sendCreated(res, data, 'User created');
  }

  async updateUserStatus(req: AuthRequest, res: Response) {
    const { user_id } = req.params;
    const { status } = req.body;
    const data = await adminUserService.updateUserStatus(user_id, status);
    sendSuccess(res, data);
  }
}
export const adminUserController = new AdminUserController();
