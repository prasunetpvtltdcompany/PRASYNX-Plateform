import { verifyManagementAuth, enforceOrgAccess } from "../middleware/verifyAuth";
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { gamificationController } from '../controllers/gamification.controller';

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


// ==================== LEARNING GAMES ====================
router.get('/learning-games/:org_id', asyncHandler(gamificationController.getLearningGames));
router.post('/learning-games', asyncHandler(gamificationController.createLearningGame));
router.put('/learning-games/:id', asyncHandler(gamificationController.updateLearningGame));
router.delete('/learning-games/:id', asyncHandler(gamificationController.deleteLearningGame));

// ==================== GAME ASSIGNMENTS ====================
router.get('/assignments/:org_id', asyncHandler(gamificationController.getAssignments));
router.post('/assignments', asyncHandler(gamificationController.createAssignment));
router.put('/assignments/:id', asyncHandler(gamificationController.updateAssignment));
router.delete('/assignments/:id', asyncHandler(gamificationController.deleteAssignment));

// ==================== GAME SESSIONS ====================
router.get('/sessions/:org_id', asyncHandler(gamificationController.getSessions));
router.get('/sessions/student/:student_id', asyncHandler(gamificationController.getSessionsByStudent));
router.post('/sessions', asyncHandler(gamificationController.createSession));

// ==================== STUDENT XP & PROGRESS ====================
router.get('/xp/:org_id', asyncHandler(gamificationController.getXpByOrg));
router.get('/xp/student/:student_id', asyncHandler(gamificationController.getXpByStudent));
router.post('/xp/award', asyncHandler(gamificationController.awardXp));

// ==================== ACHIEVEMENTS ====================
router.get('/achievements/:org_id', asyncHandler(gamificationController.getAchievements));
router.post('/achievements', asyncHandler(gamificationController.createAchievement));
router.delete('/achievements/:id', asyncHandler(gamificationController.deleteAchievement));

// ==================== STUDENT ACHIEVEMENTS ====================
router.get('/student-achievements/:student_id', asyncHandler(gamificationController.getStudentAchievements));
router.post('/student-achievements', asyncHandler(gamificationController.createStudentAchievement));

// ==================== LEADERBOARD ====================
router.get('/leaderboard/:org_id', asyncHandler(gamificationController.getLeaderboard));
router.post('/leaderboard/refresh/:org_id', asyncHandler(gamificationController.refreshLeaderboard));

export default router;
