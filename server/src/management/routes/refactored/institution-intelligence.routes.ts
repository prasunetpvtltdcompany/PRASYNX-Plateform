import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { institutionIntelligenceController } from '../../controllers/institution-intelligence.controller';

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
router.use(authorize('management', 'admin', 'staff'));
// Aliases without organisation_id — fall back to authenticated user's organisation
router.get('/dashboard', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId ?? '';
  return institutionIntelligenceController.getDashboard(req, res);
}));
router.get('/overview', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId ?? '';
  return institutionIntelligenceController.getOverview(req, res);
}));
router.get('/academic', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId ?? '';
  return institutionIntelligenceController.getAcademicPerformance(req, res);
}));
router.get('/operational', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId ?? '';
  return institutionIntelligenceController.getOperationalMetrics(req, res);
}));
router.get('/benchmarks', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId ?? '';
  return institutionIntelligenceController.getBenchmarks(req, res);
}));
router.get('/trends', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId ?? '';
  return institutionIntelligenceController.getTrends(req, res);
}));
router.get('/peers', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId ?? '';
  return institutionIntelligenceController.getPeerComparison(req, res);
}));

// Original param-based routes
router.get('/dashboard/:organisation_id', asyncHandler((req, res) => institutionIntelligenceController.getDashboard(req, res)));
router.get('/overview/:organisation_id', asyncHandler((req, res) => institutionIntelligenceController.getOverview(req, res)));
router.get('/academic/:organisation_id', asyncHandler((req, res) => institutionIntelligenceController.getAcademicPerformance(req, res)));
router.get('/operational/:organisation_id', asyncHandler((req, res) => institutionIntelligenceController.getOperationalMetrics(req, res)));
router.get('/benchmarks/:organisation_id', asyncHandler((req, res) => institutionIntelligenceController.getBenchmarks(req, res)));
router.get('/trends/:organisation_id', asyncHandler((req, res) => institutionIntelligenceController.getTrends(req, res)));
router.get('/peers/:organisation_id', asyncHandler((req, res) => institutionIntelligenceController.getPeerComparison(req, res)));

export default router;
