import { verifyManagementAuth, enforceOrgAccess } from "../middleware/verifyAuth";
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { gamificationEngineController } from '../controllers/gamification-engine.controller';

/**
 * Gamification Engine Routes
 *
 * Routes for points, leaderboards, badges, reward store, redemptions, and challenges.
 * GET/POST for each resource under /api/gamification-engine/
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


router.get('/points/:org_id', asyncHandler((req, res) => gamificationEngineController.getPoints(req, res)));
router.post('/points', asyncHandler((req, res) => gamificationEngineController.awardPoints(req, res)));
router.get('/leaderboards/:org_id', asyncHandler((req, res) => gamificationEngineController.getLeaderboards(req, res)));
router.post('/leaderboards', asyncHandler((req, res) => gamificationEngineController.updateLeaderboard(req, res)));
router.get('/badges/:org_id', asyncHandler((req, res) => gamificationEngineController.getBadges(req, res)));
router.post('/badges', asyncHandler((req, res) => gamificationEngineController.createBadge(req, res)));
router.get('/store/:org_id', asyncHandler((req, res) => gamificationEngineController.getStoreItems(req, res)));
router.post('/store', asyncHandler((req, res) => gamificationEngineController.createStoreItem(req, res)));
router.get('/redemptions/:org_id', asyncHandler((req, res) => gamificationEngineController.getRedemptions(req, res)));
router.post('/redemptions', asyncHandler((req, res) => gamificationEngineController.createRedemption(req, res)));
router.get('/challenges/:org_id', asyncHandler((req, res) => gamificationEngineController.getChallenges(req, res)));
router.post('/challenges', asyncHandler((req, res) => gamificationEngineController.createChallenge(req, res)));

export default router;
