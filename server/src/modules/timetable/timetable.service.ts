import { TimetableRepository } from './timetable.repository';
import { BadRequestError } from '../../shared/errors/errors';
import type { TimetableDTO, TimetableEntryDTO, TimetableEntryRow } from '@prasynx/types';

const MIN_DAY = 0;
const MAX_DAY = 6;

export class TimetableService {
  constructor(private repo: TimetableRepository) {}

  async get(tenantId: string, classId: string): Promise<TimetableDTO> {
    const cls = await this.repo.assertClassInTenant(tenantId, classId);
    const entries = await this.repo.listForClass(tenantId, classId);
    return { class_id: classId, class_name: cls.name, entries };
  }

  async list(tenantId: string): Promise<TimetableEntryDTO[]> {
    return this.repo.listForTenant(tenantId);
  }

  async replace(
    input: {
      tenantId: string;
      classId: string;
      entries: Array<{ subject_id: string; day_of_week: number; start_time: string; end_time: string; room?: string | null }>;
    },
  ): Promise<TimetableEntryDTO[]> {
    await this.repo.assertClassInTenant(input.tenantId, input.classId);
    const rows: Parameters<TimetableRepository['replaceClassEntries']>[2] = [];
    const seen = new Set<string>();
    for (const e of input.entries) {
      if (e.day_of_week < MIN_DAY || e.day_of_week > MAX_DAY) throw new BadRequestError('day_of_week must be between 0 and 6');
      if (e.start_time >= e.end_time) throw new BadRequestError('start_time must be before end_time');
      const key = `${e.day_of_week}:${e.start_time}`;
      if (seen.has(key)) throw new BadRequestError(`Duplicate slot on day ${e.day_of_week} at ${e.start_time}`);
      seen.add(key);
      await this.repo.assertSubjectInTenant(input.tenantId, e.subject_id);
      rows.push({
        organisation_id: input.tenantId,
        class_id: input.classId,
        subject_id: e.subject_id,
        day_of_week: e.day_of_week as TimetableEntryRow['day_of_week'],
        start_time: e.start_time,
        end_time: e.end_time,
        room: e.room ?? null,
      });
    }
    return this.repo.replaceClassEntries(input.tenantId, input.classId, rows);
  }

  async delete(tenantId: string, entryIds: string[]): Promise<void> {
    await this.repo.deleteEntries(tenantId, entryIds);
  }
}

export const timetableService = new TimetableService(new TimetableRepository());