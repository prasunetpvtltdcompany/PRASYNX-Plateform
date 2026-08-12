import { ForbiddenError, NotFoundError } from '../../shared/errors/errors';
import { requestDb } from '../../infrastructure/database/supabase';
import type { TimetableEntryDTO, TimetableEntryRow } from '@prasynx/types';

export interface TimetableRowWithNames extends TimetableEntryDTO {
  subjects: { name: string } | null;
  sections: { name: string } | null;
}

export class TimetableRepository {
  async assertClassInTenant(tenantId: string, classId: string): Promise<{ name: string }> {
    const { data, error } = await requestDb()
      .from('classes')
      .select('organisation_id,name')
      .eq('id', classId)
      .maybeSingle();
    if (error || !data) throw new NotFoundError('Class not found');
    if ((data as { organisation_id: string }).organisation_id !== tenantId) throw new ForbiddenError('Class does not belong to this school');
    return data as { name: string };
  }

  async assertSubjectInTenant(tenantId: string, subjectId: string): Promise<void> {
    const { data } = await requestDb().from('subjects').select('organisation_id').eq('id', subjectId).maybeSingle();
    if (!data) throw new NotFoundError('Subject not found');
    if ((data as { organisation_id: string }).organisation_id !== tenantId) throw new ForbiddenError('Subject does not belong to this school');
  }

  /** Replace the full weekly grid: delete existing rows for the class, insert the new batch. */
  async replaceClassEntries(
    tenantId: string,
    classId: string,
    rows: Array<Pick<TimetableEntryRow, 'organisation_id' | 'class_id' | 'subject_id' | 'day_of_week' | 'start_time' | 'end_time' | 'room'>>,
  ): Promise<TimetableEntryRow[]> {
    const client = requestDb();
    const { error: delErr } = await client.from('timetable_entries').delete().eq('organisation_id', tenantId).eq('class_id', classId);
    if (delErr) throw delErr;
    if (!rows.length) return [];
    const { data, error } = await client.from('timetable_entries').insert(rows).select();
    if (error) throw error;
    return (data as TimetableEntryRow[]) ?? [];
  }

  async deleteEntries(tenantId: string, entryIds: string[]): Promise<void> {
    const { error } = await requestDb().from('timetable_entries').delete().in('id', entryIds).eq('organisation_id', tenantId);
    if (error) throw error;
  }

  async listForClass(tenantId: string, classId: string): Promise<TimetableEntryDTO[]> {
    const { data, error } = await requestDb()
      .from('timetable_entries')
      .select('*, subjects(name), sections(name)')
      .eq('organisation_id', tenantId)
      .eq('class_id', classId)
      .order('day_of_week')
      .order('start_time');
    if (error) throw error;
    return ((data as TimetableRowWithNames[]) ?? []).map((r) => this.toDTO(r));
  }

  async listForTenant(tenantId: string): Promise<TimetableEntryDTO[]> {
    const { data, error } = await requestDb()
      .from('timetable_entries')
      .select('*, subjects(name), sections(name)')
      .eq('organisation_id', tenantId)
      .order('day_of_week')
      .order('start_time');
    if (error) throw error;
    return ((data as TimetableRowWithNames[]) ?? []).map((r) => this.toDTO(r));
  }

  async assertTeacherBelongsToTenant(tenantId: string, teacherId: string | null | undefined): Promise<void> {
    if (!teacherId) return;
    const { data } = await requestDb().from('teachers').select('organisation_id').eq('id', teacherId).maybeSingle();
    if (!data) throw new NotFoundError('Teacher not found');
    if ((data as { organisation_id: string }).organisation_id !== tenantId) throw new ForbiddenError('Teacher does not belong to this school');
  }

  private toDTO(row: TimetableRowWithNames): TimetableEntryDTO {
    return {
      id: row.id,
      organisation_id: row.organisation_id,
      class_id: row.class_id,
      subject_id: row.subject_id,
      teacher_id: row.teacher_id,
      day_of_week: row.day_of_week,
      start_time: row.start_time,
      end_time: row.end_time,
      room: row.room,
      subject_name: row.subjects?.name ?? null,
      section_name: row.sections?.name ?? null,
    };
  }
}