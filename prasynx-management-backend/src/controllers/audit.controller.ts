import { Response } from 'express';
import { auditService } from '../services/audit.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

export class AuditController {
  async runAll(req: AuthRequest, res: Response) {
    try {
      const results = await auditService.runAll(req.params.org_id);
      const scoring = auditService.score(results);
      sendSuccess(res, { checks: results, scoring });
    } catch (err: any) {
      sendError(res, err.message || 'Audit failed');
    }
  }
}

export const auditController = new AuditController();
