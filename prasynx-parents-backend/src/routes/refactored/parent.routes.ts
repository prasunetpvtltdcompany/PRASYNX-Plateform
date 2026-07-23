import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize, enforceParentChildAccess, enforceUserAccess } from '../../middleware/auth';
import { dashboardController } from '../../controllers/dashboard.controller';
import { childrenController } from '../../controllers/children.controller';
import { attendanceController } from '../../controllers/attendance.controller';
import { performanceController } from '../../controllers/performance.controller';
import { assignmentController } from '../../controllers/assignment.controller';
import { teacherController } from '../../controllers/teacher.controller';
import { transportController } from '../../controllers/transport.controller';
import { hostelController } from '../../controllers/hostel.controller';
import { feeController } from '../../controllers/fee.controller';
import { healthController } from '../../controllers/health.controller';
import { announcementController } from '../../controllers/announcement.controller';
import { messageController } from '../../controllers/message.controller';
import { parentNotificationController } from '../../controllers/parent-notification.controller';

const router = Router();
router.use(authenticate);
router.use(authorize('parent'));

// URL param org_id/organisation_id must match JWT
router.param('org_id', (req: any, res, next, value) => {
  if (value && value !== req.user?.organisationId) {
    return res.status(403).json({ error: 'Tenant access denied' });
  }
  next();
});
router.param('organisation_id', (req: any, res, next, value) => {
  if (value && value !== req.user?.organisationId) {
    return res.status(403).json({ error: 'Tenant access denied' });
  }
  next();
});

router.get('/dashboard/:parent_id', enforceUserAccess('parent_id'), asyncHandler((req, res) => dashboardController.getDashboard(req, res)));
router.get('/children/:parent_id', enforceUserAccess('parent_id'), asyncHandler((req, res) => childrenController.getChildren(req, res)));
router.get('/attendance/:student_id', enforceParentChildAccess(), asyncHandler((req, res) => attendanceController.getAttendance(req, res)));
router.get('/performance/:student_id', enforceParentChildAccess(), asyncHandler((req, res) => performanceController.getPerformance(req, res)));
router.get('/assignments/:student_id', enforceParentChildAccess(), asyncHandler((req, res) => assignmentController.getAssignments(req, res)));
router.get('/teachers/:organisation_id', asyncHandler((req, res) => teacherController.getTeachers(req, res)));
router.get('/transport/:student_id', enforceParentChildAccess(), asyncHandler((req, res) => transportController.getTransport(req, res)));
router.get('/hostel/:student_id', enforceParentChildAccess(), asyncHandler((req, res) => hostelController.getHostel(req, res)));
router.get('/fees-summary/:parent_id', enforceUserAccess('parent_id'), asyncHandler((req, res) => feeController.getFeesSummary(req, res)));
router.get('/fees/:student_id', enforceParentChildAccess(), asyncHandler((req, res) => feeController.getFeesByStudent(req, res)));
router.get('/fees/:student_id', enforceParentChildAccess(), asyncHandler((req, res) => feeController.getFeesByStudent(req, res)));
router.get('/health/:student_id', enforceParentChildAccess(), asyncHandler((req, res) => healthController.getHealth(req, res)));
router.get('/announcements/:org_id', asyncHandler((req, res) => announcementController.getAnnouncements(req, res)));
router.post('/messages', asyncHandler((req, res) => messageController.sendMessage(req, res)));
router.get('/messages/:user_id/:other_user_id', asyncHandler((req, res) => messageController.getConversation(req, res)));
router.get('/notifications/:user_id', asyncHandler((req, res) => parentNotificationController.getNotifications(req, res)));

export default router;
