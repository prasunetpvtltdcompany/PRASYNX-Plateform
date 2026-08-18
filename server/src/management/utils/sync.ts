import { supabase } from '../config/database';

export async function trackChange(event: { organisationId: string; tableName: string; operation: string; recordId?: string; performedBy?: string }): Promise<void> {
  try {
    await supabase.from('change_events').insert({
      organisation_id: event.organisationId,
      table_name: event.tableName,
      operation: event.operation,
      record_id: event.recordId || null,
      performed_by: event.performedBy || null,
    });
  } catch (err) {
    console.error('[Sync] trackChange failed (table may not exist):', (err as any)?.message);
  }
}

export async function notifyRole(orgId: string, role: string, title: string, message: string, context?: string, refId?: string): Promise<void> {
  try {
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('organisation_id', orgId)
      .eq('role', role)
      .eq('status', 'active');

    if (users && users.length > 0) {
      const notifications = users.map(u => ({ user_id: u.id, title, message, read: false }));
      await supabase.from('notifications').insert(notifications);
    }
  } catch (err) {
    console.error('[Sync] notifyRole failed:', (err as any)?.message);
  }
}

export async function notifyUser(userId: string, title: string, message: string): Promise<void> {
  try {
    await supabase.from('notifications').insert({ user_id: userId, title, message, read: false });
  } catch (err) {
    console.error('[Sync] notifyUser failed:', (err as any)?.message);
  }
}

export async function notifyStudentsInClass(orgId: string, classId: string, title: string, message: string, context?: string, refId?: string): Promise<void> {
  try {
    const { data: classStudents } = await supabase
      .from('class_student_map')
      .select('student_id')
      .eq('class_id', classId);

    if (!classStudents || classStudents.length === 0) return;

    const studentIds = classStudents.map(s => s.student_id);

    const { data: students } = await supabase
      .from('students')
      .select('id')
      .in('id', studentIds)
      .eq('organisation_id', orgId)
      .eq('status', 'active');

    if (!students || students.length === 0) return;

    const { data: users } = await supabase
      .from('users')
      .select('id')
      .in('id', students.map(s => s.id))
      .eq('status', 'active');

    if (users && users.length > 0) {
      const notifications = users.map(u => ({ user_id: u.id, title, message, read: false }));
      await supabase.from('notifications').insert(notifications);
    }
  } catch (err) {
    console.error('[Sync] notifyStudentsInClass failed:', (err as any)?.message);
  }
}

export async function notifyParentsOfStudentsInClass(orgId: string, classId: string, title: string, message: string, context?: string, refId?: string): Promise<void> {
  try {
    const { data: classStudents } = await supabase
      .from('class_student_map')
      .select('student_id')
      .eq('class_id', classId);

    if (!classStudents || classStudents.length === 0) return;

    const { data: students } = await supabase
      .from('students')
      .select('id')
      .in('id', classStudents.map(s => s.student_id))
      .eq('organisation_id', orgId)
      .eq('status', 'active');

    if (!students || students.length === 0) return;

    const { data: parents } = await supabase
      .from('parent_student_links')
      .select('parent_id')
      .in('student_id', students.map(s => s.id));

    if (parents && parents.length > 0) {
      const notifications = parents.map(p => ({ user_id: p.parent_id, title, message, read: false }));
      await supabase.from('notifications').insert(notifications);
    }
  } catch (err) {
    console.error('[Sync] notifyParentsOfStudentsInClass failed:', (err as any)?.message);
  }
}

export async function notifyStudentParents(orgId: string, studentId: string, title: string, message: string, context?: string, refId?: string): Promise<void> {
  try {
    const { data: parents } = await supabase
      .from('parent_student_links')
      .select('parent_id')
      .eq('student_id', studentId);

    if (parents && parents.length > 0) {
      const notifications = parents.map(p => ({ user_id: p.parent_id, title, message, read: false }));
      await supabase.from('notifications').insert(notifications);
    }
  } catch (err) {
    console.error('[Sync] notifyStudentParents failed:', (err as any)?.message);
  }
}

export async function notifyStaffAssignedToClass(orgId: string, classId: string, title: string, message: string, context?: string, refId?: string): Promise<void> {
  try {
    // Use class_subject_teacher_map (canonical source of truth)
    const { data: mappedTeachers } = await supabase
      .from('class_subject_teacher_map')
      .select('teacher_id')
      .eq('class_id', classId);

    const mappedTeacherIds = mappedTeachers?.map(t => t.teacher_id) || [];
    let userIds: string[] = [];
    if (mappedTeacherIds.length > 0) {
      const { data: teacherUsers } = await supabase
        .from('staff_records')
        .select('user_id')
        .in('id', mappedTeacherIds)
        .eq('status', 'active');

      if (teacherUsers) {
        userIds = teacherUsers.map(t => t.user_id);
      }
    }

    if (userIds.length > 0) {
      const notifications = userIds.map(uid => ({ user_id: uid, title, message, read: false }));
      await supabase.from('notifications').insert(notifications);
    }
  } catch (err) {
    console.error('[Sync] notifyStaffAssignedToClass failed:', (err as any)?.message);
  }
}
