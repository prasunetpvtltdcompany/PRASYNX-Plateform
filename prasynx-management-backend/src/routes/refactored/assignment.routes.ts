import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { assignmentController } from '../../controllers/assignment.controller';

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

router.get('/dashboard/:organisation_id', asyncHandler((req, res) => assignmentController.getDashboard(req, res)));

router.get('/list/:organisation_id', asyncHandler((req, res) => assignmentController.getAssignments(req, res)));
router.get('/list/:organisation_id/:assignment_id', asyncHandler((req, res) => assignmentController.getAssignmentById(req, res)));
router.post('/list/:organisation_id', asyncHandler((req, res) => assignmentController.createAssignment(req, res)));
router.put('/list/:assignment_id', asyncHandler((req, res) => assignmentController.updateAssignment(req, res)));
router.delete('/list/:assignment_id', asyncHandler((req, res) => assignmentController.deleteAssignment(req, res)));
router.post('/list/:assignment_id/publish', asyncHandler((req, res) => assignmentController.publishAssignment(req, res)));
router.post('/list/:assignment_id/close', asyncHandler((req, res) => assignmentController.closeAssignment(req, res)));
router.post('/list/:assignment_id/duplicate', asyncHandler((req, res) => assignmentController.duplicateAssignment(req, res)));

router.get('/submissions/:organisation_id', asyncHandler((req, res) => assignmentController.getSubmissions(req, res)));
router.post('/submissions/:submission_id/grade', asyncHandler((req, res) => assignmentController.gradeSubmission(req, res)));
router.post('/submissions/bulk-grade/:organisation_id', asyncHandler((req, res) => assignmentController.bulkGrade(req, res)));
router.post('/submissions/:assignment_id/publish-grades', asyncHandler((req, res) => assignmentController.publishGrades(req, res)));

router.get('/performance/:organisation_id/:student_id', asyncHandler((req, res) => assignmentController.getStudentPerformance(req, res)));

router.get('/analytics/:organisation_id', asyncHandler((req, res) => assignmentController.getAnalytics(req, res)));
router.get('/ai-insights/:organisation_id', asyncHandler((req, res) => assignmentController.getAiInsights(req, res)));

router.get('/rubrics/:assignment_id', asyncHandler((req, res) => assignmentController.getRubrics(req, res)));
router.post('/rubrics/:organisation_id/:assignment_id', asyncHandler((req, res) => assignmentController.saveRubrics(req, res)));

router.get('/reports/:organisation_id', asyncHandler((req, res) => assignmentController.getReports(req, res)));
router.get('/reports/:organisation_id/export', asyncHandler((req, res) => assignmentController.exportReport(req, res)));

export default router;
