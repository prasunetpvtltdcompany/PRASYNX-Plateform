import { Response } from 'express';
import { classService } from '../services/class.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class ClassController {
  async getClasses(req: AuthRequest, res: Response) {
    const { teacher_id } = req.params;
    const data = await classService.getClasses(teacher_id);
    sendSuccess(res, data);
  }

  async getAdminClasses(req: AuthRequest, res: Response) {
    const { org_id } = req.params;
    const data = await classService.getAdminClasses(org_id);
    sendSuccess(res, data);
  }

  async createAdminClass(req: AuthRequest, res: Response) {
    const data = await classService.createAdminClass(req.body);
    sendCreated(res, data, 'Class created');
  }
}
export const classController = new ClassController();
