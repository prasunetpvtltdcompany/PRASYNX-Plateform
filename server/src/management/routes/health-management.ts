import { verifyManagementAuth, enforceOrgAccess } from "../middleware/verifyAuth";
/**
 * Health Management Routes (legacy)
 *
 * GET    /records/:org_id        - List medical records for an org
 * GET    /checkups/:org_id       - List health checkups for an org
 * GET    /medications/:org_id    - List medications administered for an org
 * GET    /counseling/:org_id     - List counseling requests for an org
 * GET    /covid/:org_id          - List COVID tracking entries for an org
 * GET    /mood/:org_id           - List mood logs for an org
 * GET    /emergency/:org_id      - List emergency contacts for an org
 * POST   /records                - Create a medical record
 * POST   /checkups               - Create a health checkup
 * POST   /medications            - Create a medication entry
 * PUT    /counseling/:id/status  - Update counseling request status
 * PUT    /covid/:id/resolve      - Resolve a COVID case
 */
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { healthManagementController } from '../controllers/health-management.controller';

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


router.get('/records/:org_id', asyncHandler(healthManagementController.getRecords));
router.get('/checkups/:org_id', asyncHandler(healthManagementController.getCheckups));
router.get('/medications/:org_id', asyncHandler(healthManagementController.getMedications));
router.get('/counseling/:org_id', asyncHandler(healthManagementController.getCounseling));
router.get('/covid/:org_id', asyncHandler(healthManagementController.getCovid));
router.get('/mood/:org_id', asyncHandler(healthManagementController.getMood));
router.get('/emergency/:org_id', asyncHandler(healthManagementController.getEmergency));
router.post('/records', asyncHandler(healthManagementController.createRecord));
router.post('/checkups', asyncHandler(healthManagementController.createCheckup));
router.post('/medications', asyncHandler(healthManagementController.createMedication));
router.put('/counseling/:id/status', asyncHandler(healthManagementController.updateCounselingStatus));
router.put('/covid/:id/resolve', asyncHandler(healthManagementController.resolveCovidCase));

export default router;
