import type { Request, Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { aiService } from './ai.service';
import type { CreateAiLessonInput, CreateAiQuizInput } from '@prasynx/types';

const tenantOf = (req: Request): string => req.user?.tenantId ?? '';
const userIdOf = (req: Request): string => req.user?.userId ?? '';

export class AiController {
  listLessons = asyncHandler(async (req: Request, res: Response) => {
    const lessons = await aiService.listLessons(tenantOf(req));
    res.status(200).json({ lessons });
  });

  createLesson = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as CreateAiLessonInput;
    if (!body?.title) throw new BadRequestError('Lesson title is required');
    const lesson = await aiService.createLesson(tenantOf(req), body, userIdOf(req));
    res.status(201).json({ lesson });
  });

  listQuizzes = asyncHandler(async (req: Request, res: Response) => {
    const quizzes = await aiService.listQuizzes(tenantOf(req));
    res.status(200).json({ quizzes });
  });

  createQuiz = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as CreateAiQuizInput;
    if (!body?.title) throw new BadRequestError('Quiz title is required');
    const quiz = await aiService.createQuiz(tenantOf(req), body, userIdOf(req));
    res.status(201).json({ quiz });
  });

  listAssistants = asyncHandler(async (req: Request, res: Response) => {
    const assistants = await aiService.listAssistants(tenantOf(req));
    res.status(200).json({ assistants });
  });

  listConversations = asyncHandler(async (req: Request, res: Response) => {
    const conversations = await aiService.listConversations(tenantOf(req));
    res.status(200).json({ conversations });
  });

  chat = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as { query?: string };
    if (!body?.query?.trim()) throw new BadRequestError('Query is required');
    const reply = await aiService.chat(tenantOf(req), body.query.trim(), userIdOf(req));
    res.status(200).json(reply);
  });
}

export const aiController = new AiController();