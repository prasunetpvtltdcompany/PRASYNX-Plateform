-- ============================================================================
-- APPROVED APPLICATIONS -> ADMISSIONS TABLE
-- ============================================================================
-- When an admission application is approved it is mirrored into the newer
-- `admissions` table (used by /api/admission-management/*). `application_id`
-- links the row back to admission_applications so approval is idempotent.
-- ============================================================================

-- Link column on the newer admissions table (idempotent).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'admissions' AND column_name = 'application_id'
  ) THEN
    ALTER TABLE public.admissions ADD COLUMN application_id UUID REFERENCES public.admission_applications(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Full UNIQUE constraint (NOT a partial index) so PostgREST can use it for
-- ON CONFLICT. Multiple NULL application_id rows are allowed by Postgres.
ALTER TABLE public.admissions DROP CONSTRAINT IF EXISTS uq_admissions_application_id;
DROP INDEX IF EXISTS uq_admissions_application_id;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_admissions_application_id'
  ) THEN
    ALTER TABLE public.admissions ADD CONSTRAINT uq_admissions_application_id UNIQUE (application_id);
  END IF;
END $$;
