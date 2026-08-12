import { describe, it, expect, beforeEach } from 'vitest';
import { NotificationsService } from '../notifications.service';
import { NotificationsRepository } from '../notifications.repository';
import { NotFoundError } from '../../../shared/errors/errors';

const TENANT = '00000000-0000-0000-0000-00000000000a';
const USER_ID = '00000000-0000-0000-0000-0000000000ad';
const NOTIF_ID = '00000000-0000-0000-0000-000000000111';
const ROLE = 'management';

const dto = {
  id: NOTIF_ID,
  organisation_id: TENANT,
  user_id: null,
  title: 'New announcement',
  message: 'Science fair on Friday',
  type: 'info',
  read: false,
  target_role: ROLE,
  sent_at: '2026-08-11T00:00:00.000Z',
};

function stubRepo(overrides: Partial<NotificationsRepository> = {}): NotificationsRepository {
  return {
    listFor: async () => [dto],
    unreadCount: async () => 1,
    findOwned: async (_t: string, _u: string, _r: string, id: string) => (id === NOTIF_ID ? dto : null),
    markRead: async () => {},
    markAllRead: async () => {},
    create: async () => NOTIF_ID,
    assertOwned: async (_t: string, _u: string, _r: string, id: string) =>
      id === NOTIF_ID ? dto : ((() => { throw new NotFoundError('Notification not found'); })() as typeof dto),
    ...overrides,
  } as unknown as NotificationsRepository;
}

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(() => {
    service = new NotificationsService(stubRepo());
  });

  it('lists notifications for the current user/role', async () => {
    const list = await service.list(TENANT, USER_ID, ROLE);
    expect(list[0].title).toBe('New announcement');
  });

  it('returns the unread count', async () => {
    const unread = await service.unreadCount(TENANT, USER_ID, ROLE);
    expect(unread).toBe(1);
  });

  it('marks a notification as read', async () => {
    await expect(service.markRead(TENANT, USER_ID, ROLE, NOTIF_ID)).resolves.toBeUndefined();
  });

  it('marks all notifications as read', async () => {
    await expect(service.markAllRead(TENANT, USER_ID, ROLE)).resolves.toBeUndefined();
  });

  it('rejects marking a notification that is not owned by the user', async () => {
    await expect(service.markRead(TENANT, USER_ID, ROLE, '00000000-0000-0000-0000-000000000999')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('sends a notification to a role', async () => {
    const id = await service.send(TENANT, { title: 'Fee due', target_role: 'parent' });
    expect(id).toBe(NOTIF_ID);
  });
});