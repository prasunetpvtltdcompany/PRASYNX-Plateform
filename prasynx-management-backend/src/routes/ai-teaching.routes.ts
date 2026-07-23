import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate, authorize } from '../middleware/auth';
import { aiTeachingController } from '../controllers/ai-teaching.controller';

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

router.get('/dashboard/:organisation_id', asyncHandler((req, res) => aiTeachingController.getDashboard(req, res)));
router.get('/assistants/:organisation_id', asyncHandler((req, res) => aiTeachingController.getAssistants(req, res)));
router.post('/assistants/:organisation_id', asyncHandler((req, res) => aiTeachingController.createAssistant(req, res)));
router.put('/assistants/:id', asyncHandler((req, res) => aiTeachingController.updateAssistant(req, res)));
router.delete('/assistants/:id', asyncHandler((req, res) => aiTeachingController.deleteAssistant(req, res)));

router.get('/conversations/:organisation_id', asyncHandler((req, res) => aiTeachingController.getConversations(req, res)));
router.post('/conversations/:organisation_id', asyncHandler((req, res) => aiTeachingController.sendMessage(req, res)));

router.get('/student-support/:organisation_id', asyncHandler((req, res) => aiTeachingController.getStudentSupport(req, res)));
router.get('/teacher-tools/:organisation_id', asyncHandler((req, res) => aiTeachingController.getTeacherTools(req, res)));

router.post('/generate/lesson/:organisation_id', asyncHandler((req, res) => aiTeachingController.generateLesson(req, res)));
router.post('/generate/quiz/:organisation_id', asyncHandler((req, res) => aiTeachingController.generateQuiz(req, res)));
router.post('/generate/content/:organisation_id', asyncHandler((req, res) => aiTeachingController.generateContent(req, res)));

router.get('/knowledge-base/:organisation_id', asyncHandler((req, res) => aiTeachingController.getKnowledgeBase(req, res)));
router.post('/knowledge-base/:organisation_id', asyncHandler((req, res) => aiTeachingController.uploadKnowledgeDoc(req, res)));
router.delete('/knowledge-base/:id', asyncHandler((req, res) => aiTeachingController.deleteKnowledgeDoc(req, res)));

router.get('/analytics/:organisation_id', asyncHandler((req, res) => aiTeachingController.getAnalytics(req, res)));
router.get('/reports/:organisation_id', asyncHandler((req, res) => aiTeachingController.getReports(req, res)));

export default router;
