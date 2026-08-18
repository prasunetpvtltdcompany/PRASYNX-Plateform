import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { examController } from '../../controllers/exam.controller';

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
router.use(authorize('management', 'admin', 'principal', 'teacher', 'staff'));

router.get('/dashboard/:organisation_id', asyncHandler((req, res) => examController.getDashboard(req, res)));

router.get('/list/:organisation_id', asyncHandler((req, res) => examController.getExams(req, res)));
router.get('/list/:organisation_id/:exam_id', asyncHandler((req, res) => examController.getExamById(req, res)));
router.post('/list/:organisation_id', asyncHandler((req, res) => examController.createExam(req, res)));
router.put('/list/:exam_id', asyncHandler((req, res) => examController.updateExam(req, res)));
router.delete('/list/:exam_id', asyncHandler((req, res) => examController.deleteExam(req, res)));
router.patch('/list/:exam_id/status', asyncHandler((req, res) => examController.updateExamStatus(req, res)));

router.get('/schedules/:exam_id', asyncHandler((req, res) => examController.getSchedules(req, res)));
router.post('/schedules/:organisation_id', asyncHandler((req, res) => examController.createSchedule(req, res)));
router.put('/schedules/:schedule_id', asyncHandler((req, res) => examController.updateSchedule(req, res)));
router.delete('/schedules/:schedule_id', asyncHandler((req, res) => examController.deleteSchedule(req, res)));

router.get('/results/:organisation_id', asyncHandler((req, res) => examController.getResults(req, res)));
router.post('/results/:organisation_id', asyncHandler((req, res) => examController.enterMarks(req, res)));
router.post('/results/bulk/:organisation_id', asyncHandler((req, res) => examController.bulkEnterMarks(req, res)));
router.post('/results/:exam_id/publish', asyncHandler((req, res) => examController.publishResults(req, res)));
router.post('/results/:exam_id/lock', asyncHandler((req, res) => examController.lockResults(req, res)));
router.post('/results/:exam_id/unlock', asyncHandler((req, res) => examController.unlockResults(req, res)));

router.get('/performance/:organisation_id/:student_id', asyncHandler((req, res) => examController.getStudentPerformance(req, res)));

router.get('/analytics/:organisation_id', asyncHandler((req, res) => examController.getAnalytics(req, res)));

router.get('/ai-insights/:organisation_id', asyncHandler((req, res) => examController.getAiInsights(req, res)));
router.get('/readiness/:organisation_id', asyncHandler((req, res) => examController.getReadinessScores(req, res)));

router.get('/invigilators/:organisation_id', asyncHandler((req, res) => examController.getInvigilators(req, res)));
router.get('/grade-definitions/:organisation_id', asyncHandler((req, res) => examController.getGradeDefinitions(req, res)));
router.post('/grade-definitions/:organisation_id', asyncHandler((req, res) => examController.saveGradeDefinitions(req, res)));

export default router;
