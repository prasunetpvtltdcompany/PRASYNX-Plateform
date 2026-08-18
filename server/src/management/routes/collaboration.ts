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


router.get('/classrooms/:org_id', async (req, res) => {

  try {
    const { data } = await supabase.from('virtual_classrooms').select('*').eq('organisation_id', req.params.org_id);
    res.json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/classrooms', async (req, res) => {

  const { error } = await supabase.from('virtual_classrooms').insert(req.body);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

router.get('/whiteboards/:org_id', async (req, res) => {

  try {
    const { data } = await supabase.from('whiteboard_sessions').select('*').eq('organisation_id', req.params.org_id);
    res.json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/whiteboards', async (req, res) => {

  const { error } = await supabase.from('whiteboard_sessions').insert(req.body);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

router.get('/projects/:org_id', async (req, res) => {

  try {
    const { data } = await supabase.from('group_projects').select('*').eq('organisation_id', req.params.org_id);
    res.json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/projects', async (req, res) => {

  const { error } = await supabase.from('group_projects').insert(req.body);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

router.get('/documents/:org_id', async (req, res) => {

  try {
    const { data } = await supabase.from('co_edited_documents').select('*').eq('organisation_id', req.params.org_id);
    res.json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/documents', async (req, res) => {

  const { error } = await supabase.from('co_edited_documents').insert(req.body);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

router.get('/forums/:org_id', async (req, res) => {

  try {
    const { data } = await supabase.from('discussion_forums').select('*').eq('organisation_id', req.params.org_id);
    res.json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/forums', async (req, res) => {

  const { error } = await supabase.from('discussion_forums').insert(req.body);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

export default router;
