import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { config } from '../config';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

export class EventsManagementController {
  async getEvents(req: Request, res: Response) {
    try {
      const { org_id } = req.params;
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organisation_id', org_id)
        .order('start_date', { ascending: false });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createEvent(req: Request, res: Response) {
    try {
      const { organisation_id, title, description, event_type, start_date, end_date, start_time, end_time, location } = req.body;
      const { data, error } = await supabase.from('events').insert({
        organisation_id, title, description, event_type, start_date, end_date, start_time, end_time, location, status: 'upcoming'
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async updateEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      delete updates.id; delete updates.organisation_id; delete updates.created_at;
      const { data, error } = await supabase.from('events').update(updates).eq('id', id).select().single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async deleteEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      sendSuccess(res, { success: true });
    } catch (e: any) { sendError(res, e.message); }
  }

  async getClubs(req: Request, res: Response) {
    try {
      const { org_id } = req.params;
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('organisation_id', org_id)
        .order('name');
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createClub(req: Request, res: Response) {
    try {
      const { organisation_id, name, description, coordinator } = req.body;
      const { data, error } = await supabase.from('clubs').insert({
        organisation_id, name, description, coordinator
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async updateClub(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      delete updates.id; delete updates.organisation_id; delete updates.created_at;
      const { data, error } = await supabase.from('clubs').update(updates).eq('id', id).select().single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async deleteClub(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('clubs').delete().eq('id', id);
      if (error) throw error;
      sendSuccess(res, { success: true });
    } catch (e: any) { sendError(res, e.message); }
  }

  async getSportsTeams(req: Request, res: Response) {
    try {
      const { org_id } = req.params;
      const { data, error } = await supabase
        .from('sports_teams')
        .select('*')
        .eq('organisation_id', org_id)
        .order('name');
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createSportsTeam(req: Request, res: Response) {
    try {
      const { organisation_id, name, sport_type, coach, max_players } = req.body;
      const { data, error } = await supabase.from('sports_teams').insert({
        organisation_id, name, sport_type, coach, max_players: parseInt(max_players) || 0, status: 'active'
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async updateSportsTeam(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      delete updates.id; delete updates.organisation_id; delete updates.created_at;
      const { data, error } = await supabase.from('sports_teams').update(updates).eq('id', id).select().single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async deleteSportsTeam(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('sports_teams').delete().eq('id', id);
      if (error) throw error;
      sendSuccess(res, { success: true });
    } catch (e: any) { sendError(res, e.message); }
  }
}

export const eventsManagementController = new EventsManagementController();
