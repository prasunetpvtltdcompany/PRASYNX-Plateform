/** AI teaching module DTOs (schema: public.ai_*). */

export interface AiLessonDTO {
  id: string;
  organisation_id: string;
  title: string;
  subject_id: string | null;
  class_id: string | null;
  topic: string | null;
  duration: number | null;
  objectives: unknown[] | null;
  content: string | null;
  materials: unknown[] | null;
  status: string | null;
  created_by: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAiLessonInput {
  title: string;
  subject_id?: string;
  class_id?: string;
  topic?: string;
  duration?: number;
  objectives?: string[];
  content?: string;
  materials?: string[];
  status?: string;
}

export interface AiQuizDTO {
  id: string;
  organisation_id: string;
  title: string;
  subject_id: string | null;
  class_id: string | null;
  topic: string | null;
  difficulty: string | null;
  questions: unknown[] | null;
  question_count: number | null;
  status: string | null;
  created_by: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAiQuizInput {
  title: string;
  subject_id?: string;
  class_id?: string;
  topic?: string;
  difficulty?: string;
  questions?: unknown[];
  status?: string;
}

export interface AiAssistantDTO {
  id: string;
  organisation_id: string;
  name: string;
  description: string | null;
  assistant_type: string | null;
  subject_id: string | null;
  teacher_id: string | null;
  status: string | null;
  config: Record<string, unknown> | null;
  accuracy_score: number | null;
  usage_count: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface AiConversationDTO {
  id: string;
  organisation_id: string;
  user_id: string | null;
  assistant_id: string | null;
  query: string;
  response: string | null;
  context: Record<string, unknown> | null;
  created_at?: string;
}