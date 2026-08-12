import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireTenant } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { PERMISSIONS } from '@prasynx/config';
import { validate } from '../../shared/middleware/validate';
import { createLibraryBookSchema } from '@prasynx/validation';
import { libraryController } from './library.controller';

const router = Router();

router.use(authenticate, requireTenant, authorize(PERMISSIONS.SCHOOL_STUDENTS_MANAGE));

router.get('/', libraryController.list);
router.post('/', validate({ body: createLibraryBookSchema }), libraryController.create);
router.get('/:id', validate({ params: z.object({ id: z.string().uuid() }) }), libraryController.get);
router.delete('/:id', validate({ params: z.object({ id: z.string().uuid() }) }), libraryController.remove);

export default router;