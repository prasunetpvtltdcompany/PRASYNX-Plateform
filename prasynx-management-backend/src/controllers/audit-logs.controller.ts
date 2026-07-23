import { Response } from 'express';
import { auditLogsService } from '../services/audit-logs.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class AuditLogsController {
  async getDashboard(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await auditLogsService.getDashboard(organisation_id);
    sendSuccess(res, result);
  }

  async getLogs(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const { action, entity_type, severity, user_id, from, to, search, page, limit } = req.query as any;
    const result = await auditLogsService.getLogs(organisation_id, {
      action, entityType: entity_type, severity, userId: user_id, from, to, search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    sendSuccess(res, result);
  }

  async getLogById(req: AuthRequest, res: Response) {
    const { log_id } = req.params;
    const result = await auditLogsService.getLogById(log_id);
    sendSuccess(res, result);
  }

  async createLog(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await auditLogsService.createLog(organisation_id, req.body);
    sendCreated(res, result, 'Audit log created');
  }

  async getDistinctActions(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await auditLogsService.getDistinctActions(organisation_id);
    sendSuccess(res, result);
  }

  async getDistinctEntityTypes(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await auditLogsService.getDistinctEntityTypes(organisation_id);
    sendSuccess(res, result);
  }

  async getRetentionConfig(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await auditLogsService.getRetentionConfig(organisation_id);
    sendSuccess(res, result);
  }

  async updateRetentionConfig(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await auditLogsService.updateRetentionConfig(organisation_id, req.body);
    sendSuccess(res, result, 'Retention config updated');
  }

  async purgeLogs(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const { older_than_days } = req.body;
    const result = await auditLogsService.purgeLogs(organisation_id, older_than_days || 365);
    sendSuccess(res, result, 'Logs purged');
  }
}

export const auditLogsController = new AuditLogsController();
