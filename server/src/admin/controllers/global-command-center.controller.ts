import { Response } from 'express';
import { globalCommandCenterService } from '../services/global-command-center.service';
import { AuthRequest } from '../types';

export class GlobalCommandCenterController {
  async getOverview(req: AuthRequest, res: Response) {
    await globalCommandCenterService.getOverview(req, res);
  }

  async listOrganisations(req: AuthRequest, res: Response) {
    await globalCommandCenterService.listOrganisations(req, res);
  }

  async getOrganisation(req: AuthRequest, res: Response) {
    await globalCommandCenterService.getOrganisation(req, res);
  }

  async getStudents(req: AuthRequest, res: Response) {
    await globalCommandCenterService.getStudents(req, res);
  }

  async getStaff(req: AuthRequest, res: Response) {
    await globalCommandCenterService.getStaff(req, res);
  }

  async getParents(req: AuthRequest, res: Response) {
    await globalCommandCenterService.getParents(req, res);
  }

  async getOrgAdmins(req: AuthRequest, res: Response) {
    await globalCommandCenterService.getOrgAdmins(req, res);
  }

  async getOrgSecurityLogs(req: AuthRequest, res: Response) {
    await globalCommandCenterService.getOrgSecurityLogs(req, res);
  }

  async getOrgAuditLogs(req: AuthRequest, res: Response) {
    await globalCommandCenterService.getOrgAuditLogs(req, res);
  }

  async globalSearch(req: AuthRequest, res: Response) {
    await globalCommandCenterService.globalSearch(req, res);
  }

  async startImpersonation(req: AuthRequest, res: Response) {
    await globalCommandCenterService.startImpersonation(req, res);
  }

  async stopImpersonation(req: AuthRequest, res: Response) {
    await globalCommandCenterService.stopImpersonation(req, res);
  }

  async getImpersonationSessions(req: AuthRequest, res: Response) {
    await globalCommandCenterService.getImpersonationSessions(req, res);
  }

  async getMonitoring(req: AuthRequest, res: Response) {
    await globalCommandCenterService.getMonitoring(req, res);
  }

  async getAuditLogs(req: AuthRequest, res: Response) {
    await globalCommandCenterService.getAuditLogs(req, res);
  }

  async getRBAC(req: AuthRequest, res: Response) {
    await globalCommandCenterService.getRBAC(req, res);
  }

  async getCompliance(req: AuthRequest, res: Response) {
    await globalCommandCenterService.getCompliance(req, res);
  }

  async getPortalStats(req: AuthRequest, res: Response) {
    await globalCommandCenterService.getPortalStats(req, res);
  }

  async getPortalUsers(req: AuthRequest, res: Response) {
    await globalCommandCenterService.getPortalUsers(req, res);
  }
}

export const globalCommandCenterController = new GlobalCommandCenterController();
