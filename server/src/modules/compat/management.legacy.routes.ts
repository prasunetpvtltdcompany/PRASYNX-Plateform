import { Router } from 'express';
import { requestDb } from '../../infrastructure/database/supabase';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const router = Router();

// Legacy: GET /api/management/classes/:class_id -> return class details
router.get('/classes/:class_id', async (req, res) => {
  const { class_id } = req.params as { class_id?: string };
  if (!class_id) return res.status(400).json({ error: 'class_id required' });
  if (!UUID_RE.test(class_id)) return res.status(400).json({ error: 'Invalid class_id' });
  try {
    const { data, error } = await requestDb().from('classes').select('*').eq('id', class_id).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Class not found' });
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || String(err) });
  }
});

// Legacy: GET /api/management/classes/:organisation_id (list classes by organisation)
router.get('/classes/org/:organisation_id', async (req, res) => {
  const { organisation_id } = req.params as { organisation_id?: string };
  if (!organisation_id) return res.status(400).json({ error: 'organisation_id required' });
  if (!UUID_RE.test(organisation_id)) return res.status(400).json({ error: 'Invalid organisation_id' });
  try {
    const { data, error } = await requestDb().from('classes').select('*').eq('organisation_id', organisation_id);
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || String(err) });
  }
});

export default router;
