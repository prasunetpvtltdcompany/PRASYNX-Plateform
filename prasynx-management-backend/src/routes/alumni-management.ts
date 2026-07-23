import { verifyManagementAuth, enforceOrgAccess } from "../middleware/verifyAuth";
// Alumni Management (Legacy) — CRUD routes for alumni directory, events, donations, and mentors
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { alumniManagementController } from '../controllers/alumni-management.controller';

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


// ==================== ALUMNI DIRECTORY ====================
router.get('/alumni/:org_id', asyncHandler(alumniManagementController.getAlumni));
router.post('/alumni', asyncHandler(alumniManagementController.createAlumni));
router.put('/alumni/:id', asyncHandler(alumniManagementController.updateAlumni));
router.delete('/alumni/:id', asyncHandler(alumniManagementController.deleteAlumni));

// ==================== ALUMNI EVENTS ====================
router.get('/events/:org_id', asyncHandler(alumniManagementController.getEvents));
router.post('/events', asyncHandler(alumniManagementController.createEvent));
router.put('/events/:id', asyncHandler(alumniManagementController.updateEvent));
router.delete('/events/:id', asyncHandler(alumniManagementController.deleteEvent));

// ==================== ALUMNI DONATIONS ====================
router.get('/donations/:org_id', asyncHandler(alumniManagementController.getDonations));
router.post('/donations', asyncHandler(alumniManagementController.createDonation));
router.delete('/donations/:id', asyncHandler(alumniManagementController.deleteDonation));

// ==================== ALUMNI MENTORS ====================
router.get('/mentors/:org_id', asyncHandler(alumniManagementController.getMentors));
router.post('/mentors', asyncHandler(alumniManagementController.createMentor));
router.put('/mentors/:id', asyncHandler(alumniManagementController.updateMentor));
router.delete('/mentors/:id', asyncHandler(alumniManagementController.deleteMentor));

export default router;
