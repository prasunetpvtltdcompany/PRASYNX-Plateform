import { describe, it, expect, beforeEach } from 'vitest';
import { AttendanceService } from '../attendance.service';
import { AttendanceRepository, type StudentMeta, type ClassStudent } from '../attendance.repository';
import { BadRequestError, ForbiddenError } from '../../../shared/errors/errors';

const ORG = '00000000-0000-0000-0000-00000000000a';
const CLASS = '00000000-0000-0000-0000-0000000000c1';
const STUDENT_1 = '00000000-0000-0000-0000-0000000000s1';
const STUDENT_2 = '00000000-0000-0000-0000-0000000000s2';

const meta = (id: string): StudentMeta => ({ organisation_id: ORG, class_id: CLASS, section_id: null, full_name: `Student ${id}` });

function stubRepo(): AttendanceRepository {
  return {
    getStudentMeta: async (studentId: string, tenantId: string) => {
      if (tenantId !== ORG) throw new ForbiddenError('Student does not belong to this school');
      return meta(studentId);
    },
    studentsInClass: async (classId: string, tenantId: string): Promise<ClassStudent[]> =>
      [
        { id: STUDENT_1, full_name: 'Student 1', class_id: CLASS, section_id: null, organisation_id: ORG, roll_number: 'R1' },
        { id: STUDENT_2, full_name: 'Student 2', class_id: CLASS, section_id: null, organisation_id: ORG, roll_number: 'R2' },
      ].filter((s) => s.class_id === classId && s.organisation_id === tenantId),
    rosterForClass: async (_t: string, _classId: string, _date: string) => ({
      students: [
        { id: STUDENT_1, full_name: 'Student 1', roll_number: 'R1', section_id: null, status: 'present', record_id: 'rec-1', notes: null },
        { id: STUDENT_2, full_name: 'Student 2', roll_number: 'R2', section_id: null, status: null, record_id: null, notes: null },
      ],
      class_name: 'Class A',
    }),
    records: async () => ({
      data: [
        {
          id: 'r1',
          organisation_id: ORG,
          student_id: STUDENT_1,
          class_id: CLASS,
          section_id: null,
          teacher_id: 't',
          subject_id: null,
          attendance_date: '2026-08-10',
          attendance_status: 'Present',
          remarks: null,
          created_at: '',
        },
      ],
      total: 1,
    }),
    dailySummaryRaw: async (_t: string, date: string) =>
      date === '2026-08-10'
        ? [
            { class_id: CLASS, status: 'present' },
            { class_id: CLASS, status: 'absent' },
          ]
        : [],
    studentsByClass: async () => ({ [CLASS]: 4 }),
    classNames: async (_t: string, ids: string[]) =>
      Object.fromEntries(ids.map((id) => [id, id === CLASS ? 'Class A' : 'Class B'])),
    existingForDay: async () => [],
    insertRecords: async (rows: Array<{
      organisation_id: string;
      student_id: string;
      class_id: string | null;
      section_id: string | null;
      teacher_id: string;
      attendance_date: string;
      attendance_status: string;
      remarks?: string | null;
    }>) =>
      rows.map((r, i: number) => ({
        id: `00000000-0000-0000-0000-000000000r${i}`,
        organisation_id: r.organisation_id,
        student_id: r.student_id,
        class_id: r.class_id,
        section_id: r.section_id,
        teacher_id: r.teacher_id,
        subject_id: null,
        attendance_date: r.attendance_date,
        attendance_status: r.attendance_status,
        remarks: r.remarks ?? null,
        created_at: new Date().toISOString(),
      })),
    updateRecord: async (id: string, fields: { attendance_status: string; remarks?: string | null; teacher_id: string }) => ({
      id,
      organisation_id: ORG,
      student_id: STUDENT_1,
      class_id: CLASS,
      section_id: null,
      teacher_id: fields.teacher_id,
      subject_id: null,
      attendance_date: '2026-08-10',
      attendance_status: fields.attendance_status,
      remarks: fields.remarks ?? null,
      created_at: new Date().toISOString(),
    }),
    recordsForStudent: async () => [
      { id: 'r1', organisation_id: ORG, student_id: STUDENT_1, class_id: CLASS, section_id: null, teacher_id: 't', subject_id: null, attendance_date: '2026-08-08', attendance_status: 'Present', remarks: null, created_at: '' },
      { id: 'r2', organisation_id: ORG, student_id: STUDENT_1, class_id: CLASS, section_id: null, teacher_id: 't', subject_id: null, attendance_date: '2026-08-09', attendance_status: 'Absent', remarks: null, created_at: '' },
      { id: 'r3', organisation_id: ORG, student_id: STUDENT_1, class_id: CLASS, section_id: null, teacher_id: 't', subject_id: null, attendance_date: '2026-08-10', attendance_status: 'Late', remarks: null, created_at: '' },
    ],
    studentIdForUser: async (userId: string) => (userId === 'user-student' ? STUDENT_1 : null),
    studentIdsForParent: async () => [STUDENT_1],
  } as unknown as AttendanceRepository;
}

