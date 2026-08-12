import { AnnouncementsRepository } from './announcements.repository';
import type { AnnouncementDTO, CreateAnnouncementInput, UpdateAnnouncementInput } from '@prasynx/types';
import type { CreateNotificationInput } from '@prasynx/types';
import { notificationsService } from '../notifications/notifications.service';

type NotifyFn = (tenantId: string, input: CreateNotificationInput) => Promise<string>;

const notificationsFx: NotifyFn = (tenantId, input) => notificationsService.send(tenantId, input);

export class AnnouncementsService {
  constructor(
    private repo: AnnouncementsRepository,
    private notify: NotifyFn = notificationsFx,
  ) {}

  list(tenantId: string): Promise<AnnouncementDTO[]> {
    return this.repo.list(tenantId);
  }

  async get(tenantId: string, id: string): Promise<AnnouncementDTO> {
    return this.repo.assertExists(tenantId, id);
  }

  async create(tenantId: string, input: CreateAnnouncementInput, createdBy: string | undefined): Promise<AnnouncementDTO> {
    const id = await this.repo.create(tenantId, input, createdBy);
    const created = await this.repo.findById(tenantId, id);
    if (!created) throw new Error('Announcement was created but could not be loaded');
    await this.notify(tenantId, {
      title: input.title,
      message: input.content ?? undefined,
      type: input.priority === 'high' ? 'danger' : 'info',
      reference_type: 'announcement',
      reference_id: id,
      target_role: input.target_role ?? 'management',
    });
    return created;
  }

  async update(tenantId: string, id: string, input: UpdateAnnouncementInput): Promise<AnnouncementDTO> {
    await this.repo.assertExists(tenantId, id);
    await this.repo.update(tenantId, id, input);
    const updated = await this.repo.findById(tenantId, id);
    if (!updated) throw new Error('Announcement could not be loaded after update');
    return updated;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.repo.assertExists(tenantId, id);
    await this.repo.remove(tenantId, id);
  }
}

export const announcementsService = new AnnouncementsService(new AnnouncementsRepository(), (tenantId, input) =>
  notificationsService.send(tenantId, input),
);