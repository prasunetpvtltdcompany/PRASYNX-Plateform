import { verifyManagementAuth, enforceOrgAccess } from "../middleware/verifyAuth";
/**
 * Career Management Routes (Legacy)
 *
 * Manages internships, psychometric tests, college applications,
 * skill assessments, and career sessions.
 */
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { careerManagementController } from '../controllers/career-management.controller';

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


// ==================== INTERNSHIPS ====================
router.get('/internships/:org_id', asyncHandler(careerManagementController.getInternships));
router.post('/internships', asyncHandler(careerManagementController.createInternship));
router.put('/internships/:id', asyncHandler(careerManagementController.updateInternship));
router.delete('/internships/:id', asyncHandler(careerManagementController.deleteInternship));

// ==================== PSYCHOMETRIC TESTS ====================
router.get('/psychometric-tests/:org_id', asyncHandler(careerManagementController.getPsychometricTests));
router.post('/psychometric-tests', asyncHandler(careerManagementController.createPsychometricTest));
router.put('/psychometric-tests/:id', asyncHandler(careerManagementController.updatePsychometricTest));
router.delete('/psychometric-tests/:id', asyncHandler(careerManagementController.deletePsychometricTest));

// ==================== COLLEGE APPLICATIONS ====================
router.get('/college-applications/:org_id', asyncHandler(careerManagementController.getCollegeApplications));
router.post('/college-applications', asyncHandler(careerManagementController.createCollegeApplication));
router.put('/college-applications/:id', asyncHandler(careerManagementController.updateCollegeApplication));
router.delete('/college-applications/:id', asyncHandler(careerManagementController.deleteCollegeApplication));

// ==================== SKILL ASSESSMENTS ====================
router.get('/skill-assessments/:org_id', asyncHandler(careerManagementController.getSkillAssessments));
router.post('/skill-assessments', asyncHandler(careerManagementController.createSkillAssessment));
router.delete('/skill-assessments/:id', asyncHandler(careerManagementController.deleteSkillAssessment));

// ==================== CAREER SESSIONS ====================
router.get('/sessions/:org_id', asyncHandler(careerManagementController.getSessions));
router.post('/sessions', asyncHandler(careerManagementController.createSession));
router.put('/sessions/:id', asyncHandler(careerManagementController.updateSession));
router.delete('/sessions/:id', asyncHandler(careerManagementController.deleteSession));

export default router;
