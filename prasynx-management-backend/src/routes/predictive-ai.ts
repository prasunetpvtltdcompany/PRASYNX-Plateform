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

const safeFetchByStudent = async (table: string, studentId: string) => {
  const { data } = await supabase.from(table).select('*').eq('student_id', studentId);
  return data || [];
};

const safeFetchByTeacher = async (table: string, teacherId: string) => {
  const { data } = await supabase.from(table).select('*').eq('teacher_id', teacherId);
  return data || [];
};

const safeInsert = async (table: string, body: any) => {
  const { error } = await supabase.from(table).insert(body);
  if (error) return { error: error.message };
  return { success: true };
};

// Admission Predictions
router.get('/admission-predictions/:org_id', async (req, res) => res.json(await safeFetch('admission_predictions', req.params.org_id)));
router.post('/admission-predictions', async (req, res) => res.json(await safeInsert('admission_predictions', req.body)));

// Career Paths
router.get('/career-paths/:org_id', async (req, res) => res.json(await safeFetch('career_paths', req.params.org_id)));
router.post('/career-paths', async (req, res) => res.json(await safeInsert('career_paths', req.body)));

// Teacher Retention
router.get('/teacher-retention/:org_id', async (req, res) => res.json(await safeFetch('teacher_retention', req.params.org_id)));
router.post('/teacher-retention', async (req, res) => res.json(await safeInsert('teacher_retention', req.body)));

// Budget Forecasts
router.get('/budget-forecasts/:org_id', async (req, res) => res.json(await safeFetch('budget_forecasts', req.params.org_id)));
router.post('/budget-forecasts', async (req, res) => res.json(await safeInsert('budget_forecasts', req.body)));

// Enrollment Forecasts
router.get('/enrollment-forecasts/:org_id', async (req, res) => res.json(await safeFetch('enrollment_forecasts', req.params.org_id)));
router.post('/enrollment-forecasts', async (req, res) => res.json(await safeInsert('enrollment_forecasts', req.body)));

export default router;
