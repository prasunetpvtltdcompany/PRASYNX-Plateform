import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import { exportController } from '../../controllers/export.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('management', 'admin', 'principal'));

router.get('/academic-years/:org_id', asyncHandler((req, res) => exportController.csvAcademicYears(req, res)));
router.get('/sections/:org_id', asyncHandler((req, res) => exportController.csvSections(req, res)));
router.get('/students/:org_id', asyncHandler((req, res) => exportController.csvStudents(req, res)));
router.get('/staff/:org_id', asyncHandler((req, res) => exportController.csvStaff(req, res)));
router.get('/homework/:org_id', asyncHandler((req, res) => exportController.csvHomework(req, res)));
router.get('/enrollments/:org_id', asyncHandler((req, res) => exportController.csvEnrollments(req, res)));
router.get('/promotions/:org_id', asyncHandler((req, res) => exportController.csvPromotions(req, res)));
router.get('/communication-logs/:org_id', asyncHandler((req, res) => exportController.csvCommunicationLogs(req, res)));
router.get('/teacher-assignments/:org_id', asyncHandler((req, res) => exportController.csvTeacherAssignments(req, res)));
router.get('/parents/:org_id', asyncHandler((req, res) => exportController.csvParents(req, res)));

export default router;
