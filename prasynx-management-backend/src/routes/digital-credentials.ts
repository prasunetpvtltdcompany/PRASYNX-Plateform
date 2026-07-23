import { verifyManagementAuth, enforceOrgAccess } from "../middleware/verifyAuth";
// Digital Credentials (legacy) - certificates, verifiable credentials, academic transcripts, and skill badges
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { digitalCredentialsController } from '../controllers/digital-credentials.controller';

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


router.get('/certificates/:org_id', asyncHandler(digitalCredentialsController.getCertificatesByOrg));
router.post('/certificates', asyncHandler(digitalCredentialsController.createCertificate));
router.put('/certificates/:id', asyncHandler(digitalCredentialsController.updateCertificate));
router.get('/credentials/:org_id', asyncHandler(digitalCredentialsController.getCredentialsByOrg));
router.post('/credentials', asyncHandler(digitalCredentialsController.createCredential));
router.get('/transcripts/:org_id', asyncHandler(digitalCredentialsController.getTranscriptsByOrg));
router.post('/transcripts', asyncHandler(digitalCredentialsController.createTranscript));
router.get('/badges/:org_id', asyncHandler(digitalCredentialsController.getBadgesByOrg));
router.post('/badges', asyncHandler(digitalCredentialsController.createBadge));
router.get('/verify/:blockchain_hash', asyncHandler(digitalCredentialsController.verifyCertificate));

export default router;
