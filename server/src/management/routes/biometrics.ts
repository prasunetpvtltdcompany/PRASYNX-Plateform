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


router.get('/iris/:org_id', async (req, res) => {

  try {
    const { data } = await supabase.from('iris_records').select('*').eq('organisation_id', req.params.org_id);
    res.json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/iris', async (req, res) => {

  const { error } = await supabase.from('iris_records').insert(req.body);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

router.get('/voice/:org_id', async (req, res) => {

  try {
    const { data } = await supabase.from('voice_records').select('*').eq('organisation_id', req.params.org_id);
    res.json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/voice', async (req, res) => {

  const { error } = await supabase.from('voice_records').insert(req.body);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

router.get('/heart-rate/:org_id', async (req, res) => {

  try {
    const { data } = await supabase.from('heart_rate_records').select('*').eq('organisation_id', req.params.org_id);
    res.json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/heart-rate', async (req, res) => {

  const { error } = await supabase.from('heart_rate_records').insert(req.body);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

router.get('/sleep/:org_id', async (req, res) => {

  try {
    const { data } = await supabase.from('sleep_patterns').select('*').eq('organisation_id', req.params.org_id);
    res.json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/sleep', async (req, res) => {

  const { error } = await supabase.from('sleep_patterns').insert(req.body);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

router.get('/nutrition/:org_id', async (req, res) => {

  try {
    const { data } = await supabase.from('nutrition_records').select('*').eq('organisation_id', req.params.org_id);
    res.json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/nutrition', async (req, res) => {

  const { error } = await supabase.from('nutrition_records').insert(req.body);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

export default router;
