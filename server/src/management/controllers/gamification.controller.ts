import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

export class GamificationController {
  // ==================== LEARNING GAMES ====================

  async getLearningGames(req: Request, res: Response) {
    const { org_id } = req.params;
    try {
      const { data, error } = await supabase
        .from('learning_games')
        .select('*')
        .eq('organisation_id', org_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async createLearningGame(req: Request, res: Response) {
    try {
      const { error } = await supabase.from('learning_games').insert(req.body);
      if (error) throw error;
      sendCreated(res, { success: true });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async updateLearningGame(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const { error } = await supabase.from('learning_games').update(req.body).eq('id', id);
      if (error) throw error;
      sendSuccess(res, { success: true });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async deleteLearningGame(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const { error } = await supabase.from('learning_games').delete().eq('id', id);
      if (error) throw error;
      sendSuccess(res, { success: true });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  // ==================== GAME ASSIGNMENTS ====================

  async getAssignments(req: Request, res: Response) {
    const { org_id } = req.params;
    try {
      const { data, error } = await supabase
        .from('game_assignments')
        .select('*, learning_games(*)')
        .eq('organisation_id', org_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async createAssignment(req: Request, res: Response) {
    try {
      const { error } = await supabase.from('game_assignments').insert(req.body);
      if (error) throw error;
      sendCreated(res, { success: true });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async updateAssignment(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const { error } = await supabase.from('game_assignments').update(req.body).eq('id', id);
      if (error) throw error;
      sendSuccess(res, { success: true });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async deleteAssignment(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const { error } = await supabase.from('game_assignments').delete().eq('id', id);
      if (error) throw error;
      sendSuccess(res, { success: true });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  // ==================== GAME SESSIONS ====================

  async getSessions(req: Request, res: Response) {
    const { org_id } = req.params;
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*, learning_games(title, subject, difficulty)')
        .eq('organisation_id', org_id)
        .order('started_at', { ascending: false });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async getSessionsByStudent(req: Request, res: Response) {
    const { student_id } = req.params;
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*, learning_games(title, subject, difficulty, thumbnail_url)')
        .eq('student_id', student_id)
        .order('started_at', { ascending: false });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async createSession(req: Request, res: Response) {
    try {
      const { error } = await supabase.from('game_sessions').insert(req.body);
      if (error) throw error;
      sendCreated(res, { success: true });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  // ==================== STUDENT XP & PROGRESS ====================

  async getXpByOrg(req: Request, res: Response) {
    const { org_id } = req.params;
    try {
      const { data, error } = await supabase
        .from('student_xp')
        .select('*')
        .eq('organisation_id', org_id)
        .order('total_xp', { ascending: false });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async getXpByStudent(req: Request, res: Response) {
    const { student_id } = req.params;
    try {
      const { data, error } = await supabase
        .from('student_xp')
        .select('*')
        .eq('student_id', student_id)
        .single();
      if (error) throw error;
      sendSuccess(res, data || { total_xp: 0, level: 1, streak_days: 0 });
    } catch (e: any) {
      sendSuccess(res, { total_xp: 0, level: 1, streak_days: 0 });
    }
  }

  async awardXp(req: Request, res: Response) {
    const { organisation_id, student_id, xp_amount } = req.body;
    try {
      const { data: existing } = await supabase
        .from('student_xp')
        .select('*')
        .eq('student_id', student_id)
        .single();

      if (existing) {
        const newXp = existing.total_xp + xp_amount;
        const newLevel = Math.floor(newXp / 500) + 1;
        const { error } = await supabase
          .from('student_xp')
          .update({
            total_xp: newXp,
            level: newLevel,
            updated_at: new Date().toISOString()
          })
          .eq('student_id', student_id);
        if (error) throw error;
      } else {
        const level = Math.floor(xp_amount / 500) + 1;
        const { error } = await supabase
          .from('student_xp')
          .insert({
            organisation_id,
            student_id,
            total_xp: xp_amount,
            level,
            last_activity_date: new Date().toISOString().split('T')[0]
          });
        if (error) throw error;
      }

      sendSuccess(res, { success: true });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  // ==================== ACHIEVEMENTS ====================

  async getAchievements(req: Request, res: Response) {
    const { org_id } = req.params;
    try {
      const { data, error } = await supabase
        .from('achievement_definitions')
        .select('*')
        .eq('organisation_id', org_id);
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async createAchievement(req: Request, res: Response) {
    try {
      const { error } = await supabase.from('achievement_definitions').insert(req.body);
      if (error) throw error;
      sendCreated(res, { success: true });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async deleteAchievement(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const { error } = await supabase.from('achievement_definitions').delete().eq('id', id);
      if (error) throw error;
      sendSuccess(res, { success: true });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  // ==================== STUDENT ACHIEVEMENTS ====================

  async getStudentAchievements(req: Request, res: Response) {
    const { student_id } = req.params;
    try {
      const { data, error } = await supabase
        .from('student_achievements')
        .select('*, achievement_definitions(*)')
        .eq('student_id', student_id);
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async createStudentAchievement(req: Request, res: Response) {
    try {
      const { error } = await supabase.from('student_achievements').insert(req.body);
      if (error) throw error;
      sendCreated(res, { success: true });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  // ==================== LEADERBOARD ====================

  async getLeaderboard(req: Request, res: Response) {
    const { org_id } = req.params;
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('organisation_id', org_id)
        .order('rank', { ascending: true });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async refreshLeaderboard(req: Request, res: Response) {
    const { org_id } = req.params;
    try {
      const { data: xpData, error: xpError } = await supabase
        .from('student_xp')
        .select('*')
        .eq('organisation_id', org_id)
        .order('total_xp', { ascending: false });
      if (xpError) throw xpError;

      if (xpData) {
        const { error: deleteError } = await supabase
          .from('leaderboard')
          .delete()
          .eq('organisation_id', org_id);
        if (deleteError) throw deleteError;

        const entries = xpData.map((s: any, i: number) => ({
          organisation_id: org_id,
          student_id: s.student_id,
          total_xp: s.total_xp,
          level: s.level,
          rank: i + 1
        }));

        if (entries.length > 0) {
          const { error: insertError } = await supabase
            .from('leaderboard')
            .insert(entries);
          if (insertError) throw insertError;
        }
      }

      sendSuccess(res, { success: true });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }
}

export const gamificationController = new GamificationController();
