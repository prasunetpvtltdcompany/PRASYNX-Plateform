import { Response } from 'express';
import { staffService } from '../services/staff.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

/**
 * Staff Controller
 * 
 * Handles all staff and teacher management endpoints.
 * Functions: createStaff, getStaff, updateStaff, updateStaffStatus
 */
export class StaffController {
  async createStaff(req: AuthRequest, res: Response) {
    const staff = await staffService.createStaff(req.body);
    sendCreated(res, staff, 'Staff created successfully');
  }

  async getStaff(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const staff = await staffService.getStaff(organisation_id);
    sendSuccess(res, { staff });
  }

  async updateStaff(req: AuthRequest, res: Response) {
    const { staff_id } = req.params;
    const result = await staffService.updateStaff(staff_id, req.body);
    sendSuccess(res, result);
  }

  async updateStaffStatus(req: AuthRequest, res: Response) {
    const { staff_id } = req.params;
    const { status } = req.body;
    const result = await staffService.updateStaffStatus(staff_id, status);
    sendSuccess(res, result);
  }
}

export const staffController = new StaffController();
