import { Response } from 'express';
import { institutionIntelligenceService } from '../services/institution-intelligence.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class InstitutionIntelligenceController {
  async getDashboard(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await institutionIntelligenceService.getIntelligenceDashboard(organisation_id);
    sendSuccess(res, result);
  }

  async getOverview(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await institutionIntelligenceService.getOverview(organisation_id);
    sendSuccess(res, result);
  }

  async getAcademicPerformance(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await institutionIntelligenceService.getAcademicPerformance(organisation_id);
    sendSuccess(res, result);
  }

  async getOperationalMetrics(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await institutionIntelligenceService.getOperationalMetrics(organisation_id);
    sendSuccess(res, result);
  }

  async getBenchmarks(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await institutionIntelligenceService.getBenchmarks(organisation_id);
    sendSuccess(res, result);
  }

  async getTrends(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await institutionIntelligenceService.getTrends(organisation_id);
    sendSuccess(res, result);
  }

  async getPeerComparison(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await institutionIntelligenceService.getPeerComparison(organisation_id);
    sendSuccess(res, result);
  }
}

export const institutionIntelligenceController = new InstitutionIntelligenceController();
