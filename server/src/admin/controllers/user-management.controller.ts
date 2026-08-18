import { Response } from 'express';
import { userManagementService } from '../services/user-management.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class UserManagementController {
  async getStats(req: AuthRequest, res: Response) {
    const data = await userManagementService.getStats();
    sendSuccess(res, data);
  }

  async getUsers(req: AuthRequest, res: Response) {
    const data = await userManagementService.getUsers({
      group: typeof req.query.group === 'string' ? req.query.group : undefined,
      q: typeof req.query.q === 'string' ? req.query.q : undefined,
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
    });
    sendSuccess(res, data);
  }

  async createUser(req: AuthRequest, res: Response) {
    const data = await userManagementService.createUser(req.body);
    sendCreated(res, { user: data }, 'User created');
  }

  async updateUserStatus(req: AuthRequest, res: Response) {
    const data = await userManagementService.updateUserStatus(req.params.id, req.body.status);
    sendSuccess(res, { user: data }, 'User status updated');
  }

  async deleteUser(req: AuthRequest, res: Response) {
    const data = await userManagementService.deleteUser(req.params.id);
    sendSuccess(res, data, 'User deleted');
  }

  async getCompanyAdmins(req: AuthRequest, res: Response) {
    const data = await userManagementService.getCompanyAdmins();
    sendSuccess(res, { companyAdmins: data });
  }

  async createCompanyAdmin(req: AuthRequest, res: Response) {
    const data = await userManagementService.createCompanyAdmin(req.body);
    sendCreated(res, { companyAdmin: data }, 'Company admin created');
  }

  async updateCompanyAdmin(req: AuthRequest, res: Response) {
    const data = await userManagementService.updateCompanyAdmin(req.params.id, req.body);
    sendSuccess(res, { companyAdmin: data }, 'Company admin updated');
  }

  async deleteCompanyAdmin(req: AuthRequest, res: Response) {
    const data = await userManagementService.deleteCompanyAdmin(req.params.id);
    sendSuccess(res, data, 'Company admin deleted');
  }
}
export const userManagementController = new UserManagementController();
