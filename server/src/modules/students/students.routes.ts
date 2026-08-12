import { Router } from 'express';
import { authenticate, requireTenant } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { PERMISSIONS } from '@prasynx/config';
import { validate } from '../../shared/middleware/validate';
import { createStudentSchema, updateStudentSchema } from '@prasynx/validation';
import { studentsController } from './students.controller';
import { z } from 'zod';

const router = Router();

// Student directory is managed inside a school.
router.use(authenticate, requireTenant, authorize(PERMISSIONS.SCHOOL_STUDENTS_MANAGE));

router.get('/', studentsController.list);
router.post('/', validate({ body: createStudentSchema }), studentsController.create);
router.get('/:id', validate({ params: z.object({ id: z.string().uuid() }) }), studentsController.get);
router.patch('/:id', validate({ params: z.object({ id: z.string().uuid() }), body: updateStudentSchema }), studentsController.update);
router.delete('/:id', validate({ params: z.object({ id: z.string().uuid() }) }), studentsController.remove);

export default router;