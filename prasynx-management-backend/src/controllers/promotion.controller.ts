import { Response } from 'express';
import { promotionService } from '../services/promotion.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class PromotionController {
  async getHistory(req: AuthRequest, res: Response) {
    const result = await promotionService.getHistory(req.params.org_id);
    sendSuccess(res, result);
  }
  async promoteStudents(req: AuthRequest, res: Response) {
    const result = await promotionService.promoteStudents(req.params.org_id, req.body);
    sendCreated(res, result, 'Students promoted');
  }
  async getPromotionReport(req: AuthRequest, res: Response) {
    const result = await promotionService.getPromotionReport(req.params.org_id);
    sendSuccess(res, result);
  }
}

export const promotionController = new PromotionController();
