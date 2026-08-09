-- ============================================================================
-- ACADEMIC YEAR AWARENESS — Add academic_year_id across year-scoped tables
-- ============================================================================
-- Idempotent, missing-table-safe migration. Every ALTER/INDEX is guarded so the
-- migration never fails if a given table does not (yet) exist in the target DB.
-- academic_year_id is a UUID FK into academic_years -> ON DELETE SET NULL.
-- ============================================================================

-- Ensure academic_years exists (dependency).
CREATE TABLE IF NOT EXISTS public.academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organisation_id, name)
);

-- Helper: add academic_year_id FK column + index to a table only if the table
-- AND the column capacity exist. Skips silently when the table is missing.
DO $$
DECLARE
  tbl text;
  years_exist boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='academic_years') INTO years_exist;
  IF NOT years_exist THEN
    RAISE NOTICE 'academic_years missing; skipping academic_year_id backfill';
    RETURN;
  END IF;

  FOREACH tbl IN ARRAY ARRAY[
    'admission_applications',
    'attendance',
    'attendance_records',
    'exams',
    'exam_schedules',
    'exam_results',
    'assignments',
    'assignment_submissions',
    'homework',
    'homework_submissions',
    'fee_structures',
    'student_fees',
    'fee_payments',
    'grades',
    'subject_wise_marks',
    'timetable_entries'
  ] LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename=tbl) THEN
      BEGIN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL', tbl);
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_academic_year ON public.%I(academic_year_id)', tbl, tbl);
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Skipped %: %', tbl, SQLERRM;
      END;
    ELSE
      RAISE NOTICE 'Table % does not exist; skipped', tbl;
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- Human-readable academic year label (e.g. "2026-27") for records that may not
-- have an entry in the academic_years table. Applied to admission_applications
-- so applications always carry a displayable year.
-- ============================================================================
ALTER TABLE public.admission_applications
  ADD COLUMN IF NOT EXISTS academic_year TEXT;