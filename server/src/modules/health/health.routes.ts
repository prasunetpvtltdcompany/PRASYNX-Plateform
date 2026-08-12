import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireTenant } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { PERMISSIONS } from '@prasynx/config';
import { validate } from '../../shared/middleware/validate';
import { createHealthRecordSchema } from '@prasynx/validation';
import { healthController } from './health.controller';

const router = Router();

router.use(authenticate, requireTenant, authorize(PERMISSIONS.SCHOOL_STUDENTS_MANAGE));

router.get('/', healthController.list);
router.post('/', validate({ body: createHealthRecordSchema }), healthController.create);
router.get('/:id', validate({ params: z.object({ id: z.string().uuid() }) }), healthController.get);
router.delete('/:id', validate({ params: z.object({ id: z.string().uuid() }) }), healthController.remove);

export default router;