-- ============================================================================
-- DISCIPLINE MODULE — Behavioral Incidents Management
-- ============================================================================
-- Tracks student disciplinary incidents end-to-end: reporting, severity,
-- actions, outcomes, and resolution. Table name `behavioral_incidents` is
-- already referenced by the risk-detection service.
-- Idempotent + missing-table-safe.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.behavioral_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  incident_type TEXT NOT NULL,              -- e.g. bullying, uniform, attendance, misconduct
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'minor',   -- minor | moderate | major | critical
  location TEXT,
  reported_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  action_taken TEXT,                        -- warning | detention | suspension | expulsion | counselling | other
  action_detail TEXT,
  action_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'reported',  -- reported | under_review | actioned | resolved | closed
  resolution_notes TEXT,
  resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
  academic_year TEXT,                       -- human-readable "2026-27" label fallback
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_behavioral_incidents_org ON public.behavioral_incidents(organisation_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_incidents_student ON public.behavioral_incidents(student_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_incidents_severity ON public.behavioral_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_behavioral_incidents_status ON public.behavioral_incidents(status);
CREATE INDEX IF NOT EXISTS idx_behavioral_incidents_reported_at ON public.behavioral_incidents(reported_at DESC);
CREATE INDEX IF NOT EXISTS idx_behavioral_incidents_academic_year ON public.behavioral_incidents(academic_year_id);

-- updated_at maintenance
DROP TRIGGER IF EXISTS set_behavioral_incidents_updated_at ON public.behavioral_incidents;
CREATE TRIGGER set_behavioral_incidents_updated_at
  BEFORE UPDATE ON public.behavioral_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.behavioral_incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view incidents in their org" ON public.behavioral_incidents;
CREATE POLICY "Users can view incidents in their org"
  ON public.behavioral_incidents FOR SELECT
  USING (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert incidents in their org" ON public.behavioral_incidents;
CREATE POLICY "Users can insert incidents in their org"
  ON public.behavioral_incidents FOR INSERT
  WITH CHECK (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update incidents in their org" ON public.behavioral_incidents;
CREATE POLICY "Users can update incidents in their org"
  ON public.behavioral_incidents FOR UPDATE
  USING (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete incidents in their org" ON public.behavioral_incidents;
CREATE POLICY "Users can delete incidents in their org"
  ON public.behavioral_incidents FOR DELETE
  USING (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

COMMENT ON TABLE public.behavioral_incidents IS
  'Disciplinary incident records per student with severity, action, and resolution lifecycle.';
