import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireTenant } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { PERMISSIONS } from '@prasynx/config';
import { validate } from '../../shared/middleware/validate';
import { createAdmissionSchema, updateAdmissionStatusSchema } from '@prasynx/validation';
import { admissionsController } from './admissions.controller';

const router = Router();

// Applications are managed inside a school.
router.use(authenticate, requireTenant, authorize(PERMISSIONS.SCHOOL_STUDENTS_MANAGE));

router.get('/', admissionsController.list);
router.post('/', validate({ body: createAdmissionSchema }), admissionsController.create);
router.get('/:id', validate({ params: z.object({ id: z.string().uuid() }) }), admissionsController.get);
router.patch(
  '/:id/status',
  validate({ params: z.object({ id: z.string().uuid() }), body: updateAdmissionStatusSchema }),
  admissionsController.updateStatus,
);
router.delete('/:id', validate({ params: z.object({ id: z.string().uuid() }) }), admissionsController.remove);

export default router;