-- staff_performance table (matching the existing staff_* schema pattern)
-- NOTE: original migration 0020 referenced the non-existent "organization_profiles"
-- table, so this table was never created. This creates it against the real
-- "organisations" parent table used by staff_tasks / staff_attendance / etc.

CREATE TABLE IF NOT EXISTS public.staff_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  score INTEGER DEFAULT 0,
  kpi_metrics JSONB DEFAULT '{}'::jsonb,
  manager_feedback TEXT,
  review_date DATE DEFAULT CURRENT_DATE,
  review_period TEXT DEFAULT 'MONTHLY',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_performance_org ON public.staff_performance(organisation_id);
CREATE INDEX IF NOT EXISTS idx_staff_performance_staff ON public.staff_performance(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_performance_review_date ON public.staff_performance(review_date);

ALTER TABLE public.staff_performance ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF to_regprocedure('public.get_user_org_id()') IS NOT NULL THEN
    DROP POLICY IF EXISTS staff_portal_org_isolation ON public.staff_performance;
    CREATE POLICY staff_portal_org_isolation ON public.staff_performance
      FOR ALL
      USING (organisation_id = public.get_user_org_id())
      WITH CHECK (organisation_id = public.get_user_org_id());
  END IF;
END $$;
