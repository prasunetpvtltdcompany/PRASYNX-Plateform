-- Exam Module Enhancements
-- Aligns the live DB schema with the management frontend ExamTab contract.

-- ============================================================
-- 1. EXAMS
-- ============================================================
ALTER TABLE exams
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS section TEXT,
  ADD COLUMN IF NOT EXISTS term TEXT,
  ADD COLUMN IF NOT EXISTS academic_year TEXT,
  ADD COLUMN IF NOT EXISTS total_marks NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS passing_marks NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS total_students INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pass_percentage DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES staff_records(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Backfill title from name (keeps NOT NULL name satisfied)
UPDATE exams SET title = COALESCE(NULLIF(title, ''), name) WHERE title IS NULL OR title = '';

-- Expand status CHECK to include draft / scheduled / cancelled (management workflow)
ALTER TABLE exams DROP CONSTRAINT IF EXISTS exams_status_check;
ALTER TABLE exams ADD CONSTRAINT exams_status_check
  CHECK (status IN ('draft','scheduled','upcoming','ongoing','completed','cancelled'));

-- Expand exam_type CHECK to include test / other (frontend options)
ALTER TABLE exams DROP CONSTRAINT IF EXISTS exams_exam_type_check;
ALTER TABLE exams ADD CONSTRAINT exams_exam_type_check
  CHECK (exam_type IN ('midterm','final','quiz','unit_test','practical','test','other'));

-- ============================================================
-- 2. EXAM SCHEDULES
-- ============================================================
ALTER TABLE exam_schedules
  ADD COLUMN IF NOT EXISTS invigilator_id UUID REFERENCES staff_records(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS max_marks NUMERIC(5,2) DEFAULT 100,
  ADD COLUMN IF NOT EXISTS pass_marks NUMERIC(5,2) DEFAULT 40,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS session TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ============================================================
-- 3. EXAM RESULTS
-- ============================================================
ALTER TABLE exam_results
  ADD COLUMN IF NOT EXISTS total_marks NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS is_passed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS percentage DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS gpa NUMERIC(3,2),
  ADD COLUMN IF NOT EXISTS rank INTEGER,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ============================================================
-- 4. EXAM GRADE DEFINITIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS exam_grade_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  grade TEXT NOT NULL,
  min_percentage DECIMAL(5,2) NOT NULL,
  max_percentage DECIMAL(5,2) NOT NULL,
  grade_points NUMERIC(3,2),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
