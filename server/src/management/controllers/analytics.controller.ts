import { Response } from 'express';
import { analyticsService } from '../services/analytics.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class AnalyticsController {
  async getDashboard(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await analyticsService.getDashboard(organisation_id);
    sendSuccess(res, result);
  }

  async getDashboards(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const dashboards = await analyticsService.getDashboards(organisation_id);
    sendSuccess(res, dashboards);
  }

  async createDashboard(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await analyticsService.createDashboard(organisation_id, req.body);
    sendCreated(res, result, 'Dashboard created');
  }

  async updateDashboard(req: AuthRequest, res: Response) {
    const { dashboard_id } = req.params;
    const result = await analyticsService.updateDashboard(dashboard_id, req.body);
    sendSuccess(res, result, 'Dashboard updated');
  }

  async deleteDashboard(req: AuthRequest, res: Response) {
    const { dashboard_id } = req.params;
    const result = await analyticsService.deleteDashboard(dashboard_id);
    sendSuccess(res, result, 'Dashboard deleted');
  }

  async getWidgets(req: AuthRequest, res: Response) {
    const { dashboard_id } = req.params;
    const widgets = await analyticsService.getWidgets(dashboard_id);
    sendSuccess(res, widgets);
  }

  async createWidget(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await analyticsService.createWidget(organisation_id, req.body);
    sendCreated(res, result, 'Widget created');
  }

  async updateWidget(req: AuthRequest, res: Response) {
    const { widget_id } = req.params;
    const result = await analyticsService.updateWidget(widget_id, req.body);
    sendSuccess(res, result, 'Widget updated');
  }

  async deleteWidget(req: AuthRequest, res: Response) {
    const { widget_id } = req.params;
    const result = await analyticsService.deleteWidget(widget_id);
    sendSuccess(res, result, 'Widget deleted');
  }

  async getReports(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const { report_type } = req.query as any;
    const reports = await analyticsService.getReports(organisation_id, report_type);
    sendSuccess(res, reports);
  }

  async createReport(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await analyticsService.createReport(organisation_id, req.body);
    sendCreated(res, result, 'Report created');
  }

  async updateReport(req: AuthRequest, res: Response) {
    const { report_id } = req.params;
    const result = await analyticsService.updateReport(report_id, req.body);
    sendSuccess(res, result, 'Report updated');
  }

  async deleteReport(req: AuthRequest, res: Response) {
    const { report_id } = req.params;
    const result = await analyticsService.deleteReport(report_id);
    sendSuccess(res, result, 'Report deleted');
  }

  async executeReport(req: AuthRequest, res: Response) {
    const { report_id } = req.params;
    const result = await analyticsService.executeReport(report_id);
    sendSuccess(res, result, 'Report executed');
  }

  async getDataSources(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const sources = await analyticsService.getDataSources(organisation_id);
    sendSuccess(res, sources);
  }

  async createDataSource(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await analyticsService.createDataSource(organisation_id, req.body);
    sendCreated(res, result, 'Data source created');
  }

  async updateDataSource(req: AuthRequest, res: Response) {
    const { source_id } = req.params;
    const result = await analyticsService.updateDataSource(source_id, req.body);
    sendSuccess(res, result, 'Data source updated');
  }

  async deleteDataSource(req: AuthRequest, res: Response) {
    const { source_id } = req.params;
    const result = await analyticsService.deleteDataSource(source_id);
    sendSuccess(res, result, 'Data source deleted');
  }

  async testDataSource(req: AuthRequest, res: Response) {
    const { source_id } = req.params;
    const result = await analyticsService.testDataSource(source_id);
    sendSuccess(res, result, 'Data source tested');
  }
}

export const analyticsController = new AnalyticsController();
