import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import { healthController } from '../../controllers/health.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('management', 'admin', 'principal'));

router.get('/dashboard/:org_id', asyncHandler((req, res) => healthController.dashboard(req, res)));
router.get('/students/:org_id', asyncHandler((req, res) => healthController.students(req, res)));
router.get('/records/:org_id', asyncHandler((req, res) => healthController.records(req, res)));
router.post('/records/:org_id', asyncHandler((req, res) => healthController.createRecord(req, res)));
router.get('/vaccinations/:org_id', asyncHandler((req, res) => healthController.vaccinations(req, res)));
router.post('/vaccinations/:org_id', asyncHandler((req, res) => healthController.createVaccination(req, res)));
router.get('/medical-records/:org_id', asyncHandler((req, res) => healthController.medicalRecords(req, res)));
router.post('/medical-records/:org_id', asyncHandler((req, res) => healthController.createMedicalRecord(req, res)));
router.get('/emergency/:org_id', asyncHandler((req, res) => healthController.emergencyContacts(req, res)));
router.get('/ai-insights/:org_id', asyncHandler((req, res) => healthController.aiInsights(req, res)));
router.get('/student/:org_id/:student_id', asyncHandler((req, res) => healthController.studentProfile(req, res)));

export default router;
