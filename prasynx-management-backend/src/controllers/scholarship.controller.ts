import { Response } from 'express';
import { scholarshipService } from '../services/scholarship.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class ScholarshipController {
  async getDashboard(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await scholarshipService.getDashboard(organisation_id);
    sendSuccess(res, result);
  }

  async getPrograms(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await scholarshipService.getPrograms(organisation_id);
    sendSuccess(res, result);
  }

  async createProgram(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await scholarshipService.createProgram(organisation_id, req.body);
    sendCreated(res, result, 'Scholarship program created');
  }

  async updateProgram(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const result = await scholarshipService.updateProgram(id, req.body);
    sendSuccess(res, result, 'Scholarship program updated');
  }

  async deleteProgram(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const result = await scholarshipService.deleteProgram(id);
    sendSuccess(res, result, 'Scholarship program deleted');
  }

  async getApplications(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const { search, status } = req.query;
    const result = await scholarshipService.getApplications(organisation_id, {
      search: search as string | undefined,
      status: status as string | undefined,
    });
    sendSuccess(res, result);
  }

  async createApplication(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await scholarshipService.createApplication(organisation_id, req.body);
    sendCreated(res, result, 'Application submitted');
  }

  async updateApplicationStatus(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    const result = await scholarshipService.updateApplicationStatus(id, status);
    sendSuccess(res, result, `Application ${status}`);
  }

  async getBeneficiaries(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await scholarshipService.getBeneficiaries(organisation_id);
    sendSuccess(res, result);
  }

  async getAiEligibility(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await scholarshipService.getAiEligibility(organisation_id);
    sendSuccess(res, result);
  }

  async getFinancialAidAnalytics(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await scholarshipService.getFinancialAidAnalytics(organisation_id);
    sendSuccess(res, result);
  }

  async getReports(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const { type } = req.query;
    const result = await scholarshipService.getReports(organisation_id, type as string | undefined);
    sendSuccess(res, result);
  }

  async getSidebar(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await scholarshipService.getSidebar(organisation_id);
    sendSuccess(res, result);
  }
}

export const scholarshipController = new ScholarshipController();
