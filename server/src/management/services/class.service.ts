import { supabase } from '../config/database';
import { AppError, BadRequestError, ConflictError, NotFoundError } from '../utils/errors';

// Hard cap on students per class/section (enforced on assignment).
export const MAX_SECTION_STUDENTS = 35;

export class ClassService {
  async getDashboard(orgId: string) {
    const [classRes, studentsRes, roomsRes, sectionsRes] = await Promise.all([
      supabase.from('classes').select('id, status').eq('organisation_id', orgId),
      supabase.from('students').select('id, status').eq('organisation_id', orgId),
      supabase.from('classrooms').select('id, status').eq('organisation_id', orgId),
      supabase.from('sections').select('id, status').eq('organisation_id', orgId),
    ]);
    return {
      totalClasses: (classRes.data || []).filter((c: any) => c.status === 'active').length,
      totalStudents: (studentsRes.data || []).filter((s: any) => s.status === 'active').length,
      totalRooms: (roomsRes.data || []).filter((r: any) => r.status === 'active').length,
      archivedClasses: (classRes.data || []).filter((c: any) => c.status === 'archived').length,
      totalSections: (sectionsRes.data || []).filter((s: any) => s.status === 'active').length,
      occupancyRate: 0,
      attendanceRate: 0,
      performanceAvg: 0,
    };
  }

  // Maps a class row to the API shape: name -> class_name.
  private mapClassRow(c: any, sections: any[] = [], studentCount = 0) {
    const { name, ...rest } = c;
    return { ...rest, class_name: name, student_count: studentCount, sections };
  }

  private mapSectionRow(s: any, studentCount = 0) {
    return { ...s, student_count: studentCount };
  }

  // ── Target resolution ─────────────────────────────────────
  // A "target" is either a class id (students mapped directly, section_id NULL)
  // or a section id (students mapped with section_id set).
  private async resolveTarget(targetId: string): Promise<{ type: 'class' | 'section'; id: string; classId: string; capacity: number }> {
    const secRes = await supabase.from('sections').select('id, class_id, capacity').eq('id', targetId).maybeSingle();
    if (secRes.error) throw new BadRequestError(secRes.error.message);
    if (secRes.data) {
      return { type: 'section', id: secRes.data.id, classId: secRes.data.class_id, capacity: secRes.data.capacity ?? MAX_SECTION_STUDENTS };
    }
    const clsRes = await supabase.from('classes').select('id, capacity').eq('id', targetId).maybeSingle();
    if (clsRes.error) throw new BadRequestError(clsRes.error.message);
    if (clsRes.data) {
      return { type: 'class', id: clsRes.data.id, classId: clsRes.data.id, capacity: clsRes.data.capacity ?? MAX_SECTION_STUDENTS };
    }
    throw new NotFoundError('Class or section not found');
  }

  // ── Student counting ──────────────────────────────────────
  // Direct class students: class_id set, section_id NULL.
  // Section students: section_id set.
  private async countClassStudents(classIds: string[]) {
    const map = new Map<string, number>();
    if (classIds.length === 0) return map;
    const { data, error } = await supabase
      .from('class_student_map')
      .select('class_id')
      .is('section_id', null)
      .in('class_id', classIds);
    if (error) throw new BadRequestError(error.message);
    for (const row of data || []) map.set(row.class_id, (map.get(row.class_id) || 0) + 1);
    return map;
  }

  private async countSectionStudents(sectionIds: string[]) {
    const map = new Map<string, number>();
    if (sectionIds.length === 0) return map;
    const { data, error } = await supabase
      .from('class_student_map')
      .select('section_id')
      .not('section_id', 'is', null)
      .in('section_id', sectionIds);
    if (error) throw new BadRequestError(error.message);
    for (const row of data || []) map.set(row.section_id, (map.get(row.section_id) || 0) + 1);
    return map;
  }

  private async countCurrent(target: { type: 'class' | 'section'; id: string }) {
    if (target.type === 'section') {
      const { data } = await supabase.from('class_student_map').select('id').eq('section_id', target.id);
      return (data || []).length;
    }
    const { data } = await supabase.from('class_student_map').select('id').eq('class_id', target.id).is('section_id', null);
    return (data || []).length;
  }

