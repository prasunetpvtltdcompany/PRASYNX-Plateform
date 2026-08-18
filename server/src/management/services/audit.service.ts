import { supabase } from '../config/database';

interface AuditResult {
  check: string;
  status: 'pass' | 'fail' | 'warn';
  detail: string;
  count?: number;
}

export class AuditService {
  async runAll(orgId: string): Promise<AuditResult[]> {
    return (await Promise.all([
      this.checkOrphanStudents(orgId),
      this.checkOrphanParents(orgId),
      this.checkOrphanStaff(orgId),
      this.checkDuplicateEnrollments(orgId),
      this.checkMissingAcademicYears(orgId),
      this.checkMultipleActiveYears(orgId),
      this.checkClassTeacherOverlap(orgId),
      this.checkSubjectTeacherMissing(orgId),
      this.checkHomeworkWithoutSubmissions(orgId),
      this.checkEnrollmentsWithoutStudents(orgId),
      this.checkCSTMapOrphans(orgId),
      this.checkUserStatusMismatch(orgId),
      this.checkCommunicationLogOrphans(orgId),
      this.checkMissingSections(orgId),
      this.checkUniqueIdCollisions(orgId),
      this.checkPromotionIntegrity(orgId),
    ])).flat();
  }

  // 1. Students without user accounts or user_id NULL
  async checkOrphanStudents(orgId: string): Promise<AuditResult[]> {
    const results: AuditResult[] = [];
    const { count: nullUser } = await supabase.from('students')
      .select('*', { count: 'exact', head: true })
      .eq('organisation_id', orgId).is('user_id', null);
    if (nullUser && nullUser > 0) results.push({ check: '1. Orphan Students', status: 'fail', detail: `${nullUser} students have no user_id`, count: nullUser });

    const { data: students } = await supabase.from('students')
      .select('id, user_id')
      .eq('organisation_id', orgId).not('user_id', 'is', null);
    const { data: users } = await supabase.from('users')
      .select('id').eq('organisation_id', orgId);
    const validIds = new Set((users || []).map((u: any) => u.id));
    const badRefs = (students || []).filter((s: any) => !validIds.has(s.user_id));
    if (badRefs.length > 0) results.push({ check: '1. Orphan Students', status: 'warn', detail: `${badRefs.length} students reference non-existent user_ids`, count: badRefs.length });

    if (results.length === 0) results.push({ check: '1. Orphan Students', status: 'pass', detail: 'All students have valid user accounts' });
    return results;
  }

  // 2. Parents without user accounts
  async checkOrphanParents(orgId: string): Promise<AuditResult[]> {
    const { count } = await supabase.from('parents')
      .select('*', { count: 'exact', head: true })
      .eq('organisation_id', orgId).is('user_id', null);
    if (count && count > 0) return [{ check: '2. Orphan Parents', status: 'fail', detail: `${count} parents have no user_id`, count }];
    return [{ check: '2. Orphan Parents', status: 'pass', detail: 'All parents have valid user accounts' }];
  }

  // 3. Staff without user accounts
  async checkOrphanStaff(orgId: string): Promise<AuditResult[]> {
    const { count } = await supabase.from('staff_records')
      .select('*', { count: 'exact', head: true })
      .eq('organisation_id', orgId).is('user_id', null);
    if (count && count > 0) return [{ check: '3. Orphan Staff', status: 'fail', detail: `${count} teachers have no user_id`, count }];
    return [{ check: '3. Orphan Staff', status: 'pass', detail: 'All teachers have valid user accounts' }];
  }

