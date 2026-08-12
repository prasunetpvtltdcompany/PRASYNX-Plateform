/** Activities module DTOs (schema: public.events, clubs, sports_teams). */

export interface EventDTO {
  id: string;
  organisation_id: string;
  title: string;
  description: string | null;
  event_type: string | null;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  status: string | null;
  created_at?: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  event_type?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  status?: string;
}

export interface ClubDTO {
  id: string;
  organisation_id: string;
  name: string;
  description: string | null;
  coordinator: string | null;
  created_at?: string;
}

export interface CreateClubInput {
  name: string;
  description?: string;
  coordinator?: string;
}

export interface SportsTeamDTO {
  id: string;
  organisation_id: string;
  name: string;
  sport_type: string | null;
  coach: string | null;
  max_players: number | null;
  status: string | null;
  created_at?: string;
}

export interface CreateSportsTeamInput {
  name: string;
  sport_type?: string;
  coach?: string;
  max_players?: number;
  status?: string;
}