  // Picks the section a student should be assigned to when a class has sections:
  // the least-filled section first, tie-broken by name (A → B → C). Returns null
  // when the class has no (active) sections, meaning students go directly to the class.
  private async pickSectionForClass(classId: string) {
    const { data, error } = await supabase
      .from('sections')
      .select('id, name, capacity')
      .eq('class_id', classId)
      .eq('status', 'active')
      .order('name', { ascending: true });
    if (error) throw new BadRequestError(error.message);
    if (!data || data.length === 0) return null;
    const counts = await this.countSectionStudents(data.map((s: any) => s.id));
    // Fill A first — move to the next section only when the current one is full.
    const sorted = [...data].sort((a: any, b: any) =>
      (a.name || '').localeCompare(b.name || '', undefined, { numeric: true }),
    );
    const firstAvailable = sorted.find((s: any) => (counts.get(s.id) || 0) < (s.capacity ?? MAX_SECTION_STUDENTS));
    if (firstAvailable) return firstAvailable;
    // All sections are full — spread overflow onto the least-filled section.
    return [...sorted].sort((a: any, b: any) => (counts.get(a.id) || 0) - (counts.get(b.id) || 0))[0];
  }

  // ── Classes ───────────────────────────────────────────────
  async getClasses(orgId: string) {
    const [classesRes, sectionsRes] = await Promise.all([
      supabase.from('classes').select('*').eq('organisation_id', orgId).order('name', { ascending: true }),
      supabase.from('sections').select('*').eq('organisation_id', orgId).order('name', { ascending: true }),
    ]);
    if (classesRes.error) throw new BadRequestError(classesRes.error.message);
    if (sectionsRes.error) throw new BadRequestError(sectionsRes.error.message);
    const classes = classesRes.data || [];
    const sections = sectionsRes.data || [];
    const classCounts = await this.countClassStudents(classes.map((c: any) => c.id));
    const sectionCounts = await this.countSectionStudents(sections.map((s: any) => s.id));
    return classes.map((c: any) => {
      const childSections = sections
        .filter((s: any) => s.class_id === c.id)
        .map((s: any) => this.mapSectionRow(s, sectionCounts.get(s.id) || 0));
      return this.mapClassRow(c, childSections, classCounts.get(c.id) || 0);
    });
  }

  async getClassById(classId: string) {
    const { data, error } = await supabase.from('classes').select('*').eq('id', classId).single();
    if (error) throw new NotFoundError('Class not found');
    const { data: sections, error: secErr } = await supabase
      .from('sections').select('*').eq('class_id', classId).order('name');
    if (secErr) throw new BadRequestError(secErr.message);
    const sectionCounts = await this.countSectionStudents((sections || []).map((s: any) => s.id));
    const childSections = (sections || []).map((s: any) => this.mapSectionRow(s, sectionCounts.get(s.id) || 0));
    const classCount = (await this.countClassStudents([classId])).get(classId) || 0;
    return this.mapClassRow(data, childSections, classCount);
  }

  async createClass(orgId: string, data: any) {
    const { name, capacity, room_number, status } = data || {};
    if (!name) throw new BadRequestError('Class name is required');
    const { data: cls, error } = await supabase.from('classes').insert({
      name,
      capacity: capacity ?? MAX_SECTION_STUDENTS,
      room_number: room_number ?? null,
      status: status ?? 'active',
      organisation_id: orgId,
    }).select().single();
    if (error) throw new BadRequestError(error.message);
    return this.mapClassRow(cls);
  }

  async updateClass(classId: string, data: any) {
    const { name, capacity, room_number, status } = data || {};
    const patch: Record<string, any> = {};
    if (name !== undefined) patch.name = name;
    if (capacity !== undefined) patch.capacity = capacity;
    if (room_number !== undefined) patch.room_number = room_number;
    if (status !== undefined) patch.status = status;
    const { data: cls, error } = await supabase.from('classes').update(patch).eq('id', classId).select().single();
    if (error) throw new BadRequestError(error.message);
    return this.mapClassRow(cls);
  }

