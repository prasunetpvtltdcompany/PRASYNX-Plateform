import { ActivityRepository } from './activities.repository';
import type { CreateClubInput, CreateEventInput, CreateSportsTeamInput } from '@prasynx/types';

export class ActivityService {
  constructor(private repo: ActivityRepository) {}

  async overview(tenantId: string) {
    const [events, clubs, teams] = await Promise.all([
      this.repo.listEvents(tenantId),
      this.repo.listClubs(tenantId),
      this.repo.listTeams(tenantId),
    ]);
    return { events, clubs, teams };
  }

  async createEvent(tenantId: string, input: CreateEventInput) {
    const id = await this.repo.createEvent(tenantId, {
      organisation_id: tenantId,
      title: input.title,
      description: input.description ?? null,
      event_type: input.event_type ?? 'general',
      start_date: input.start_date || null,
      end_date: input.end_date || null,
      start_time: input.start_time || null,
      end_time: input.end_time || null,
      location: input.location ?? null,
      status: input.status ?? 'planned',
    });
    return { id };
  }

  async createClub(tenantId: string, input: CreateClubInput) {
    const id = await this.repo.createClub(tenantId, {
      organisation_id: tenantId,
      name: input.name,
      description: input.description ?? null,
      coordinator: input.coordinator ?? null,
    });
    return { id };
  }

  async createTeam(tenantId: string, input: CreateSportsTeamInput) {
    const id = await this.repo.createTeam(tenantId, {
      organisation_id: tenantId,
      name: input.name,
      sport_type: input.sport_type ?? null,
      coach: input.coach ?? null,
      max_players: input.max_players ?? null,
      status: input.status ?? 'active',
    });
    return { id };
  }
}

export const activityService = new ActivityService(new ActivityRepository());