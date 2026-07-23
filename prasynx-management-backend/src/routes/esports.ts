import { verifyManagementAuth, enforceOrgAccess } from "../middleware/verifyAuth";
import { Router } from 'express';
import { supabase } from '../lib/backend-common';

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


// ---- Esports Leagues ----
router.get('/leagues/:org_id', async (req, res) => {
  const { org_id } = req.params;

  try {
    const { data } = await supabase.from('esports_leagues').select('*').eq('organisation_id', org_id);
    res.json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/leagues', async (req, res) => {

  const { error } = await supabase.from('esports_leagues').insert(req.body);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ---- Esports Teams ----
router.get('/teams/:league_id', async (req, res) => {
  const { league_id } = req.params;

  try {
    const { data } = await supabase.from('esports_teams').select('*').eq('league_id', league_id);
    res.json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/teams', async (req, res) => {

  const { error } = await supabase.from('esports_teams').insert(req.body);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ---- Gaming Curriculum ----
router.get('/gaming-curriculum/:org_id', async (req, res) => {
  const { org_id } = req.params;

  try {
    const { data } = await supabase.from('gaming_curriculum').select('*').eq('organisation_id', org_id);
    res.json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/gaming-curriculum', async (req, res) => {

  const { error } = await supabase.from('gaming_curriculum').insert(req.body);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ---- Live Streams ----
router.get('/live-streams/:org_id', async (req, res) => {
  const { org_id } = req.params;

  try {
    const { data } = await supabase.from('live_streams').select('*').eq('organisation_id', org_id);
    res.json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/live-streams', async (req, res) => {

  const { error } = await supabase.from('live_streams').insert(req.body);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

export default router;