  async deleteClass(classId: string) {
    // Deleting a class cascades to its sections (sections.class_id FK CASCADE).
    // First unassign every student mapped to the class (directly or via its
    // sections) so the deletion is reflected across students/class_student_map.
    const { data: sections } = await supabase.from('sections').select('id').eq('class_id', classId);
    const sectionIds = (sections || []).map((s: any) => s.id);

    // All students of this class: direct mappings + section mappings.
    let classQuery = supabase.from('class_student_map').select('student_id').eq('class_id', classId);
    const { data: directMaps } = await classQuery;
    let sectionMaps: any[] = [];
    if (sectionIds.length > 0) {
      const { data } = await supabase.from('class_student_map').select('student_id').in('section_id', sectionIds);
      sectionMaps = data || [];
    }
    const studentIds = [...new Set([
      ...(directMaps || []).map((m: any) => m.student_id),
      ...sectionMaps.map((m: any) => m.student_id),
    ])];

    // 1. Unassign students (reflect in students table).
    if (studentIds.length > 0) {
      await supabase
        .from('students')
        .update({ class_id: null, section_id: null })
        .in('id', studentIds);
    }

    // 2. Remove mapping rows.
    await supabase.from('class_student_map').delete().eq('class_id', classId);
    if (sectionIds.length > 0) {
      await supabase.from('class_student_map').delete().in('section_id', sectionIds);
    }

    // 3. Clean promotion_history references (class or its sections) — these are
    //    NOT NULL FKs so they must be removed before the class itself is deleted.
    await supabase.from('promotion_history').delete().or(
      sectionIds.length > 0
        ? `from_class_id.eq.${classId},to_class_id.eq.${classId},from_section_id.in.(${sectionIds.join(',')}),to_section_id.in.(${sectionIds.join(',')})`
        : `from_class_id.eq.${classId},to_class_id.eq.${classId}`
    );

    // 4. Delete class (cascades sections).
    const { error } = await supabase.from('classes').delete().eq('id', classId);
    if (error) throw new BadRequestError(error.message);
    return { message: 'Class deleted', unassigned_students: studentIds.length };
  }

  async archiveClass(classId: string) {
    const { data, error } = await supabase.from('classes').update({ status: 'archived' }).eq('id', classId).select().single();
    if (error) throw new BadRequestError(error.message);
    return this.mapClassRow(data);
  }

  // ── Sections ──────────────────────────────────────────────
  async getSections(classId: string) {
    const { data, error } = await supabase.from('sections').select('*').eq('class_id', classId).order('name');
    if (error) throw new BadRequestError(error.message);
    const counts = await this.countSectionStudents((data || []).map((s: any) => s.id));
    return (data || []).map((s: any) => this.mapSectionRow(s, counts.get(s.id) || 0));
  }

  async createSection(classId: string, data: any) {
    const { name, capacity, room_number, status } = data || {};
    if (!name) throw new BadRequestError('Section name is required');
    const parent = await this.getClassById(classId);
    const { data: sec, error } = await supabase.from('sections').insert({
      name,
      capacity: capacity ?? MAX_SECTION_STUDENTS,
      room_number: room_number ?? null,
      status: status ?? 'active',
      organisation_id: parent.organisation_id,
      class_id: classId,
    }).select().single();
    if (error) throw new BadRequestError(error.message);
    return this.mapSectionRow(sec);
  }

  async updateSection(sectionId: string, data: any) {
    const { name, capacity, room_number, status } = data || {};
    const patch: Record<string, any> = {};
    if (name !== undefined) patch.name = name;
    if (capacity !== undefined) patch.capacity = capacity;
    if (room_number !== undefined) patch.room_number = room_number;
    if (status !== undefined) patch.status = status;
    const { data: sec, error } = await supabase.from('sections').update(patch).eq('id', sectionId).select().single();
    if (error) throw new BadRequestError(error.message);
    return this.mapSectionRow(sec);
  }

  async deleteSection(sectionId: string) {
    const { data: sec, error: fetchErr } = await supabase.from('sections').select('id').eq('id', sectionId).single();
    if (fetchErr) throw new NotFoundError('Section not found');

    // Unassign every student in this section (class + section cleared).
    const { data: maps } = await supabase.from('class_student_map').select('student_id').eq('section_id', sectionId);
    const studentIds = (maps || []).map((m: any) => m.student_id);
    if (studentIds.length > 0) {
      await supabase.from('students').update({ class_id: null, section_id: null }).in('id', studentIds);
    }

    // Remove mapping rows + promotion_history references to the section.
    await supabase.from('class_student_map').delete().eq('section_id', sectionId);
    await supabase.from('promotion_history').delete().or(`from_section_id.eq.${sectionId},to_section_id.eq.${sectionId}`);

    const { error } = await supabase.from('sections').delete().eq('id', sectionId);
    if (error) throw new BadRequestError(error.message);
    return { message: 'Section deleted', unassigned_students: studentIds.length };
  }

