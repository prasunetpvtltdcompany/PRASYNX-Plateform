import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireTenant } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { PERMISSIONS } from '@prasynx/config';
import { validate } from '../../shared/middleware/validate';
import { createAnnouncementSchema, updateAnnouncementSchema } from '@prasynx/validation';
import { announcementsController } from './announcements.controller';

const router = Router();

router.use(authenticate, requireTenant, authorize(PERMISSIONS.SCHOOL_MANAGE));

router.get('/', announcementsController.list);
router.post('/', validate({ body: createAnnouncementSchema }), announcementsController.create);
router.get('/:id', validate({ params: z.object({ id: z.string().uuid() }) }), announcementsController.get);
router.patch('/:id', validate({ params: z.object({ id: z.string().uuid() }), body: updateAnnouncementSchema }), announcementsController.update);
router.delete('/:id', validate({ params: z.object({ id: z.string().uuid() }) }), announcementsController.remove);

export default router;