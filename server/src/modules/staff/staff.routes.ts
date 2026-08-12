import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireTenant } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { PERMISSIONS } from '@prasynx/config';
import { validate } from '../../shared/middleware/validate';
import { createStaffRecordSchema, createStaffAttendanceSchema, createStaffLeaveRequestSchema, updateStaffLeaveStatusSchema } from '@prasynx/validation';
import { staffController } from './staff.controller';

const router = Router();

router.use(authenticate, requireTenant, authorize(PERMISSIONS.SCHOOL_STAFF_MANAGE));

router.get('/', staffController.list);
router.post('/', validate({ body: createStaffRecordSchema }), staffController.create);

router.get('/attendance', staffController.listAttendance);
router.post('/attendance', validate({ body: createStaffAttendanceSchema }), staffController.createAttendance);

router.get('/leave-requests', staffController.listLeaves);
router.post('/leave-requests', validate({ body: createStaffLeaveRequestSchema }), staffController.createLeave);
router.patch(
  '/leave-requests/:id/status',
  validate({ params: z.object({ id: z.string().uuid() }), body: updateStaffLeaveStatusSchema }),
  staffController.updateLeaveStatus,
);

router.get('/payroll', staffController.listPayroll);
router.get('/payslips', staffController.listPayslips);

router.get('/:id', validate({ params: z.object({ id: z.string().uuid() }) }), staffController.get);
router.patch('/:id', validate({ params: z.object({ id: z.string().uuid() }), body: z.object({ status: z.string().max(30).optional() }) }), staffController.update);

export default router;