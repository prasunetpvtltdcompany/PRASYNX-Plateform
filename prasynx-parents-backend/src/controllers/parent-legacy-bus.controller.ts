import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';

export class ParentLegacyBusController {
  async getLocation(req: Request, res: Response) {
    const { student_id } = req.params;
    try {
      const { data: assignment } = await supabase.from('transport_assignments').select('route_id').eq('student_id', student_id).single();
      if (!assignment?.route_id) return res.json({ location: null });
      const { data, error } = await supabase.from('bus_locations').select('*').eq('route_id', assignment.route_id).order('updated_at', { ascending: false }).limit(1).single();
      if (error && error.code !== 'PGRST116') throw error;
      res.json({ location: data || null });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }
}
export const parentLegacyBusController = new ParentLegacyBusController();
