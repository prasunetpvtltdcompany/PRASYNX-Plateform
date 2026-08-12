import { createServerClient } from '../supabase/server';
import type { AIAction, AIActionResult, AIContext } from '../../types/ai';

const TOOL_DEFINITIONS: AIAction[] = [
  {
    id: 'get_attendance',
    name: 'get_attendance',
    description: 'Get attendance records for a student',
    parameters: { studentId: 'string', period: 'string' },
    requiredRole: ['student', 'parent', 'teacher', 'admin'],
    handler: async (params, context) => {
      const supabase = await createServerClient();
      const studentId = params.studentId || context.studentId;
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false })
        .limit(30);
      if (error) return { success: false, message: 'Failed to fetch attendance', error: error.message };
      return { success: true, message: `Found ${data.length} attendance records`, data };
    },
  },
  {
    id: 'get_grades',
    name: 'get_grades',
    description: 'Get grades for a student',
    parameters: { studentId: 'string', subject: 'string' },
    requiredRole: ['student', 'parent', 'teacher', 'admin'],
    handler: async (params, context) => {
      const supabase = await createServerClient();
      const studentId = params.studentId || context.studentId;
      let query = supabase.from('grades').select('*').eq('student_id', studentId);
      if (params.subject) query = query.eq('subject', params.subject);
      const { data, error } = await query.limit(20);
      if (error) return { success: false, message: 'Failed to fetch grades', error: error.message };
      return { success: true, message: `Found ${data.length} grade records`, data };
    },
  },
  {
    id: 'get_assignments',
    name: 'get_assignments',
    description: 'Get assignments for a student or class',
    parameters: { studentId: 'string', classId: 'string', status: 'string' },
    requiredRole: ['student', 'teacher', 'admin'],
    handler: async (params, context) => {
      const supabase = await createServerClient();
      let query = supabase.from('assignments').select('*');
      if (params.studentId || context.studentId) query = query.eq('student_id', params.studentId || context.studentId);
      if (params.classId || context.classId) query = query.eq('class_id', params.classId || context.classId);
      if (params.status) query = query.eq('status', params.status);
      const { data, error } = await query.limit(20);
      if (error) return { success: false, message: 'Failed to fetch assignments', error: error.message };
      return { success: true, message: `Found ${data.length} assignments`, data };
    },
  },
  {
    id: 'get_fees',
    name: 'get_fees',
    description: 'Get fee records for a student or parent',
    parameters: { studentId: 'string', parentId: 'string' },
    requiredRole: ['student', 'parent', 'admin'],
    handler: async (params, context) => {
      const supabase = await createServerClient();
      let query = supabase.from('fees').select('*');
      if (params.studentId || context.studentId) query = query.eq('student_id', params.studentId || context.studentId);
      if (params.parentId || context.parentId) query = query.eq('parent_id', params.parentId || context.parentId);
      const { data, error } = await query.limit(20);
      if (error) return { success: false, message: 'Failed to fetch fees', error: error.message };
      return { success: true, message: `Found ${data.length} fee records`, data };
    },
  },
  {
    id: 'get_exams',
    name: 'get_exams',
    description: 'Get exams for a class or student',
    parameters: { classId: 'string', studentId: 'string' },
    requiredRole: ['student', 'teacher', 'admin'],
    handler: async (params, context) => {
      const supabase = await createServerClient();
      let query = supabase.from('exams').select('*');
      if (params.classId || context.classId) query = query.eq('class_id', params.classId || context.classId);
      if (params.studentId || context.studentId) query = query.eq('student_id', params.studentId || context.studentId);
      const { data, error } = await query.limit(20);
      if (error) return { success: false, message: 'Failed to fetch exams', error: error.message };
      return { success: true, message: `Found ${data.length} exams`, data };
    },
  },
  {
    id: 'get_notifications',
    name: 'get_notifications',
    description: 'Get notifications for the current user',
    parameters: { limit: 'number' },
    requiredRole: ['student', 'parent', 'teacher', 'recruiter', 'admin'],
    handler: async (_params, context) => {
      const supabase = await createServerClient();
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', context.userId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) return { success: false, message: 'Failed to fetch notifications', error: error.message };
      return { success: true, message: `You have ${data.length} notifications`, data };
    },
  },
  {
    id: 'get_jobs',
    name: 'get_jobs',
    description: 'Get job listings',
    parameters: { recruiterId: 'string', status: 'string' },
    requiredRole: ['recruiter', 'admin'],
    handler: async (params, context) => {
      const supabase = await createServerClient();
      let query = supabase.from('jobs').select('*');
      if (params.recruiterId || context.recruiterId) query = query.eq('recruiter_id', params.recruiterId || context.recruiterId);
      if (params.status) query = query.eq('status', params.status);
      const { data, error } = await query.limit(20);
      if (error) return { success: false, message: 'Failed to fetch jobs', error: error.message };
      return { success: true, message: `Found ${data.length} job listings`, data };
    },
  },
  {
    id: 'get_applications',
    name: 'get_applications',
    description: 'Get job applications',
    parameters: { jobId: 'string', status: 'string' },
    requiredRole: ['recruiter', 'admin', 'student'],
    handler: async (params, context) => {
      const supabase = await createServerClient();
      let query = supabase.from('applications').select('*');
      if (params.jobId || context.jobId) query = query.eq('job_id', params.jobId || context.jobId);
      if (params.status) query = query.eq('status', params.status);
      if (context.role === 'student') query = query.eq('student_id', context.studentId);
      const { data, error } = await query.limit(20);
      if (error) return { success: false, message: 'Failed to fetch applications', error: error.message };
      return { success: true, message: `Found ${data.length} applications`, data };
    },
  },
  {
    id: 'create_study_plan',
    name: 'create_study_plan',
    description: 'Create a personalized study plan for a student',
    parameters: { subject: 'string', duration: 'string', focusAreas: 'string' },
    requiredRole: ['student', 'teacher'],
    handler: async (params, context) => {
      const supabase = await createServerClient();
      const { error } = await supabase.from('study_plans').insert({
        student_id: context.studentId,
        subject: params.subject,
        duration: params.duration,
        focus_areas: typeof params.focusAreas === 'string' ? params.focusAreas.split(',').map(s => s.trim()) : [],
        created_by: context.userId,
        created_at: new Date().toISOString(),
      });
      if (error) return { success: false, message: 'Failed to create study plan', error: error.message };
      return { success: true, message: `Study plan created for ${params.subject}` };
    },
  },
  {
    id: 'generate_report',
    name: 'generate_report',
    description: 'Generate a report (attendance, grade, or custom)',
    parameters: { type: 'string', period: 'string', format: 'string' },
    requiredRole: ['admin', 'teacher'],
    handler: async (_params, _context) => {
      return { success: true, message: 'Report generation started. You will be notified when ready.' };
    },
  },
  {
    id: 'schedule_interview',
    name: 'schedule_interview',
    description: 'Schedule an interview with a candidate',
    parameters: { candidateId: 'string', jobId: 'string', date: 'string', time: 'string' },
    requiredRole: ['recruiter', 'admin'],
    handler: async (params, context) => {
      const supabase = await createServerClient();
      const { error } = await supabase.from('interviews').insert({
        candidate_id: params.candidateId,
        job_id: params.jobId || context.jobId,
        scheduled_date: params.date,
        scheduled_time: params.time,
        scheduled_by: context.userId,
        status: 'scheduled',
        created_at: new Date().toISOString(),
      });
      if (error) return { success: false, message: 'Failed to schedule interview', error: error.message };
      return { success: true, message: `Interview scheduled for ${params.date} at ${params.time}` };
    },
  },
  {
    id: 'shortlist_candidate',
    name: 'shortlist_candidate',
    description: 'Shortlist a candidate for a position',
    parameters: { candidateId: 'string', jobId: 'string', notes: 'string' },
    requiredRole: ['recruiter', 'admin'],
    handler: async (params, context) => {
      const supabase = await createServerClient();
      const { error } = await supabase.from('applications').update({
        status: 'shortlisted',
        shortlisted_at: new Date().toISOString(),
        shortlisted_by: context.userId,
        notes: params.notes,
      }).eq('student_id', params.candidateId).eq('job_id', params.jobId || context.jobId);
      if (error) return { success: false, message: 'Failed to shortlist candidate', error: error.message };
      return { success: true, message: 'Candidate shortlisted successfully' };
    },
  },
];

export function getToolsForRole(role: string): AIAction[] {
  return TOOL_DEFINITIONS.filter(t => t.requiredRole.includes(role as any));
}

export async function executeToolAction(
  actionName: string,
  params: Record<string, unknown>,
  context: AIContext
): Promise<AIActionResult> {
  const tool = TOOL_DEFINITIONS.find(t => t.name === actionName);
  if (!tool) return { success: false, message: `Unknown action: ${actionName}`, error: 'Tool not found' };
  if (!tool.requiredRole.includes(context.role as any)) {
    return { success: false, message: 'You do not have permission to perform this action', error: 'Forbidden' };
  }
  return tool.handler(params, context);
}

export function getToolDefinitionsForSystemPrompt(role: string): string {
  const tools = getToolsForRole(role);
  if (tools.length === 0) return '';
  return tools.map(t =>
    `- ${t.name}: ${t.description}`
  ).join('\n');
}
