import { Response } from 'express';
import { healthService } from '../services/health.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response';
import { AuthRequest } from '../types';

export class HealthController {
  async dashboard(req: AuthRequest, res: Response) {
    try {
      const result = await healthService.dashboard(req.params.org_id);
      sendSuccess(res, result);
    } catch (e: any) { sendError(res, e.message); }
  }
  async students(req: AuthRequest, res: Response) {
    try {
      const { search } = req.query as any;
      const result = await healthService.students(req.params.org_id, search);
      sendSuccess(res, result);
    } catch (e: any) { sendError(res, e.message); }
  }
  async records(req: AuthRequest, res: Response) {
    try {
      const { student_id, record_type } = req.query as any;
      const result = await healthService.records(req.params.org_id, { student_id, record_type });
      sendSuccess(res, result);
    } catch (e: any) { sendError(res, e.message); }
  }
  async createRecord(req: AuthRequest, res: Response) {
    try {
      const result = await healthService.createRecord(req.params.org_id, req.body, req.user?.userId);
      sendCreated(res, result, 'Health record added');
    } catch (e: any) { sendError(res, e.message); }
  }
  async vaccinations(req: AuthRequest, res: Response) {
    try {
      const { student_id } = req.query as any;
      const result = await healthService.vaccinations(req.params.org_id, { student_id });
      sendSuccess(res, result);
    } catch (e: any) { sendError(res, e.message); }
  }
  async createVaccination(req: AuthRequest, res: Response) {
    try {
      const result = await healthService.createVaccination(req.params.org_id, req.body);
      sendCreated(res, result, 'Vaccination recorded');
    } catch (e: any) { sendError(res, e.message); }
  }
  async medicalRecords(req: AuthRequest, res: Response) {
    try {
      const { student_id } = req.query as any;
      const result = await healthService.medicalRecords(req.params.org_id, { student_id });
      sendSuccess(res, result);
    } catch (e: any) { sendError(res, e.message); }
  }
  async createMedicalRecord(req: AuthRequest, res: Response) {
    try {
      const result = await healthService.createMedicalRecord(req.params.org_id, req.body);
      sendCreated(res, result, 'Medical record added');
    } catch (e: any) { sendError(res, e.message); }
  }
  async emergencyContacts(req: AuthRequest, res: Response) {
    try {
      const result = await healthService.emergencyContacts(req.params.org_id);
      sendSuccess(res, result);
    } catch (e: any) { sendError(res, e.message); }
  }
  async aiInsights(req: AuthRequest, res: Response) {
    try {
      const result = await healthService.aiInsights(req.params.org_id);
      sendSuccess(res, result);
    } catch (e: any) { sendError(res, e.message); }
  }
  async studentProfile(req: AuthRequest, res: Response) {
    try {
      const result = await healthService.studentProfile(req.params.org_id, req.params.student_id);
      sendSuccess(res, result);
    } catch (e: any) { sendError(res, e.message); }
  }
}

export const healthController = new HealthController();
