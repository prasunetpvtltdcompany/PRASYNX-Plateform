import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnnouncementsService } from '../announcements.service';
import { AnnouncementsRepository } from '../announcements.repository';
import { NotFoundError } from '../../../shared/errors/errors';
import type { AnnouncementDTO } from '@prasynx/types';

const TENANT = '00000000-0000-0000-0000-00000000000a';
const ID = '00000000-0000-0000-0000-000000000121';

const dto: AnnouncementDTO = {
  id: ID,
  organisation_id: TENANT,
  created_by: 'user-1',
  title: 'Midterm schedule',
  content: 'Exams start next week',
  target_role: 'all',
  target_class_id: null,
  priority: 'normal',
  published_at: null,
  created_at: '2026-08-10T00:00:00.000Z',
};

function stubRepo(overrides: Partial<AnnouncementsRepository> = {}): AnnouncementsRepository {
  return {
    list: async () => [dto],
    findById: async (_t: string, id: string) => (id === ID ? dto : null),
    create: async () => ID,
    update: async () => {},
    remove: async () => {},
    assertExists: async (_t: string, id: string) =>
      id === ID ? dto : ((() => { throw new NotFoundError('Announcement not found in this school'); })() as AnnouncementDTO),
    ...overrides,
  } as unknown as AnnouncementsRepository;
}

describe('AnnouncementsService', () => {
  let service: AnnouncementsService;
  let notify: ReturnType<typeof import('vitest').vi.fn>;
  beforeEach(() => {
    notify = vi.fn(async () => 'notif-1');
    service = new AnnouncementsService(stubRepo(), notify);
  });

  it('lists announcements', async () => {
    const list = await service.list(TENANT);
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe('Midterm schedule');
  });

  it('creates and returns an announcement via findById', async () => {
    const created = await service.create(TENANT, { title: 'Holiday', publish: true }, 'user-1');
    expect(created.title).toBe('Midterm schedule');
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith(TENANT, expect.objectContaining({ reference_type: 'announcement', reference_id: ID }));
  });

  it('throws NotFound for unknown announcement', async () => {
    await expect(service.get(TENANT, '00000000-0000-0000-0000-000000000999')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('removes an announcement', async () => {
    await expect(service.remove(TENANT, ID)).resolves.toBeUndefined();
  });
});