  // ── Student mapping (class_student_map) ───────────────────
  async getClassStudents(targetId: string) {
    const target = await this.resolveTarget(targetId);
    let query = supabase.from('class_student_map').select('*, student:students(*)');
    if (target.type === 'section') {
      query = query.eq('section_id', target.id);
    } else {
      query = query.eq('class_id', target.id).is('section_id', null);
    }
    const { data, error } = await query;
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getClassStudentsWithClassName(targetId: string) {
    const target = await this.resolveTarget(targetId);
    const rows = await this.getClassStudents(targetId);
    let className = '';
    if (target.type === 'section') {
      const { data: cls } = await supabase.from('classes').select('name').eq('id', target.classId).single();
      const { data: sec } = await supabase.from('sections').select('name').eq('id', target.id).single();
      className = cls?.name ? `${cls.name} - ${sec?.name || ''}`.trim() : (sec?.name || '');
    } else {
      const { data: cls } = await supabase.from('classes').select('name').eq('id', target.id).single();
      className = cls?.name || '';
    }
    return { class_id: target.id, class_name: className, is_section: target.type === 'section', students: rows };
  }

  private async assertCapacity(targetId: string, extra: number) {
    const target = await this.resolveTarget(targetId);
    const count = await this.countCurrent(target);
    const cap = target.capacity;
    if (count + extra > cap) {
      throw new ConflictError(`Section capacity reached (${count}/${cap}). Maximum ${cap} students per section.`);
    }
  }

  // Finds where a student is currently assigned (class + optional section).
  private async findStudentAssignment(studentId: string) {
    const { data, error } = await supabase
      .from('class_student_map')
      .select('class_id, section_id')
      .eq('student_id', studentId);
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  // Resolves a target to (classId, sectionId|null) key used for "same place" checks.
  private async targetKey(targetId: string) {
    const target = await this.resolveTarget(targetId);
    return { classId: target.classId, sectionId: target.type === 'section' ? target.id : null };
  }

  // Keeps students.class_id / section_id in sync with class_student_map so all
  // modules that read class/section off the student row stay consistent.
  private async syncStudentRow(studentId: string, classId: string | null, sectionId: string | null) {
    const { error } = await supabase
      .from('students')
      .update({ class_id: classId, section_id: sectionId })
      .eq('id', studentId);
    if (error) throw new BadRequestError(error.message);
  }

  private async assertNotAssignedElsewhere(studentId: string, targetId: string, confirm: boolean) {
    const existing = await this.findStudentAssignment(studentId);
    if (existing.length === 0) return existing;
    const key = await this.targetKey(targetId);
    // Already assigned to the exact target → treat as idempotent (skip guard).
    const samePlace = existing.some((e: any) => e.class_id === key.classId && e.section_id === key.sectionId);
    if (samePlace) return existing;

    // Assigned somewhere else → require confirmation to move.
    if (!confirm) {
      const { data: names } = await supabase
        .from('class_student_map')
        .select('class_id, section_id, class:classes!class_student_map_class_id_fkey(name), section:sections!class_student_map_section_id_fkey(name)')
        .eq('student_id', studentId);
      const current = (names || []).map((n: any) => ({
        class_name: n.class?.name || 'Unknown class',
        section_name: n.section?.name || null,
      }));
      throw new AppError(
        `Student is already assigned to another class${current[0]?.section_name ? ` section ${current[0].section_name}` : ''}. Re-assignment requires confirmation.`,
        409,
        'REASSIGN_REQUIRES_CONFIRM',
        { current_assignments: current },
      );
    }

    // Confirmed → remove previous mappings so the student moves, not duplicates.
    await supabase.from('class_student_map').delete().eq('student_id', studentId);
    return existing;
  }

  async assignStudent(targetId: string, studentId: string, confirm = false): Promise<any> {
    const target = await this.resolveTarget(targetId);
    // If the target is a class that has sections, students must go into a section
    // (A first, then B, ...) — never directly into the class.
    if (target.type === 'class') {
      const sec = await this.pickSectionForClass(targetId);
      if (sec) {
        // Already assigned anywhere in this class → idempotent no-op.
        const inClass = await this.findStudentAssignment(studentId);
        if (inClass.some((e: any) => e.class_id === targetId)) {
          const { data: row } = await supabase
            .from('class_student_map')
            .select('*')
            .eq('class_id', targetId)
            .eq('student_id', studentId)
            .maybeSingle();
          return row || { class_id: targetId, section_id: null, student_id: studentId, already_assigned: true };
        }
        return this.assignStudent(sec.id, studentId, confirm);
      }
    }
    // Already in the exact target → idempotent no-op (unique class_id+student_id).
    const key = await this.targetKey(targetId);
    const existing = await this.findStudentAssignment(studentId);
    const samePlace = existing.some((e: any) => e.class_id === key.classId && e.section_id === key.sectionId);
    if (samePlace) {
      let q = supabase.from('class_student_map').select('*').eq('class_id', key.classId).eq('student_id', studentId);
      if (key.sectionId) q = q.eq('section_id', key.sectionId); else q = q.is('section_id', null);
      const { data: existingRow } = await q.maybeSingle();
      return existingRow || { class_id: key.classId, section_id: key.sectionId, student_id: studentId, already_assigned: true };
    }
    await this.assertNotAssignedElsewhere(studentId, targetId, confirm);
    await this.assertCapacity(targetId, 1);
    const { data, error } = await supabase
      .from('class_student_map')
      .insert({
        class_id: target.classId,
        section_id: target.type === 'section' ? target.id : null,
        student_id: studentId,
      })
      .select().single();
    if (error) throw new BadRequestError(error.message);
    await this.syncStudentRow(studentId, target.classId, target.type === 'section' ? target.id : null);
    return data;
  }

  async assignStudentsBulk(targetId: string, studentIds: string[], confirm = false) {
    if (!studentIds?.length) throw new BadRequestError('student_ids is required');
    const target = await this.resolveTarget(targetId);
    // If the target is a class that has sections, distribute students across the
    // sections (fill A first, then B, ...) instead of assigning directly to the class.
    if (target.type === 'class') {
      const { data: sections, error } = await supabase
        .from('sections')
        .select('id, name, capacity')
        .eq('class_id', targetId)
        .eq('status', 'active')
        .order('name', { ascending: true });
      if (error) throw new BadRequestError(error.message);
      if (sections && sections.length > 0) {
        return this.assignBulkToSections(targetId, sections, studentIds, confirm);
      }
    }
    const cap = target.capacity;
    const current = await this.countCurrent(target);

    // Existing assignments are skipped (idempotent), not counted against cap.
    let existingQuery = supabase.from('class_student_map').select('student_id').in('student_id', studentIds);
    if (target.type === 'section') {
      existingQuery = existingQuery.eq('section_id', target.id);
    } else {
      existingQuery = existingQuery.eq('class_id', target.id).is('section_id', null);
    }
    const { data: existing, error: exErr } = await existingQuery;
    if (exErr) throw new BadRequestError(exErr.message);
    const existingSet = new Set((existing || []).map((e: any) => e.student_id));
    const freshIds = studentIds.filter((id: string) => !existingSet.has(id));

    // Students already assigned to another class/section must be confirmed.
    const elsewhereIds: string[] = [];
    if (freshIds.length > 0) {
      const { data: elsewhere } = await supabase
        .from('class_student_map')
        .select('student_id')
        .in('student_id', freshIds);
      const elsewhereSet = new Set((elsewhere || []).map((e: any) => e.student_id));
      for (const id of freshIds) {
        if (elsewhereSet.has(id)) elsewhereIds.push(id);
      }
    }
    if (elsewhereIds.length > 0 && !confirm) {
      const { data: names } = await supabase
        .from('class_student_map')
        .select('student_id, class:classes!class_student_map_class_id_fkey(name), section:sections!class_student_map_section_id_fkey(name)')
        .in('student_id', elsewhereIds);
      const current = (names || []).map((n: any) => ({
        student_id: n.student_id,
        class_name: n.class?.name || 'Unknown class',
        section_name: n.section?.name || null,
      }));
      throw new AppError(
        `${elsewhereIds.length} student(s) are already assigned to another class/section. Re-assignment requires confirmation.`,
        409,
        'REASSIGN_REQUIRES_CONFIRM',
        { current_assignments: current },
      );
    }

    const available = Math.max(0, cap - current);
    const assignedIds = freshIds.slice(0, available);
    const skipped = freshIds.length - assignedIds.length;

    let assigned = 0;
    if (assignedIds.length > 0) {
      if (confirm && elsewhereIds.length > 0) {
        // Move confirmed students from their previous class/section first.
        await supabase.from('class_student_map').delete().in('student_id', assignedIds);
      }
      const records = assignedIds.map((student_id: string) => ({
        class_id: target.classId,
        section_id: target.type === 'section' ? target.id : null,
        student_id,
      }));
      const { data: inserted, error } = await supabase.from('class_student_map').insert(records).select();
      if (error) throw new BadRequestError(error.message);
      assigned = (inserted || []).length;
      // Reflect the new class/section on the student rows.
      const sectionId = target.type === 'section' ? target.id : null;
      const { error: syncErr } = await supabase
        .from('students')
        .update({ class_id: target.classId, section_id: sectionId })
        .in('id', assignedIds);
      if (syncErr) throw new BadRequestError(syncErr.message);
    }
    return { assigned, skipped, capacity: cap, current, message: skipped > 0 ? `Section full: ${skipped} student(s) not added (${current}/${cap})` : `Assigned ${assigned} student(s)` };
  }

  // Distributes a list of students across a class's sections. Sections are filled in
  // name order (A → B → C); once one section is full the remaining students spill
  // into the next one. Students already in this class are skipped as idempotent.
  private async assignBulkToSections(classId: string, sections: any[], studentIds: string[], confirm: boolean) {
    const { data: existing, error: exErr } = await supabase
      .from('class_student_map')
      .select('student_id')
      .eq('class_id', classId);
    if (exErr) throw new BadRequestError(exErr.message);
    const existingSet = new Set((existing || []).map((e: any) => e.student_id));
    const freshIds = studentIds.filter((id: string) => !existingSet.has(id));

    // Students already assigned to another class/section must be confirmed.
    const elsewhereIds: string[] = [];
    if (freshIds.length > 0) {
      const { data: elsewhere } = await supabase
        .from('class_student_map')
        .select('student_id')
        .in('student_id', freshIds);
      const elsewhereSet = new Set((elsewhere || []).map((e: any) => e.student_id));
      for (const id of freshIds) {
        if (elsewhereSet.has(id)) elsewhereIds.push(id);
      }
    }
    if (elsewhereIds.length > 0 && !confirm) {
      const { data: names } = await supabase
        .from('class_student_map')
        .select('student_id, class:classes!class_student_map_class_id_fkey(name), section:sections!class_student_map_section_id_fkey(name)')
        .in('student_id', elsewhereIds);
      const current = (names || []).map((n: any) => ({
        student_id: n.student_id,
        class_name: n.class?.name || 'Unknown class',
        section_name: n.section?.name || null,
      }));
      throw new AppError(
        `${elsewhereIds.length} student(s) are already assigned to another class/section. Re-assignment requires confirmation.`,
        409,
        'REASSIGN_REQUIRES_CONFIRM',
        { current_assignments: current },
      );
    }

    const counts = await this.countSectionStudents(sections.map((s: any) => s.id));
    // Fill A first — only spill into the next section when the current one is full.
    const ordered = [...sections].sort((a: any, b: any) =>
      (a.name || '').localeCompare(b.name || '', undefined, { numeric: true }),
    );

    const records: any[] = [];
    const assignedIds: string[] = [];
    let queue = [...freshIds];
    for (const sec of ordered) {
      if (queue.length === 0) break;
      const cap = sec.capacity ?? MAX_SECTION_STUDENTS;
      const count = counts.get(sec.id) || 0;
      const available = Math.max(0, cap - count);
      const take = queue.slice(0, available);
      for (const sid of take) {
        records.push({ class_id: classId, section_id: sec.id, student_id: sid });
        assignedIds.push(sid);
      }
      queue = queue.slice(available);
    }
    const skipped = queue.length;

    let assigned = 0;
    if (records.length > 0) {
      if (confirm && elsewhereIds.length > 0) {
        await supabase.from('class_student_map').delete().in('student_id', assignedIds);
      }
      const { data: inserted, error } = await supabase.from('class_student_map').insert(records).select();
      if (error) throw new BadRequestError(error.message);
      assigned = (inserted || []).length;
      // Reflect the new class + section on each student row (per section group).
      for (const sec of ordered) {
        const secIds = records.filter((r: any) => r.section_id === sec.id).map((r: any) => r.student_id);
        if (secIds.length > 0) {
          const { error: syncErr } = await supabase
            .from('students')
            .update({ class_id: classId, section_id: sec.id })
            .in('id', secIds);
          if (syncErr) throw new BadRequestError(syncErr.message);
        }
      }
    }
    const totalCap = ordered.reduce((n: number, s: any) => n + (s.capacity ?? MAX_SECTION_STUDENTS), 0);
    const totalCurrent = ordered.reduce((n: number, s: any) => n + (counts.get(s.id) || 0), 0);
    return {
      assigned,
      skipped,
      capacity: totalCap,
      current: totalCurrent,
      message: skipped > 0
        ? `${skipped} student(s) could not be assigned: all sections full (${totalCurrent}/${totalCap}).`
        : `Assigned ${assigned} student(s) across sections.`,
    };
  }

  async removeStudent(targetId: string, studentId: string) {
    const target = await this.resolveTarget(targetId);
    let query = supabase.from('class_student_map').delete().eq('student_id', studentId);
    if (target.type === 'section') {
      query = query.eq('section_id', target.id);
    } else {
      query = query.eq('class_id', target.id).is('section_id', null);
    }
    const { error } = await query;
    if (error) throw new BadRequestError(error.message);
    // If the student is still mapped somewhere else, keep that mapping; otherwise clear.
    const { data: remaining } = await supabase.from('class_student_map').select('class_id, section_id').eq('student_id', studentId);
    const next = (remaining || [])[0];
    await this.syncStudentRow(studentId, next?.class_id ?? null, next?.section_id ?? null);
    return { message: 'Student removed from class/section' };
  }

  async transferStudent(studentId: string, fromTargetId: string, toTargetId: string) {
    await this.assertCapacity(toTargetId, 1);
    const fromTarget = await this.resolveTarget(fromTargetId);
    let delQuery = supabase.from('class_student_map').delete().eq('student_id', studentId);
    if (fromTarget.type === 'section') {
      delQuery = delQuery.eq('section_id', fromTarget.id);
    } else {
      delQuery = delQuery.eq('class_id', fromTarget.id).is('section_id', null);
    }
    await delQuery;
    const toTarget = await this.resolveTarget(toTargetId);
    const { data, error } = await supabase.from('class_student_map').insert({
      class_id: toTarget.classId,
      section_id: toTarget.type === 'section' ? toTarget.id : null,
      student_id: studentId,
    }).select().single();
    if (error) throw new BadRequestError(error.message);
    await this.syncStudentRow(studentId, toTarget.classId, toTarget.type === 'section' ? toTarget.id : null);
    return data;
  }

  async promoteStudents(orgId: string, fromTargetId: string, toTargetId: string, studentIds: string[]) {
    // Promotion is an explicit move from the source class — the students are
    // already assigned there, so the reassignment guard is bypassed (confirm).
    const result = await this.assignStudentsBulk(toTargetId, studentIds, true);
    if (result.assigned > 0) {
      const fromTarget = await this.resolveTarget(fromTargetId);
      let delQuery = supabase.from('class_student_map').delete().in('student_id', studentIds);
      if (fromTarget.type === 'section') {
        delQuery = delQuery.eq('section_id', fromTarget.id);
      } else {
        delQuery = delQuery.eq('class_id', fromTarget.id).is('section_id', null);
      }
      await delQuery;
    }
    return result;
  }

  async assignClassTeacher(classId: string, teacherId: string, orgId?: string) {
    const { data, error } = await supabase.from('class_subject_teacher_map').insert({
      class_id: classId, teacher_id: teacherId,
      organisation_id: orgId || (await this.getClassById(classId)).organisation_id
    }).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async assignAssistantTeacher(classId: string, teacherId: string, orgId?: string) {
    const { data, error } = await supabase.from('class_subject_teacher_map').insert({
      class_id: classId, teacher_id: teacherId,
      organisation_id: orgId || (await this.getClassById(classId)).organisation_id
    }).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async getRooms(classId: string) {
    const { data, error } = await supabase.from('classrooms').select('*').eq('class_id', classId);
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async allocateRoom(orgId: string, data: any) {
    const { data: room, error } = await supabase.from('classrooms').insert({ ...data, organisation_id: orgId }).select().single();
    if (error) throw new BadRequestError(error.message);
    return room;
  }

  async updateRoom(roomId: string, data: any) {
    const { data: room, error } = await supabase.from('classrooms').update(data).eq('id', roomId).select().single();
    if (error) throw new BadRequestError(error.message);
    return room;
  }

  async deleteRoom(roomId: string) {
    const { error } = await supabase.from('classrooms').delete().eq('id', roomId);
    if (error) throw new BadRequestError(error.message);
    return { message: 'Room deleted' };
  }

  async getAttendanceTrend(orgId: string, classId: string) {
    const { data, error } = await supabase.from('attendance_records').select('date, status').eq('organisation_id', orgId).eq('class_id', classId).order('date', { ascending: true }).limit(30);
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getPerformanceSnapshots(orgId: string, classId: string) {
    const { data, error } = await supabase.from('exam_results').select('*, exam:exams(*)').eq('organisation_id', orgId).eq('class_id', classId).order('created_at', { ascending: false }).limit(10);
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getAcademicAnalytics(orgId: string, classId: string) {
    const [studentsRes, examsRes, attendanceRes] = await Promise.all([
      supabase.from('class_student_map').select('student_id').eq('class_id', classId),
      supabase.from('exam_results').select('marks_obtained, total_marks, exam_id').eq('organisation_id', orgId).eq('class_id', classId),
      supabase.from('attendance_records').select('status').eq('organisation_id', orgId).eq('class_id', classId),
    ]);
    const students = studentsRes.data || [];
    const exams = examsRes.data || [];
    const attendance = attendanceRes.data || [];
    const avgMarks = exams.length > 0 ? exams.reduce((s: number, e: any) => s + (e.marks_obtained / e.total_marks) * 100, 0) / exams.length : 0;
    const attendanceRate = attendance.length > 0 ? attendance.filter((a: any) => a.status === 'present').length / attendance.length * 100 : 0;
    return { totalStudents: students.length, averageMarks: Math.round(avgMarks * 100) / 100, attendanceRate: Math.round(attendanceRate * 100) / 100, examCount: exams.length };
  }

  async getAiInsights(orgId: string, classId: string) {
    const analytics = await this.getAcademicAnalytics(orgId, classId);
    const insights: string[] = [];
    if (analytics.averageMarks < 60) insights.push('Class average marks are below 60%. Consider remedial sessions.');
    if (analytics.attendanceRate < 80) insights.push('Attendance rate is below 80%. Investigate causes of absenteeism.');
    if (analytics.totalStudents > 35) insights.push('Class size exceeds 35 students. Consider splitting the class.');
    return { insights, analytics };
  }

  async getUnassignedStudents(orgId: string) {
    const { data: allStudents, error } = await supabase.from('students').select('id').eq('organisation_id', orgId).eq('status', 'active');
    if (error) throw new BadRequestError(error.message);
    const studentIds = (allStudents || []).map((s: any) => s.id);
    if (studentIds.length === 0) return [];
    const { data: mapped } = await supabase.from('class_student_map').select('student_id').in('student_id', studentIds);
    const mappedIds = new Set((mapped || []).map((m: any) => m.student_id));
    const unassignedIds = studentIds.filter(id => !mappedIds.has(id));
    if (unassignedIds.length === 0) return [];
    const { data: unassigned } = await supabase.from('students').select('*').in('id', unassignedIds);
    return unassigned || [];
  }

  async getAllAssignedStudents(orgId: string) {
    const { data: classRows, error: classErr } = await supabase
      .from('classes').select('id').eq('organisation_id', orgId);
    if (classErr) throw new BadRequestError(classErr.message);
    const classIds = (classRows || []).map((c: any) => c.id);
    if (classIds.length === 0) return [];
    const { data, error } = await supabase
      .from('class_student_map')
      .select('student_id, class_id, section_id, student:students(*), class:classes!class_student_map_class_id_fkey(name), section:sections!class_student_map_section_id_fkey(name)')
      .in('class_id', classIds);
    if (error) throw new BadRequestError(error.message);
    return (data || []).map((r: any) => ({
      student_id: r.student_id,
      student: r.student,
      class_id: r.class_id,
      class_name: r.class?.name || '',
      section_id: r.section_id,
      section_name: r.section?.name || null,
    }));
  }

  async getAvailableTeachers(orgId: string) {
    const { data, error } = await supabase.from('users').select('id, full_name, email').eq('organisation_id', orgId).eq('role', 'teacher').eq('status', 'active');
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }
}

export const classService = new ClassService();
