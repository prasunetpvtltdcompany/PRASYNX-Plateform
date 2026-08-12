import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireTenant } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { PERMISSIONS } from '@prasynx/config';
import { validate } from '../../shared/middleware/validate';
import { createTransportRouteSchema } from '@prasynx/validation';
import { transportController } from './transport.controller';

const router = Router();

router.use(authenticate, requireTenant, authorize(PERMISSIONS.SCHOOL_STUDENTS_MANAGE));

router.get('/', transportController.list);
router.post('/', validate({ body: createTransportRouteSchema }), transportController.create);
router.get('/:id', validate({ params: z.object({ id: z.string().uuid() }) }), transportController.get);
router.delete('/:id', validate({ params: z.object({ id: z.string().uuid() }) }), transportController.remove);

export default router;