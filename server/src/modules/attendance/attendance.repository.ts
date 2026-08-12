import { ForbiddenError, NotFoundError } from '../../shared/errors/errors';
import { requestDb } from '../../infrastructure/database/supabase';
import type { AttendanceRecordRow, AttendanceStatus, ClassRosterStudent } from '@prasynx/types';

export interface StudentMeta {
  organisation_id: string;
  class_id: string | null;
  section_id: string | null;
  full_name: string;
}

export interface ClassStudent {
  id: string;
  full_name: string;
  class_id: string;
  section_id: string | null;
  organisation_id: string;
  roll_number: string | null;
}

/**
 * attendance.repository - the ONLY file in this module allowed to touch Supabase.
 * Uses the per-request RLS client (`requestDb`) so RLS + code-level tenant checks
 * both apply.
 */
export class AttendanceRepository {
  async getStudentMeta(studentId: string, tenantId: string): Promise<StudentMeta> {
    const { data, error } = await requestDb()
      .from('students')
      .select('organisation_id,class_id,section_id,full_name')
      .eq('id', studentId)
      .maybeSingle();
    if (error || !data) throw new NotFoundError('Student not found');
    this.ensureTenant((data as StudentMeta).organisation_id, tenantId);
    return data as StudentMeta;
  }

  async studentsInClass(classId: string, tenantId: string): Promise<ClassStudent[]> {
    const { data, error } = await requestDb()
      .from('students')
      .select('id,full_name,class_id,section_id,organisation_id,roll_number')
      .eq('class_id', classId)
      .eq('organisation_id', tenantId)
      .order('full_name');
    if (error) throw error;
    return (data as ClassStudent[]) ?? [];
  }

  /** Existing records for a set of students on a given day (subject-less rows). */
  async existingForDay(studentIds: string[], date: string): Promise<Array<{ id: string; student_id: string }>> {
    if (!studentIds.length) return [];
    const { data, error } = await requestDb()
      .from('attendance_records')
      .select('id,student_id')
      .in('student_id', studentIds)
      .eq('attendance_date', date)
      .is('subject_id', null);
    if (error) throw error;
    return (data as Array<{ id: string; student_id: string }>) ?? [];
  }

  async insertRecords(
    rows: Array<{
      organisation_id: string;
      student_id: string;
      class_id: string | null;
      section_id: string | null;
      teacher_id: string;
      attendance_date: string;
      attendance_status: string;
      remarks?: string | null;
    }>,
  ): Promise<AttendanceRecordRow[]> {
    if (!rows.length) return [];
    const { data, error } = await requestDb().from('attendance_records').insert(rows).select();
    if (error) throw error;
    return (data as AttendanceRecordRow[]) ?? [];
  }

  async updateRecord(
    id: string,
    fields: { attendance_status: string; remarks?: string | null; teacher_id: string },
  ): Promise<AttendanceRecordRow> {
    const { data, error } = await requestDb()
      .from('attendance_records')
      .update({ attendance_status: fields.attendance_status, remarks: fields.remarks ?? null, teacher_id: fields.teacher_id })
      .eq('id', id)
      .select()
      .single();
    if (error || !data) throw new NotFoundError('Attendance record could not be updated');
    return data as AttendanceRecordRow;
  }

