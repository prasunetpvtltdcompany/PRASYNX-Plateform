import { Response } from 'express';
import { childrenService } from '../services/children.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class ChildrenController {
  async getChildren(req: AuthRequest, res: Response) {
    const { parent_id } = req.params;
    const students = await childrenService.getChildren(parent_id);
    sendSuccess(res, { students });
  }
}
export const childrenController = new ChildrenController();
