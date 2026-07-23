import { createServerClient } from '../supabase/server';
import type { AIContext } from '../../types/ai';

export function parseContextFromHeaders(page: string, role?: string): Partial<AIContext> {
  const segments = page.split('/').filter(Boolean);
  const portal = segments[0] || 'unknown';

  const context: Partial<AIContext> = {
    page,
    portal,
    role: (role as AIContext['role']) || 'student',
  };

  return context;
}

export function buildContextString(context: AIContext): string {
  const parts: string[] = [
    `Current Portal: ${context.portal}`,
    `Current Page: ${context.page}`,
    `User Role: ${context.role}`,
    `User ID: ${context.userId}`,
  ];

  if (context.schoolId) parts.push(`School ID: ${context.schoolId}`);
  if (context.studentId) parts.push(`Student ID: ${context.studentId}`);
  if (context.parentId) parts.push(`Parent ID: ${context.parentId}`);
  if (context.teacherId) parts.push(`Teacher ID: ${context.teacherId}`);
  if (context.recruiterId) parts.push(`Recruiter ID: ${context.recruiterId}`);
  if (context.classId) parts.push(`Class ID: ${context.classId}`);
  if (context.jobId) parts.push(`Job ID: ${context.jobId}`);

  if (context.data && Object.keys(context.data).length > 0) {
    parts.push('Context Data:');
    for (const [key, value] of Object.entries(context.data)) {
      parts.push(`  ${key}: ${JSON.stringify(value)}`);
    }
  }

  return parts.join('\n');
}

export async function fetchDashboardData(context: AIContext): Promise<Record<string, unknown>> {
  const supabase = await createServerClient();
  const data: Record<string, unknown> = {};

  try {
    switch (context.role) {
      case 'student': {
        const { data: attendance } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', context.studentId)
          .limit(10);
        if (attendance) data.attendance = attendance;

        const { data: grades } = await supabase
          .from('grades')
          .select('*')
          .eq('student_id', context.studentId)
          .limit(10);
        if (grades) data.grades = grades;

        const { data: assignments } = await supabase
          .from('assignments')
          .select('*')
          .eq('student_id', context.studentId)
          .limit(10);
        if (assignments) data.assignments = assignments;
        break;
      }
      case 'parent': {
        const { data: feeStatus } = await supabase
          .from('fees')
          .select('*')
          .eq('parent_id', context.parentId)
          .limit(10);
        if (feeStatus) data.fees = feeStatus;

        const { data: children } = await supabase
          .from('students')
          .select('*')
          .eq('parent_id', context.parentId);
        if (children) data.children = children;
        break;
      }
      case 'teacher': {
        const { data: classes } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', context.teacherId)
          .limit(10);
        if (classes) data.classes = classes;

        const { data: exams } = await supabase
          .from('exams')
          .select('*')
          .eq('created_by', context.userId)
          .limit(10);
        if (exams) data.exams = exams;
        break;
      }
      case 'recruiter': {
        const { data: jobs } = await supabase
          .from('jobs')
          .select('*')
          .eq('recruiter_id', context.recruiterId)
          .limit(10);
        if (jobs) data.jobs = jobs;

        const { data: applications } = await supabase
          .from('applications')
          .select('*')
          .eq('job_id', context.jobId)
          .limit(10);
        if (applications) data.applications = applications;
        break;
      }
      case 'admin': {
        const { data: users } = await supabase
          .from('profiles')
          .select('*')
          .limit(20);
        if (users) data.recentUsers = users;

        const { data: schools } = await supabase
          .from('schools')
          .select('*')
          .limit(10);
        if (schools) data.schools = schools;
        break;
      }
    }
  } catch {
    // Gracefully handle missing tables
  }

  return data;
}
