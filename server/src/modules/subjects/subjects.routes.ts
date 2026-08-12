import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireTenant } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { PERMISSIONS } from '@prasynx/config';
import { validate } from '../../shared/middleware/validate';
import { createSubjectSchema, updateSubjectSchema } from '@prasynx/validation';
import { subjectsController } from './subjects.controller';

const router = Router();

router.use(authenticate, requireTenant, authorize(PERMISSIONS.SCHOOL_SUBJECTS_MANAGE));

router.get('/', subjectsController.list);
router.post('/', validate({ body: createSubjectSchema }), subjectsController.create);
router.get('/:id', validate({ params: z.object({ id: z.string().uuid() }) }), subjectsController.get);
router.patch('/:id', validate({ params: z.object({ id: z.string().uuid() }), body: updateSubjectSchema }), subjectsController.update);
router.delete('/:id', validate({ params: z.object({ id: z.string().uuid() }) }), subjectsController.remove);

export default router;