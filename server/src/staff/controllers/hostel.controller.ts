import { Response } from 'express';
import { hostelService } from '../services/hostel.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class HostelController {
  async getHostelRooms(req: AuthRequest, res: Response) {
    const { org_id } = req.params;
    const data = await hostelService.getHostelRooms(org_id);
    sendSuccess(res, data);
  }
}
export const hostelController = new HostelController();
