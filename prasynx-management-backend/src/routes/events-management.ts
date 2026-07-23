import { verifyManagementAuth, enforceOrgAccess } from "../middleware/verifyAuth";
// Events Management Routes (Legacy)
// Handles CRUD for events, clubs, and sports teams
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { eventsManagementController } from '../controllers/events-management.controller';

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


// ==================== EVENTS (main events table) ====================
router.get('/events/:org_id', asyncHandler(eventsManagementController.getEvents));
router.post('/events', asyncHandler(eventsManagementController.createEvent));
router.put('/events/:id', asyncHandler(eventsManagementController.updateEvent));
router.delete('/events/:id', asyncHandler(eventsManagementController.deleteEvent));

// ==================== CLUBS ====================
router.get('/clubs/:org_id', asyncHandler(eventsManagementController.getClubs));
router.post('/clubs', asyncHandler(eventsManagementController.createClub));
router.put('/clubs/:id', asyncHandler(eventsManagementController.updateClub));
router.delete('/clubs/:id', asyncHandler(eventsManagementController.deleteClub));

// ==================== SPORTS TEAMS ====================
router.get('/sports-teams/:org_id', asyncHandler(eventsManagementController.getSportsTeams));
router.post('/sports-teams', asyncHandler(eventsManagementController.createSportsTeam));
router.put('/sports-teams/:id', asyncHandler(eventsManagementController.updateSportsTeam));
router.delete('/sports-teams/:id', asyncHandler(eventsManagementController.deleteSportsTeam));

export default router;
