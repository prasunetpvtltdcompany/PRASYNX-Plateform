import { verifyManagementAuth, enforceOrgAccess } from "../middleware/verifyAuth";
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { extracurricularController } from '../controllers/extracurricular.controller';

/**
 * Extracurricular Routes
 *
 * Routes for clubs, sports teams, matches, player stats, events,
 * talent portfolios, and volunteer records.
 * GET/POST for each resource under /api/extracurricular/
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


router.get('/clubs/:org_id', asyncHandler((req, res) => extracurricularController.getClubs(req, res)));
router.post('/clubs', asyncHandler((req, res) => extracurricularController.createClub(req, res)));
router.get('/club-members/:club_id', asyncHandler((req, res) => extracurricularController.getClubMembers(req, res)));
router.post('/club-members', asyncHandler((req, res) => extracurricularController.createClubMember(req, res)));
router.get('/sports-teams/:org_id', asyncHandler((req, res) => extracurricularController.getSportsTeams(req, res)));
router.post('/sports-teams', asyncHandler((req, res) => extracurricularController.createSportsTeam(req, res)));
router.get('/matches/:org_id', asyncHandler((req, res) => extracurricularController.getMatches(req, res)));
router.post('/matches', asyncHandler((req, res) => extracurricularController.createMatch(req, res)));
router.get('/player-stats/:org_id', asyncHandler((req, res) => extracurricularController.getPlayerStats(req, res)));
router.post('/player-stats', asyncHandler((req, res) => extracurricularController.createPlayerStat(req, res)));
router.get('/events/:org_id', asyncHandler((req, res) => extracurricularController.getEvents(req, res)));
router.post('/events', asyncHandler((req, res) => extracurricularController.createEvent(req, res)));
router.get('/portfolios/:org_id', asyncHandler((req, res) => extracurricularController.getPortfolios(req, res)));
router.post('/portfolios', asyncHandler((req, res) => extracurricularController.createPortfolio(req, res)));
router.get('/volunteers/:org_id', asyncHandler((req, res) => extracurricularController.getVolunteers(req, res)));
router.post('/volunteers', asyncHandler((req, res) => extracurricularController.createVolunteer(req, res)));

export default router;
