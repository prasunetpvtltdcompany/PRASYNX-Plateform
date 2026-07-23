-- ============================================================================
-- PRASYNX ERP – PRODUCTION MULTI-TENANT MIGRATION
-- ============================================================================
-- RUN ORDER:
--   1. prasunet-schema.sql (base schema – already run)
--   2. prasunet-fix-missing-tables.sql (missing tables – already run)
--   3. THIS FILE (production hardening)
-- ============================================================================

-- ============================================================================
-- PART 1: ADD organisation_id TO JUNCTION TABLES
-- ============================================================================

-- 1a. parent_student_links
ALTER TABLE IF EXISTS public.parent_student_links
  ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE;

UPDATE public.parent_student_links psl
  SET organisation_id = s.organisation_id
  FROM public.students s
  WHERE s.id = psl.student_id AND psl.organisation_id IS NULL;

ALTER TABLE IF EXISTS public.parent_student_links
  ALTER COLUMN organisation_id SET NOT NULL;

-- 1b. class_subject_teacher_map
ALTER TABLE IF EXISTS public.class_subject_teacher_map
  ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE;

UPDATE public.class_subject_teacher_map cstm
  SET organisation_id = c.organisation_id
  FROM public.classes c
  WHERE c.id = cstm.class_id AND cstm.organisation_id IS NULL;

ALTER TABLE IF EXISTS public.class_subject_teacher_map
  ALTER COLUMN organisation_id SET NOT NULL;

-- 1c. Create class_student_map if not exists (referenced by code but may be missing)
CREATE TABLE IF NOT EXISTS public.class_student_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- 1d. Add organisation_id to teacher_student_map (if exists)
ALTER TABLE IF EXISTS public.teacher_student_map
  ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teacher_student_map') THEN
    UPDATE public.teacher_student_map tsm
      SET organisation_id = t.organisation_id
      FROM public.teachers t
      WHERE t.id = tsm.teacher_id AND tsm.organisation_id IS NULL;
  END IF;
END $$;

-- 1e. Add organisation_id to exam_submissions (may be missing it)
ALTER TABLE IF EXISTS public.exam_submissions
  ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'exam_submissions') THEN
    UPDATE public.exam_submissions es
      SET organisation_id = e.organisation_id
      FROM public.exams e
      WHERE e.id = es.exam_id AND es.organisation_id IS NULL;
  END IF;
END $$;

-- 1f. Add organisation_id to exam_questions (may be missing it)
ALTER TABLE IF EXISTS public.exam_questions
  ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'exam_questions') THEN
    UPDATE public.exam_questions eq
      SET organisation_id = e.organisation_id
      FROM public.exams e
      WHERE e.id = eq.exam_id AND eq.organisation_id IS NULL;
  END IF;
END $$;

-- 1g. Add organisation_id to vaccinations
ALTER TABLE IF EXISTS public.vaccinations
  ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vaccinations') THEN
    UPDATE public.vaccinations v
      SET organisation_id = s.organisation_id
      FROM public.students s
      WHERE s.id = v.student_id AND v.organisation_id IS NULL;
  END IF;
END $$;

-- 1h. Add organisation_id to health_medical_records
ALTER TABLE IF EXISTS public.health_medical_records
  ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'health_medical_records') THEN
    UPDATE public.health_medical_records hmr
      SET organisation_id = s.organisation_id
      FROM public.students s
      WHERE s.id = hmr.student_id AND hmr.organisation_id IS NULL;
  END IF;
END $$;

-- 1i. Add organisation_id to health_emergency_contacts
ALTER TABLE IF EXISTS public.health_emergency_contacts
  ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'health_emergency_contacts') THEN
    UPDATE public.health_emergency_contacts hec
      SET organisation_id = s.organisation_id
      FROM public.students s
      WHERE s.id = hec.student_id AND hec.organisation_id IS NULL;
  END IF;
END $$;

