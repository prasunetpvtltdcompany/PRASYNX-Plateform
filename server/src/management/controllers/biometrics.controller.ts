import { Response } from 'express';
import { biometricsService } from '../services/biometrics.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class BiometricsController {
  async getDashboard(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await biometricsService.getDashboard(organisation_id);
    sendSuccess(res, result);
  }

  async getDevices(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const devices = await biometricsService.getDevices(organisation_id);
    sendSuccess(res, devices);
  }

  async createDevice(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await biometricsService.createDevice(organisation_id, req.body);
    sendCreated(res, result, 'Device created');
  }

  async updateDevice(req: AuthRequest, res: Response) {
    const { device_id } = req.params;
    const result = await biometricsService.updateDevice(device_id, req.body);
    sendSuccess(res, result, 'Device updated');
  }

  async deleteDevice(req: AuthRequest, res: Response) {
    const { device_id } = req.params;
    const result = await biometricsService.deleteDevice(device_id);
    sendSuccess(res, result, 'Device deleted');
  }

  async getTemplates(req: AuthRequest, res: Response) {
    const { organisation_id, user_id } = req.params;
    const templates = await biometricsService.getTemplates(organisation_id, user_id);
    sendSuccess(res, templates);
  }

  async enrollTemplate(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await biometricsService.enrollTemplate(organisation_id, req.body);
    sendCreated(res, result, 'Template enrolled');
  }

  async updateTemplate(req: AuthRequest, res: Response) {
    const { template_id } = req.params;
    const result = await biometricsService.updateTemplate(template_id, req.body);
    sendSuccess(res, result, 'Template updated');
  }

  async deleteTemplate(req: AuthRequest, res: Response) {
    const { template_id } = req.params;
    const result = await biometricsService.deleteTemplate(template_id);
    sendSuccess(res, result, 'Template deleted');
  }

  async getAttendanceLogs(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const { user_id, device_id, status, from, to } = req.query as any;
    const logs = await biometricsService.getAttendanceLogs(organisation_id, { userId: user_id, deviceId: device_id, status, from, to });
    sendSuccess(res, logs);
  }

  async recordAttendance(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await biometricsService.recordAttendance(organisation_id, req.body);
    sendCreated(res, result, 'Attendance recorded');
  }

  async getAssignments(req: AuthRequest, res: Response) {
    const { organisation_id, device_id } = req.params;
    const assignments = await biometricsService.getAssignments(organisation_id, device_id);
    sendSuccess(res, assignments);
  }

  async createAssignment(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await biometricsService.createAssignment(organisation_id, req.body);
    sendCreated(res, result, 'Assignment created');
  }

  async deleteAssignment(req: AuthRequest, res: Response) {
    const { assignment_id } = req.params;
    const result = await biometricsService.deleteAssignment(assignment_id);
    sendSuccess(res, result, 'Assignment deleted');
  }
}

export const biometricsController = new BiometricsController();
