import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { classController } from '../../controllers/class.controller';

const router = Router();


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
router.use(authorize('management', 'admin', 'principal', 'teacher'));

router.get('/dashboard/:organisation_id', asyncHandler((req, res) => classController.getDashboard(req, res)));

router.get('/classes/:organisation_id', asyncHandler((req, res) => classController.getClasses(req, res)));
router.get('/classes/:organisation_id/:class_id', asyncHandler((req, res) => classController.getClassById(req, res)));
router.post('/classes/:organisation_id', asyncHandler((req, res) => classController.createClass(req, res)));
router.put('/classes/:class_id', asyncHandler((req, res) => classController.updateClass(req, res)));
router.delete('/classes/:class_id', asyncHandler((req, res) => classController.deleteClass(req, res)));
router.post('/classes/:class_id/archive', asyncHandler((req, res) => classController.archiveClass(req, res)));

router.get('/classes/:class_id/students', asyncHandler((req, res) => classController.getClassStudents(req, res)));
router.post('/classes/:class_id/students', asyncHandler((req, res) => classController.assignStudent(req, res)));
router.post('/classes/:class_id/students/bulk', asyncHandler((req, res) => classController.assignStudentsBulk(req, res)));
router.delete('/classes/:class_id/students/:student_id', asyncHandler((req, res) => classController.removeStudent(req, res)));
router.post('/students/transfer', asyncHandler((req, res) => classController.transferStudent(req, res)));
router.post('/students/promote', asyncHandler((req, res) => classController.promoteStudents(req, res)));

router.post('/classes/:class_id/class-teacher/:teacher_id', asyncHandler((req, res) => classController.assignClassTeacher(req, res)));
router.post('/classes/:class_id/assistant-teacher/:teacher_id', asyncHandler((req, res) => classController.assignAssistantTeacher(req, res)));

router.get('/classes/:class_id/rooms', asyncHandler((req, res) => classController.getRooms(req, res)));
router.post('/rooms/:organisation_id', asyncHandler((req, res) => classController.allocateRoom(req, res)));
router.put('/rooms/:room_id', asyncHandler((req, res) => classController.updateRoom(req, res)));
router.delete('/rooms/:room_id', asyncHandler((req, res) => classController.deleteRoom(req, res)));

router.get('/classes/:class_id/attendance-trend', asyncHandler((req, res) => classController.getAttendanceTrend(req, res)));
router.get('/classes/:class_id/performance', asyncHandler((req, res) => classController.getPerformanceSnapshots(req, res)));
router.get('/classes/:class_id/academic-analytics', asyncHandler((req, res) => classController.getAcademicAnalytics(req, res)));
router.get('/classes/:class_id/ai-insights', asyncHandler((req, res) => classController.getAiInsights(req, res)));

router.get('/unassigned-students/:organisation_id', asyncHandler((req, res) => classController.getUnassignedStudents(req, res)));
router.get('/available-teachers/:organisation_id', asyncHandler((req, res) => classController.getAvailableTeachers(req, res)));

export default router;
