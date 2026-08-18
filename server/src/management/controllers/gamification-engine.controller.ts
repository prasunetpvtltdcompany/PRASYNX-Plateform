import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

/**
 * Gamification Engine Controller
 *
 * Handles gamification features including points, leaderboards,
 * achievement badges, reward store, redemptions, and interactive challenges.
 * Functions: getPoints, awardPoints, getLeaderboards, updateLeaderboard,
 *            getBadges, createBadge, getStoreItems, createStoreItem,
 *            getRedemptions, createRedemption, getChallenges, createChallenge
 */
export class GamificationEngineController {
  async getPoints(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('points_entries').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async awardPoints(req: Request, res: Response) {
    const { error } = await supabase.from('points_entries').insert({ ...req.body, awarded_at: new Date().toISOString() });
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getLeaderboards(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('leaderboard_entries').select('*').eq('organisation_id', req.params.org_id).order('rank', { ascending: true });
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async updateLeaderboard(req: Request, res: Response) {
    const { error } = await supabase.from('leaderboard_entries').insert({ ...req.body, updated_at: new Date().toISOString() });
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getBadges(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('achievement_badges').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createBadge(req: Request, res: Response) {
    const { error } = await supabase.from('achievement_badges').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getStoreItems(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('reward_store_items').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createStoreItem(req: Request, res: Response) {
    const { error } = await supabase.from('reward_store_items').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getRedemptions(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('redemptions').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createRedemption(req: Request, res: Response) {
    const { error } = await supabase.from('redemptions').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getChallenges(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('interactive_challenges').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createChallenge(req: Request, res: Response) {
    const { error } = await supabase.from('interactive_challenges').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }
}

export const gamificationEngineController = new GamificationEngineController();
