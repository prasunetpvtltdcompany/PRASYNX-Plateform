import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireTenant } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { PERMISSIONS } from '@prasynx/config';
import { validate } from '../../shared/middleware/validate';
import { createAiLessonSchema, createAiQuizSchema } from '@prasynx/validation';
import { aiController } from './ai.controller';

const router = Router();

router.use(authenticate, requireTenant, authorize(PERMISSIONS.SCHOOL_AI_MANAGE));

router.get('/lessons', aiController.listLessons);
router.post('/lessons', validate({ body: createAiLessonSchema }), aiController.createLesson);

router.get('/quizzes', aiController.listQuizzes);
router.post('/quizzes', validate({ body: createAiQuizSchema }), aiController.createQuiz);

router.get('/assistants', aiController.listAssistants);
router.get('/conversations', aiController.listConversations);
router.post('/chat', validate({ body: z.object({ query: z.string().min(1).max(2000) }) }), aiController.chat);

export default router;