-- 1j. Add organisation_id to feedback
ALTER TABLE IF EXISTS public.feedback
  ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feedback') THEN
    UPDATE public.feedback f
      SET organisation_id = s.organisation_id
      FROM public.students s
      WHERE s.id = f.student_id AND f.organisation_id IS NULL;
  END IF;
END $$;

-- 1k. Add organisation_id to assignment_submissions (if it doesn't have it already)
ALTER TABLE IF EXISTS public.assignment_submissions
  ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE;

-- 1l. Create password_reset_tokens table (for forgot-password flow)
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON public.password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON public.password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);

-- ============================================================================
-- PART 2: FIX UNIQUE CONSTRAINTS FOR MULTI-TENANT
-- ============================================================================

-- 2a. users: global UNIQUE(email) → UNIQUE(organisation_id, email)
ALTER TABLE IF EXISTS public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS public.users DROP CONSTRAINT IF EXISTS users_email_org_key;
ALTER TABLE IF EXISTS public.users
  ADD CONSTRAINT users_email_org_key UNIQUE(organisation_id, email);

-- 2b. teachers: global UNIQUE(teacher_code) → UNIQUE(organisation_id, teacher_code)
ALTER TABLE IF EXISTS public.teachers DROP CONSTRAINT IF EXISTS teachers_teacher_code_key;
ALTER TABLE IF EXISTS public.teachers DROP CONSTRAINT IF EXISTS teachers_teacher_code_org_key;
ALTER TABLE IF EXISTS public.teachers
  ADD CONSTRAINT teachers_teacher_code_org_key UNIQUE(organisation_id, teacher_code);

-- 2c. subjects: add org-scoped unique on code
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subjects_code_org_key') THEN
    ALTER TABLE IF EXISTS public.subjects
      ADD CONSTRAINT subjects_code_org_key UNIQUE(organisation_id, code);
  END IF;
END $$;

-- 2d. classes: add org-scoped unique on name + section + academic_year
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'classes_name_section_org_key') THEN
    ALTER TABLE IF EXISTS public.classes
      ADD CONSTRAINT classes_name_section_org_key UNIQUE(organisation_id, name, section);
  END IF;
END $$;

-- 2e. students: add org-scoped unique on admission_number if column exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'admission_number') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'students_admission_number_org_key') THEN
      ALTER TABLE public.students
        ADD CONSTRAINT students_admission_number_org_key UNIQUE(organisation_id, admission_number);
    END IF;
  END IF;
END $$;

-- 2f. students: add org-scoped unique on roll_number if provided
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'students_roll_number_org_key') THEN
    ALTER TABLE IF EXISTS public.students
      ADD CONSTRAINT students_roll_number_org_key UNIQUE(organisation_id, roll_number);
  END IF;
END $$;

-- 2g. attendance: add unique on (student_id, date, period) if period column exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attendance' AND column_name = 'period') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_student_date_period_key') THEN
      ALTER TABLE IF EXISTS public.attendance
        ADD CONSTRAINT attendance_student_date_period_key UNIQUE(student_id, date, period);
    END IF;
  END IF;
END $$;

-- 2h. Add UNIQUE(user_id) on students, teachers, parents
ALTER TABLE IF EXISTS public.students DROP CONSTRAINT IF EXISTS students_user_id_key;
ALTER TABLE IF EXISTS public.students ADD CONSTRAINT students_user_id_key UNIQUE(user_id);

ALTER TABLE IF EXISTS public.teachers DROP CONSTRAINT IF EXISTS teachers_user_id_key;
ALTER TABLE IF EXISTS public.teachers ADD CONSTRAINT teachers_user_id_key UNIQUE(user_id);

ALTER TABLE IF EXISTS public.parents DROP CONSTRAINT IF EXISTS parents_user_id_key;
ALTER TABLE IF EXISTS public.parents ADD CONSTRAINT parents_user_id_key UNIQUE(user_id);

-- ============================================================================
-- PART 3: ADD organisation_id NOT NULL ON TABLES WITH EXISTING COLUMN
-- ============================================================================

