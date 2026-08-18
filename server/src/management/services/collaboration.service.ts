import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class CollaborationService {
  // ==================== CLASSROOMS ====================
  async getClassrooms(orgId: string) {
    const { data } = await supabase
      .from('virtual_classrooms')
      .select('*, members:classroom_members(count), teacher:users!teacher_id(full_name)')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false });
    return (data || []).map(c => ({
      ...c, memberCount: c.members?.[0]?.count || 0, teacherName: c.teacher?.full_name,
    }));
  }

  async createClassroom(orgId: string, data: any) {
    const room = {
      organisation_id: orgId,
      name: data.name,
      description: data.description,
      teacher_id: data.teacher_id,
      subject: data.subject,
      max_students: data.max_students || 30,
      code: data.code || Math.random().toString(36).slice(2, 8).toUpperCase(),
      status: 'active',
      created_by: data.created_by,
    };
    const { data: result, error } = await supabase.from('virtual_classrooms').insert(room).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async updateClassroom(id: string, data: any) {
    const { data: result, error } = await supabase.from('virtual_classrooms').update(data).eq('id', id).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async deleteClassroom(id: string) {
    const { error } = await supabase.from('virtual_classrooms').delete().eq('id', id);
    if (error) throw new BadRequestError(error.message);
    return { success: true };
  }

  // ==================== PROJECTS ====================
  async getProjects(orgId: string) {
    const { data } = await supabase
      .from('group_projects')
      .select('*, members:project_members(count), tasks:project_tasks(count)')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false });
    return (data || []).map(p => ({
      ...p, memberCount: p.members?.[0]?.count || 0, taskCount: p.tasks?.[0]?.count || 0,
    }));
  }

  async createProject(orgId: string, data: any) {
    const project = {
      organisation_id: orgId,
      title: data.title,
      description: data.description,
      subject: data.subject,
      lead_id: data.lead_id,
      max_members: data.max_members || 5,
      due_date: data.due_date,
      status: 'active',
      created_by: data.created_by,
    };
    const { data: result, error } = await supabase.from('group_projects').insert(project).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async updateProject(id: string, data: any) {
    const { data: result, error } = await supabase.from('group_projects').update(data).eq('id', id).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async deleteProject(id: string) {
    const { error } = await supabase.from('group_projects').delete().eq('id', id);
    if (error) throw new BadRequestError(error.message);
    return { success: true };
  }

  // ==================== PROJECT TASKS ====================
  async getProjectTasks(projectId: string) {
    const { data } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    return data || [];
  }

  async createTask(orgId: string, data: any) {
    const { data: result, error } = await supabase.from('project_tasks').insert({
      project_id: data.project_id,
      title: data.title,
      description: data.description,
      assigned_to: data.assigned_to,
      due_date: data.due_date,
      priority: data.priority || 'medium',
      status: 'pending',
    }).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async updateTask(taskId: string, data: any) {
    const update: any = { ...data };
    if (data.status === 'completed') update.completed_at = new Date().toISOString();
    const { data: result, error } = await supabase.from('project_tasks').update(update).eq('id', taskId).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async deleteTask(taskId: string) {
    const { error } = await supabase.from('project_tasks').delete().eq('id', taskId);
    if (error) throw new BadRequestError(error.message);
    return { success: true };
  }

  // ==================== WHITEBOARDS ====================
  async getWhiteboards(orgId: string) {
    const { data } = await supabase
      .from('whiteboard_sessions')
      .select('*')
      .eq('organisation_id', orgId)
      .order('updated_at', { ascending: false });
    return data || [];
  }

  async createWhiteboard(orgId: string, data: any) {
    const { data: result, error } = await supabase.from('whiteboard_sessions').insert({
      organisation_id: orgId,
      classroom_id: data.classroom_id,
      title: data.title,
      canvas_data: {},
      is_live: false,
      created_by: data.created_by,
    }).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async deleteWhiteboard(id: string) {
    const { error } = await supabase.from('whiteboard_sessions').delete().eq('id', id);
    if (error) throw new BadRequestError(error.message);
    return { success: true };
  }

  // ==================== DOCUMENTS ====================
  async getDocuments(orgId: string) {
    const { data } = await supabase
      .from('co_edited_documents')
      .select('*, collaborators:document_collaborators(count)')
      .eq('organisation_id', orgId)
      .order('updated_at', { ascending: false });
    return (data || []).map(d => ({ ...d, collaboratorCount: d.collaborators?.[0]?.count || 0 }));
  }

  async createDocument(orgId: string, data: any) {
    const { data: result, error } = await supabase.from('co_edited_documents').insert({
      organisation_id: orgId,
      classroom_id: data.classroom_id,
      project_id: data.project_id,
      title: data.title,
      content: data.content || '',
      version: 1,
      created_by: data.created_by,
    }).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async updateDocument(id: string, data: any) {
    const { data: current } = await supabase.from('co_edited_documents').select('version').eq('id', id).single();
    const update: any = { ...data, version: (current?.version || 0) + 1, updated_at: new Date().toISOString() };
    const { data: result, error } = await supabase.from('co_edited_documents').update(update).eq('id', id).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async deleteDocument(id: string) {
    const { error } = await supabase.from('co_edited_documents').delete().eq('id', id);
    if (error) throw new BadRequestError(error.message);
    return { success: true };
  }

  // ==================== FORUMS ====================
  async getForums(orgId: string) {
    const { data } = await supabase
      .from('discussion_forums')
      .select('*, posts:forum_posts(count)')
      .eq('organisation_id', orgId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    return (data || []).map(f => ({ ...f, postCount: f.posts?.[0]?.count || 0 }));
  }

  async createForum(orgId: string, data: any) {
    const { data: result, error } = await supabase.from('discussion_forums').insert({
      organisation_id: orgId,
      classroom_id: data.classroom_id,
      title: data.title,
      description: data.description,
      is_pinned: data.is_pinned || false,
      created_by: data.created_by,
    }).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async deleteForum(id: string) {
    const { error } = await supabase.from('discussion_forums').delete().eq('id', id);
    if (error) throw new BadRequestError(error.message);
    return { success: true };
  }

  async getForumPosts(forumId: string) {
    const { data } = await supabase
      .from('forum_posts')
      .select('*, user:created_by(full_name)')
      .eq('forum_id', forumId)
      .is('parent_id', null)
      .order('created_at', { ascending: true });
    return (data || []).map(p => ({ ...p, authorName: p.user?.full_name }));
  }

  async createPost(orgId: string, data: any) {
    const { data: result, error } = await supabase.from('forum_posts').insert({
      forum_id: data.forum_id,
      parent_id: data.parent_id || null,
      content: data.content,
      created_by: data.created_by,
    }).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async getDashboard(orgId: string) {
    const [classrooms, projects, documents, forums] = await Promise.all([
      this.getClassrooms(orgId),
      this.getProjects(orgId),
      this.getDocuments(orgId),
      this.getForums(orgId),
    ]);

    return {
      summary: {
        totalClassrooms: classrooms.length,
        activeClassrooms: classrooms.filter(c => c.status === 'active').length,
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        totalDocuments: documents.length,
        totalForums: forums.length,
      },
      recentClassrooms: classrooms.slice(0, 5),
      recentProjects: projects.slice(0, 5),
    };
  }
}

export const collaborationService = new CollaborationService();
