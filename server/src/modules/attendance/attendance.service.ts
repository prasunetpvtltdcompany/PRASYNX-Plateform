import { AttendanceRepository, type ClassStudent } from './attendance.repository';
import { enqueue } from '../../infrastructure/jobs/queue';
import { BadRequestError, ForbiddenError } from '../../shared/errors/errors';
import type {
  AttendanceRecordDTO,
  AttendanceRecordRow,
  AttendanceRecordListItem,
  AttendanceReport,
  AttendanceStatus,
  ClassAttendanceSummary,
  ClassRosterDTO,
  DailyAttendanceSummaryDTO,
  MarkAttendanceInput,
  PaginatedAttendanceRecords,
} from '@prasynx/types';
import { hasPermission, PERMISSIONS } from '@prasynx/config';
import type { Role } from '@prasynx/types';

/** Single implementations of the domain rules that staff/student/management backends used to duplicate. */
export class AttendanceService {
  constructor(private repo: AttendanceRepository) {}

  async mark(input: MarkAttendanceInput & { tenantId: string }): Promise<AttendanceRecordDTO> {
    const meta = await this.repo.getStudentMeta(input.studentId, input.tenantId);
    const status = this.normalizeStatus(input.status);

    const existing = await this.repo.existingForDay([input.studentId], input.date);
    const row = existing.length
      ? await this.repo.updateRecord(existing[0].id, { attendance_status: status, remarks: input.notes ?? null, teacher_id: input.teacherId })
      : (
          await this.repo.insertRecords([
            {
              organisation_id: meta.organisation_id,
              student_id: input.studentId,
              class_id: meta.class_id,
              section_id: meta.section_id,
              teacher_id: input.teacherId,
              attendance_date: input.date,
              attendance_status: status,
              remarks: input.notes ?? null,
            },
          ])
        )[0];

    this.fanOutParentNotification(input.studentId, meta.full_name, input.status, input.date);
    return this.toDTO(row);
  }

  async markBulk(input: {
    teacherId: string;
    classId: string;
    date: string;
    records: Array<{ studentId: string; status: AttendanceStatus; notes?: string | null }>;
    tenantId: string;
  }): Promise<AttendanceRecordDTO[]> {
    const students = await this.repo.studentsInClass(input.classId, input.tenantId);
    const byId = new Map<string, ClassStudent>(students.map((s) => [s.id, s]));

    // Every student in the batch must belong to the caller's class + school.
    const seen = new Set<string>();
    for (const rec of input.records) {
      if (seen.has(rec.studentId)) throw new BadRequestError(`Duplicate student in batch: ${rec.studentId}`);
      seen.add(rec.studentId);
      if (!byId.has(rec.studentId)) throw new ForbiddenError(`Student ${rec.studentId} is not in this class`);
    }

    const existing = await this.repo.existingForDay([...seen], input.date);
    const existingByStudent = new Map(existing.map((r) => [r.student_id, r.id]));

    const toInsert: Parameters<AttendanceRepository['insertRecords']>[0] = [];
    const results: AttendanceRecordRow[] = [];

    for (const rec of input.records) {
      const status = this.normalizeStatus(rec.status);
      const meta = byId.get(rec.studentId)!;
      const existingId = existingByStudent.get(rec.studentId);
      if (existingId) {
        results.push(await this.repo.updateRecord(existingId, { attendance_status: status, remarks: rec.notes ?? null, teacher_id: input.teacherId }));
      } else {
        toInsert.push({
          organisation_id: meta.organisation_id,
          student_id: rec.studentId,
          class_id: meta.class_id,
          section_id: meta.section_id,
          teacher_id: input.teacherId,
          attendance_date: input.date,
          attendance_status: status,
          remarks: rec.notes ?? null,
        });
      }
      this.fanOutParentNotification(rec.studentId, meta.full_name, rec.status, input.date);
    }

    if (toInsert.length) results.push(...(await this.repo.insertRecords(toInsert)));
    return results.map((r) => this.toDTO(r));
  }

  async report(input: { requester: { role: Role; userId: string; tenantId: string | null }; studentId: string; from?: string; to?: string }): Promise<AttendanceReport> {
    const tenantId = input.requester.tenantId;
    if (!tenantId) throw new ForbiddenError('Not scoped to a school');
    await this.repo.getStudentMeta(input.studentId, tenantId); // existence + tenant check

    if (!(await this.canViewStudent(input.requester, input.studentId))) {
      throw new ForbiddenError('You can only view attendance for your own class/children/self');
    }

    const rows = await this.repo.recordsForStudent(input.studentId, input.from, input.to);
    const records = rows.map((r) => this.toDTO(r));

    const counts = { total: records.length, present: 0, absent: 0, late: 0, excused: 0 };
    for (const r of records) {
      const status = r.status;
      if (status === 'present') counts.present++;
      else if (status === 'late') { counts.late++; counts.present++; }
      else if (status === 'excused') counts.excused++;
      else counts.absent++;
    }
    const percentage = counts.total > 0 ? Math.round((counts.present / counts.total) * 100) : 0;
    return { summary: { ...counts, percentage }, records };
  }

