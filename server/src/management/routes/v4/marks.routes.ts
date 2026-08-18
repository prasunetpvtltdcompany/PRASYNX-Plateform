import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import { marksController } from '../../controllers/marks.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('management', 'admin', 'principal', 'teacher'));

router.get('/exam/:exam_id', asyncHandler((req, res) => marksController.getExamResults(req, res)));
router.post('/enter/:org_id', asyncHandler((req, res) => marksController.enterMarks(req, res)));
router.patch('/publish/:exam_id', asyncHandler((req, res) => marksController.publishResults(req, res)));
router.get('/student/:org_id/:student_id', asyncHandler((req, res) => marksController.getStudentPerformance(req, res)));
router.get('/class/:org_id/:class_id', asyncHandler((req, res) => marksController.getClassPerformance(req, res)));
router.get('/summary/:org_id', asyncHandler((req, res) => marksController.getGradeSummary(req, res)));
router.get('/rankings/:org_id/:exam_id', asyncHandler((req, res) => marksController.getRankings(req, res)));
router.get('/report-card/:org_id/:student_id/:exam_id', asyncHandler((req, res) => marksController.getReportCard(req, res)));

export default router;
