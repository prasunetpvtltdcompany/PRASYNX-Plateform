import { Response } from 'express';
import { transportService } from '../services/transport.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class TransportController {
  async getTransportRoutes(req: AuthRequest, res: Response) {
    const { org_id } = req.params;
    const data = await transportService.getTransportRoutes(org_id);
    sendSuccess(res, data);
  }

  async createTransportRoute(req: AuthRequest, res: Response) {
    const data = await transportService.createTransportRoute(req.body);
    sendCreated(res, data, 'Route created');
  }
}
export const transportController = new TransportController();
