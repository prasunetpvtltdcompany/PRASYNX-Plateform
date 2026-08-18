import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import { homeworkController } from '../../controllers/homework.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('management', 'admin', 'principal', 'teacher'));

router.get('/:org_id', asyncHandler((req, res) => homeworkController.getHomework(req, res)));
router.get('/:org_id/:id', asyncHandler((req, res) => homeworkController.getHomeworkById(req, res)));
router.post('/:org_id', asyncHandler((req, res) => homeworkController.createHomework(req, res)));
router.put('/:org_id/:id', asyncHandler((req, res) => homeworkController.updateHomework(req, res)));
router.delete('/:org_id/:id', asyncHandler((req, res) => homeworkController.deleteHomework(req, res)));

router.get('/:org_id/:homework_id/submissions', asyncHandler((req, res) => homeworkController.getSubmissions(req, res)));
router.post('/:org_id/submit', asyncHandler((req, res) => homeworkController.submitHomework(req, res)));
router.put('/:org_id/grade/:id', asyncHandler((req, res) => homeworkController.gradeSubmission(req, res)));

router.get('/:org_id/performance', asyncHandler((req, res) => homeworkController.getPerformance(req, res)));

export default router;
