import { NotificationsRepository } from './notifications.repository';
import type { CreateNotificationInput } from '@prasynx/types';

export class NotificationsService {
  constructor(private repo: NotificationsRepository) {}

  list(tenantId: string, userId: string, role: string) {
    return this.repo.listFor(tenantId, userId, role);
  }

  async unreadCount(tenantId: string, userId: string, role: string) {
    return this.repo.unreadCount(tenantId, userId, role);
  }

  async markRead(tenantId: string, userId: string, role: string, id: string): Promise<void> {
    await this.repo.assertOwned(tenantId, userId, role, id);
    await this.repo.markRead(tenantId, userId, role, id);
  }

  async markAllRead(tenantId: string, userId: string, role: string): Promise<void> {
    await this.repo.markAllRead(tenantId, userId, role);
  }

  /** Internal helper used by other modules to fan out a notification to a role or user. */
  async send(tenantId: string, input: CreateNotificationInput): Promise<string> {
    return this.repo.create(tenantId, input);
  }
}

export const notificationsService = new NotificationsService(new NotificationsRepository());