import { Router } from 'express';
import { createUserSchema } from '@prasynx/validation';
import { authenticate, requireTenant } from '../../shared/middleware/authenticate';
import { authorize, authorizeAny } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { PERMISSIONS } from '@prasynx/config';
import { usersController } from './users.controller';

const router = Router();

router.get('/me', authenticate, authorize(PERMISSIONS.OWN_PROFILE), usersController.me);

router.get(
  '/',
  authenticate,
  requireTenant,
  authorizeAny(PERMISSIONS.SCHOOL_MANAGE, PERMISSIONS.SCHOOL_TEACHERS_MANAGE, PERMISSIONS.SCHOOL_STUDENTS_MANAGE),
  usersController.list,
);

router.post(
  '/',
  authenticate,
  requireTenant,
  authorize(PERMISSIONS.SCHOOL_MANAGE),
  validate({ body: createUserSchema }),
  usersController.provision,
);

export default router;