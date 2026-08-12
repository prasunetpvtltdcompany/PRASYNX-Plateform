import { describe, it, expect, beforeEach } from 'vitest';
import { TimetableService } from '../timetable.service';
import { TimetableRepository } from '../timetable.repository';
import { BadRequestError, ForbiddenError } from '../../../shared/errors/errors';

const ORG = '00000000-0000-0000-0000-00000000000a';
const CLASS = '00000000-0000-0000-0000-0000000000c1';
const SUBJECT = '00000000-0000-0000-0000-0000000000s1';

function stubRepo(): TimetableRepository {
  return {
    assertClassInTenant: async (tenantId: string, classId: string) => {
      if (tenantId !== ORG || classId !== CLASS) throw new ForbiddenError('Class does not belong to this school');
      return { name: 'Class 1' };
    },
    assertSubjectInTenant: async (tenantId: string, subjectId: string) => {
      if (tenantId !== ORG || subjectId !== SUBJECT) throw new ForbiddenError('Subject does not belong to this school');
    },
    replaceClassEntries: async (tenantId: string, classId: string, rows: Array<{ organisation_id: string; class_id: string; subject_id: string; day_of_week: number; start_time: string; end_time: string; room?: string | null }>) =>
      rows.map((r, i) => ({
        id: `00000000-0000-0000-0000-000000000e${i}`,
        organisation_id: tenantId,
        class_id: classId,
        subject_id: r.subject_id,
        teacher_id: null,
        day_of_week: r.day_of_week,
        start_time: r.start_time,
        end_time: r.end_time,
        room: r.room ?? null,
      })),
    deleteEntries: async () => {},
    listForClass: async () => [
      { id: 'e1', organisation_id: ORG, class_id: CLASS, subject_id: SUBJECT, teacher_id: null, day_of_week: 1, start_time: '08:00', end_time: '08:45', room: '101', subject_name: 'Math', section_name: null },
    ],
    listForTenant: async () => [],
    assertTeacherBelongsToTenant: async () => {},
  } as unknown as TimetableRepository;
}

describe('TimetableService', () => {
  let svc: TimetableService;

  beforeEach(() => {
    svc = new TimetableService(stubRepo());
  });

  it('returns a class timetable grouped with class name', async () => {
    const t = await svc.get(ORG, CLASS);
    expect(t.class_name).toBe('Class 1');
    expect(t.entries).toHaveLength(1);
    expect(t.entries[0].subject_name).toBe('Math');
  });

  it('rejects duplicate day+start slots', async () => {
    await expect(
      svc.replace({
        tenantId: ORG,
        classId: CLASS,
        entries: [
          { subject_id: SUBJECT, day_of_week: 1, start_time: '08:00', end_time: '08:45' },
          { subject_id: SUBJECT, day_of_week: 1, start_time: '08:00', end_time: '09:30' },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('rejects invalid day_of_week', async () => {
    await expect(
      svc.replace({ tenantId: ORG, classId: CLASS, entries: [{ subject_id: SUBJECT, day_of_week: 7, start_time: '08:00', end_time: '08:45' }] }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('rejects start after end', async () => {
    await expect(
      svc.replace({ tenantId: ORG, classId: CLASS, entries: [{ subject_id: SUBJECT, day_of_week: 1, start_time: '09:00', end_time: '08:00' }] }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('scopes class lookups to the tenant', async () => {
    await expect(svc.get('other-org', CLASS)).rejects.toBeInstanceOf(ForbiddenError);
  });
});