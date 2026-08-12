import { Router } from 'express';
import { createAssignmentSchema, submitAssignmentSchema, gradeSubmissionSchema, assignmentQuerySchema } from '@prasynx/validation';
import { authenticate, requireTenant } from '../../shared/middleware/authenticate';
import { authorize, authorizeAny } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { userLimiter } from '../../shared/middleware/rateLimit';
import { audit } from '../../shared/middleware/audit';
import { PERMISSIONS } from '@prasynx/config';
import { assignmentController } from './assignments.controller';

const router = Router();

router.use(authenticate, requireTenant, audit);

router.post(
  '/',
  authorize(PERMISSIONS.SCHOOL_ASSIGNMENTS_MANAGE),
  userLimiter(60_000, 30, 'Too many assignment writes, slow down.'),
  validate({ body: createAssignmentSchema }),
  assignmentController.create,
);

router.get(
  '/',
  authorizeAny(PERMISSIONS.SCHOOL_ASSIGNMENTS_VIEW, PERMISSIONS.SCHOOL_ASSIGNMENTS_MANAGE),
  validate({ query: assignmentQuerySchema }),
  assignmentController.list,
);

router.get(
  '/student',
  authorizeAny(PERMISSIONS.SCHOOL_ASSIGNMENTS_VIEW, PERMISSIONS.SCHOOL_ASSIGNMENTS_MANAGE),
  validate({ query: assignmentQuerySchema }),
  assignmentController.studentView,
);

router.get(
  '/:assignmentId',
  authorizeAny(PERMISSIONS.SCHOOL_ASSIGNMENTS_VIEW, PERMISSIONS.SCHOOL_ASSIGNMENTS_MANAGE),
  assignmentController.get,
);

router.post(
  '/:assignmentId/submit',
  authorizeAny(PERMISSIONS.SCHOOL_ASSIGNMENTS_VIEW, PERMISSIONS.SCHOOL_ASSIGNMENTS_MANAGE),
  userLimiter(60_000, 20, 'Too many submissions, slow down.'),
  validate({ body: submitAssignmentSchema }),
  assignmentController.submit,
);

router.post(
  '/:assignmentId/grade',
  authorize(PERMISSIONS.SCHOOL_ASSIGNMENTS_MANAGE),
  userLimiter(60_000, 30, 'Too many grade writes, slow down.'),
  validate({ body: gradeSubmissionSchema }),
  assignmentController.grade,
);

export default router;