-- Ensure organisation_id is NOT NULL on all core tables where it was nullable
ALTER TABLE IF EXISTS public.parent_student_links ALTER COLUMN organisation_id SET NOT NULL;
ALTER TABLE IF EXISTS public.class_subject_teacher_map ALTER COLUMN organisation_id SET NOT NULL;
ALTER TABLE IF EXISTS public.class_student_map ALTER COLUMN organisation_id SET NOT NULL;

-- ============================================================================
-- PART 4: COMPOSITE INDEXES FOR 100K+ SCALE
-- ============================================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_org_email ON public.users(organisation_id, email);
CREATE INDEX IF NOT EXISTS idx_users_org_role ON public.users(organisation_id, role);
CREATE INDEX IF NOT EXISTS idx_users_org_status ON public.users(organisation_id, status);

-- Students
CREATE INDEX IF NOT EXISTS idx_students_org_user ON public.students(organisation_id, user_id);
CREATE INDEX IF NOT EXISTS idx_students_org_roll ON public.students(organisation_id, roll_number);
CREATE INDEX IF NOT EXISTS idx_students_org_name ON public.students(organisation_id, full_name);
DROP INDEX IF EXISTS public.idx_students_class;
CREATE INDEX IF NOT EXISTS idx_students_student_class ON public.students(student_class);

-- Teachers
CREATE INDEX IF NOT EXISTS idx_teachers_org_user ON public.teachers(organisation_id, user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_org_code ON public.teachers(organisation_id, teacher_code);

-- Parents
CREATE INDEX IF NOT EXISTS idx_parents_org_user ON public.parents(organisation_id, user_id);

-- Parent-Student Links
CREATE INDEX IF NOT EXISTS idx_psl_org_parent ON public.parent_student_links(organisation_id, parent_id);
CREATE INDEX IF NOT EXISTS idx_psl_org_student ON public.parent_student_links(organisation_id, student_id);

-- Class-Student Map
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'class_student_map') THEN
    CREATE INDEX IF NOT EXISTS idx_csm_org_class ON public.class_student_map(organisation_id, class_id);
    CREATE INDEX IF NOT EXISTS idx_csm_org_student ON public.class_student_map(organisation_id, student_id);
  END IF;
END $$;

-- Class-Subject-Teacher Map
CREATE INDEX IF NOT EXISTS idx_cstm_org_teacher ON public.class_subject_teacher_map(organisation_id, teacher_id);
CREATE INDEX IF NOT EXISTS idx_cstm_org_class ON public.class_subject_teacher_map(organisation_id, class_id);

-- Attendance
CREATE INDEX IF NOT EXISTS idx_attendance_org_student_date ON public.attendance(organisation_id, student_id, date);
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attendance' AND column_name = 'class_id') THEN
    CREATE INDEX IF NOT EXISTS idx_attendance_org_class_date ON public.attendance(organisation_id, class_id, date);
  END IF;
END $$;

