-- ============================================================================
-- DISCIPLINE — BEHAVIORAL INCIDENT LOG
-- ============================================================================
-- Tracks the lifecycle of each disciplinary incident over time: reporting,
-- status changes, actions taken, and resolution. Powers the incident timeline.
-- Idempotent + missing-table-safe.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.behavioral_incident_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.behavioral_incidents(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  log_type TEXT NOT NULL DEFAULT 'note',   -- reported | status_change | action_taken | resolution | note
  from_value TEXT,
  to_value TEXT,
  note TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incident_log_incident ON public.behavioral_incident_log(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_log_org ON public.behavioral_incident_log(organisation_id);
CREATE INDEX IF NOT EXISTS idx_incident_log_created_at ON public.behavioral_incident_log(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.behavioral_incident_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view incident logs in their org" ON public.behavioral_incident_log;
CREATE POLICY "Users can view incident logs in their org"
  ON public.behavioral_incident_log FOR SELECT
  USING (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert incident logs in their org" ON public.behavioral_incident_log;
CREATE POLICY "Users can insert incident logs in their org"
  ON public.behavioral_incident_log FOR INSERT
  WITH CHECK (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

COMMENT ON TABLE public.behavioral_incident_log IS
  'Lifecycle log for each disciplinary incident: reporting, status changes, actions, resolution.';
