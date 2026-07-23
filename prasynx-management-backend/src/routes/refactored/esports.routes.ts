import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { esportsController } from '../../controllers/esports.controller';

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

router.get('/dashboard/:organisation_id', asyncHandler((req, res) => esportsController.getDashboard(req, res)));

router.get('/leagues/:organisation_id', asyncHandler((req, res) => esportsController.getLeagues(req, res)));
router.post('/leagues/:organisation_id', asyncHandler((req, res) => esportsController.createLeague(req, res)));
router.put('/leagues/:league_id', asyncHandler((req, res) => esportsController.updateLeague(req, res)));
router.delete('/leagues/:league_id', asyncHandler((req, res) => esportsController.deleteLeague(req, res)));

router.get('/teams/:organisation_id', asyncHandler((req, res) => esportsController.getTeams(req, res)));
router.get('/teams/:organisation_id/:league_id', asyncHandler((req, res) => esportsController.getTeams(req, res)));
router.post('/teams/:organisation_id', asyncHandler((req, res) => esportsController.createTeam(req, res)));
router.put('/teams/:team_id', asyncHandler((req, res) => esportsController.updateTeam(req, res)));
router.delete('/teams/:team_id', asyncHandler((req, res) => esportsController.deleteTeam(req, res)));

router.get('/players/:organisation_id', asyncHandler((req, res) => esportsController.getPlayers(req, res)));
router.get('/players/:organisation_id/:team_id', asyncHandler((req, res) => esportsController.getPlayers(req, res)));
router.post('/players/:organisation_id', asyncHandler((req, res) => esportsController.addPlayer(req, res)));
router.delete('/players/:player_id', asyncHandler((req, res) => esportsController.removePlayer(req, res)));

router.get('/tournaments/:organisation_id', asyncHandler((req, res) => esportsController.getTournaments(req, res)));
router.get('/tournaments/:organisation_id/:league_id', asyncHandler((req, res) => esportsController.getTournaments(req, res)));
router.post('/tournaments/:organisation_id', asyncHandler((req, res) => esportsController.createTournament(req, res)));

router.get('/matches/:organisation_id', asyncHandler((req, res) => esportsController.getMatches(req, res)));
router.post('/matches/:organisation_id', asyncHandler((req, res) => esportsController.createMatch(req, res)));
router.put('/matches/:match_id/score', asyncHandler((req, res) => esportsController.updateMatchScore(req, res)));

router.get('/standings/:organisation_id/:league_id', asyncHandler((req, res) => esportsController.getStandings(req, res)));

router.get('/curriculum/:organisation_id', asyncHandler((req, res) => esportsController.getCurriculum(req, res)));
router.post('/curriculum/:organisation_id', asyncHandler((req, res) => esportsController.createCurriculum(req, res)));
router.delete('/curriculum/:curriculum_id', asyncHandler((req, res) => esportsController.deleteCurriculum(req, res)));

router.get('/streams/:organisation_id', asyncHandler((req, res) => esportsController.getLiveStreams(req, res)));
router.post('/streams/:organisation_id', asyncHandler((req, res) => esportsController.createLiveStream(req, res)));
router.delete('/streams/:stream_id', asyncHandler((req, res) => esportsController.deleteLiveStream(req, res)));

export default router;
