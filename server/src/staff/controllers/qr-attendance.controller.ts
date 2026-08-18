import { Response } from 'express';
import { qrAttendanceService } from '../services/qr-attendance.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class QrAttendanceController {
  async generateQR(req: AuthRequest, res: Response) {
    const data = await qrAttendanceService.generateQR(req.body);
    sendSuccess(res, data);
  }

  async getScanCount(req: AuthRequest, res: Response) {
    const { token } = req.body;
    const data = await qrAttendanceService.getScanCount(token);
    sendSuccess(res, data);
  }
}
export const qrAttendanceController = new QrAttendanceController();
