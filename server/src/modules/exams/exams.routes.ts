import { Router } from 'express';
import {
  createExamSchema,
  updateExamSchema,
  scheduleExamSchema,
  deleteScheduleSchema,
  recordResultsSchema,
  resultsQuerySchema,
  examQuerySchema,
} from '@prasynx/validation';
import { authenticate, requireTenant } from '../../shared/middleware/authenticate';
import { authorize, authorizeAny } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { userLimiter } from '../../shared/middleware/rateLimit';
import { audit } from '../../shared/middleware/audit';
import { PERMISSIONS } from '@prasynx/config';
import { examController } from './exams.controller';

const router = Router();

router.use(authenticate, requireTenant, audit);

router.post(
  '/',
  authorize(PERMISSIONS.SCHOOL_EXAMS_MANAGE),
  userLimiter(60_000, 30, 'Too many exam writes, slow down.'),
  validate({ body: createExamSchema }),
  examController.create,
);

router.get(
  '/',
  authorizeAny(PERMISSIONS.SCHOOL_EXAMS_VIEW, PERMISSIONS.SCHOOL_EXAMS_MANAGE),
  validate({ query: examQuerySchema }),
  examController.list,
);

router.patch(
  '/:examId',
  authorize(PERMISSIONS.SCHOOL_EXAMS_MANAGE),
  userLimiter(60_000, 30, 'Too many exam updates, slow down.'),
  validate({ body: updateExamSchema }),
  examController.update,
);

router.get(
  '/:examId',
  authorizeAny(PERMISSIONS.SCHOOL_EXAMS_VIEW, PERMISSIONS.SCHOOL_EXAMS_MANAGE),
  examController.get,
);

router.post(
  '/:examId/schedule',
  authorize(PERMISSIONS.SCHOOL_EXAMS_MANAGE),
  userLimiter(60_000, 20, 'Too many schedule writes, slow down.'),
  validate({ body: scheduleExamSchema }),
  examController.schedule,
);

router.post(
  '/:examId/schedule/delete',
  authorize(PERMISSIONS.SCHOOL_EXAMS_MANAGE),
  userLimiter(60_000, 20, 'Too many schedule writes, slow down.'),
  validate({ body: deleteScheduleSchema }),
  examController.deleteSchedules,
);

router.post(
  '/:examId/results',
  authorize(PERMISSIONS.SCHOOL_EXAMS_MANAGE),
  userLimiter(60_000, 30, 'Too many result writes, slow down.'),
  validate({ body: recordResultsSchema }),
  examController.recordResults,
);

router.get(
  '/results/all',
  authorizeAny(PERMISSIONS.SCHOOL_EXAMS_VIEW, PERMISSIONS.SCHOOL_EXAMS_MANAGE),
  validate({ query: resultsQuerySchema }),
  examController.results,
);

export default router;