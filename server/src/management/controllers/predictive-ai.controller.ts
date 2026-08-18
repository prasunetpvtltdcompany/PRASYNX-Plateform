import { Response } from 'express';
import { predictiveAiService } from '../services/predictive-ai.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class PredictiveAiController {
  async getDashboard(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await predictiveAiService.getDashboard(organisation_id);
    sendSuccess(res, result);
  }

  async getRiskAnalysis(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await predictiveAiService.getRiskAnalysis(organisation_id);
    sendSuccess(res, result);
  }

  async getStudentPredictions(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const { search, class: cls, risk } = req.query;
    const result = await predictiveAiService.getStudentPredictions(organisation_id, {
      search: search as string | undefined,
      class: cls as string | undefined,
      risk: risk as string | undefined,
    });
    sendSuccess(res, result);
  }

  async getAttendanceForecast(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await predictiveAiService.getAttendanceForecast(organisation_id);
    sendSuccess(res, result);
  }

  async getAcademicForecast(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await predictiveAiService.getAcademicForecast(organisation_id);
    sendSuccess(res, result);
  }

  async getDropoutPrediction(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await predictiveAiService.getDropoutPrediction(organisation_id);
    sendSuccess(res, result);
  }

  async getInterventions(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await predictiveAiService.getInterventions(organisation_id);
    sendSuccess(res, result);
  }

  async createIntervention(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await predictiveAiService.createIntervention(organisation_id, req.body);
    sendCreated(res, result, 'Intervention plan created');
  }

  async getAnalytics(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await predictiveAiService.getAnalytics(organisation_id);
    sendSuccess(res, result);
  }

  async getAiInsights(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await predictiveAiService.getAiInsights(organisation_id);
    sendSuccess(res, result);
  }

  async getReports(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const { type } = req.query;
    const result = await predictiveAiService.getReports(organisation_id, type as string | undefined);
    sendSuccess(res, result);
  }

  async getSidebar(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await predictiveAiService.getSidebar(organisation_id);
    sendSuccess(res, result);
  }
}

export const predictiveAiController = new PredictiveAiController();
