import { supabase } from '../config/database';

export class AiTeachingService {
  async getDashboard(orgId: string) {
    const [assistantsRes, convosRes, lessonsRes, quizzesRes, kbRes] = await Promise.all([
      supabase.from('ai_assistants').select('id, status, usage_count, accuracy_score').eq('organisation_id', orgId),
      supabase.from('ai_conversations').select('id, created_at').eq('organisation_id', orgId),
      supabase.from('ai_lessons').select('id').eq('organisation_id', orgId),
      supabase.from('ai_quizzes').select('id').eq('organisation_id', orgId),
      supabase.from('ai_knowledge_base').select('id').eq('organisation_id', orgId),
    ]);

    const assistants = assistantsRes.data || [];
    const activeAssistants = assistants.filter((a: any) => a.status === 'active');
    const totalUsage = assistants.reduce((s: number, a: any) => s + (a.usage_count || 0), 0);
    const avgAccuracy = assistants.length > 0
      ? Math.round(assistants.reduce((s: number, a: any) => s + (a.accuracy_score || 0), 0) / assistants.length) : 0;
    const lessonsCount = lessonsRes.data?.length || 0;
    const quizzesCount = quizzesRes.data?.length || 0;
    const convosToday = (convosRes.data || []).filter((c: any) =>
      new Date(c.created_at).toDateString() === new Date().toDateString()).length;

    const timeSaved = lessonsCount * 45 + quizzesCount * 30;
    const teacherCount = 50;
    const adoptionRate = teacherCount > 0 ? Math.min(100, Math.round((activeAssistants.length / 8) * 100)) : 0;

    return {
      activeAssistants: activeAssistants.length,
      questionsAnsweredToday: convosToday,
      aiGeneratedLessons: lessonsCount,
      assignmentsGenerated: quizzesCount,
      timeSavedMinutes: timeSaved,
      studentInteractions: totalUsage,
      aiAccuracyScore: avgAccuracy,
      teacherAdoptionRate: adoptionRate,
      totalAssistants: assistants.length,
      totalConversations: convosRes.data?.length || 0,
      knowledgeBaseDocs: kbRes.data?.length || 0,
    };
  }

  async getAssistants(orgId: string, filters?: any) {
    let query = supabase.from('ai_assistants').select('*').eq('organisation_id', orgId);

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.type) query = query.eq('assistant_type', filters.type);
    if (filters?.subject_id) query = query.eq('subject_id', filters.subject_id);
    if (filters?.teacher_id) query = query.eq('teacher_id', filters.teacher_id);
    if (filters?.search) {
      const s = filters.search;
      query = query.or(`name.ilike.%${s}%,description.ilike.%${s}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    const defaultAssistants = [
      { name: 'AI Subject Tutor', description: 'Personalized subject tutoring with adaptive learning paths', usage: 1284, accuracy: 94, type: 'tutor' },
      { name: 'AI Homework Assistant', description: 'Step-by-step homework help and problem solving', usage: 3452, accuracy: 92, type: 'homework' },
      { name: 'AI Quiz Generator', description: 'Auto-generate quizzes from any topic or curriculum', usage: 876, accuracy: 96, type: 'quiz' },
      { name: 'AI Lesson Planner', description: 'Create comprehensive lesson plans aligned to standards', usage: 654, accuracy: 95, type: 'lesson' },
      { name: 'AI Content Creator', description: 'Generate educational content, notes, and resources', usage: 2341, accuracy: 93, type: 'content' },
      { name: 'AI Grading Assistant', description: 'Auto-grade assignments with detailed feedback', usage: 1876, accuracy: 91, type: 'grading' },
      { name: 'AI Attendance Assistant', description: 'Smart attendance tracking with insights', usage: 4321, accuracy: 98, type: 'attendance' },
      { name: 'AI Parent Communication', description: 'Automated parent updates and communication', usage: 987, accuracy: 97, type: 'communication' },
    ];

    if (!data || data.length === 0) {
      return defaultAssistants.map((a, i) => ({
        id: `${i + 1}`, ...a, status: 'active', usage_count: a.usage,
        accuracy_score: a.accuracy, assistant_type: a.type,
      }));
    }

    return data;
  }

  async createAssistant(orgId: string, body: any) {
    const { data, error } = await supabase.from('ai_assistants').insert({
      organisation_id: orgId, name: body.name, description: body.description,
      assistant_type: body.type || 'custom', subject_id: body.subject_id,
      teacher_id: body.teacher_id, status: body.status || 'active',
      config: body.config || {}, accuracy_score: body.accuracy_score || 90,
    }).select().single();
    if (error) throw error;
    return data;
  }

  async updateAssistant(id: string, body: any) {
    const { data, error } = await supabase.from('ai_assistants').update(body).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteAssistant(id: string) {
    const { error } = await supabase.from('ai_assistants').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }

  async getConversations(orgId: string, filters?: any) {
    const from = filters?.from || new Date(Date.now() - 7 * 86400000).toISOString();
    let query = supabase.from('ai_conversations').select('*').eq('organisation_id', orgId)
      .gte('created_at', from).order('created_at', { ascending: false });

    if (filters?.user_id) query = query.eq('user_id', filters.user_id);
    if (filters?.assistant_id) query = query.eq('assistant_id', filters.assistant_id);
    if (filters?.search) query = query.or(`query.ilike.%${filters.search}%,response.ilike.%${filters.search}%`);

    const { data, error } = await query.limit(filters?.limit || 100);
    if (error) throw error;
    return data || [];
  }

  async sendMessage(orgId: string, body: { query: string; user_id?: string; assistant_id?: string; context?: any }) {
    const response = `I understand your question about "${body.query}". As an AI teaching assistant, I can help explain concepts, provide examples, and guide learning. Could you specify which subject or topic you'd like to explore further?`;
    const { data, error } = await supabase.from('ai_conversations').insert({
      organisation_id: orgId, user_id: body.user_id || 'system',
      assistant_id: body.assistant_id || 'default',
      query: body.query, response, context: body.context || {},
    }).select().single();
    if (error) throw error;
    return data;
  }

  async getStudentSupport(orgId: string, studentId?: string) {
    let query = supabase.from('ai_conversations').select('*').eq('organisation_id', orgId);
    if (studentId) query = query.eq('user_id', studentId);
    const { data } = await query.order('created_at', { ascending: false }).limit(100);
    const entries = data || [];

    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'];
    const difficultyCounts: Record<string, number> = {};
    entries.forEach((e: any) => {
      const sub = subjects.find(s => e.query?.toLowerCase().includes(s.toLowerCase())) || 'General';
      difficultyCounts[sub] = (difficultyCounts[sub] || 0) + 1;
    });

    const weakSubjects = Object.entries(difficultyCounts)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      totalQueries: entries.length,
      uniqueStudents: [...new Set(entries.map((e: any) => e.user_id))].length,
      topQueries: this.getTopQueries(entries),
      weakSubjects,
      recentActivity: entries.slice(0, 10),
    };
  }

