import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class EsportsService {
  async getLeagues(orgId: string) {
    const { data } = await supabase
      .from('esports_leagues')
      .select('*')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false });
    return data || [];
  }

  async createLeague(orgId: string, data: any) {
    const league = {
      organisation_id: orgId,
      name: data.name,
      description: data.description,
      game: data.game,
      platform: data.platform,
      season: data.season,
      max_teams: data.max_teams || 8,
      format: data.format || 'round_robin',
      rules: data.rules,
      prize_pool: data.prize_pool,
      banner_url: data.banner_url,
      status: data.status || 'upcoming',
      start_date: data.start_date,
      end_date: data.end_date,
    };
    const { data: result, error } = await supabase.from('esports_leagues').insert(league).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async updateLeague(leagueId: string, data: any) {
    const { data: result, error } = await supabase.from('esports_leagues').update(data).eq('id', leagueId).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async deleteLeague(leagueId: string) {
    const { error } = await supabase.from('esports_leagues').delete().eq('id', leagueId);
    if (error) throw new BadRequestError(error.message);
    return { success: true };
  }

  async getTeams(orgId: string, leagueId?: string) {
    let query = supabase
      .from('esports_teams')
      .select('*, league:esports_leagues(name, game), players:esports_players(count)')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false });
    if (leagueId) query = query.eq('league_id', leagueId);
    const { data } = await query;
    return (data || []).map(t => ({ ...t, playerCount: t.players?.[0]?.count || 0 }));
  }

  async createTeam(orgId: string, data: any) {
    const team = {
      organisation_id: orgId,
      league_id: data.league_id,
      name: data.name,
      tag: data.tag,
      logo_url: data.logo_url,
      color: data.color,
      captain_id: data.captain_id,
      max_players: data.max_players || 5,
      status: data.status || 'active',
    };
    const { data: result, error } = await supabase.from('esports_teams').insert(team).select().single();
    if (error) throw new BadRequestError(error.message);

    if (data.captain_id) {
      await supabase.from('esports_players').insert({
        organisation_id: orgId,
        team_id: result.id,
        student_id: data.captain_id,
        role: 'captain',
      });
    }
    if (data.player_ids) {
      const players = data.player_ids.filter((id: string) => id !== data.captain_id).map((sid: string) => ({
        organisation_id: orgId,
        team_id: result.id,
        student_id: sid,
        role: 'player',
      }));
      if (players.length > 0) await supabase.from('esports_players').insert(players);
    }
    return result;
  }

  async updateTeam(teamId: string, data: any) {
    const { data: result, error } = await supabase.from('esports_teams').update(data).eq('id', teamId).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async deleteTeam(teamId: string) {
    const { error } = await supabase.from('esports_teams').delete().eq('id', teamId);
    if (error) throw new BadRequestError(error.message);
    return { success: true };
  }

  async getPlayers(orgId: string, teamId?: string) {
    let query = supabase
      .from('esports_players')
      .select('*, team:esports_teams(name, tag), student:students(full_name, roll_number, class_id, classes:classes!students_class_id_fkey(name))')
      .eq('organisation_id', orgId);
    if (teamId) query = query.eq('team_id', teamId);
    const { data } = await query.order('joined_at', { ascending: false });
    return (data || []).map(p => ({
      ...p,
      teamName: p.team?.name,
      teamTag: p.team?.tag,
      studentName: p.student?.full_name,
      studentRoll: p.student?.roll_number,
      studentClass: p.student?.classes?.name,
    }));
  }

  async addPlayer(orgId: string, data: any) {
    const player = {
      organisation_id: orgId,
      team_id: data.team_id,
      student_id: data.student_id,
      role: data.role || 'player',
      jersey_number: data.jersey_number,
    };
    const { data: result, error } = await supabase.from('esports_players').insert(player).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async removePlayer(playerId: string) {
    const { error } = await supabase.from('esports_players').delete().eq('id', playerId);
    if (error) throw new BadRequestError(error.message);
    return { success: true };
  }

  async createTournament(orgId: string, data: any) {
    const tournament = {
      organisation_id: orgId,
      league_id: data.league_id,
      name: data.name,
      stage: data.stage || 'group_stage',
      bracket_type: data.bracket_type || 'single_elimination',
      status: 'pending',
      start_date: data.start_date,
      end_date: data.end_date,
    };
    const { data: result, error } = await supabase.from('esports_tournaments').insert(tournament).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async getTournaments(orgId: string, leagueId?: string) {
    let query = supabase
      .from('esports_tournaments')
      .select('*, league:esports_leagues(name, game)')
      .eq('organisation_id', orgId)
      .order('start_date', { ascending: false });
    if (leagueId) query = query.eq('league_id', leagueId);
    const { data } = await query;
    return (data || []).map(t => ({ ...t, leagueName: t.league?.name, leagueGame: t.league?.game }));
  }

  async getMatches(orgId: string, filters?: { leagueId?: string; teamId?: string; status?: string }) {
    let query = supabase
      .from('esports_matches')
      .select('*, tournament:esports_tournaments(name, stage), team1:esports_teams!team1_id(name, tag), team2:esports_teams!team2_id(name, tag), winner:esports_teams!winner_id(name)')
      .eq('organisation_id', orgId)
      .order('scheduled_at', { ascending: false });
    if (filters?.leagueId) query = query.eq('league_id', filters.leagueId);
    if (filters?.teamId) query = query.or(`team1_id.eq.${filters.teamId},team2_id.eq.${filters.teamId}`);
    if (filters?.status) query = query.eq('status', filters.status);
    const { data } = await query;
    return (data || []).map(m => ({
      ...m,
      tournamentName: m.tournament?.name,
      tournamentStage: m.tournament?.stage,
      team1Name: m.team1?.name,
      team1Tag: m.team1?.tag,
      team2Name: m.team2?.name,
      team2Tag: m.team2?.tag,
      winnerName: m.winner?.name,
    }));
  }

  async createMatch(orgId: string, data: any) {
    const match = {
      organisation_id: orgId,
      tournament_id: data.tournament_id,
      league_id: data.league_id,
      team1_id: data.team1_id,
      team2_id: data.team2_id,
      round: data.round || 1,
      status: 'scheduled',
      scheduled_at: data.scheduled_at,
      stream_url: data.stream_url,
      notes: data.notes,
    };
    const { data: result, error } = await supabase.from('esports_matches').insert(match).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async updateMatchScore(matchId: string, data: { team1_score: number; team2_score: number; winner_id?: string; status?: string }) {
    const update: any = {
      team1_score: data.team1_score,
      team2_score: data.team2_score,
    };
    if (data.winner_id) update.winner_id = data.winner_id;
    if (data.status) update.status = data.status;
    if (data.status === 'completed') update.completed_at = new Date().toISOString();

    const { data: result, error } = await supabase.from('esports_matches').update(update).eq('id', matchId).select().single();
    if (error) throw new BadRequestError(error.message);

    await this.updateStandings(result.league_id, result.team1_id, result.team2_id, result.team1_score, result.team2_score, result.winner_id);
    return result;
  }

  private async updateStandings(leagueId: string, team1Id: string, team2Id: string, score1: number, score2: number, winnerId: string | null) {
    for (const [teamId, scoreFor, scoreAgainst] of [[team1Id, score1, score2], [team2Id, score2, score1]] as [string, number, number][]) {
      const { data: existing } = await supabase.from('esports_standings').select('*').eq('league_id', leagueId).eq('team_id', teamId).single();

      const win = winnerId === teamId ? 1 : 0;
      const loss = winnerId && winnerId !== teamId ? 1 : 0;
      const draw = !winnerId ? 1 : 0;
      const points = win * 3 + draw * 1;

      if (existing) {
        await supabase.from('esports_standings').update({
          matches_played: existing.matches_played + 1,
          wins: existing.wins + win,
          losses: existing.losses + loss,
          draws: existing.draws + draw,
          points: existing.points + points,
          score_for: existing.score_for + scoreFor,
          score_against: existing.score_against + scoreAgainst,
        }).eq('id', existing.id);
      } else {
        await supabase.from('esports_standings').insert({
          organisation_id: (await supabase.from('esports_leagues').select('organisation_id').eq('id', leagueId).single()).data?.organisation_id,
          league_id: leagueId,
          team_id: teamId,
          matches_played: 1,
          wins: win,
          losses: loss,
          draws: draw,
          points,
          score_for: scoreFor,
          score_against: scoreAgainst,
        });
      }
    }
    await this.recalcRanks(leagueId);
  }

  private async recalcRanks(leagueId: string) {
    const { data: standings } = await supabase
      .from('esports_standings')
      .select('*')
      .eq('league_id', leagueId)
      .order('points', { ascending: false })
      .order('score_for', { ascending: false });

    if (standings) {
      for (let i = 0; i < standings.length; i++) {
        await supabase.from('esports_standings').update({ rank: i + 1 }).eq('id', standings[i].id);
      }
    }
  }

  async getStandings(orgId: string, leagueId: string) {
    const { data } = await supabase
      .from('esports_standings')
      .select('*, team:esports_teams(name, tag, logo_url, color)')
      .eq('organisation_id', orgId)
      .eq('league_id', leagueId)
      .order('rank', { ascending: true });
    return (data || []).map(s => ({
      ...s,
      teamName: s.team?.name,
      teamTag: s.team?.tag,
      teamLogo: s.team?.logo_url,
      teamColor: s.team?.color,
    }));
  }

  async getCurriculum(orgId: string) {
    const { data } = await supabase
      .from('gaming_curriculum')
      .select('*')
      .eq('organisation_id', orgId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    return data || [];
  }

  async createCurriculum(orgId: string, data: any) {
    const entry = { organisation_id: orgId, ...data, status: data.status || 'active' };
    const { data: result, error } = await supabase.from('gaming_curriculum').insert(entry).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async deleteCurriculum(id: string) {
    const { error } = await supabase.from('gaming_curriculum').delete().eq('id', id);
    if (error) throw new BadRequestError(error.message);
    return { success: true };
  }

  async getLiveStreams(orgId: string) {
    const { data } = await supabase
      .from('live_streams')
      .select('*')
      .eq('organisation_id', orgId)
      .order('scheduled_at', { ascending: false });
    return data || [];
  }

  async createLiveStream(orgId: string, data: any) {
    const stream = { organisation_id: orgId, ...data, status: data.status || 'upcoming' };
    const { data: result, error } = await supabase.from('live_streams').insert(stream).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async deleteLiveStream(id: string) {
    const { error } = await supabase.from('live_streams').delete().eq('id', id);
    if (error) throw new BadRequestError(error.message);
    return { success: true };
  }

  async getDashboard(orgId: string) {
    const [leagues, teams, matches, streams] = await Promise.all([
      this.getLeagues(orgId),
      this.getTeams(orgId),
      this.getMatches(orgId, { status: 'scheduled' }),
      this.getLiveStreams(orgId),
    ]);

    return {
      summary: {
        totalLeagues: leagues.length,
        activeLeagues: leagues.filter(l => l.status === 'active' || l.status === 'registration').length,
        totalTeams: teams.length,
        upcomingMatches: matches.filter(m => m.status === 'scheduled').length,
        liveStreams: streams.filter(s => s.status === 'live').length,
      },
      recentLeagues: leagues.slice(0, 5),
      upcomingMatches: matches.slice(0, 5),
      liveStreams: streams.filter(s => s.status === 'live').slice(0, 3),
    };
  }
}

export const esportsService = new EsportsService();
