import type { AiLessonDTO, AiQuizDTO } from '@prasynx/types';
import { db } from '../../infrastructure/database/supabase';
import { NotFoundError } from '../../shared/errors/errors';

const LESSON_COLUMNS =
  'id,organisation_id,title,subject_id,class_id,topic,duration,objectives,content,materials,status,created_by,created_at,updated_at';
const QUIZ_COLUMNS =
  'id,organisation_id,title,subject_id,class_id,topic,difficulty,questions,question_count,status,created_by,created_at,updated_at';
const ASSISTANT_COLUMNS =
  'id,organisation_id,name,description,assistant_type,subject_id,teacher_id,status,config,accuracy_score,usage_count,created_at,updated_at';
const CONVERSATION_COLUMNS = 'id,organisation_id,user_id,assistant_id,query,response,context,created_at';

export class AiRepository {
  async listLessons(tenantId: string): Promise<AiLessonDTO[]> {
    const { data, error } = await db.from('ai_lessons').select(LESSON_COLUMNS).eq('organisation_id', tenantId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data as unknown as AiLessonDTO[]) ?? [];
  }

  async createLesson(tenantId: string, row: Record<string, unknown>): Promise<string> {
    const { data, error } = await db.from('ai_lessons').insert(row).select('id').single();
    if (error || !data) throw error ?? new Error('Lesson could not be created');
    return data.id as string;
  }

  async findLesson(tenantId: string, id: string): Promise<AiLessonDTO | null> {
    const { data, error } = await db.from('ai_lessons').select(LESSON_COLUMNS).eq('id', id).eq('organisation_id', tenantId).maybeSingle();
    if (error) throw error;
    return (data as unknown as AiLessonDTO | null) ?? null;
  }

  async listQuizzes(tenantId: string): Promise<AiQuizDTO[]> {
    const { data, error } = await db.from('ai_quizzes').select(QUIZ_COLUMNS).eq('organisation_id', tenantId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data as unknown as AiQuizDTO[]) ?? [];
  }

  async createQuiz(tenantId: string, row: Record<string, unknown>): Promise<string> {
    const { data, error } = await db.from('ai_quizzes').insert(row).select('id').single();
    if (error || !data) throw error ?? new Error('Quiz could not be created');
    return data.id as string;
  }

  async findQuiz(tenantId: string, id: string): Promise<AiQuizDTO | null> {
    const { data, error } = await db.from('ai_quizzes').select(QUIZ_COLUMNS).eq('id', id).eq('organisation_id', tenantId).maybeSingle();
    if (error) throw error;
    return (data as unknown as AiQuizDTO | null) ?? null;
  }

  async listAssistants(tenantId: string): Promise<Array<Record<string, unknown>>> {
    const { data, error } = await db.from('ai_assistants').select(ASSISTANT_COLUMNS).eq('organisation_id', tenantId).order('name');
    if (error) throw error;
    return data ?? [];
  }

  async listConversations(tenantId: string, limit = 50): Promise<Array<Record<string, unknown>>> {
    const { data, error } = await db
      .from('ai_conversations')
      .select(CONVERSATION_COLUMNS)
      .eq('organisation_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  }

  async saveConversation(tenantId: string, row: Record<string, unknown>): Promise<string> {
    const { data, error } = await db.from('ai_conversations').insert(row).select('id').single();
    if (error || !data) throw error ?? new Error('Conversation could not be saved');
    return data.id as string;
  }

  async assertLesson(tenantId: string, id: string): Promise<AiLessonDTO> {
    const found = await this.findLesson(tenantId, id);
    if (!found) throw new NotFoundError('Lesson not found in this school');
    return found;
  }

  async assertQuiz(tenantId: string, id: string): Promise<AiQuizDTO> {
    const found = await this.findQuiz(tenantId, id);
    if (!found) throw new NotFoundError('Quiz not found in this school');
    return found;
  }
}