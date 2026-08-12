import { CommunicationRepository } from './communication.repository';
import { registerJob } from '../../infrastructure/jobs/queue';
import { logger } from '../../shared/logger/logger';
import type { NotifyUserTarget } from '@prasynx/types';

interface ParentNotifyPayload {
  studentId: string;
  studentName: string;
  status: string;
  date: string;
}

/**
 * communication.service - cross-module notifications. Other modules may ONLY
 * depend on this service (never this module's repository) and use the async
 * queue for fan-out so DB writes never sit inside the request path.
 */
export class CommunicationService {
  constructor(private repo: CommunicationRepository) {}

  async notifyParentsOfAttendance(payload: ParentNotifyPayload): Promise<void> {
    const parentIds = await this.repo.parentIdsForStudent(payload.studentId);
    if (!parentIds.length) return;

    const rows: NotifyUserTarget[] = parentIds.map((user_id) => ({
      user_id,
      title: `Attendance Marked - ${payload.studentName}`,
      message: `${payload.studentName} was marked "${payload.status}" on ${payload.date}.`,
      type: payload.status === 'absent' || payload.status === 'late' ? 'warning' : 'info',
    }));

    await this.repo.insertNotifications(rows);
  }

  /** Wire the background worker handlers up once at boot. */
  registerHandlers() {
    registerJob('attendance.parentNotify', async (raw) => {
      const payload = raw as unknown as ParentNotifyPayload;
      try {
        await this.notifyParentsOfAttendance(payload);
      } catch (err) {
        logger.error({ err, payload }, 'Parent notification job failed');
      }
    });
  }
}

export const communicationService = new CommunicationService(new CommunicationRepository());