import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';

export class ParentLegacyPtmController {
  async getBookings(req: Request, res: Response) {
    const { parent_id } = req.params;
    try {
      const { data, error } = await supabase.from('ptm_bookings').select('*').eq('parent_id', parent_id).order('created_at', { ascending: false });
      if (error) throw error;
      res.json({ bookings: data || [] });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }

  async createBooking(req: Request, res: Response) {
    const { parent_id, teacher_id, student_id, preferred_date, preferred_time } = req.body;
    try {
      const { data, error } = await supabase.from('ptm_bookings').insert({ parent_id, teacher_id, student_id, preferred_date, preferred_time, status: 'pending' }).select();
      if (error) throw error;
      res.status(201).json({ message: 'PTM booking request created', booking: data?.[0] });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }
}
export const parentLegacyPtmController = new ParentLegacyPtmController();