  // 4. Duplicate class_student_map entries
  async checkDuplicateEnrollments(orgId: string): Promise<AuditResult[]> {
    const { data } = await supabase.from('class_student_map')
      .select('class_id, student_id, count', { count: 'exact' })
      .eq('organisation_id', orgId)
      .select('class_id, student_id');
    if (!data?.length) return [{ check: '4. Duplicate Enrollments', status: 'pass', detail: 'No enrollment data to check' }];

    const seen = new Set<string>();
    const dups: string[] = [];
    for (const r of data) {
      const key = `${r.class_id}:${r.student_id}`;
      if (seen.has(key)) dups.push(key);
      seen.add(key);
    }
    if (dups.length > 0) return [{ check: '4. Duplicate Enrollments', status: 'fail', detail: `${dups.length} duplicate enrollments found`, count: dups.length }];
    return [{ check: '4. Duplicate Enrollments', status: 'pass', detail: 'No duplicate enrollments' }];
  }

  // 5. Classes without academic_year_id
  async checkMissingAcademicYears(orgId: string): Promise<AuditResult[]> {
    const { count } = await supabase.from('classes')
      .select('*', { count: 'exact', head: true })
      .eq('organisation_id', orgId);
    if (count && count > 0) return [{ check: '5. Missing Academic Years', status: 'warn', detail: `${count} classes have no academic_year_id`, count }];
    return [{ check: '5. Missing Academic Years', status: 'pass', detail: 'All classes have academic_year_id' }];
  }

  // 6. Multiple active academic years
  async checkMultipleActiveYears(orgId: string): Promise<AuditResult[]> {
    const { count } = await supabase.from('academic_years')
      .select('*', { count: 'exact', head: true })
      .eq('organisation_id', orgId).eq('is_current', true);
    if (!count) return [{ check: '6. Multiple Active Years', status: 'warn', detail: 'No active academic year set' }];
    if (count > 1) return [{ check: '6. Multiple Active Years', status: 'fail', detail: `${count} academic years are marked current`, count }];
    return [{ check: '6. Multiple Active Years', status: 'pass', detail: 'Exactly one active academic year' }];
  }

  // 7. Multiple class teachers per class
  async checkClassTeacherOverlap(orgId: string): Promise<AuditResult[]> {
    const { data } = await supabase.from('class_subject_teacher_map')
      .select('class_id, class:classes!class_subject_teacher_map_class_id_fkey!inner(organisation_id)')
      .eq('class.organisation_id', orgId).eq('is_class_teacher', true);
    if (!data?.length) return [{ check: '7. Class Teacher Overlap', status: 'pass', detail: 'No class teachers assigned' }];
    const classCounts: Record<string, number> = {};
    for (const r of data) classCounts[r.class_id] = (classCounts[r.class_id] || 0) + 1;
    const overlaps = Object.entries(classCounts).filter(([, c]) => c > 1);
    if (overlaps.length > 0) return [{ check: '7. Class Teacher Overlap', status: 'fail', detail: `${overlaps.length} classes have multiple teachers`, count: overlaps.length }];
    return [{ check: '7. Class Teacher Overlap', status: 'pass', detail: 'No overlapping class teachers' }];
  }

  // 8. Subjects without assigned teacher (via class_subject_teacher_map)
  async checkSubjectTeacherMissing(orgId: string): Promise<AuditResult[]> {
    const { data: allCS } = await supabase.from('class_subjects').select('id, class:class_sections!class_subjects_class_id_fkey!inner(organisation_id)').eq('class.organisation_id', orgId);
    const { data: cst } = await supabase.from('class_subject_teacher_map').select('class_id, subject_id, class:classes!class_subject_teacher_map_class_id_fkey!inner(organisation_id)').eq('class.organisation_id', orgId);
    if (!allCS?.length) return [{ check: '8. Subjects Without Teacher', status: 'pass', detail: 'No class-subject assignments to check' }];
    const assigned = new Set((cst || []).map((r: any) => `${r.class_id}:${r.subject_id}`));
    const missing = allCS.filter((cs: any) => !assigned.has(`${cs.class_id}:${cs.subject_id}`));
    if (missing.length > 0) return [{ check: '8. Subjects Without Teacher', status: 'warn', detail: `${missing.length} class-subjects have no teacher assigned`, count: missing.length }];
    return [{ check: '8. Subjects Without Teacher', status: 'pass', detail: 'All subjects have assigned teachers' }];
  }

