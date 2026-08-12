import { requestDb } from '../../infrastructure/database/supabase';
import { ForbiddenError } from '../errors/errors';
import { hasPermission, type Permission } from '@prasynx/config';
import type { Role } from '@prasynx/types';

export interface Requester {
  role: Role;
  userId: string;
  tenantId: string | null;
}

/**
 * Shared student-scope resolver. Students may only ever reach their own
 * records; parents only their linked children; school staff only when they
 * hold the view permission. Centralizes the rule so attendance/exams/
 * assignments/finance cannot drift.
 */
export class StudentAccess {
  async studentIdForUser(userId: string): Promise<string | null> {
    const { data } = await requestDb().from('students').select('id').eq('user_id', userId).maybeSingle();
    return (data as { id: string } | null)?.id ?? null;
  }

  async studentIdsForParent(tenantId: string, parentId: string): Promise<string[]> {
    const { data } = await requestDb()
      .from('parent_student_links')
      .select('student_id')
      .eq('parent_id', parentId)
      .eq('organisation_id', tenantId);
    return ((data as Array<{ student_id: string }>) ?? []).map((r) => r.student_id);
  }

  /** Whether `requester` may see data for `studentId`. Staff/teacher/management additionally need `viewPermission`. */
  async canView(requester: Requester, studentId: string, viewPermission: Permission): Promise<boolean> {
    const { role, userId } = requester;
    if (role === 'student') return (await this.studentIdForUser(userId)) === studentId;
    if (role === 'parent') {
      const ids = await this.studentIdsForParent(requester.tenantId ?? '', userId);
      return ids.includes(studentId);
    }
    // staff / teacher / management
    return hasPermission(role, viewPermission);
  }

  /** Throws unless `requester` may view `studentId`'s data. */
  async assertCanView(requester: Requester, studentId: string, viewPermission: Permission): Promise<void> {
    if (!(await this.canView(requester, studentId, viewPermission))) {
      throw new ForbiddenError('You can only view your own or your children\'s records');
    }
  }
}

export const studentAccess = new StudentAccess();