  /** Class + date roster grid: students with their status for the day (management/teacher). */
  async roster(input: { tenantId: string; classId: string; date?: string }): Promise<ClassRosterDTO> {
    const date = input.date ?? new Date().toISOString().slice(0, 10);
    await this.repo.studentsInClass(input.classId, input.tenantId); // class membership + tenant check
    const { students } = await this.repo.rosterForClass(input.tenantId, input.classId, date);
    const marked = students.filter((s) => s.status !== null).length;
    return { class_id: input.classId, date, marked, unmarked: students.length - marked, students };
  }

  /** Filtered, paginated records list (management). */
  async records(input: {
    tenantId: string;
    classId?: string;
    date?: string;
    from?: string;
    to?: string;
    status?: string;
    studentId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedAttendanceRecords> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 50;
    const { data, total } = await this.repo.records(input.tenantId, {
      classId: input.classId,
      date: input.date,
      from: input.from,
      to: input.to,
      status: input.status,
      studentId: input.studentId,
      page,
      pageSize,
    });
    const items: AttendanceRecordListItem[] = data.map((r) => {
      const joined = r as unknown as { student?: { full_name?: string | null } };
      return {
        id: r.id,
        organisation_id: r.organisation_id,
        student_id: r.student_id,
        student_name: joined.student?.full_name ?? null,
        class_id: r.class_id,
        section_id: r.section_id,
        teacher_id: r.teacher_id,
        subject_id: r.subject_id,
        date: r.attendance_date,
        status: (r.attendance_status || 'Present').toLowerCase() as AttendanceStatus,
        notes: r.remarks ?? null,
        created_at: r.created_at,
      };
    });
    return { data: items, total, page, pageSize };
  }

  /** Per-class breakdown of attendance for a single date (management). */
  async dailySummary(input: { tenantId: string; date?: string }): Promise<DailyAttendanceSummaryDTO> {
    const date = input.date ?? new Date().toISOString().slice(0, 10);
    const [rows, studentsByClass] = await Promise.all([
      this.repo.dailySummaryRaw(input.tenantId, date),
      this.repo.studentsByClass(input.tenantId),
    ]);

    const perClass = new Map<string, { present: number; absent: number; late: number; excused: number }>();
    for (const r of rows) {
      if (!r.class_id) continue;
      const bucket = perClass.get(r.class_id) ?? { present: 0, absent: 0, late: 0, excused: 0 };
      if (r.status === 'late') bucket.late++;
      else if (r.status === 'absent') bucket.absent++;
      else if (r.status === 'excused') bucket.excused++;
      else bucket.present++;
      perClass.set(r.class_id, bucket);
    }

    const classIds = Array.from(new Set([...perClass.keys(), ...Object.keys(studentsByClass)]));
    const names = await this.repo.classNames(input.tenantId, classIds);

    const classes: ClassAttendanceSummary[] = classIds.map((classId) => {
      const b = perClass.get(classId) ?? { present: 0, absent: 0, late: 0, excused: 0 };
      const total = studentsByClass[classId] ?? 0;
      const marked = b.present + b.absent + b.late + b.excused;
      return {
        class_id: classId,
        class_name: names[classId] ?? null,
        ...b,
        unmarked: Math.max(0, total - marked),
        total,
      };
    });

    const totals = {
      total: classes.reduce((s, c) => s + c.total, 0),
      present: classes.reduce((s, c) => s + c.present, 0),
      absent: classes.reduce((s, c) => s + c.absent, 0),
      late: classes.reduce((s, c) => s + c.late, 0),
      excused: classes.reduce((s, c) => s + c.excused, 0),
      percentage: 0,
    };
    const markedTotal = totals.present + totals.absent + totals.late + totals.excused;
    totals.total = markedTotal;
    totals.percentage = markedTotal > 0 ? Math.round((totals.present / markedTotal) * 100) : 0;

    return { date, classes, totals };
  }

  // --- internals ---

  /** Self/child access: students & parents are restricted; staff only with the view permission. */
  private async canViewStudent(requester: { role: Role; userId: string; tenantId: string | null }, studentId: string): Promise<boolean> {
    const { role, userId, tenantId } = requester;
    if (role === 'student') return (await this.repo.studentIdForUser(userId)) === studentId;
    if (role === 'parent') {
      const ids = await this.repo.studentIdsForParent(tenantId!, userId);
      return ids.includes(studentId);
    }
    // staff/management/teacher
    return hasPermission(role, PERMISSIONS.SCHOOL_ATTENDANCE_VIEW);
  }

  private normalizeStatus(status: AttendanceStatus): string {
    const lower = status.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1); // DB stores 'Present', DTO exposes 'present'
  }

  private fanOutParentNotification(studentId: string, studentName: string, status: AttendanceStatus, date: string): void {
    enqueue('attendance.parentNotify', { studentId, studentName, status, date });
  }

  private toDTO(row: AttendanceRecordRow): AttendanceRecordDTO {
    const status = (row.attendance_status || 'present').toLowerCase() as AttendanceStatus;
    return {
      id: row.id,
      organisation_id: row.organisation_id,
      student_id: row.student_id,
      teacher_id: row.teacher_id,
      date: row.attendance_date,
      status,
      notes: row.remarks ?? null,
      created_at: row.created_at,
    };
  }
}

export const attendanceService = new AttendanceService(new AttendanceRepository());