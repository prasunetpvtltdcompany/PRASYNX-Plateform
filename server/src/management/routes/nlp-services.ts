import { verifyManagementAuth, enforceOrgAccess } from "../middleware/verifyAuth";
// NLP Services routes - search logs, student search, report comments, speech logs, and translations
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { nlpServicesController } from '../controllers/nlp-services.controller';

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


router.get('/search/:org_id', asyncHandler(nlpServicesController.getSearchLogs));
router.post('/search', asyncHandler(nlpServicesController.createSearchLog));
router.get('/search/query/:org_id', asyncHandler(nlpServicesController.searchStudents));
router.get('/report-comments/:org_id', asyncHandler(nlpServicesController.getReportComments));
router.post('/report-comments', asyncHandler(nlpServicesController.createReportComment));
router.get('/speech-logs/:org_id', asyncHandler(nlpServicesController.getSpeechLogs));
router.post('/speech-logs', asyncHandler(nlpServicesController.createSpeechLog));
router.get('/translations/:org_id', asyncHandler(nlpServicesController.getTranslations));
router.post('/translations', asyncHandler(nlpServicesController.createTranslation));

export default router;
