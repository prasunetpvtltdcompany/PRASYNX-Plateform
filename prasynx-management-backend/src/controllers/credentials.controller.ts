import { Response } from 'express';
import { AuthRequest } from '../types';
import { credentialsService } from '../services/credentials.service';
import { sendSuccess, sendError } from '../utils/response';

class CredentialsController {
  async getDashboard(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await credentialsService.getDashboard(organisation_id);
      sendSuccess(res, data, 'Dashboard fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch dashboard');
    }
  }

  async getCertificates(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await credentialsService.getCertificates(organisation_id);
      sendSuccess(res, data, 'Certificates fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch certificates');
    }
  }

  async createCertificate(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await credentialsService.createCertificate(organisation_id, req.body);
      sendSuccess(res, data, 'Certificate created');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to create certificate');
    }
  }

  async updateCertificate(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await credentialsService.updateCertificate(id, req.body);
      sendSuccess(res, data, 'Certificate updated');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to update certificate');
    }
  }

  async deleteCertificate(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await credentialsService.deleteCertificate(id);
      sendSuccess(res, data, 'Certificate deleted');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to delete certificate');
    }
  }

  async getCredentials(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await credentialsService.getCredentials(organisation_id);
      sendSuccess(res, data, 'Credentials fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch credentials');
    }
  }

  async createCredential(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await credentialsService.createCredential(organisation_id, req.body);
      sendSuccess(res, data, 'Credential created');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to create credential');
    }
  }

  async getTranscripts(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await credentialsService.getTranscripts(organisation_id);
      sendSuccess(res, data, 'Transcripts fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch transcripts');
    }
  }

  async createTranscript(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await credentialsService.createTranscript(organisation_id, req.body);
      sendSuccess(res, data, 'Transcript created');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to create transcript');
    }
  }

  async getBadges(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await credentialsService.getBadges(organisation_id);
      sendSuccess(res, data, 'Badges fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch badges');
    }
  }

  async createBadge(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await credentialsService.createBadge(organisation_id, req.body);
      sendSuccess(res, data, 'Badge created');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to create badge');
    }
  }

  async verifyCertificate(req: AuthRequest, res: Response) {
    try {
      const { blockchain_hash } = req.params;
      if (!blockchain_hash) return sendError(res, 'Blockchain hash is required', 400);
      const data = await credentialsService.verifyCertificate(blockchain_hash);
      sendSuccess(res, data, 'Certificate verified');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to verify certificate');
    }
  }

  async getAnalytics(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await credentialsService.getAnalytics(organisation_id);
      sendSuccess(res, data, 'Analytics fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch analytics');
    }
  }

  async getReports(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await credentialsService.getReports(organisation_id, req.query.type as string);
      sendSuccess(res, data, 'Reports fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch reports');
    }
  }

  async getSidebar(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await credentialsService.getSidebar(organisation_id);
      sendSuccess(res, data, 'Sidebar fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch sidebar');
    }
  }
}

export const credentialsController = new CredentialsController();