  async getTeacherTools(orgId: string, teacherId?: string) {
    const [lessonsRes, quizzesRes, assignmentsRes] = await Promise.all([
      supabase.from('ai_lessons').select('id, title, created_at, status').eq('organisation_id', orgId),
      supabase.from('ai_quizzes').select('id, title, created_at, status').eq('organisation_id', orgId),
      supabase.from('ai_generated_content').select('id, title, content_type, created_at, status').eq('organisation_id', orgId),
    ]);

    return {
      totalLessons: lessonsRes.data?.length || 0,
      totalQuizzes: quizzesRes.data?.length || 0,
      totalContent: assignmentsRes.data?.length || 0,
      recentLessons: (lessonsRes.data || []).slice(0, 5),
      recentQuizzes: (quizzesRes.data || []).slice(0, 5),
      metrics: {
        lessonsCreated: lessonsRes.data?.filter((l: any) => l.status === 'published').length || 0,
        quizzesCreated: quizzesRes.data?.filter((q: any) => q.status === 'published').length || 0,
      },
    };
  }

  async generateLesson(orgId: string, body: any) {
    const { data, error } = await supabase.from('ai_lessons').insert({
      organisation_id: orgId, title: body.title, subject_id: body.subject_id,
      class_id: body.class_id, topic: body.topic, duration: body.duration || 45,
      objectives: body.objectives || [], content: body.content || '',
      materials: body.materials || [], status: 'draft', created_by: body.created_by || 'system',
    }).select().single();
    if (error) throw error;
    return data;
  }

  async generateQuiz(orgId: string, body: any) {
    const questions = Array.from({ length: body.count || 10 }, (_, i) => ({
      question: `Sample question ${i + 1} for ${body.topic || body.title}`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      explanation: `Explanation for question ${i + 1}`,
    }));
    const { data, error } = await supabase.from('ai_quizzes').insert({
      organisation_id: orgId, title: body.title, subject_id: body.subject_id,
      class_id: body.class_id, topic: body.topic, difficulty: body.difficulty || 'medium',
      questions, question_count: questions.length, status: 'draft',
      created_by: body.created_by || 'system',
    }).select().single();
    if (error) throw error;
    return data;
  }

  async generateContent(orgId: string, body: any) {
    const { data, error } = await supabase.from('ai_generated_content').insert({
      organisation_id: orgId, title: body.title, content_type: body.content_type,
      subject_id: body.subject_id, class_id: body.class_id, topic: body.topic,
      content: body.content || '', format: body.format || 'text', status: 'draft',
      created_by: body.created_by || 'system',
    }).select().single();
    if (error) throw error;
    return data;
  }

