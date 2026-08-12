import { AiRepository } from './ai.repository';
import type { AiLessonDTO, AiQuizDTO, CreateAiLessonInput, CreateAiQuizInput } from '@prasynx/types';

/**
 * Rule-based teaching assistant. This is a deterministic fallback that keeps the
 * AI module functional without external LLM keys; swap `respond()` for a real
 * model call (OpenAI/Anthropic) when credentials are provisioned. The response
 * is still persisted to ai_conversations so the audit trail stays intact.
 */
const ASSISTANT_NAME = 'Prerana AI';

function respond(query: string): string {
  const q = query.toLowerCase();
  if (/(quiz|test|assessment|practice)/.test(q)) {
    return 'I can draft a quiz on any topic. Create one from the AI Teaching page and I will suggest chapter-wise questions (MCQs, true/false, short answer) with difficulty tracking.';
  }
  if (/(lesson|plan|syllabus|chapter|teach)/.test(q)) {
    return 'To prepare a lesson plan, tell me the subject, class and topic. I generate objectives, key points, activities and assessment ideas, aligned to the chapter.';
  }
  if (/(homework|assignment|tasks)/.test(q)) {
    return 'For homework support I recommend short, outcome-based tasks. I can generate differentiated questions based on the class and difficulty.';
  }
  if (/(schedule|timetable|class)/.test(q)) {
    return 'I can help review the timetable and flag clashes or drop-in coverage. Check the Timetable module and I will suggest the best slot for a subject.';
  }
  if (/(fee|payment|finance|expense)/.test(q)) {
    return 'For finance queries, view the Finance module. I can summarise collections outstanding by grade if you ask for a monthly summary.';
  }
  if (/(attendance|absent|leave)/.test(q)) {
    return 'Attendance insights: I can spot patterns like repeated late arrivals or long streaks of absence from the Attendance module records.';
  }
  if (/(hello|hi|hey|namaste|help|what can you)[?.]?$/.test(q)) {
    return `Hello! I am ${ASSISTANT_NAME}, the PRASYNX teaching assistant. I can help draft lesson plans, quizzes, homework and provide academic insights. Ask me in English or Hindi.`;
  }
  return `I understood your request about "${query.slice(0, 120)}". I specialise in lesson planning, quiz generation, homework ideas and academic insights. Please provide more detail (subject, class and topic) and I will prepare a full plan.`;
}

export class AiService {
  constructor(private repo: AiRepository) {}

  listLessons(tenantId: string): Promise<AiLessonDTO[]> {
    return this.repo.listLessons(tenantId);
  }

  async createLesson(tenantId: string, input: CreateAiLessonInput, userId: string): Promise<AiLessonDTO> {
    const id = await this.repo.createLesson(tenantId, {
      organisation_id: tenantId,
      title: input.title,
      subject_id: input.subject_id || null,
      class_id: input.class_id || null,
      topic: input.topic || null,
      duration: input.duration ?? 45,
      objectives: input.objectives ?? null,
      content: input.content ?? null,
      materials: input.materials ?? null,
      status: input.status ?? 'draft',
      created_by: userId,
    });
    const created = await this.repo.findLesson(tenantId, id);
    if (!created) throw new Error('Lesson was created but could not be loaded');
    return created;
  }

  listQuizzes(tenantId: string): Promise<AiQuizDTO[]> {
    return this.repo.listQuizzes(tenantId);
  }

  async createQuiz(tenantId: string, input: CreateAiQuizInput, userId: string): Promise<AiQuizDTO> {
    const questions = input.questions ?? [];
    const id = await this.repo.createQuiz(tenantId, {
      organisation_id: tenantId,
      title: input.title,
      subject_id: input.subject_id || null,
      class_id: input.class_id || null,
      topic: input.topic || null,
      difficulty: input.difficulty || 'medium',
      questions,
      question_count: questions.length || null,
      status: input.status ?? 'draft',
      created_by: userId,
    });
    const created = await this.repo.findQuiz(tenantId, id);
    if (!created) throw new Error('Quiz was created but could not be loaded');
    return created;
  }

  listAssistants(tenantId: string) {
    return this.repo.listAssistants(tenantId);
  }

  listConversations(tenantId: string) {
    return this.repo.listConversations(tenantId);
  }

  async chat(tenantId: string, query: string, userId: string): Promise<{ id: string; query: string; response: string }> {
    const response = respond(query);
    const id = await this.repo.saveConversation(tenantId, {
      organisation_id: tenantId,
      user_id: userId,
      assistant_id: ASSISTANT_NAME,
      query,
      response,
      context: { source: 'rule-based-v1' },
    });
    return { id, query, response };
  }
}

export const aiService = new AiService(new AiRepository());