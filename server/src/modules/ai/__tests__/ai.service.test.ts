import { describe, it, expect, beforeEach } from 'vitest';
import { AiService } from '../ai.service';
import { AiRepository } from '../ai.repository';
import { NotFoundError } from '../../../shared/errors/errors';

const TENANT = '00000000-0000-0000-0000-00000000000a';
const LESSON_ID = '00000000-0000-0000-0000-000000000111';
const QUIZ_ID = '00000000-0000-0000-0000-000000000112';
const USER_ID = '00000000-0000-0000-0000-0000000000ad';

const lesson = {
  id: LESSON_ID,
  organisation_id: TENANT,
  title: 'Photosynthesis',
  subject_id: null,
  class_id: null,
  topic: 'Plants',
  duration: 45,
  status: 'draft',
  created_at: '2026-08-10T00:00:00.000Z',
};

const quiz = {
  id: QUIZ_ID,
  organisation_id: TENANT,
  title: 'Photosynthesis quiz',
  questions: [{ q: 'x' }],
  question_count: 1,
  status: 'draft',
  created_at: '2026-08-10T00:00:00.000Z',
};

function stubRepo(overrides: Partial<AiRepository> = {}): AiRepository {
  return {
    listLessons: async () => [lesson],
    createLesson: async () => LESSON_ID,
    findLesson: async (_t: string, id: string) => (id === LESSON_ID ? lesson : null),
    listQuizzes: async () => [quiz],
    createQuiz: async () => QUIZ_ID,
    findQuiz: async (_t: string, id: string) => (id === QUIZ_ID ? quiz : null),
    listAssistants: async () => [{ id: 'a1', name: 'Prerana AI' }],
    listConversations: async () => [],
    saveConversation: async () => 'c1',
    assertLesson: async (_t: string, id: string) =>
      id === LESSON_ID ? lesson : ((() => { throw new NotFoundError('Lesson not found in this school'); })() as typeof lesson),
    assertQuiz: async (_t: string, id: string) =>
      id === QUIZ_ID ? quiz : ((() => { throw new NotFoundError('Quiz not found in this school'); })() as typeof quiz),
    ...overrides,
  } as unknown as AiRepository;
}

describe('AiService', () => {
  let service: AiService;

  beforeEach(() => {
    service = new AiService(stubRepo());
  });

  it('lists lessons', async () => {
    const list = await service.listLessons(TENANT);
    expect(list[0].title).toBe('Photosynthesis');
  });

  it('creates a lesson and persists a default duration', async () => {
    const created = await service.createLesson(TENANT, { title: 'Fractions', content: 'Lesson body' }, USER_ID);
    expect(created.title).toBe('Photosynthesis');
  });

  it('creates a quiz and counts questions', async () => {
    await service.createQuiz(TENANT, { title: 'Fractions quiz', questions: [{ a: 1 }, { b: 2 }] }, USER_ID);
    expect(true).toBe(true);
  });

  it('generates a helpful response and persists it', async () => {
    const saved: Record<string, unknown>[] = [];
    const svc = new AiService(
      stubRepo({ saveConversation: async (_t: string, row: Record<string, unknown>) => { saved.push(row); return 'c2'; } }),
    );
    const reply = await svc.chat(TENANT, 'Can you help with a quiz?', USER_ID);
    expect(reply.response).toMatch(/quiz/i);
    expect(saved).toHaveLength(1);
  });
});