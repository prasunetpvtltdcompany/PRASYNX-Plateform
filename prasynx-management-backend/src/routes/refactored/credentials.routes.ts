import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { credentialsController } from '../../controllers/credentials.controller';

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
router.use(authorize('management', 'admin', 'principal', 'staff'));

router.get('/dashboard/:organisation_id', asyncHandler((req, res) => credentialsController.getDashboard(req, res)));
router.get('/certificates/:organisation_id', asyncHandler((req, res) => credentialsController.getCertificates(req, res)));
router.post('/certificates/:organisation_id', asyncHandler((req, res) => credentialsController.createCertificate(req, res)));
router.put('/certificates/:id', asyncHandler((req, res) => credentialsController.updateCertificate(req, res)));
router.delete('/certificates/:id', asyncHandler((req, res) => credentialsController.deleteCertificate(req, res)));
router.get('/credentials/:organisation_id', asyncHandler((req, res) => credentialsController.getCredentials(req, res)));
router.post('/credentials/:organisation_id', asyncHandler((req, res) => credentialsController.createCredential(req, res)));
router.get('/transcripts/:organisation_id', asyncHandler((req, res) => credentialsController.getTranscripts(req, res)));
router.post('/transcripts/:organisation_id', asyncHandler((req, res) => credentialsController.createTranscript(req, res)));
router.get('/badges/:organisation_id', asyncHandler((req, res) => credentialsController.getBadges(req, res)));
router.post('/badges/:organisation_id', asyncHandler((req, res) => credentialsController.createBadge(req, res)));
router.get('/verify/:blockchain_hash', asyncHandler((req, res) => credentialsController.verifyCertificate(req, res)));
router.get('/analytics/:organisation_id', asyncHandler((req, res) => credentialsController.getAnalytics(req, res)));
router.get('/reports/:organisation_id', asyncHandler((req, res) => credentialsController.getReports(req, res)));
router.get('/sidebar/:organisation_id', asyncHandler((req, res) => credentialsController.getSidebar(req, res)));

export default router;
