import { Response } from 'express';
import { riskDetectionService } from '../services/risk-detection.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class RiskDetectionController {
  async analyzeAllStudents(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await riskDetectionService.analyzeAllStudents(organisation_id);
    sendSuccess(res, result);
  }

  async analyzeStudent(req: AuthRequest, res: Response) {
    const { organisation_id, student_id } = req.params;
    const result = await riskDetectionService.analyzeStudent(organisation_id, student_id);
    sendSuccess(res, result);
  }

  async getAlerts(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const { severity, resolved } = req.query;
    const resolvedBool = resolved === 'true' ? true : resolved === 'false' ? false : undefined;
    const alerts = await riskDetectionService.getAlerts(organisation_id, {
      severity: severity as string | undefined,
      resolved: resolvedBool,
    });
    sendSuccess(res, alerts);
  }

  async generateAlerts(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const alerts = await riskDetectionService.generateAlerts(organisation_id);
    sendCreated(res, alerts, `${alerts.length} alert(s) generated`);
  }

  async resolveAlert(req: AuthRequest, res: Response) {
    const { alert_id } = req.params;
    const userId = req.user?.userId || 'system';
    const result = await riskDetectionService.resolveAlert(alert_id, userId);
    sendSuccess(res, result, 'Alert resolved');
  }

  async getThresholds(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const thresholds = await riskDetectionService.getThresholds(organisation_id);
    sendSuccess(res, thresholds);
  }

  async updateThresholds(req: AuthRequest, res: Response) {
    const { organisation_id, threshold_type } = req.params;
    const result = await riskDetectionService.updateThresholds(organisation_id, threshold_type, req.body);
    sendSuccess(res, result, 'Thresholds updated');
  }

  async getStudentHistory(req: AuthRequest, res: Response) {
    const { organisation_id, student_id } = req.params;
    const result = await riskDetectionService.getStudentHistory(organisation_id, student_id);
    sendSuccess(res, result);
  }

  async getPredictiveInsights(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await riskDetectionService.getPredictiveInsights(organisation_id);
    sendSuccess(res, result);
  }
}

export const riskDetectionController = new RiskDetectionController();
