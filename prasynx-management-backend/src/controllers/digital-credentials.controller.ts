import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

class DigitalCredentialsController {
  async getCertificatesByOrg(req: Request, res: Response) {
    const { org_id } = req.params;
    try {
      const { data, error } = await supabase
        .from('digital_certificates')
        .select('*, student:students(*)')
        .eq('organisation_id', org_id)
        .order('issued_date', { ascending: false });
      if (error) throw error;
      sendSuccess(res, { certificates: data || [] });
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  async createCertificate(req: Request, res: Response) {
    const { student_id, certificate_type, title, description, blockchain_hash, ipfs_url, issued_date, expiry_date, organisation_id } = req.body;
    if (!student_id || !certificate_type || !title || !organisation_id) {
      return sendError(res, 'student_id, certificate_type, title, and organisation_id are required', 400);
    }
    try {
      const { data, error } = await supabase
        .from('digital_certificates')
        .insert({ student_id, certificate_type, title, description, blockchain_hash, ipfs_url, issued_date, expiry_date, organisation_id })
        .select();
      if (error) throw error;
      sendCreated(res, data);
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  async updateCertificate(req: Request, res: Response) {
    const { id } = req.params;
    const updates = req.body;
    try {
      const { data, error } = await supabase
        .from('digital_certificates')
        .update(updates)
        .eq('id', id)
        .select();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  async getCredentialsByOrg(req: Request, res: Response) {
    const { org_id } = req.params;
    try {
      const { data, error } = await supabase
        .from('verifiable_credentials')
        .select('*')
        .eq('organisation_id', org_id)
        .order('issued_date', { ascending: false });
      if (error) throw error;
      sendSuccess(res, { credentials: data || [] });
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  async createCredential(req: Request, res: Response) {
    const { student_id, credential_type, title, issuer, credential_data, blockchain_hash, organisation_id } = req.body;
    if (!student_id || !credential_type || !title || !issuer || !credential_data || !organisation_id) {
      return sendError(res, 'student_id, credential_type, title, issuer, credential_data, and organisation_id are required', 400);
    }
    try {
      const { data, error } = await supabase
        .from('verifiable_credentials')
        .insert({ student_id, credential_type, title, issuer, credential_data, blockchain_hash, organisation_id })
        .select();
      if (error) throw error;
      sendCreated(res, data);
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  async getTranscriptsByOrg(req: Request, res: Response) {
    const { org_id } = req.params;
    try {
      const { data, error } = await supabase
        .from('academic_transcripts')
        .select('*, student:students(*)')
        .eq('organisation_id', org_id);
      if (error) throw error;
      sendSuccess(res, { transcripts: data || [] });
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  async createTranscript(req: Request, res: Response) {
    const { student_id, transcript_data, qr_code, issued_date, organisation_id } = req.body;
    if (!student_id || !transcript_data || !organisation_id) {
      return sendError(res, 'student_id, transcript_data, and organisation_id are required', 400);
    }
    try {
      const { data, error } = await supabase
        .from('academic_transcripts')
        .insert({ student_id, transcript_data, qr_code, issued_date, organisation_id })
        .select();
      if (error) throw error;
      sendCreated(res, data);
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  async getBadgesByOrg(req: Request, res: Response) {
    const { org_id } = req.params;
    try {
      const { data, error } = await supabase
        .from('skill_badges')
        .select('*, student:students(*)')
        .eq('organisation_id', org_id);
      if (error) throw error;
      sendSuccess(res, { badges: data || [] });
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  async createBadge(req: Request, res: Response) {
    const { student_id, badge_name, badge_type, issuer, issued_date, badge_url, organisation_id } = req.body;
    if (!student_id || !badge_name || !badge_type || !issuer || !organisation_id) {
      return sendError(res, 'student_id, badge_name, badge_type, issuer, and organisation_id are required', 400);
    }
    try {
      const { data, error } = await supabase
        .from('skill_badges')
        .insert({ student_id, badge_name, badge_type, issuer, issued_date, badge_url, organisation_id })
        .select();
      if (error) throw error;
      sendCreated(res, data);
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  async verifyCertificate(req: Request, res: Response) {
    const { blockchain_hash } = req.params;
    try {
      const { data, error } = await supabase
        .from('digital_certificates')
        .select('*, student:students(*)')
        .eq('blockchain_hash', blockchain_hash)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        return sendError(res, 'Certificate not found', 404);
      }
      sendSuccess(res, { verified: true, certificate: data });
    } catch (err: any) {
      sendError(res, err.message);
    }
  }
}

export const digitalCredentialsController = new DigitalCredentialsController();