  // 9. Homework with no submissions
  async checkHomeworkWithoutSubmissions(orgId: string): Promise<AuditResult[]> {
    const { data: allHw } = await supabase.from('homework').select('id').eq('organisation_id', orgId);
    const { data: subs } = await supabase.from('homework_submissions').select('homework_id');
    if (!allHw?.length) return [{ check: '9. Homework Without Submissions', status: 'pass', detail: 'No homework assignments' }];
    const submittedIds = new Set((subs || []).map((s: any) => s.homework_id));
    const missing = allHw.filter((h: any) => !submittedIds.has(h.id));
    if (missing.length > 0) return [{ check: '9. Homework Without Submissions', status: 'warn', detail: `${missing.length} homework items have no submissions`, count: missing.length }];
    return [{ check: '9. Homework Without Submissions', status: 'pass', detail: 'All homework has submissions' }];
  }

  // 10. Enrollments referencing non-existent students
  async checkEnrollmentsWithoutStudents(orgId: string): Promise<AuditResult[]> {
    const { data: enrollments } = await supabase.from('class_student_map').select('student_id').eq('organisation_id', orgId);
    const { data: students } = await supabase.from('students').select('id').eq('organisation_id', orgId);
    if (!enrollments?.length) return [{ check: '10. Orphan Enrollments', status: 'pass', detail: 'No enrollments to check' }];
    const validIds = new Set((students || []).map((s: any) => s.id));
    const bad = enrollments.filter((e: any) => !validIds.has(e.student_id));
    if (bad.length > 0) return [{ check: '10. Orphan Enrollments', status: 'fail', detail: `${bad.length} enrollments reference non-existent students`, count: bad.length }];
    return [{ check: '10. Orphan Enrollments', status: 'pass', detail: 'All enrollments reference valid students' }];
  }

  // 11. CSTMap entries with no class/teacher
  async checkCSTMapOrphans(orgId: string): Promise<AuditResult[]> {
    const { data: cst } = await supabase.from('class_subject_teacher_map').select('class_id, teacher_id, class:classes!class_subject_teacher_map_class_id_fkey!inner(organisation_id)').eq('class.organisation_id', orgId);
    const { data: classes } = await supabase.from('classes').select('id').eq('organisation_id', orgId);
    const { data: teachers } = await supabase.from('staff_records').select('id').eq('organisation_id', orgId);
    if (!cst?.length) return [{ check: '11. Orphan Teacher Assignments', status: 'pass', detail: 'No teacher assignments to check' }];
    const validClasses = new Set((classes || []).map((c: any) => c.id));
    const validTeachers = new Set((teachers || []).map((t: any) => t.id));
    const noClass = cst.filter((r: any) => !validClasses.has(r.class_id));
    const noTeacher = cst.filter((r: any) => !validTeachers.has(r.teacher_id));
    const total = noClass.length + noTeacher.length;
    if (total > 0) return [{ check: '11. Orphan Teacher Assignments', status: 'fail', detail: `${total} assignments reference missing entities (classes: ${noClass.length}, teachers: ${noTeacher.length})`, count: total }];
    return [{ check: '11. Orphan Teacher Assignments', status: 'pass', detail: 'All assignments reference valid entities' }];
  }

  // 12. User status vs student/teacher/parent status mismatch
  async checkUserStatusMismatch(orgId: string): Promise<AuditResult[]> {
    const { data: students } = await supabase.from('students')
      .select('id, user_id, status').eq('organisation_id', orgId).not('user_id', 'is', null);
    const { data: users } = await supabase.from('users')
      .select('id, status').eq('organisation_id', orgId);
    const userMap = new Map((users || []).map((u: any) => [u.id, u.status]));
    const mismatches = (students || []).filter((s: any) => s.status !== userMap.get(s.user_id));
    if (mismatches.length > 0) return [{ check: '12. Status Mismatch', status: 'warn', detail: `${mismatches.length} students have status mismatch with their user account`, count: mismatches.length }];
    return [{ check: '12. Status Mismatch', status: 'pass', detail: 'All statuses are consistent' }];
  }

