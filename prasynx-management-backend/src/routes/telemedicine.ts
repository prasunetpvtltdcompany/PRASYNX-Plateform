import { verifyManagementAuth, enforceOrgAccess } from "../middleware/verifyAuth";
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { telemedicineController } from '../controllers/telemedicine.controller';

/**
 * Telemedicine Routes
 * 
 * Routes for telemedicine consultations, prescriptions, vaccinations,
 * mental health, and emergency SOS.
 * GET/POST for each resource under /api/telemedicine/
 */
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


router.get('/consultations/:org_id', asyncHandler((req, res) => telemedicineController.getConsultations(req, res)));
router.post('/consultations', asyncHandler((req, res) => telemedicineController.createConsultation(req, res)));
router.get('/prescriptions/:org_id', asyncHandler((req, res) => telemedicineController.getPrescriptions(req, res)));
router.post('/prescriptions', asyncHandler((req, res) => telemedicineController.createPrescription(req, res)));
router.get('/vaccinations/:org_id', asyncHandler((req, res) => telemedicineController.getVaccinations(req, res)));
router.post('/vaccinations', asyncHandler((req, res) => telemedicineController.createVaccination(req, res)));
router.get('/mental-health/:org_id', asyncHandler((req, res) => telemedicineController.getMentalHealth(req, res)));
router.post('/mental-health', asyncHandler((req, res) => telemedicineController.createMentalHealth(req, res)));
router.get('/sos/:org_id', asyncHandler((req, res) => telemedicineController.getSosAlerts(req, res)));
router.post('/sos/resolve/:id', asyncHandler((req, res) => telemedicineController.resolveSosAlert(req, res)));

export default router;
