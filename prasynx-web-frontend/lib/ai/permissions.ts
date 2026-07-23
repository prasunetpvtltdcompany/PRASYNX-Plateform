import type { AIContext } from '../../types/ai';

interface PermissionCheck {
  allowed: boolean;
  reason?: string;
}

export function canAccessData(context: AIContext, dataType: string, targetUserId?: string): PermissionCheck {
  const { role, userId, schoolId, studentId, parentId } = context;

  switch (role) {
    case 'student':
      if (dataType === 'self' || dataType === 'own_attendance' || dataType === 'own_grades') {
        if (!targetUserId || targetUserId === userId) return { allowed: true };
      }
      if (dataType === 'career' || dataType === 'scholarship') return { allowed: true };
      return { allowed: false, reason: 'Students can only access their own data.' };

    case 'parent':
      if (dataType === 'child_data') {
        if (targetUserId && targetUserId === studentId) return { allowed: true };
        return { allowed: true, reason: 'Parents can access their children\'s data.' };
      }
      if (dataType === 'fee' || dataType === 'communication') return { allowed: true };
      return { allowed: false, reason: 'Parents can only access child and fee related data.' };

    case 'teacher':
      if (dataType === 'class_data' || dataType === 'student_data') return { allowed: true };
      if (dataType === 'exam' || dataType === 'assignment') return { allowed: true };
      if (dataType === 'self') return { allowed: true };
      return { allowed: false, reason: 'Teachers can access class and student data.' };

    case 'recruiter':
      if (dataType === 'job' || dataType === 'candidate' || dataType === 'application') return { allowed: true };
      if (dataType === 'analytics') return { allowed: true };
      return { allowed: false, reason: 'Recruiters can access job and candidate data.' };

    case 'admin':
      if (dataType === 'any') return { allowed: true };
      return { allowed: true };

    default:
      return { allowed: false, reason: 'Unknown role. Access denied.' };
  }
}

export function canExecuteAction(context: AIContext, actionName: string): PermissionCheck {
  const actionRoleMap: Record<string, string[]> = {
    create_assignment: ['teacher', 'admin'],
    create_study_plan: ['student', 'teacher'],
    generate_notes: ['student'],
    register_event: ['student', 'parent'],
    pay_fees: ['parent', 'admin'],
    contact_teacher: ['parent', 'student'],
    download_report: ['parent', 'student', 'teacher', 'admin'],
    create_exam: ['teacher', 'admin'],
    mark_attendance: ['teacher', 'admin'],
    publish_results: ['teacher', 'admin'],
    post_job: ['recruiter', 'admin'],
    shortlist_candidates: ['recruiter', 'admin'],
    schedule_interview: ['recruiter', 'admin'],
    create_school: ['admin'],
    create_user: ['admin'],
    assign_permissions: ['admin'],
    generate_reports: ['admin', 'teacher'],
    book_demo: ['visitor', 'student', 'parent', 'teacher', 'recruiter', 'admin'],
    contact_sales: ['visitor'],
    view_pricing: ['visitor'],
  };

  const allowedRoles = actionRoleMap[actionName];
  if (!allowedRoles) return { allowed: false, reason: `Unknown action: ${actionName}` };
  if (allowedRoles.includes(context.role)) return { allowed: true };
  return { allowed: false, reason: `Action "${actionName}" requires ${allowedRoles.join(' or ')} role.` };
}

export function canAccessSchool(context: AIContext, targetSchoolId: string): PermissionCheck {
  if (!context.schoolId) return { allowed: false, reason: 'No school context available.' };
  if (context.role === 'admin') return { allowed: true };
  if (context.schoolId === targetSchoolId) return { allowed: true };
  return { allowed: false, reason: 'Cannot access data from another school.' };
}