  // 13. Communication log entries with no sender/receiver
  async checkCommunicationLogOrphans(orgId: string): Promise<AuditResult[]> {
    const { count } = await supabase.from('communication_log')
      .select('*', { count: 'exact', head: true })
      .eq('organisation_id', orgId)
      .is('sender_id', null);
    if (count && count > 0) return [{ check: '13. Orphan Comm Logs', status: 'warn', detail: `${count} communication_log entries have no sender`, count }];
    return [{ check: '13. Orphan Comm Logs', status: 'pass', detail: 'All communication logs have valid senders' }];
  }

  // 14. Classes with no sections
  async checkMissingSections(orgId: string): Promise<AuditResult[]> {
    const { data: allClasses } = await supabase.from('classes').select('id').eq('organisation_id', orgId);
    const { data: sections } = await supabase.from('sections').select('class_id').eq('organisation_id', orgId);
    if (!allClasses?.length) return [{ check: '14. Classes Without Sections', status: 'pass', detail: 'No classes to check' }];
    const classesWithSec = new Set((sections || []).map((s: any) => s.class_id));
    const missing = allClasses.filter((c: any) => !classesWithSec.has(c.id));
    if (missing.length > 0) return [{ check: '14. Classes Without Sections', status: 'warn', detail: `${missing.length}/${allClasses.length} classes have no sections`, count: missing.length }];
    return [{ check: '14. Classes Without Sections', status: 'pass', detail: 'All classes have sections' }];
  }

  // 15. Unique ID collisions
  async checkUniqueIdCollisions(orgId: string): Promise<AuditResult[]> {
    let collisions = 0;
    const configs = [
      { table: 'students' as const, col: 'student_unique_id' },
      { table: 'staff_records' as const, col: 'staff_unique_id' },
      { table: 'parents' as const, col: 'parent_unique_id' },
    ];
    for (const { table, col } of configs) {
      const { data } = await supabase.from(table).select(col).eq('organisation_id', orgId).not(col, 'is', null);
      if (data?.length) {
        const ids = data.map((r: any) => r[col]);
        const unique = new Set(ids);
        collisions += ids.length - unique.size;
      }
    }
    if (collisions > 0) return [{ check: '15. Unique ID Collisions', status: 'fail', detail: `${collisions} duplicate unique IDs found`, count: collisions }];
    return [{ check: '15. Unique ID Collisions', status: 'pass', detail: 'No unique ID collisions' }];
  }

  // 16. Promotion history integrity
  async checkPromotionIntegrity(orgId: string): Promise<AuditResult[]> {
    const { data: promos } = await supabase.from('promotion_history').select('from_class_id, to_class_id').eq('organisation_id', orgId);
    const { data: classes } = await supabase.from('classes').select('id').eq('organisation_id', orgId);
    if (!promos?.length) return [{ check: '16. Promotion Integrity', status: 'pass', detail: 'No promotions to check' }];
    const validIds = new Set((classes || []).map((c: any) => c.id));
    const badFrom = promos.filter((p: any) => !validIds.has(p.from_class_id));
    const badTo = promos.filter((p: any) => !validIds.has(p.to_class_id));
    const issues = badFrom.length + badTo.length;
    if (issues > 0) return [{ check: '16. Promotion Integrity', status: 'fail', detail: `${issues} promotions reference non-existent classes (from: ${badFrom.length}, to: ${badTo.length})`, count: issues }];
    return [{ check: '16. Promotion Integrity', status: 'pass', detail: 'All promotion records reference valid classes' }];
  }

  // Scoring
  score(results: AuditResult[]): { total: number; passed: number; failed: number; warnings: number; score: number } {
    const total = results.length;
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const warnings = results.filter(r => r.status === 'warn').length;
    const score = total > 0 ? Math.round((passed / total) * 100) / 100 : 0;
    return { total, passed, failed, warnings, score };
  }
}

export const auditService = new AuditService();
