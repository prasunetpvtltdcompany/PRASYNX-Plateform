-- ============================================================================
-- DISCIPLINE — REMOVE ACADEMIC YEAR COLUMNS
-- ============================================================================
-- Academic year is derived from the report date; the explicit columns are
-- removed to avoid stale/duplicate data.
-- ============================================================================

ALTER TABLE public.behavioral_incidents
  DROP COLUMN IF EXISTS academic_year_id,
  DROP COLUMN IF EXISTS academic_year;
