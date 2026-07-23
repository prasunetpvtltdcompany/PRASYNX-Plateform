import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

/**
 * Extracurricular Controller
 *
 * Handles extracurricular activities including clubs, sports teams,
 * matches, player stats, events, talent portfolios, and volunteer records.
 * Functions: getClubs, createClub, getClubMembers, createClubMember,
 *            getSportsTeams, createSportsTeam, getMatches, createMatch,
 *            getPlayerStats, createPlayerStat, getEvents, createEvent,
 *            getPortfolios, createPortfolio, getVolunteers, createVolunteer
 */
export class ExtracurricularController {
  async getClubs(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('clubs').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createClub(req: Request, res: Response) {
    const { error } = await supabase.from('clubs').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getClubMembers(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('club_members').select('*').eq('club_id', req.params.club_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createClubMember(req: Request, res: Response) {
    const { error } = await supabase.from('club_members').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getSportsTeams(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('sports_teams').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createSportsTeam(req: Request, res: Response) {
    const { error } = await supabase.from('sports_teams').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getMatches(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('sport_matches').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createMatch(req: Request, res: Response) {
    const { error } = await supabase.from('sport_matches').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getPlayerStats(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('player_stats').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createPlayerStat(req: Request, res: Response) {
    const { error } = await supabase.from('player_stats').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getEvents(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('event_registrations').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createEvent(req: Request, res: Response) {
    const { error } = await supabase.from('event_registrations').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getPortfolios(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('talent_portfolios').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createPortfolio(req: Request, res: Response) {
    const { error } = await supabase.from('talent_portfolios').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getVolunteers(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('volunteer_records').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createVolunteer(req: Request, res: Response) {
    const { error } = await supabase.from('volunteer_records').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }
}

export const extracurricularController = new ExtracurricularController();
