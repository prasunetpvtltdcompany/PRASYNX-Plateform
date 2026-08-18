import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIMESLOTS = ['07:30', '08:00', '08:45', '09:30', '10:15', '10:30', '11:15', '12:00', '12:45', '13:30', '14:15', '15:00', '15:45', '16:30', '17:00'];

export class TimetableService {
  async getDashboard(orgId: string) {
    const [entriesRes, teachersRes, roomsRes, conflictsRes] = await Promise.all([
      supabase.from('timetable_entries').select('*', { count: 'exact' }).eq('organisation_id', orgId).eq('is_active', true),
      supabase.from('staff_records').select('id', { count: 'exact' }).eq('organisation_id', orgId).eq('status', 'active'),
      supabase.from('timetable_entries').select('room').eq('organisation_id', orgId).not('room', 'is', null),
      supabase.from('schedule_conflicts').select('*', { count: 'exact' }).eq('organisation_id', orgId).eq('is_resolved', false),
    ]);

    const entries = entriesRes.data || [];
    const teachersAssigned = new Set(entries.map(e => e.teacher_id).filter(Boolean)).size;
    const roomsUsed = new Set((roomsRes.data || []).map(r => r.room).filter(Boolean)).size;
    const weeklySessions = entries.length;
    const totalTeachers = teachersRes.count || 0;
    const workload = totalTeachers > 0 ? Math.round((teachersAssigned / totalTeachers) * 100) : 0;

    const classHours: Record<string, number> = {};
    for (const e of entries) {
      if (e.class_id) {
        const h = this.hoursBetween(e.start_time, e.end_time);
        classHours[e.class_id] = (classHours[e.class_id] || 0) + h;
      }
    }
    const avgWeekly = entries.length > 0 ? Math.round(entries.length / 7) : 0;

    const dayDistribution = [0, 0, 0, 0, 0, 0, 0];
    for (const e of entries) dayDistribution[e.day_of_week] = (dayDistribution[e.day_of_week] || 0) + 1;

    return {
      summary: {
        totalEntries: entries.length,
        totalTeachersAssigned: teachersAssigned,
        totalTeachers,
        totalRoomsUsed: roomsUsed,
        weeklySessions,
        teacherWorkload: workload,
        avgWeeklySessions: avgWeekly,
        unresolvedConflicts: conflictsRes.count || 0,
        aiScore: this.computeAiScore(entries, conflictsRes.count || 0),
      },
      dayDistribution,
      workload,
      entriesByType: entries.reduce((acc: any, e: any) => {
        acc[e.entry_type || 'regular'] = (acc[e.entry_type || 'regular'] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  private computeAiScore(entries: any[], conflicts: number): number {
    if (entries.length === 0) return 100;
    let score = 100;
    score -= conflicts * 5;
    const teacherCount = new Set(entries.map(e => e.teacher_id)).size;
    if (teacherCount > 0) {
      const avg = entries.length / teacherCount;
      if (avg > 8) score -= 10;
      if (avg < 3) score -= 5;
    }
    return Math.max(0, Math.min(100, score));
  }

  private hoursBetween(start: string, end: string): number {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return ((eh * 60 + em) - (sh * 60 + sm)) / 60;
  }

  async getEntries(orgId: string, filters?: { class_id?: string; teacher_id?: string; day_of_week?: number; room?: string; entry_type?: string; term?: string }) {
    let query = supabase
      .from('timetable_entries')
      .select('*, teacher:staff_records(*), subject:subjects(*), class:classes!timetable_entries_class_id_fkey(*), substitute:substitute_teacher_id(id, full_name)')
      .eq('organisation_id', orgId)
      .eq('is_active', true)
      .order('day_of_week')
      .order('start_time');
    if (filters?.class_id) query = query.eq('class_id', filters.class_id);
    if (filters?.teacher_id) query = query.eq('teacher_id', filters.teacher_id);
    if (filters?.day_of_week != null) query = query.eq('day_of_week', filters.day_of_week);
    if (filters?.room) query = query.eq('room', filters.room);
    if (filters?.entry_type) query = query.eq('entry_type', filters.entry_type);
    if (filters?.term) query = query.eq('term', filters.term);
    const { data } = await query;
    return data || [];
  }

  async getEntryById(entryId: string) {
    const { data, error } = await supabase
      .from('timetable_entries')
      .select('*, teacher:staff_records(*), subject:subjects(*), class:classes!timetable_entries_class_id_fkey(*), substitute:substitute_teacher_id(id, full_name)')
      .eq('id', entryId)
      .single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async createEntry(orgId: string, data: any) {
    const conflicts = await this.detectConflicts(orgId, {
      teacher_id: data.teacher_id,
      day_of_week: data.day_of_week,
      start_time: data.start_time,
      end_time: data.end_time,
      room: data.room,
    });
    if (conflicts.length > 0) {
      await this.logConflicts(orgId, conflicts, data);
    }
    const entry = {
      organisation_id: orgId,
      class_id: data.class_id,
      subject_id: data.subject_id,
      teacher_id: data.teacher_id,
      day_of_week: data.day_of_week,
      start_time: data.start_time,
      end_time: data.end_time,
      room: data.room,
      period_number: data.period_number,
      color: data.color || this.generateColor(data.subject_id),
      entry_type: data.entry_type || 'regular',
      notes: data.notes,
      term: data.term,
      academic_year: data.academic_year,
    };
    const { data: result, error } = await supabase.from('timetable_entries').insert(entry).select().single();
    if (error) throw new BadRequestError(error.message);
    await this.auditLog(orgId, 'CREATE', result.id, {});
    return result;
  }

  async updateEntry(entryId: string, data: any) {
    const { data: result, error } = await supabase.from('timetable_entries').update(data).eq('id', entryId).select().single();
    if (error) throw new BadRequestError(error.message);
    await this.auditLog(result.organisation_id, 'UPDATE', entryId, data);
    return result;
  }

  async deleteEntry(entryId: string) {
    const { data: entry } = await supabase.from('timetable_entries').select('organisation_id').eq('id', entryId).single();
    const { error } = await supabase.from('timetable_entries').delete().eq('id', entryId);
    if (error) throw new BadRequestError(error.message);
    if (entry) await this.auditLog(entry.organisation_id, 'DELETE', entryId, {});
    return { success: true };
  }

  async bulkCreate(orgId: string, entries: any[]) {
    const withOrg = entries.map(e => ({ ...e, organisation_id: orgId }));
    const { data, error } = await supabase.from('timetable_entries').insert(withOrg).select();
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async swapPeriods(orgId: string, entryIdA: string, entryIdB: string) {
    const { data: a } = await supabase.from('timetable_entries').select('*').eq('id', entryIdA).single();
    const { data: b } = await supabase.from('timetable_entries').select('*').eq('id', entryIdB).single();
    if (!a || !b) throw new BadRequestError('Entry not found');
    const aTime = { start_time: a.start_time, end_time: a.end_time, day_of_week: a.day_of_week, room: a.room, teacher_id: a.teacher_id };
    const bTime = { start_time: b.start_time, end_time: b.end_time, day_of_week: b.day_of_week, room: b.room, teacher_id: b.teacher_id };
    await Promise.all([
      supabase.from('timetable_entries').update(bTime).eq('id', entryIdA),
      supabase.from('timetable_entries').update(aTime).eq('id', entryIdB),
    ]);
    await this.auditLog(orgId, 'SWAP', entryIdA, { swappedWith: entryIdB });
    return { success: true };
  }

  async moveEntry(entryId: string, targetDay: number, targetStart: string, targetEnd: string) {
    const { data, error } = await supabase
      .from('timetable_entries')
      .update({ day_of_week: targetDay, start_time: targetStart, end_time: targetEnd })
      .eq('id', entryId)
      .select()
      .single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async assignSubstitute(entryId: string, substituteTeacherId: string) {
    const { data, error } = await supabase
      .from('timetable_entries')
      .update({ substitute_teacher_id: substituteTeacherId })
      .eq('id', entryId)
      .select()
      .single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async copySchedule(orgId: string, fromClassId: string, toClassId: string) {
    const { data: source } = await supabase
      .from('timetable_entries')
      .select('*')
      .eq('organisation_id', orgId)
      .eq('class_id', fromClassId)
      .eq('is_active', true);
    if (!source || source.length === 0) throw new BadRequestError('No source entries found');
    const newEntries = source.map(e => ({
      organisation_id: orgId,
      class_id: toClassId,
      subject_id: e.subject_id,
      teacher_id: e.teacher_id,
      day_of_week: e.day_of_week,
      start_time: e.start_time,
      end_time: e.end_time,
      room: e.room,
      period_number: e.period_number,
      color: e.color,
      entry_type: e.entry_type,
      term: e.term,
      academic_year: e.academic_year,
    }));
    const { data, error } = await supabase.from('timetable_entries').insert(newEntries).select();
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async duplicateWeek(orgId: string, classId: string, sourceWeekStart: string, targetWeekStart: string) {
    const { data: source } = await supabase
      .from('timetable_entries')
      .select('*')
      .eq('organisation_id', orgId)
      .eq('class_id', classId)
      .eq('is_active', true);
    if (!source || source.length === 0) throw new BadRequestError('No entries found');
    const newEntries = source.map(e => ({
      ...e, id: undefined, created_at: undefined, updated_at: undefined,
    }));
    const { data, error } = await supabase.from('timetable_entries').insert(newEntries).select();
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async detectConflicts(orgId: string, data: { teacher_id?: string; day_of_week: number; start_time: string; end_time: string; room?: string; exclude_id?: string }) {
    const conflicts: any[] = [];
    if (data.teacher_id) {
      let q = supabase.from('timetable_entries')
        .select('id, class_id, start_time, end_time, teacher:staff_records(full_name), class:classes!timetable_entries_class_id_fkey(name)')
        .eq('organisation_id', orgId)
        .eq('teacher_id', data.teacher_id)
        .eq('day_of_week', data.day_of_week)
        .eq('is_active', true)
        .or(`start_time.lt.${data.end_time},end_time.gt.${data.start_time}`);
      if (data.exclude_id) q = q.neq('id', data.exclude_id);
      const { data: teacherConflicts } = await q;
      if (teacherConflicts && teacherConflicts.length > 0) {
        conflicts.push(...teacherConflicts.map(c => ({ type: 'teacher', entry: c, description: `Teacher ${(c.teacher as any)?.full_name || ''} already scheduled` })));
      }
    }
    if (data.room) {
      let q = supabase.from('timetable_entries')
        .select('id, class_id, start_time, end_time, class:classes!timetable_entries_class_id_fkey(name)')
        .eq('organisation_id', orgId)
        .eq('room', data.room)
        .eq('day_of_week', data.day_of_week)
        .eq('is_active', true)
        .or(`start_time.lt.${data.end_time},end_time.gt.${data.start_time}`);
      if (data.exclude_id) q = q.neq('id', data.exclude_id);
      const { data: roomConflicts } = await q;
      if (roomConflicts && roomConflicts.length > 0) {
        conflicts.push(...roomConflicts.map(c => ({ type: 'room', entry: c, description: `Room ${data.room} already booked` })));
      }
    }
    return conflicts;
  }

  private async logConflicts(orgId: string, conflicts: any[], data: any) {
    for (const c of conflicts) {
      await supabase.from('schedule_conflicts').insert({
        organisation_id: orgId,
        conflict_type: c.type === 'teacher' ? 'teacher' : 'room',
        entry_id_a: c.entry?.id,
        description: c.description,
        severity: 'warning',
      });
    }
  }

  async getConflicts(orgId: string) {
    const { data } = await supabase
      .from('schedule_conflicts')
      .select('*, entry_a:entry_id_a(id, class:classes!timetable_entries_class_id_fkey(name), subject:subjects(name)), entry_b:entry_id_b(id, class:classes!timetable_entries_class_id_fkey(name), subject:subjects(name))')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false })
      .limit(50);
    return data || [];
  }

  async resolveConflict(conflictId: string) {
    const { data, error } = await supabase
      .from('schedule_conflicts')
      .update({ is_resolved: true, resolved_at: new Date().toISOString() })
      .eq('id', conflictId)
      .select()
      .single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async getTeacherAvailability(orgId: string, teacherId?: string) {
    let q = supabase.from('teacher_availability').select('*, teacher:staff_records(full_name)').eq('organisation_id', orgId);
    if (teacherId) q = q.eq('teacher_id', teacherId);
    const { data } = await q.order('day_of_week').order('start_time');
    return data || [];
  }

  async setTeacherAvailability(orgId: string, data: any) {
    const record = {
      organisation_id: orgId,
      teacher_id: data.teacher_id,
      day_of_week: data.day_of_week,
      start_time: data.start_time,
      end_time: data.end_time,
      is_available: data.is_available ?? true,
      reason: data.reason,
    };
    const { data: result, error } = await supabase.from('teacher_availability').upsert(record, { onConflict: 'teacher_id,day_of_week,start_time' }).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async getRoomSchedule(orgId: string, room?: string) {
    let q = supabase.from('room_schedules').select('*').eq('organisation_id', orgId);
    if (room) q = q.eq('room', room);
    const { data } = await q.order('day_of_week').order('start_time');
    return data || [];
  }

  async bookRoom(orgId: string, data: any) {
    const booking = {
      organisation_id: orgId,
      room: data.room,
      day_of_week: data.day_of_week,
      start_time: data.start_time,
      end_time: data.end_time,
      booked_by: data.booked_by,
      booking_type: data.booking_type || 'timetable',
      notes: data.notes,
    };
    const { data: result, error } = await supabase.from('room_schedules').insert(booking).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async getTemplates(orgId: string) {
    const { data } = await supabase.from('timetable_templates').select('*').eq('organisation_id', orgId).order('created_at', { ascending: false });
    return data || [];
  }

  async saveTemplate(orgId: string, data: any) {
    const template = {
      organisation_id: orgId,
      name: data.name,
      description: data.description,
      template_data: data.template_data || [],
      is_default: data.is_default || false,
      created_by: data.created_by,
    };
    const { data: result, error } = await supabase.from('timetable_templates').insert(template).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async applyTemplate(orgId: string, templateId: string, classId: string) {
    const { data: template } = await supabase.from('timetable_templates').select('*').eq('id', templateId).single();
    if (!template) throw new BadRequestError('Template not found');
    const entries = (template.template_data || []).map((e: any) => ({
      organisation_id: orgId,
      class_id: classId,
      subject_id: e.subject_id,
      teacher_id: e.teacher_id,
      day_of_week: e.day_of_week,
      start_time: e.start_time,
      end_time: e.end_time,
      room: e.room,
      period_number: e.period_number,
      entry_type: e.entry_type || 'regular',
    }));
    const { data, error } = await supabase.from('timetable_entries').insert(entries).select();
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getAcademicCalendar(orgId: string, year?: number) {
    let q = supabase.from('academic_calendar').select('*').eq('organisation_id', orgId);
    if (year) {
      q = q.gte('start_date', `${year}-01-01`).lte('start_date', `${year}-12-31`);
    }
    const { data } = await q.order('start_date');
    return data || [];
  }

  async createCalendarEvent(orgId: string, data: any) {
    const event = {
      organisation_id: orgId,
      event_type: data.event_type,
      title: data.title,
      description: data.description,
      start_date: data.start_date,
      end_date: data.end_date,
      is_holiday: data.is_holiday || false,
      affects_schedule: data.affects_schedule || false,
      color: data.color || '#7C3AED',
    };
    const { data: result, error } = await supabase.from('academic_calendar').insert(event).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  // ==================== AI GENERATION ====================
  async generateTimetable(orgId: string, classId: string, term: string, academicYear: string) {
    const [subjectsRes, teachersRes, classRes] = await Promise.all([
      supabase.from('class_subject_teacher_map').select('*, subject:subject_id(*), teacher:teacher_id(*)').eq('class_id', classId),
      supabase.from('staff_records').select('id, full_name, specialization, max_periods_per_day').eq('organisation_id', orgId).eq('status', 'active'),
      supabase.from('classes').select('*').eq('id', classId).single(),
    ]);

    const subjects = subjectsRes.data || [];
    const teachers = teachersRes.data || [];
    const cls = classRes.data;

    if (!cls || subjects.length === 0) throw new BadRequestError('No subjects configured for this class');

    await supabase.from('timetable_entries').delete().eq('organisation_id', orgId).eq('class_id', classId).eq('term', term);

    const periods = [
      { start: '08:00', end: '08:45', num: 1 },
      { start: '08:45', end: '09:30', num: 2 },
      { start: '09:30', end: '10:15', num: 3 },
      { start: '10:30', end: '11:15', num: 4 },
      { start: '11:15', end: '12:00', num: 5 },
      { start: '12:45', end: '13:30', num: 6 },
      { start: '13:30', end: '14:15', num: 7 },
      { start: '14:15', end: '15:00', num: 8 },
    ];

    const days = [1, 2, 3, 4, 5];
    const teacherPeriodCount: Record<string, number> = {};
    const subjectFrequency: Record<string, number> = {};
    const entries: any[] = [];
    const colors = ['#7C3AED', '#22C55E', '#F59E0B', '#3B82F6', '#EC4899', '#14B8A6', '#EF4444', '#A855F7'];

    const sortedSubjects = [...subjects].sort((a: any, b: any) => {
      const aCount = subjectFrequency[a.subject_id] || 0;
      const bCount = subjectFrequency[b.subject_id] || 0;
      return aCount - bCount;
    });

    let periodIdx = 0;
    for (const day of days) {
      for (const period of periods) {
        const subjIdx = periodIdx % sortedSubjects.length;
        const mapping = sortedSubjects[subjIdx] as any;
        if (!mapping) continue;

        const subject = mapping.subject;
        const teacher = mapping.teacher || teachers[periodIdx % teachers.length];
        if (!teacher) continue;

        const tid = teacher.id;
        teacherPeriodCount[tid] = (teacherPeriodCount[tid] || 0) + 1;
        subjectFrequency[mapping.subject_id] = (subjectFrequency[mapping.subject_id] || 0) + 1;

        entries.push({
          organisation_id: orgId,
          class_id: classId,
          subject_id: subject?.id || mapping.subject_id,
          teacher_id: tid,
          day_of_week: day,
          start_time: period.start,
          end_time: period.end,
          period_number: period.num,
          color: colors[Math.floor(Math.random() * colors.length)],
          entry_type: 'regular',
          term,
          academic_year: academicYear,
        });
        periodIdx++;
      }
    }

    const { data, error } = await supabase.from('timetable_entries').insert(entries).select();
    if (error) throw new BadRequestError(error.message);

    return {
      success: true,
      generated: entries.length,
      subjectsUsed: Object.keys(subjectFrequency).length,
      teachersUsed: Object.keys(teacherPeriodCount).length,
      entries: data || [],
    };
  }

  async getAnalytics(orgId: string) {
    const entries = await this.getEntries(orgId);
    const teachers: Record<string, number> = {};
    const rooms: Record<string, number> = {};
    const subjects: Record<string, number> = {};
    const daily: number[] = [0, 0, 0, 0, 0, 0, 0];

    for (const e of entries) {
      teachers[e.teacher_id] = (teachers[e.teacher_id] || 0) + 1;
      if (e.room) rooms[e.room] = (rooms[e.room] || 0) + 1;
      subjects[e.subject_id] = (subjects[e.subject_id] || 0) + 1;
      daily[e.day_of_week] = (daily[e.day_of_week] || 0) + 1;
    }

    return {
      teacherWorkload: Object.entries(teachers).map(([id, count]) => ({ id, count })),
      roomUtilization: Object.entries(rooms).map(([room, count]) => ({ room, count })),
      subjectDistribution: Object.entries(subjects).map(([id, count]) => ({ id, count })),
      dailyDistribution: daily.map((count, day) => ({ day: DAYS[day], count })),
      totalEntries: entries.length,
      uniqueTeachers: Object.keys(teachers).length,
      uniqueRooms: Object.keys(rooms).length,
      uniqueSubjects: Object.keys(subjects).length,
    };
  }

  async getAiSuggestions(orgId: string) {
    const entries = await this.getEntries(orgId);
    const conflicts = await this.getConflicts(orgId);
    const suggestions: any[] = [];

    const teacherCount: Record<string, any[]> = {};
    for (const e of entries) {
      if (!teacherCount[e.teacher_id]) teacherCount[e.teacher_id] = [];
      teacherCount[e.teacher_id].push(e);
    }

    for (const [tid, tEntries] of Object.entries(teacherCount)) {
      if (tEntries.length > 8) {
        const teacher = tEntries[0].teacher;
        suggestions.push({ type: 'workload', severity: 'warning', title: 'High Teacher Workload', message: `${teacher?.full_name || 'Teacher'} has ${tEntries.length} periods per week. Consider redistributing.` });
      }
    }

    if (conflicts.length > 0) {
      suggestions.push({ type: 'conflict', severity: 'critical', title: 'Schedule Conflicts Detected', message: `${conflicts.length} unresolved conflicts require attention.`, count: conflicts.length });
    }

    const rooms = [...new Set(entries.map(e => e.room).filter(Boolean))];
    const roomUsage: Record<string, number> = {};
    for (const e of entries) { if (e.room) roomUsage[e.room] = (roomUsage[e.room] || 0) + 1; }
    for (const [room, count] of Object.entries(roomUsage)) {
      if (count < 3) suggestions.push({ type: 'utilization', severity: 'info', title: 'Underutilized Room', message: `Room ${room} is used only ${count} times weekly.` });
      if (count > 15) suggestions.push({ type: 'utilization', severity: 'warning', title: 'Overutilized Room', message: `Room ${room} has ${count} bookings. Consider alternative rooms.` });
    }

    return suggestions;
  }

  private async auditLog(orgId: string, action: string, entryId: string, changes: any) {
    await supabase.from('timetable_audit_log').insert({
      organisation_id: orgId,
      action,
      entry_id: entryId,
      changes,
    });
  }

  private generateColor(subjectId: string): string {
    const colors = ['#7C3AED', '#22C55E', '#F59E0B', '#3B82F6', '#EC4899', '#14B8A6', '#EF4444', '#A855F7'];
    return colors[Math.abs(subjectId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % colors.length];
  }

  async getTeachersList(orgId: string) {
    const { data } = await supabase.from('staff_records').select('id, full_name, email, phone, specialization').eq('organisation_id', orgId).eq('status', 'active');
    return data || [];
  }

  async getClassesList(orgId: string) {
    const { data } = await supabase.from('classes').select('id, name').eq('organisation_id', orgId).eq('status', 'active');
    return data || [];
  }

  async getSubjectsList(orgId: string) {
    const { data } = await supabase.from('subjects').select('id, name, code').eq('organisation_id', orgId);
    return data || [];
  }
}

export const timetableService = new TimetableService();