-- Timetable
CREATE INDEX IF NOT EXISTS idx_timetable_org_class_day ON public.timetable_entries(organisation_id, class_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_timetable_org_teacher ON public.timetable_entries(organisation_id, teacher_id);

-- Exam Results
CREATE INDEX IF NOT EXISTS idx_exam_results_org_student ON public.exam_results(organisation_id, student_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_org_exam ON public.exam_results(organisation_id, exam_id);

-- Fees
CREATE INDEX IF NOT EXISTS idx_student_fees_org_student ON public.student_fees(organisation_id, student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_org_student ON public.fee_payments(organisation_id, student_id);

-- Assignments
CREATE INDEX IF NOT EXISTS idx_assignments_org_class ON public.assignments(organisation_id, class_id);

-- Books
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'books') THEN
    CREATE INDEX IF NOT EXISTS idx_books_org ON public.books(organisation_id);
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'book_issues') THEN
    CREATE INDEX IF NOT EXISTS idx_book_issues_org ON public.book_issues(organisation_id);
  END IF;
END $$;

-- ============================================================================
-- PART 5: ROW LEVEL SECURITY
-- ============================================================================

-- 5a. Enable RLS on all tables
ALTER TABLE IF EXISTS public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.class_student_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.class_subject_teacher_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.book_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.helpdesk_tickets ENABLE ROW LEVEL SECURITY;

-- 5b. Helper: get current user's organisation_id from JWT or users table
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT organisation_id FROM public.users WHERE id = auth.uid();
$$;

-- 5c. Drop existing policies to avoid duplicates
DROP POLICY IF EXISTS "org_isolation" ON public.organisations;
DROP POLICY IF EXISTS "org_isolation" ON public.users;
DROP POLICY IF EXISTS "org_isolation" ON public.students;
DROP POLICY IF EXISTS "org_isolation" ON public.teachers;
DROP POLICY IF EXISTS "org_isolation" ON public.parents;
DROP POLICY IF EXISTS "org_isolation" ON public.classes;
DROP POLICY IF EXISTS "org_isolation" ON public.subjects;
DROP POLICY IF EXISTS "org_isolation_psl" ON public.parent_student_links;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'class_student_map') THEN
    DROP POLICY IF EXISTS "org_isolation_csm" ON public.class_student_map;
  END IF;
END $$;
DROP POLICY IF EXISTS "org_isolation_cstm" ON public.class_subject_teacher_map;
DROP POLICY IF EXISTS "org_isolation_attendance" ON public.attendance;
DROP POLICY IF EXISTS "org_isolation_timetable" ON public.timetable_entries;
DROP POLICY IF EXISTS "org_isolation_exams" ON public.exams;
DROP POLICY IF EXISTS "org_isolation_exam_results" ON public.exam_results;
DROP POLICY IF EXISTS "org_isolation_assignments" ON public.assignments;
DROP POLICY IF EXISTS "org_isolation_fees" ON public.student_fees;
DROP POLICY IF EXISTS "org_isolation_events" ON public.events;
DROP POLICY IF EXISTS "org_isolation_announcements" ON public.announcements;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'books') THEN
    DROP POLICY IF EXISTS "org_isolation_books" ON public.books;
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feedback') THEN
    DROP POLICY IF EXISTS "org_isolation_feedback" ON public.feedback;
  END IF;
END $$;

