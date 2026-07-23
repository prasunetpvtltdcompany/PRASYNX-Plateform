import { Response } from 'express';
import { hostelService } from '../services/hostel.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class HostelController {
  async getHostel(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await hostelService.getHostel(student_id);
    sendSuccess(res, data);
  }
}
export const hostelController = new HostelController();
