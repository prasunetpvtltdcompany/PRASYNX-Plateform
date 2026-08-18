import { Response } from 'express';
import { esportsService } from '../services/esports.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class EsportsController {
  async getDashboard(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await esportsService.getDashboard(organisation_id);
    sendSuccess(res, result);
  }

  async getLeagues(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const leagues = await esportsService.getLeagues(organisation_id);
    sendSuccess(res, leagues);
  }

  async createLeague(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await esportsService.createLeague(organisation_id, req.body);
    sendCreated(res, result, 'League created');
  }

  async updateLeague(req: AuthRequest, res: Response) {
    const { league_id } = req.params;
    const result = await esportsService.updateLeague(league_id, req.body);
    sendSuccess(res, result, 'League updated');
  }

  async deleteLeague(req: AuthRequest, res: Response) {
    const { league_id } = req.params;
    const result = await esportsService.deleteLeague(league_id);
    sendSuccess(res, result, 'League deleted');
  }

  async getTeams(req: AuthRequest, res: Response) {
    const { organisation_id, league_id } = req.params;
    const teams = await esportsService.getTeams(organisation_id, league_id);
    sendSuccess(res, teams);
  }

  async createTeam(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await esportsService.createTeam(organisation_id, req.body);
    sendCreated(res, result, 'Team created');
  }

  async updateTeam(req: AuthRequest, res: Response) {
    const { team_id } = req.params;
    const result = await esportsService.updateTeam(team_id, req.body);
    sendSuccess(res, result, 'Team updated');
  }

  async deleteTeam(req: AuthRequest, res: Response) {
    const { team_id } = req.params;
    const result = await esportsService.deleteTeam(team_id);
    sendSuccess(res, result, 'Team deleted');
  }

  async getPlayers(req: AuthRequest, res: Response) {
    const { organisation_id, team_id } = req.params;
    const players = await esportsService.getPlayers(organisation_id, team_id);
    sendSuccess(res, players);
  }

  async addPlayer(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await esportsService.addPlayer(organisation_id, req.body);
    sendCreated(res, result, 'Player added');
  }

  async removePlayer(req: AuthRequest, res: Response) {
    const { player_id } = req.params;
    const result = await esportsService.removePlayer(player_id);
    sendSuccess(res, result, 'Player removed');
  }

  async getTournaments(req: AuthRequest, res: Response) {
    const { organisation_id, league_id } = req.params;
    const tournaments = await esportsService.getTournaments(organisation_id, league_id);
    sendSuccess(res, tournaments);
  }

  async createTournament(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await esportsService.createTournament(organisation_id, req.body);
    sendCreated(res, result, 'Tournament created');
  }

  async getMatches(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const { league_id, team_id, status } = req.query;
    const matches = await esportsService.getMatches(organisation_id, {
      leagueId: league_id as string,
      teamId: team_id as string,
      status: status as string,
    });
    sendSuccess(res, matches);
  }

  async createMatch(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await esportsService.createMatch(organisation_id, req.body);
    sendCreated(res, result, 'Match scheduled');
  }

  async updateMatchScore(req: AuthRequest, res: Response) {
    const { match_id } = req.params;
    const result = await esportsService.updateMatchScore(match_id, req.body);
    sendSuccess(res, result, 'Match score updated');
  }

  async getStandings(req: AuthRequest, res: Response) {
    const { organisation_id, league_id } = req.params;
    const standings = await esportsService.getStandings(organisation_id, league_id);
    sendSuccess(res, standings);
  }

  async getCurriculum(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const curriculum = await esportsService.getCurriculum(organisation_id);
    sendSuccess(res, curriculum);
  }

  async createCurriculum(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await esportsService.createCurriculum(organisation_id, req.body);
    sendCreated(res, result, 'Curriculum entry created');
  }

  async deleteCurriculum(req: AuthRequest, res: Response) {
    const { curriculum_id } = req.params;
    const result = await esportsService.deleteCurriculum(curriculum_id);
    sendSuccess(res, result, 'Curriculum entry deleted');
  }

  async getLiveStreams(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const streams = await esportsService.getLiveStreams(organisation_id);
    sendSuccess(res, streams);
  }

  async createLiveStream(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await esportsService.createLiveStream(organisation_id, req.body);
    sendCreated(res, result, 'Live stream created');
  }

  async deleteLiveStream(req: AuthRequest, res: Response) {
    const { stream_id } = req.params;
    const result = await esportsService.deleteLiveStream(stream_id);
    sendSuccess(res, result, 'Live stream deleted');
  }
}

export const esportsController = new EsportsController();