-- 5d. Organisation-scoped RLS for ALL tables with organisation_id
DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.organisations;
  CREATE POLICY org_isolation ON public.organisations
    FOR ALL USING (id = public.get_user_org_id());
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.users;
  CREATE POLICY org_isolation ON public.users
    FOR ALL USING (organisation_id = public.get_user_org_id());
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.students;
  CREATE POLICY org_isolation ON public.students
    FOR ALL USING (organisation_id = public.get_user_org_id());
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.teachers;
  CREATE POLICY org_isolation ON public.teachers
    FOR ALL USING (organisation_id = public.get_user_org_id());
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.parents;
  CREATE POLICY org_isolation ON public.parents
    FOR ALL USING (organisation_id = public.get_user_org_id());
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.classes;
  CREATE POLICY org_isolation ON public.classes
    FOR ALL USING (organisation_id = public.get_user_org_id());
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.subjects;
  CREATE POLICY org_isolation ON public.subjects
    FOR ALL USING (organisation_id = public.get_user_org_id());
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.parent_student_links;
  CREATE POLICY org_isolation ON public.parent_student_links
    FOR ALL USING (organisation_id = public.get_user_org_id());
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'class_student_map') THEN
    DROP POLICY IF EXISTS org_isolation ON public.class_student_map;
    CREATE POLICY org_isolation ON public.class_student_map
      FOR ALL USING (organisation_id = public.get_user_org_id());
  END IF;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.class_subject_teacher_map;
  CREATE POLICY org_isolation ON public.class_subject_teacher_map
    FOR ALL USING (organisation_id = public.get_user_org_id());
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.attendance;
  CREATE POLICY org_isolation ON public.attendance
    FOR ALL USING (organisation_id = public.get_user_org_id());
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.attendance_records;
  CREATE POLICY org_isolation ON public.attendance_records
    FOR ALL USING (organisation_id = public.get_user_org_id());
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.timetable_entries;
  CREATE POLICY org_isolation ON public.timetable_entries
    FOR ALL USING (organisation_id = public.get_user_org_id());
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.exams;
  CREATE POLICY org_isolation ON public.exams
    FOR ALL USING (organisation_id = public.get_user_org_id());
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.exam_results;
  CREATE POLICY org_isolation ON public.exam_results
    FOR ALL USING (organisation_id = public.get_user_org_id());
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'exam_questions') THEN
    DROP POLICY IF EXISTS org_isolation ON public.exam_questions;
    CREATE POLICY org_isolation ON public.exam_questions
      FOR ALL USING (organisation_id = public.get_user_org_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'exam_submissions') THEN
    DROP POLICY IF EXISTS org_isolation ON public.exam_submissions;
    CREATE POLICY org_isolation ON public.exam_submissions
      FOR ALL USING (organisation_id = public.get_user_org_id());
  END IF;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.assignments;
  CREATE POLICY org_isolation ON public.assignments
    FOR ALL USING (organisation_id = public.get_user_org_id());
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.assignment_submissions;
  CREATE POLICY org_isolation ON public.assignment_submissions
    FOR ALL USING (
      organisation_id IN (
        SELECT a.organisation_id FROM public.assignments a WHERE a.id = assignment_id
      )
    );
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.fee_structures;
  CREATE POLICY org_isolation ON public.fee_structures
    FOR ALL USING (organisation_id = public.get_user_org_id());
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.student_fees;
  CREATE POLICY org_isolation ON public.student_fees
    FOR ALL USING (organisation_id = public.get_user_org_id());
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.fee_payments;
  CREATE POLICY org_isolation ON public.fee_payments
    FOR ALL USING (organisation_id = public.get_user_org_id());
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.events;
  CREATE POLICY org_isolation ON public.events
    FOR ALL USING (organisation_id = public.get_user_org_id());
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.announcements;
  CREATE POLICY org_isolation ON public.announcements
    FOR ALL USING (organisation_id = public.get_user_org_id());
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'books') THEN
    CREATE POLICY org_isolation ON public.books
      FOR ALL USING (organisation_id = public.get_user_org_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'book_issues') THEN
    CREATE POLICY org_isolation ON public.book_issues
      FOR ALL USING (organisation_id = public.get_user_org_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feedback') THEN
    CREATE POLICY org_isolation ON public.feedback
      FOR ALL USING (organisation_id = public.get_user_org_id());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'helpdesk_tickets') THEN
    CREATE POLICY org_isolation ON public.helpdesk_tickets
      FOR ALL USING (organisation_id = public.get_user_org_id());
  END IF;
END $$;

-- 5e. Admin bypass policy (admins can see ALL orgs)
DO $$ BEGIN
  DROP POLICY IF EXISTS admin_bypass ON public.organisations;
  CREATE POLICY admin_bypass ON public.organisations
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS admin_bypass ON public.users;
  CREATE POLICY admin_bypass ON public.users
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS admin_bypass ON public.students;
  CREATE POLICY admin_bypass ON public.students
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS admin_bypass ON public.teachers;
  CREATE POLICY admin_bypass ON public.teachers
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS admin_bypass ON public.parents;
  CREATE POLICY admin_bypass ON public.parents
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
END $$;

-- ============================================================================
-- PART 6: CLEANUP DEPRECATED DUPLICATE TABLES
-- ============================================================================

-- attendance vs attendance_records: attendance is the canonical table.
-- We keep attendance_records for backward compat but will phase it out.
-- attendance is the primary table used by all recent code.

-- ============================================================================
-- PART 7: add student_class text column if missing for backward compat
-- ============================================================================

-- Some code still references students.student_class as TEXT
ALTER TABLE IF EXISTS public.students
  ADD COLUMN IF NOT EXISTS student_class TEXT;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
