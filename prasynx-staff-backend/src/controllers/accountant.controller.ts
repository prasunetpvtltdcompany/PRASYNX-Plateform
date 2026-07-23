import { Response } from 'express';
import { accountantService } from '../services/accountant.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class AccountantController {
  async getCollections(req: AuthRequest, res: Response) {
    const { org_id } = req.params;
    const data = await accountantService.getCollections(org_id);
    sendSuccess(res, data);
  }
}
export const accountantController = new AccountantController();
