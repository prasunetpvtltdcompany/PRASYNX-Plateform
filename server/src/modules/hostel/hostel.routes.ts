import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireTenant } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { PERMISSIONS } from '@prasynx/config';
import { validate } from '../../shared/middleware/validate';
import { createHostelRoomSchema } from '@prasynx/validation';
import { hostelController } from './hostel.controller';

const router = Router();

router.use(authenticate, requireTenant, authorize(PERMISSIONS.SCHOOL_STUDENTS_MANAGE));

router.get('/rooms', hostelController.rooms);
router.post('/rooms', validate({ body: createHostelRoomSchema }), hostelController.createRoom);
router.get('/rooms/:id', validate({ params: z.object({ id: z.string().uuid() }) }), hostelController.getRoom);
router.delete('/rooms/:id', validate({ params: z.object({ id: z.string().uuid() }) }), hostelController.removeRoom);
router.get('/allocations', hostelController.allocations);

export default router;