import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { config } from '../config';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

export class AlumniManagementController {
  // ==================== ALUMNI DIRECTORY ====================

  async getAlumni(req: Request, res: Response) {
    const { org_id } = req.params;
    try {
      const { data, error } = await supabase
        .from('alumni')
        .select('*')
        .eq('organisation_id', org_id)
        .order('graduation_year', { ascending: false });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async createAlumni(req: Request, res: Response) {
    const { organisation_id, full_name, email, phone, graduation_year, current_occupation, company, address } = req.body;
    try {
      const { data, error } = await supabase.from('alumni').insert({
        organisation_id, full_name, email, phone,
        graduation_year: parseInt(graduation_year) || null,
        current_occupation, company, address, status: 'active'
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async updateAlumni(req: Request, res: Response) {
    const { id } = req.params;
    const updates = req.body;
    delete updates.id; delete updates.organisation_id; delete updates.created_at;
    try {
      const { data, error } = await supabase.from('alumni').update(updates).eq('id', id).select().single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async deleteAlumni(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const { error } = await supabase.from('alumni').delete().eq('id', id);
      if (error) throw error;
      sendSuccess(res, { success: true });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  // ==================== ALUMNI EVENTS ====================

  async getEvents(req: Request, res: Response) {
    const { org_id } = req.params;
    try {
      const { data, error } = await supabase
        .from('alumni_events')
        .select('*')
        .eq('organisation_id', org_id)
        .order('event_date', { ascending: false });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async createEvent(req: Request, res: Response) {
    const { organisation_id, title, description, event_date, location } = req.body;
    try {
      const { data, error } = await supabase.from('alumni_events').insert({
        organisation_id, title, description, event_date, location, status: 'upcoming'
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async updateEvent(req: Request, res: Response) {
    const { id } = req.params;
    const updates = req.body;
    delete updates.id; delete updates.organisation_id; delete updates.created_at;
    try {
      const { data, error } = await supabase.from('alumni_events').update(updates).eq('id', id).select().single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async deleteEvent(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const { error } = await supabase.from('alumni_events').delete().eq('id', id);
      if (error) throw error;
      sendSuccess(res, { success: true });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  // ==================== ALUMNI DONATIONS ====================

  async getDonations(req: Request, res: Response) {
    const { org_id } = req.params;
    try {
      const { data, error } = await supabase
        .from('alumni_donations')
        .select('*')
        .eq('organisation_id', org_id)
        .order('donation_date', { ascending: false });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async createDonation(req: Request, res: Response) {
    const { organisation_id, alumni_id, amount, purpose, donation_date } = req.body;
    try {
      const { data, error } = await supabase.from('alumni_donations').insert({
        organisation_id, alumni_id, amount: parseFloat(amount) || 0, purpose, donation_date
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async deleteDonation(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const { error } = await supabase.from('alumni_donations').delete().eq('id', id);
      if (error) throw error;
      sendSuccess(res, { success: true });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  // ==================== ALUMNI MENTORS ====================

  async getMentors(req: Request, res: Response) {
    const { org_id } = req.params;
    try {
      const { data: mentors, error } = await supabase
        .from('alumni_mentors')
        .select('*')
        .eq('organisation_id', org_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (!mentors || mentors.length === 0) { sendSuccess(res, []); return; }

      const alumniIds = [...new Set(mentors.map((m: any) => m.alumni_id).filter(Boolean))];
      const { data: alumni } = await supabase
        .from('alumni')
        .select('id, full_name, current_occupation')
        .in('id', alumniIds.length ? alumniIds : ['none']);
      const alumniMap = new Map((alumni || []).map((a: any) => [a.id, a]));

      sendSuccess(res, mentors.map((m: any) => ({ ...m, alumni: alumniMap.get(m.alumni_id) || null })));
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async createMentor(req: Request, res: Response) {
    const { organisation_id, alumni_id, expertise, availability } = req.body;
    try {
      const { data, error } = await supabase.from('alumni_mentors').insert({
        organisation_id, alumni_id, expertise, availability, status: 'active'
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async updateMentor(req: Request, res: Response) {
    const { id } = req.params;
    const { status, expertise, availability } = req.body;
    try {
      const { data, error } = await supabase.from('alumni_mentors').update({
        ...(status !== undefined && { status }),
        ...(expertise !== undefined && { expertise }),
        ...(availability !== undefined && { availability }),
      }).eq('id', id).select().single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async deleteMentor(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const { error } = await supabase.from('alumni_mentors').delete().eq('id', id);
      if (error) throw error;
      sendSuccess(res, { success: true });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }
}

export const alumniManagementController = new AlumniManagementController();
