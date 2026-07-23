import { verifyManagementAuth, enforceOrgAccess } from "../middleware/verifyAuth";
// Exam System (legacy) routes: online exams, questions, proctoring, question bank, adaptive tests, gradebook, re-evaluations
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { examSystemController } from '../controllers/exam-system.controller';

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

router.use(verifyManagementAuth);
router.use(enforceOrgAccess());


router.get('/exams/:org_id', asyncHandler(examSystemController.getExams));
router.post('/exams', asyncHandler(examSystemController.createExam));

router.get('/questions/:exam_id', asyncHandler(examSystemController.getQuestions));
router.post('/questions', asyncHandler(examSystemController.createQuestion));

router.get('/proctoring/:org_id', asyncHandler(examSystemController.getProctoringSessions));
router.post('/proctoring', asyncHandler(examSystemController.createProctoringSession));

router.get('/question-bank/:org_id', asyncHandler(examSystemController.getQuestionBankItems));
router.post('/question-bank', asyncHandler(examSystemController.createQuestionBankItem));

router.get('/adaptive-tests/:org_id', asyncHandler(examSystemController.getAdaptiveTests));
router.post('/adaptive-tests', asyncHandler(examSystemController.createAdaptiveTest));

router.get('/gradebook/:org_id', asyncHandler(examSystemController.getGradebookEntries));
router.post('/gradebook', asyncHandler(examSystemController.createGradebookEntry));

router.get('/re-evaluations/:org_id', asyncHandler(examSystemController.getReEvaluations));
router.post('/re-evaluations', asyncHandler(examSystemController.createReEvaluation));

export default router;
