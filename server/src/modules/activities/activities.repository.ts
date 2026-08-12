import type { ClubDTO, EventDTO, SportsTeamDTO } from '@prasynx/types';
import { db } from '../../infrastructure/database/supabase';

const EVENT_COLUMNS =
  'id,organisation_id,title,description,event_type,start_date,end_date,start_time,end_time,location,status,created_at';
const CLUB_COLUMNS = 'id,organisation_id,name,description,coordinator,created_at';
const TEAM_COLUMNS = 'id,organisation_id,name,sport_type,coach,max_players,status,created_at';

export class ActivityRepository {
  async listEvents(tenantId: string): Promise<EventDTO[]> {
    const { data, error } = await db.from('events').select(EVENT_COLUMNS).eq('organisation_id', tenantId).order('start_date', { ascending: false });
    if (error) throw error;
    return (data as unknown as EventDTO[]) ?? [];
  }

  async createEvent(tenantId: string, row: Record<string, unknown>): Promise<string> {
    const { data, error } = await db.from('events').insert(row).select('id').single();
    if (error || !data) throw error ?? new Error('Event could not be created');
    return data.id as string;
  }

  async listClubs(tenantId: string): Promise<ClubDTO[]> {
    const { data, error } = await db.from('clubs').select(CLUB_COLUMNS).eq('organisation_id', tenantId).order('name');
    if (error) throw error;
    return (data as unknown as ClubDTO[]) ?? [];
  }

  async createClub(tenantId: string, row: Record<string, unknown>): Promise<string> {
    const { data, error } = await db.from('clubs').insert(row).select('id').single();
    if (error || !data) throw error ?? new Error('Club could not be created');
    return data.id as string;
  }

  async listTeams(tenantId: string): Promise<SportsTeamDTO[]> {
    const { data, error } = await db.from('sports_teams').select(TEAM_COLUMNS).eq('organisation_id', tenantId).order('name');
    if (error) throw error;
    return (data as unknown as SportsTeamDTO[]) ?? [];
  }

  async createTeam(tenantId: string, row: Record<string, unknown>): Promise<string> {
    const { data, error } = await db.from('sports_teams').insert(row).select('id').single();
    if (error || !data) throw error ?? new Error('Team could not be created');
    return data.id as string;
  }
}