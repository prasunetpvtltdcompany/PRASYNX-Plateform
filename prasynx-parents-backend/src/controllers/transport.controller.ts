import { Response } from 'express';
import { transportService } from '../services/transport.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class TransportController {
  async getTransport(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await transportService.getTransport(student_id);
    sendSuccess(res, data);
  }
}
export const transportController = new TransportController();
