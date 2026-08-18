import { Response } from 'express';
import { disciplineService } from '../services/discipline.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response';
import { AuthRequest } from '../types';

export class DisciplineController {
  async list(req: AuthRequest, res: Response) {
    try {
      const { status, severity, student_id, search } = req.query as any;
      const result = await disciplineService.list(req.params.org_id, { status, severity, student_id, search });
      sendSuccess(res, result);
    } catch (e: any) { sendError(res, e.message); }
  }
  async getById(req: AuthRequest, res: Response) {
    try {
      const result = await disciplineService.getById(req.params.org_id, req.params.id);
      sendSuccess(res, result);
    } catch (e: any) { sendError(res, e.message); }
  }
  async create(req: AuthRequest, res: Response) {
    try {
      const result = await disciplineService.create(req.params.org_id, req.body, req.user?.userId);
      sendCreated(res, result, 'Incident reported');
    } catch (e: any) { sendError(res, e.message); }
  }
  async update(req: AuthRequest, res: Response) {
    try {
      const result = await disciplineService.update(req.params.org_id, req.params.id, req.body, req.user?.userId);
      sendSuccess(res, result, 'Incident updated');
    } catch (e: any) { sendError(res, e.message); }
  }
  async remove(req: AuthRequest, res: Response) {
    try {
      const result = await disciplineService.remove(req.params.org_id, req.params.id);
      sendSuccess(res, result, 'Incident deleted');
    } catch (e: any) { sendError(res, e.message); }
  }
  async dashboard(req: AuthRequest, res: Response) {
    try {
      const result = await disciplineService.dashboard(req.params.org_id);
      sendSuccess(res, result);
    } catch (e: any) { sendError(res, e.message); }
  }
  async uploadEvidence(req: AuthRequest, res: Response) {
    try {
      const result = await disciplineService.uploadEvidence(req.params.org_id, req.body);
      sendCreated(res, result, 'Evidence uploaded');
    } catch (e: any) { sendError(res, e.message); }
  }
}

export const disciplineController = new DisciplineController();
