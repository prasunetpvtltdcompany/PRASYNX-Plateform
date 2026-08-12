import { Router } from 'express';
import { authenticate, requireTenant } from '../../shared/middleware/authenticate';
import { authorizeAny } from '../../shared/middleware/authorize';
import { PERMISSIONS } from '@prasynx/config';
import { validate } from '../../shared/middleware/validate';
import { classesController } from './classes.controller';
import { z } from 'zod';

const router = Router();

router.use(authenticate, requireTenant);

router.get('/', authorizeAny(PERMISSIONS.SCHOOL_CLASSES_MANAGE, PERMISSIONS.SCHOOL_ATTENDANCE_VIEW, PERMISSIONS.SCHOOL_EXAMS_VIEW), classesController.list);

router.get(
  '/:id',
  validate({ params: z.object({ id: z.string().uuid() }) }),
  authorizeAny(PERMISSIONS.SCHOOL_CLASSES_MANAGE, PERMISSIONS.SCHOOL_ATTENDANCE_VIEW, PERMISSIONS.SCHOOL_EXAMS_VIEW),
  classesController.get,
);

export default router;