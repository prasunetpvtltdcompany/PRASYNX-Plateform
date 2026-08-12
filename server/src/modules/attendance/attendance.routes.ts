import { Router } from 'express';
import { markAttendanceSchema, bulkAttendanceSchema, attendanceQuerySchema, attendanceRosterQuerySchema, attendanceRecordsQuerySchema, dailySummaryQuerySchema } from '@prasynx/validation';
import { authenticate, requireTenant } from '../../shared/middleware/authenticate';
import { authorize, authorizeAny } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { userLimiter } from '../../shared/middleware/rateLimit';
import { audit } from '../../shared/middleware/audit';
import { PERMISSIONS } from '@prasynx/config';
import { attendanceController } from './attendance.controller';

const router = Router();

router.use(authenticate, requireTenant, audit);

router.post(
  '/mark',
  authorize(PERMISSIONS.SCHOOL_ATTENDANCE_MANAGE),
  userLimiter(60_000, 60, 'Too many attendance writes, slow down.'),
  validate({ body: markAttendanceSchema }),
  attendanceController.mark,
);

router.post(
  '/bulk',
  authorize(PERMISSIONS.SCHOOL_ATTENDANCE_MANAGE),
  userLimiter(60_000, 20, 'Too many bulk writes, slow down.'),
  validate({ body: bulkAttendanceSchema }),
  attendanceController.bulk,
);

router.get(
  '/',
  authorizeAny(PERMISSIONS.SCHOOL_ATTENDANCE_VIEW, PERMISSIONS.SCHOOL_ATTENDANCE_MANAGE),
  validate({ query: attendanceQuerySchema }),
  attendanceController.report,
);

router.get(
  '/roster',
  authorizeAny(PERMISSIONS.SCHOOL_ATTENDANCE_VIEW, PERMISSIONS.SCHOOL_ATTENDANCE_MANAGE),
  validate({ query: attendanceRosterQuerySchema }),
  attendanceController.roster,
);

router.get(
  '/records',
  authorizeAny(PERMISSIONS.SCHOOL_ATTENDANCE_VIEW, PERMISSIONS.SCHOOL_ATTENDANCE_MANAGE),
  validate({ query: attendanceRecordsQuerySchema }),
  attendanceController.records,
);

router.get(
  '/daily-summary',
  authorizeAny(PERMISSIONS.SCHOOL_ATTENDANCE_VIEW, PERMISSIONS.SCHOOL_ATTENDANCE_MANAGE),
  validate({ query: dailySummaryQuerySchema }),
  attendanceController.dailySummary,
);

export default router;