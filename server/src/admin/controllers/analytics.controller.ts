import { Response } from 'express';
import { analyticsService } from '../services/analytics.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class AnalyticsController {
  async getDashboard(req: AuthRequest, res: Response) {
    const data = await analyticsService.getDashboard();
    sendSuccess(res, data);
  }

  async getOrgGrowth(req: AuthRequest, res: Response) {
    const data = await analyticsService.getOrgGrowth();
    sendSuccess(res, { data });
  }

  async getCredentialTrend(req: AuthRequest, res: Response) {
    const data = await analyticsService.getCredentialTrend();
    sendSuccess(res, { data });
  }

  async getUserActivity(req: AuthRequest, res: Response) {
    const data = await analyticsService.getUserActivity();
    sendSuccess(res, { data });
  }

  async getTopOrganisations(req: AuthRequest, res: Response) {
    const data = await analyticsService.getTopOrganisations();
    sendSuccess(res, { organisations: data });
  }

  async getRevenue(req: AuthRequest, res: Response) {
    const data = await analyticsService.getRevenue();
    sendSuccess(res, { data });
  }

  async listOrganisations(req: AuthRequest, res: Response) {
    const search = req.query.search as string;
    const filter = req.query.status as string;
    const data = await analyticsService.getOrganisations(search, filter);
    sendSuccess(res, { organisations: data });
  }

  async getOrganisation(req: AuthRequest, res: Response) {
    const data = await analyticsService.getOrganisationById(req.params.id);
    sendSuccess(res, data);
  }

  async updateOrganisation(req: AuthRequest, res: Response) {
    const data = await analyticsService.updateOrganisation(req.params.id, req.body);
    sendSuccess(res, data);
  }

  async deleteOrganisation(req: AuthRequest, res: Response) {
    const data = await analyticsService.deleteOrganisation(req.params.id, req.body?.passcode, req.user?.role || '');
    sendSuccess(res, data, 'Organization deleted');
  }

  async getAuditLogs(req: AuthRequest, res: Response) {
    const data = await analyticsService.getAuditLogs();
    sendSuccess(res, { logs: data });
  }

  async revokeCredential(req: AuthRequest, res: Response) {
    const data = await analyticsService.revokeCredential(req.params.id);
    sendSuccess(res, data);
  }

  async bulkCreateOrganisations(req: AuthRequest, res: Response) {
    const data = await analyticsService.bulkCreateOrganisations(req.body.organisations);
    sendSuccess(res, data, `Processed ${data.total} organisations`);
  }
}

export const analyticsController = new AnalyticsController();
