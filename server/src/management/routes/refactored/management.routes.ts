import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { dashboardController } from '../../controllers/dashboard.controller';
import { staffController } from '../../controllers/staff.controller';
import { studentController } from '../../controllers/student.controller';
import { classController } from '../../controllers/class.controller';

const router = Router();

// All management routes require authentication + management role

// URL param org_id/organisation_id must match JWT
router.param('organisation_id', (req, res, next, value) => {
  if (value && value !== req.user?.organisationId) {
    return res.status(403).json({ error: 'Tenant access denied' });
  }
  next();
});
router.param('org_id', (req, res, next, value) => {
  if (value && value !== req.user?.organisationId) {
    return res.status(403).json({ error: 'Tenant access denied' });
  }
  next();
});

router.use(authenticate);
router.use(authorize('management'));

// Dashboard
router.get('/dashboard/:organisation_id', asyncHandler((req, res) => dashboardController.getDashboard(req, res)));

// Staff
router.post('/staff', asyncHandler((req, res) => staffController.createStaff(req, res)));
router.get('/staff/:organisation_id', asyncHandler((req, res) => staffController.getStaff(req, res)));
router.put('/staff/:staff_id', asyncHandler((req, res) => staffController.updateStaff(req, res)));
router.put('/staff/:staff_id/status', asyncHandler((req, res) => staffController.updateStaffStatus(req, res)));

// Students
router.post('/students', asyncHandler((req, res) => studentController.createStudent(req, res)));
router.get('/students/:organisation_id', asyncHandler((req, res) => studentController.getStudents(req, res)));
router.patch('/students/:student_id', asyncHandler((req, res) => studentController.updateStudent(req, res)));

// Classes
router.post('/classes', asyncHandler((req, res) => classController.createClass(req, res)));
router.get('/classes/:organisation_id', asyncHandler((req, res) => classController.getClasses(req, res)));
router.post('/classes/:class_id/students', asyncHandler((req, res) => classController.assignStudent(req, res)));

export default router;
