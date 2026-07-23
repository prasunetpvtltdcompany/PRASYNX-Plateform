-- ============================================================================
-- Prasunet School ERP — Phase 5: Tables & Enhancement Migration
-- ============================================================================
-- Creates: class_subjects, homework, homework_submissions,
--          promotion_history, communication_log
-- Enhances: timetable_entries, assignments, exams, classes,
--           assignment_submissions
-- Adds:     academic_years single-active trigger
--           RLS policies for all new tables
--           Performance indexes
-- ============================================================================

-- ============================================================================
-- PART 1: CLASS_SUBJECTS — Link subjects to classes
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.class_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  is_mandatory BOOLEAN DEFAULT true,
  max_students INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, subject_id)
);

-- ============================================================================
-- PART 2: TIMETABLE ENTRIES — Add Phase 5 columns to existing table
-- ============================================================================

DO $$ BEGIN
  ALTER TABLE public.timetable_entries ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.timetable_entries ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES sections(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.timetable_entries ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.timetable_entries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================================
-- PART 3: HOMEWORK — Homework management table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.homework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  attachments JSONB DEFAULT '[]',
  max_score NUMERIC(5,2),
  is_optional BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 4: HOMEWORK SUBMISSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.homework_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  homework_id UUID NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  submission_text TEXT,
  attachments JSONB DEFAULT '[]',
  score NUMERIC(5,2),
  feedback TEXT,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  graded_at TIMESTAMPTZ,
  UNIQUE(homework_id, student_id)
);

-- ============================================================================
-- PART 5: ASSIGNMENTS — Add Phase 5 columns
-- ============================================================================

DO $$ BEGIN
  ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES sections(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================================
-- PART 6: EXAMS — Add academic_year_id column
-- ============================================================================

DO $$ BEGIN
  ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================================
-- PART 7: PROMOTION HISTORY — Promotion management table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.promotion_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  from_class_id UUID NOT NULL REFERENCES classes(id),
  from_section_id UUID REFERENCES sections(id),
  to_class_id UUID NOT NULL REFERENCES classes(id),
  to_section_id UUID REFERENCES sections(id),
  academic_year_id UUID REFERENCES academic_years(id),
  promoted_by UUID REFERENCES users(id),
  promoted_at TIMESTAMPTZ DEFAULT NOW(),
  remarks TEXT
);

-- ============================================================================
-- PART 8: COMMUNICATION LOG — Communication system table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.communication_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  sender_type TEXT NOT NULL,
  sender_id UUID NOT NULL,
  receiver_type TEXT NOT NULL,
  receiver_id UUID,
  subject TEXT,
  message TEXT NOT NULL,
  channel TEXT DEFAULT 'notification',
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 9: ACADEMIC YEAR — Single active year trigger per organisation
-- ============================================================================

CREATE OR REPLACE FUNCTION public.enforce_single_active_academic_year()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.is_current = true THEN
    UPDATE public.academic_years SET is_current = false
    WHERE organisation_id = NEW.organisation_id AND id != NEW.id AND is_current = true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_single_active_year ON public.academic_years;
CREATE TRIGGER trg_enforce_single_active_year
  BEFORE INSERT OR UPDATE OF is_current ON public.academic_years
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_single_active_academic_year();

-- ============================================================================
-- PART 10: ADD ACADEMIC_YEAR_ID TO EXISTING TABLES
-- ============================================================================

DO $$ BEGIN
  ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.assignment_submissions ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================================
-- PART 11: ROW LEVEL SECURITY
-- ============================================================================

-- 11a. Enable RLS on all new tables
ALTER TABLE IF EXISTS public.class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.promotion_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.communication_log ENABLE ROW LEVEL SECURITY;

-- 11b. Org-scoped policies for new tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'class_subjects' AND policyname = 'org_isolation') THEN
    CREATE POLICY org_isolation ON public.class_subjects
      FOR ALL USING (organisation_id = public.get_user_org_id());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'homework' AND policyname = 'org_isolation') THEN
    CREATE POLICY org_isolation ON public.homework
      FOR ALL USING (organisation_id = public.get_user_org_id());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'homework_submissions' AND policyname = 'org_isolation') THEN
    CREATE POLICY org_isolation ON public.homework_submissions
      FOR ALL USING (
        organisation_id IN (
          SELECT h.organisation_id FROM public.homework h WHERE h.id = homework_id
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promotion_history' AND policyname = 'org_isolation') THEN
    CREATE POLICY org_isolation ON public.promotion_history
      FOR ALL USING (organisation_id = public.get_user_org_id());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'communication_log' AND policyname = 'org_isolation') THEN
    CREATE POLICY org_isolation ON public.communication_log
      FOR ALL USING (organisation_id = public.get_user_org_id());
  END IF;
END $$;

-- ============================================================================
-- PART 12: INDEXES
-- ============================================================================

-- class_subjects
CREATE INDEX IF NOT EXISTS idx_class_subjects_org ON public.class_subjects(organisation_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_class ON public.class_subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_subject ON public.class_subjects(subject_id);

-- timetable_entries (additional indexes beyond existing)
CREATE INDEX IF NOT EXISTS idx_timetable_academic_year ON public.timetable_entries(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_timetable_section ON public.timetable_entries(section_id);
CREATE INDEX IF NOT EXISTS idx_timetable_day ON public.timetable_entries(day_of_week);

-- homework
CREATE INDEX IF NOT EXISTS idx_homework_org ON public.homework(organisation_id);
CREATE INDEX IF NOT EXISTS idx_homework_class ON public.homework(class_id);
CREATE INDEX IF NOT EXISTS idx_homework_subject ON public.homework(subject_id);
CREATE INDEX IF NOT EXISTS idx_homework_teacher ON public.homework(teacher_id);
CREATE INDEX IF NOT EXISTS idx_homework_status ON public.homework(status);
CREATE INDEX IF NOT EXISTS idx_homework_due_date ON public.homework(due_date);

-- homework_submissions
CREATE INDEX IF NOT EXISTS idx_homework_submissions_homework ON public.homework_submissions(homework_id);
CREATE INDEX IF NOT EXISTS idx_homework_submissions_student ON public.homework_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_homework_submissions_status ON public.homework_submissions(status);

-- promotion_history
CREATE INDEX IF NOT EXISTS idx_promotion_history_org ON public.promotion_history(organisation_id);
CREATE INDEX IF NOT EXISTS idx_promotion_history_student ON public.promotion_history(student_id);
CREATE INDEX IF NOT EXISTS idx_promotion_history_from_class ON public.promotion_history(from_class_id);
CREATE INDEX IF NOT EXISTS idx_promotion_history_to_class ON public.promotion_history(to_class_id);
CREATE INDEX IF NOT EXISTS idx_promotion_history_academic_year ON public.promotion_history(academic_year_id);

-- communication_log
CREATE INDEX IF NOT EXISTS idx_communication_log_org ON public.communication_log(organisation_id);
CREATE INDEX IF NOT EXISTS idx_communication_log_sender ON public.communication_log(sender_type, sender_id);
CREATE INDEX IF NOT EXISTS idx_communication_log_receiver ON public.communication_log(receiver_type, receiver_id);
CREATE INDEX IF NOT EXISTS idx_communication_log_channel ON public.communication_log(channel);
CREATE INDEX IF NOT EXISTS idx_communication_log_created ON public.communication_log(created_at);

-- assignment_submissions
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_academic_year ON public.assignment_submissions(academic_year_id);

-- ============================================================================
-- END OF PHASE 5 MIGRATION
-- ============================================================================