  async recordsForStudent(studentId: string, from?: string, to?: string): Promise<AttendanceRecordRow[]> {
    let query = requestDb()
      .from('attendance_records')
      .select('id,organisation_id,student_id,teacher_id,subject_id,attendance_date,attendance_status,remarks,created_at')
      .eq('student_id', studentId);
    if (from) query = query.gte('attendance_date', from);
    if (to) query = query.lte('attendance_date', to);
    query = query.order('attendance_date', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return (data as AttendanceRecordRow[]) ?? [];
  }

  /** Resolve the student whose users row matches a userId (self-service: student). */
  async studentIdForUser(userId: string): Promise<string | null> {
    const { data } = await requestDb().from('students').select('id').eq('user_id', userId).maybeSingle();
    return (data as { id: string } | null)?.id ?? null;
  }

  /** Resolve student ids linked to a parent's users row (self-service: parent). */
  async studentIdsForParent(tenantId: string, parentId: string): Promise<string[]> {
    const { data } = await requestDb()
      .from('parent_student_links')
      .select('student_id')
      .eq('parent_id', parentId);
    return ((data as Array<{ student_id: string }>) ?? []).map((r) => r.student_id);
  }

  /**
   * Roster grid for a class + date: every student with their status that day
   * (null = unmarked). Also resolves the section/class names for the UI.
   */
  async rosterForClass(tenantId: string, classId: string, date: string): Promise<{ students: ClassRosterStudent[]; class_name: string | null }> {
    const students = await this.studentsInClass(classId, tenantId);

    const { data: records, error: recErr } = await requestDb()
      .from('attendance_records')
      .select('id,student_id,attendance_status,remarks')
      .eq('organisation_id', tenantId)
      .eq('attendance_date', date)
      .in('student_id', students.map((s) => s.id));
    if (recErr) throw recErr;

    const byStudent = new Map<string, { id: string; attendance_status: string; remarks: string | null }>();
    for (const r of records ?? []) {
      if (!byStudent.has(r.student_id)) byStudent.set(r.student_id, r);
    }

    const roster: ClassRosterStudent[] = students.map((s) => {
      const rec = byStudent.get(s.id);
      return {
        id: s.id,
        full_name: s.full_name,
        roll_number: s.roll_number,
        section_id: s.section_id,
        status: rec ? ((rec.attendance_status || 'Present').toLowerCase() as AttendanceStatus) : null,
        record_id: rec?.id ?? null,
        notes: rec?.remarks ?? null,
      };
    });

    const { data: classRow } = await requestDb().from('classes').select('name').eq('id', classId).eq('organisation_id', tenantId).maybeSingle();
    return { students: roster, class_name: (classRow as { name: string } | null)?.name ?? null };
  }

  /** Filtered, paginated attendance records with the student name embedded. */
  async records(
    tenantId: string,
    filters: {
      classId?: string;
      date?: string;
      from?: string;
      to?: string;
      status?: string;
      studentId?: string;
      page?: number;
      pageSize?: number;
    },
  ): Promise<{ data: AttendanceRecordRow[]; total: number }> {
    let query = requestDb()
      .from('attendance_records')
      .select(
        'id,organisation_id,student_id,class_id,section_id,teacher_id,subject_id,attendance_date,attendance_status,remarks,created_at,student:students(full_name,roll_number)',
        { count: 'exact' },
      )
      .eq('organisation_id', tenantId);

    if (filters.classId) query = query.eq('class_id', filters.classId);
    if (filters.date) query = query.eq('attendance_date', filters.date);
    if (filters.from) query = query.gte('attendance_date', filters.from);
    if (filters.to) query = query.lte('attendance_date', filters.to);
    if (filters.status) query = query.eq('attendance_status', filters.status.charAt(0).toUpperCase() + filters.status.slice(1));
    if (filters.studentId) query = query.eq('student_id', filters.studentId);

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 50;
    query = query.order('attendance_date', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data as unknown as AttendanceRecordRow[]) ?? [], total: count ?? 0 };
  }

  /** All students + attendance records for a date, used to build the daily per-class summary. */
  async dailySummaryRaw(tenantId: string, date: string): Promise<{ class_id: string | null; status: string }[]> {
    const { data, error } = await requestDb()
      .from('attendance_records')
      .select('class_id,attendance_status')
      .eq('organisation_id', tenantId)
      .eq('attendance_date', date);
    if (error) throw error;
    return ((data as Array<{ class_id: string | null; attendance_status: string }>) ?? []).map((r) => ({
      class_id: r.class_id,
      status: (r.attendance_status || 'Present').toLowerCase(),
    }));
  }

  /** Class name lookup for a set of class ids (used to label the daily summary). */
  async classNames(tenantId: string, ids: string[]): Promise<Record<string, string>> {
    if (!ids.length) return {};
    const { data, error } = await requestDb().from('classes').select('id,name').eq('organisation_id', tenantId).in('id', ids);
    if (error) throw error;
    return Object.fromEntries(((data as Array<{ id: string; name: string }>) ?? []).map((c) => [c.id, c.name]));
  }

  /** Total students per class (for the unmarked part of the daily summary). */
  async studentsByClass(tenantId: string): Promise<Record<string, number>> {
    const { data, error } = await requestDb()
      .from('students')
      .select('class_id')
      .eq('organisation_id', tenantId);
    if (error) throw error;
    const counts: Record<string, number> = {};
    for (const r of data ?? []) {
      if (!r.class_id) continue;
      counts[r.class_id] = (counts[r.class_id] ?? 0) + 1;
    }
    return counts;
  }

  private ensureTenant(rowOrg: string, claimTenant: string) {
    if (rowOrg !== claimTenant) throw new ForbiddenError('Student does not belong to this school');
  }
}