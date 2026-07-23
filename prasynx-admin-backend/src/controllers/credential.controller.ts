/**
 * Legacy credential controller for admin portal
 * Handles credential history with inline supabase calls
 */
import { Request, Response } from 'express';
import { getCredentialHistory } from '../lib/credentialStore';

export class CredentialController {
  async getHistory(req: Request, res: Response) {
    const history = await getCredentialHistory();
    res.json({ history });
  }
}

export const credentialController = new CredentialController();
