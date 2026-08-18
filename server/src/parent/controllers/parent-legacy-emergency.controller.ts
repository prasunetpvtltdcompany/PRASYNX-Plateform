import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';

export class ParentLegacyEmergencyController {
  async getContacts(req: Request, res: Response) {
    const { org_id } = req.params;
    try {
      const { data, error } = await supabase.from('health_emergency_contacts').select('*').eq('organisation_id', org_id).order('created_at', { ascending: false });
      if (error) throw error;
      res.json({ contacts: data || [] });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }
}
export const parentLegacyEmergencyController = new ParentLegacyEmergencyController();
