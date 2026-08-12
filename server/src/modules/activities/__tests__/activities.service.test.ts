import { describe, it, expect, beforeEach } from 'vitest';
import { ActivityService } from '../activities.service';
import { ActivityRepository } from '../activities.repository';

const TENANT = '00000000-0000-0000-0000-00000000000a';
const ID = '00000000-0000-0000-0000-000000000111';

function stubRepo(overrides: Partial<ActivityRepository> = {}): ActivityRepository {
  return {
    listEvents: async () => [{ id: ID, organisation_id: TENANT, title: 'Annual Day', status: 'planned' }],
    createEvent: async () => ID,
    listClubs: async () => [{ id: ID, organisation_id: TENANT, name: 'Chess Club' }],
    createClub: async () => ID,
    listTeams: async () => [{ id: ID, organisation_id: TENANT, name: 'U-16 Cricket' }],
    createTeam: async () => ID,
    ...overrides,
  } as unknown as ActivityRepository;
}

describe('ActivityService', () => {
  let service: ActivityService;

  beforeEach(() => {
    service = new ActivityService(stubRepo());
  });

  it('returns the events/clubs/teams overview', async () => {
    const { events, clubs, teams } = await service.overview(TENANT);
    expect(events).toHaveLength(1);
    expect(clubs).toHaveLength(1);
    expect(teams).toHaveLength(1);
  });

  it('creates an event', async () => {
    const event = await service.createEvent(TENANT, { title: 'Science Fair' });
    expect(event.id).toBe(ID);
  });

  it('creates a club', async () => {
    const club = await service.createClub(TENANT, { name: 'Robotics' });
    expect(club.id).toBe(ID);
  });

  it('creates a team with a default status', async () => {
    const team = await service.createTeam(TENANT, { name: 'Basketball' });
    expect(team.id).toBe(ID);
  });
});