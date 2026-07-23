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


const safeFetch = async (table: string, orgId: string) => {
  const { data } = await supabase.from(table).select('*').eq('organisation_id', orgId);
  return data || [];
};

const safeInsert = async (table: string, body: any) => {
  const { error } = await supabase.from(table).insert(body);
  if (error) return { error: error.message };
  return { success: true };
};

// Homework Submissions
router.get('/homework/:org_id', async (req, res) => res.json(await safeFetch('homework_submissions', req.params.org_id)));
router.post('/homework', async (req, res) => res.json(await safeInsert('homework_submissions', req.body)));

// Doubt Queries
router.get('/doubts/:org_id', async (req, res) => res.json(await safeFetch('doubt_queries', req.params.org_id)));
router.post('/doubts', async (req, res) => res.json(await safeInsert('doubt_queries', req.body)));

// Lesson Plans
router.get('/lesson-plans/:org_id', async (req, res) => res.json(await safeFetch('lesson_plans', req.params.org_id)));
router.post('/lesson-plans', async (req, res) => res.json(await safeInsert('lesson_plans', req.body)));

// Quizzes
router.get('/quizzes/:org_id', async (req, res) => res.json(await safeFetch('quizzes', req.params.org_id)));
router.post('/quizzes', async (req, res) => res.json(await safeInsert('quizzes', req.body)));

export default router;
