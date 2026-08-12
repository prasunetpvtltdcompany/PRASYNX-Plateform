import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireTenant } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { PERMISSIONS } from '@prasynx/config';
import { validate } from '../../shared/middleware/validate';
import { createDisciplineIncidentSchema, updateDisciplineIncidentSchema } from '@prasynx/validation';
import { disciplineController } from './discipline.controller';

const router = Router();

router.use(authenticate, requireTenant, authorize(PERMISSIONS.SCHOOL_DISCIPLINE_MANAGE));

router.get('/', disciplineController.list);
router.post('/', validate({ body: createDisciplineIncidentSchema }), disciplineController.create);
router.get('/:id', validate({ params: z.object({ id: z.string().uuid() }) }), disciplineController.get);
router.patch('/:id', validate({ params: z.object({ id: z.string().uuid() }), body: updateDisciplineIncidentSchema }), disciplineController.update);

export default router;