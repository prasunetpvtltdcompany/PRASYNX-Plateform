import { Router, Response, NextFunction } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize, enforceStudentAccess } from '../../middleware/auth';
import { AuthRequest, JwtPayload } from '../../types';
import { sendError } from '../../utils/response';
import { dashboardController } from '../../controllers/dashboard.controller';
import { timetableController } from '../../controllers/timetable.controller';
import { assignmentController } from '../../controllers/assignment.controller';
import { attendanceController } from '../../controllers/attendance.controller';
import { examController } from '../../controllers/exam.controller';
import { feeController } from '../../controllers/fee.controller';
import { healthController } from '../../controllers/health.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('student'));
router.use(enforceStudentAccess());

// URL param org_id/organisation_id must match JWT
router.param('org_id', (req: AuthRequest, res, next, value) => {
  if (value && value !== req.user?.organisationId) {
    sendError(res, 'Tenant access denied', 403);
    return;
  }
  next();
});
router.param('organisation_id', (req: AuthRequest, res, next, value) => {
  if (value && value !== req.user?.organisationId) {
    sendError(res, 'Tenant access denied', 403);
    return;
  }
  next();
});

const overrideBody = (field: string) => (req: AuthRequest, _res: Response, next: NextFunction) => {
  req.body[field] = req.user!.userId;
  next();
};

router.get('/dashboard/:student_id', asyncHandler((req, res) => dashboardController.getDashboard(req, res)));
router.get('/timetable/class/:class_id', asyncHandler((req, res) => timetableController.getByClass(req, res)));
router.get('/timetable/student/:student_id', asyncHandler((req, res) => timetableController.getByStudent(req, res)));
router.get('/assignments/:student_id', asyncHandler((req, res) => assignmentController.getByStudent(req, res)));
router.post('/assignments/:assignment_id/submit', overrideBody('student_id'), asyncHandler((req, res) => assignmentController.submit(req, res)));
router.get('/attendance/:student_id', asyncHandler((req, res) => attendanceController.getByStudent(req, res)));
router.post('/qr-attendance/scan', overrideBody('student_id'), asyncHandler((req, res) => attendanceController.scanQr(req, res)));
router.get('/marks/:student_id', asyncHandler((req, res) => examController.getMarks(req, res)));
router.get('/exams/:student_id', asyncHandler((req, res) => examController.getExams(req, res)));
router.get('/fees/:student_id', asyncHandler((req, res) => feeController.getFees(req, res)));
router.get('/health/:student_id', asyncHandler((req, res) => healthController.getByStudent(req, res)));

export default router;
