-- ============================================================================
-- PHASE 5 — FIX: Add missing organisation_id columns + RLS
-- ============================================================================

-- Add organisation_id to homework_submissions
ALTER TABLE homework_submissions ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE;

-- Backfill organisation_id from homework table
UPDATE homework_submissions hs
SET organisation_id = h.organisation_id
FROM homework h
WHERE hs.homework_id = h.id AND hs.organisation_id IS NULL;

ALTER TABLE homework_submissions ALTER COLUMN organisation_id SET NOT NULL;

-- Re-create RLS policies for all Phase 5 tables
DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.homework_submissions;
  CREATE POLICY org_isolation ON public.homework_submissions
    FOR ALL USING (organisation_id = get_user_org_id());
  RAISE NOTICE 'RLS policy created for homework_submissions';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.homework;
  CREATE POLICY org_isolation ON public.homework
    FOR ALL USING (organisation_id = get_user_org_id());
  RAISE NOTICE 'RLS policy created for homework';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.class_subjects;
  CREATE POLICY org_isolation ON public.class_subjects
    FOR ALL USING (organisation_id = get_user_org_id());
  RAISE NOTICE 'RLS policy created for class_subjects';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.timetable_entries;
  CREATE POLICY org_isolation ON public.timetable_entries
    FOR ALL USING (organisation_id = get_user_org_id());
  RAISE NOTICE 'RLS policy created for timetable_entries';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.promotion_history;
  CREATE POLICY org_isolation ON public.promotion_history
    FOR ALL USING (organisation_id = get_user_org_id());
  RAISE NOTICE 'RLS policy created for promotion_history';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.communication_log;
  CREATE POLICY org_isolation ON public.communication_log
    FOR ALL USING (organisation_id = get_user_org_id());
  RAISE NOTICE 'RLS policy created for communication_log';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Add indexes for homework_submissions
CREATE INDEX IF NOT EXISTS idx_homework_submissions_org ON homework_submissions(organisation_id);
CREATE INDEX IF NOT EXISTS idx_homework_submissions_homework ON homework_submissions(homework_id);
CREATE INDEX IF NOT EXISTS idx_homework_submissions_student ON homework_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_homework_submissions_status ON homework_submissions(status);
