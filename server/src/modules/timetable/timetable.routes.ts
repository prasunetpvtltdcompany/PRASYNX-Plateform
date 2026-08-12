import { Router } from 'express';
import { upsertTimetableSchema, deleteTimetableEntriesSchema, timetableQuerySchema } from '@prasynx/validation';
import { authenticate, requireTenant } from '../../shared/middleware/authenticate';
import { authorize, authorizeAny } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { userLimiter } from '../../shared/middleware/rateLimit';
import { audit } from '../../shared/middleware/audit';
import { PERMISSIONS } from '@prasynx/config';
import { timetableController } from './timetable.controller';

const router = Router();

router.use(authenticate, requireTenant, audit);

router.get(
  '/',
  authorizeAny(PERMISSIONS.SCHOOL_TIMETABLE_VIEW, PERMISSIONS.SCHOOL_TIMETABLE_MANAGE),
  validate({ query: timetableQuerySchema }),
  timetableController.list,
);

router.post(
  '/',
  authorize(PERMISSIONS.SCHOOL_TIMETABLE_MANAGE),
  userLimiter(60_000, 20, 'Too many timetable writes, slow down.'),
  validate({ body: upsertTimetableSchema }),
  timetableController.replace,
);

router.delete(
  '/',
  authorize(PERMISSIONS.SCHOOL_TIMETABLE_MANAGE),
  userLimiter(60_000, 20, 'Too many timetable writes, slow down.'),
  validate({ body: deleteTimetableEntriesSchema }),
  timetableController.delete,
);

export default router;