  async getKnowledgeBase(orgId: string, filters?: any) {
    let query = supabase.from('ai_knowledge_base').select('*').eq('organisation_id', orgId);
    if (filters?.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    if (filters?.type) query = query.eq('document_type', filters.type);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async uploadKnowledgeDoc(orgId: string, body: any) {
    const { data, error } = await supabase.from('ai_knowledge_base').insert({
      organisation_id: orgId, title: body.title, description: body.description,
      document_type: body.document_type || 'document', content: body.content || '',
      tags: body.tags || [], file_url: body.file_url || '', status: 'active',
    }).select().single();
    if (error) throw error;
    return data;
  }

  async deleteKnowledgeDoc(id: string) {
    const { error } = await supabase.from('ai_knowledge_base').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }

  async getAnalytics(orgId: string) {
    const [convosRes, lessonsRes, quizzesRes, contentRes, assistantsRes] = await Promise.all([
      supabase.from('ai_conversations').select('created_at, query, user_id').eq('organisation_id', orgId),
      supabase.from('ai_lessons').select('created_at, subject_id, status').eq('organisation_id', orgId),
      supabase.from('ai_quizzes').select('created_at, subject_id, difficulty').eq('organisation_id', orgId),
      supabase.from('ai_generated_content').select('created_at, content_type, status').eq('organisation_id', orgId),
      supabase.from('ai_assistants').select('name, usage_count, accuracy_score').eq('organisation_id', orgId),
    ]);

    const convos = convosRes.data || [];
    const lessons = lessonsRes.data || [];
    const quizzes = quizzesRes.data || [];
    const content = contentRes.data || [];
    const assistants = assistantsRes.data || [];

    const usageTrend = this.buildTimeSeries(convos, 'created_at');
    const interactionTrend = this.buildTimeSeries(convos, 'created_at');
    const lessonTrend = this.buildTimeSeries(lessons, 'created_at');
    const accuracyTrend = assistants.length > 0 ? assistants.map((a: any) => ({
      name: a.name, accuracy: a.accuracy_score, usage: a.usage_count,
    })) : [];

    return {
      usageTrend: usageTrend.slice(-30),
      interactionTrend: interactionTrend.slice(-30),
      lessonCreationTrend: lessonTrend.slice(-30),
      subjectUsage: this.aggregateBySubject([...lessons, ...quizzes]),
      assistantAccuracy: accuracyTrend,
      contentStats: {
        total: content.length,
        byType: this.aggregateByType(content, 'content_type'),
        published: content.filter((c: any) => c.status === 'published').length,
        drafts: content.filter((c: any) => c.status === 'draft').length,
      },
      conversationStats: {
        total: convos.length,
        uniqueUsers: [...new Set(convos.map((c: any) => c.user_id))].length,
        topQueries: this.getTopQueries(convos),
      },
    };
  }

  async getReports(orgId: string, type: string) {
    const dash = await this.getDashboard(orgId);
    const analytics = await this.getAnalytics(orgId);

    switch (type) {
      case 'usage':
        return { ...dash, analytics, type: 'usage' };
      case 'learning':
        return { ...dash, type: 'learning', studentSupport: await this.getStudentSupport(orgId) };
      case 'productivity':
        return { ...dash, type: 'productivity', teacherTools: await this.getTeacherTools(orgId) };
      case 'content':
        return { ...dash, type: 'content', analytics };
      case 'improvement':
        return { ...dash, type: 'improvement', analytics };
      default:
        return { ...dash, analytics };
    }
  }

  private getTopQueries(entries: any[]) {
    const freq: Record<string, number> = {};
    entries.forEach((e: any) => {
      const q = e.query?.substring(0, 60) || 'Unknown';
      freq[q] = (freq[q] || 0) + 1;
    });
    return Object.entries(freq)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private buildTimeSeries(data: any[], field: string) {
    const grouped: Record<string, number> = {};
    data.forEach((item: any) => {
      const date = item[field]?.substring(0, 10);
      if (date) grouped[date] = (grouped[date] || 0) + 1;
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }

  private aggregateBySubject(data: any[]) {
    const grouped: Record<string, number> = {};
    data.forEach((item: any) => {
      const sub = item.subject_id || 'Unknown';
      grouped[sub] = (grouped[sub] || 0) + 1;
    });
    return Object.entries(grouped).map(([subject, count]) => ({ subject, count }));
  }

  private aggregateByType(data: any[], field: string) {
    const grouped: Record<string, number> = {};
    data.forEach((item: any) => {
      const type = item[field] || 'Unknown';
      grouped[type] = (grouped[type] || 0) + 1;
    });
    return Object.entries(grouped).map(([type, count]) => ({ type, count }));
  }
}

export const aiTeachingService = new AiTeachingService();