describe('AttendanceService', () => {
  let svc: AttendanceService;

  beforeEach(() => {
    svc = new AttendanceService(stubRepo());
  });

  it('marks a single student, storing capitalized status and exposing lowercase', async () => {
    const dto = await svc.mark({ teacherId: 't1', studentId: STUDENT_1, date: '2026-08-10', status: 'absent', tenantId: ORG });
    expect(dto.status).toBe('absent');
    expect(dto.student_id).toBe(STUDENT_1);
    expect(dto.organisation_id).toBe(ORG);
  });

  it('scopes by tenant and refuses cross-school access', async () => {
    await expect(svc.mark({ teacherId: 't1', studentId: STUDENT_1, date: '2026-08-10', status: 'present', tenantId: 'other-org' })).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it('bulk-marks a class in one insert', async () => {
    const dtos = await svc.markBulk({
      teacherId: 't1',
      classId: CLASS,
      date: '2026-08-10',
      tenantId: ORG,
      records: [
        { studentId: STUDENT_1, status: 'present' },
        { studentId: STUDENT_2, status: 'absent' },
      ],
    });
    expect(dtos).toHaveLength(2);
    expect(dtos.map((d) => d.status)).toEqual(['present', 'absent']);
  });

  it('rejects a student that is not part of the class', async () => {
    await expect(
      svc.markBulk({ teacherId: 't1', classId: CLASS, date: '2026-08-10', tenantId: ORG, records: [{ studentId: 'foreign', status: 'present' }] }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('rejects duplicate students inside a single batch', async () => {
    await expect(
      svc.markBulk({
        teacherId: 't1',
        classId: CLASS,
        date: '2026-08-10',
        tenantId: ORG,
        records: [
          { studentId: STUDENT_1, status: 'present' },
          { studentId: STUDENT_1, status: 'present' },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('computes the attendance summary (present + late counts as present)', async () => {
    const report = await svc.report({
      requester: { role: 'student', userId: 'user-student', tenantId: ORG },
      studentId: STUDENT_1,
    });
    expect(report.summary.total).toBe(3);
    expect(report.summary.present).toBe(2); // Present + Late
    expect(report.summary.absent).toBe(1);
    expect(report.summary.percentage).toBe(67);
  });

  it('a parent may only view their own children', async () => {
    const ok = await svc.report({ requester: { role: 'parent', userId: 'user-parent', tenantId: ORG }, studentId: STUDENT_1 });
    expect(ok.summary.total).toBe(3);

    await expect(svc.report({ requester: { role: 'parent', userId: 'user-parent', tenantId: ORG }, studentId: STUDENT_2 })).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('builds the class roster with marked/unmarked counts', async () => {
    const roster = await svc.roster({ tenantId: ORG, classId: CLASS, date: '2026-08-10' });
    expect(roster.students).toHaveLength(2);
    expect(roster.students[0].status).toBe('present');
    expect(roster.students[1].status).toBeNull();
    expect(roster.marked).toBe(1);
    expect(roster.unmarked).toBe(1);
  });

  it('defaults the roster date to today when omitted', async () => {
    const roster = await svc.roster({ tenantId: ORG, classId: CLASS });
    expect(roster.date).toBe(new Date().toISOString().slice(0, 10));
  });

  it('lists paginated attendance records with student names', async () => {
    const page = await svc.records({ tenantId: ORG, classId: CLASS, page: 1, pageSize: 10 });
    expect(page.data).toHaveLength(1);
    expect(page.data[0].date).toBe('2026-08-10');
    expect(page.data[0].status).toBe('present');
    expect(page.total).toBe(1);
  });

  it('computes the daily per-class summary and unmarked counts', async () => {
    const summary = await svc.dailySummary({ tenantId: ORG, date: '2026-08-10' });
    expect(summary.classes).toHaveLength(1);
    const cls = summary.classes[0];
    expect(cls.class_name).toBe('Class A');
    expect(cls.present).toBe(1);
    expect(cls.absent).toBe(1);
    expect(cls.total).toBe(4); // enrolled
    expect(cls.unmarked).toBe(2);
    expect(summary.totals.present).toBe(1);
    expect(summary.totals.total).toBe(2);
    expect(summary.totals.percentage).toBe(50);
  });
});