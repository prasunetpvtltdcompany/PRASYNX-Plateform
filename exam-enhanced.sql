-- Enhanced Exam Management Schema

-- Extend exams table
ALTER TABLE exams
  ADD COLUMN IF NOT EXISTS academic_year TEXT,
  ADD COLUMN IF NOT EXISTS term TEXT,
  ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS section TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS total_students INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pass_percentage DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Extend exam_schedules
ALTER TABLE exam_schedules
  ADD COLUMN IF NOT EXISTS invigilator_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS max_marks NUMERIC(5,2) DEFAULT 100,
  ADD COLUMN IF NOT EXISTS pass_marks NUMERIC(5,2) DEFAULT 40,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS session TEXT CHECK (session IN ('morning', 'afternoon', 'evening')),
  ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE;

-- Extend exam_results
ALTER TABLE exam_results
  ADD COLUMN IF NOT EXISTS is_passed BOOLEAN,
  ADD COLUMN IF NOT EXISTS gpa NUMERIC(3,2),
  ADD COLUMN IF NOT EXISTS rank INTEGER,
  ADD COLUMN IF NOT EXISTS total_marks NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS percentage DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Exam grade definitions
CREATE TABLE IF NOT EXISTS exam_grade_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  grade TEXT NOT NULL,
  min_percentage DECIMAL(5,2) NOT NULL,
  max_percentage DECIMAL(5,2) NOT NULL,
  gpa NUMERIC(3,2),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Exam invigilators
CREATE TABLE IF NOT EXISTS exam_invigilators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES exam_schedules(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  room TEXT,
  duty_date DATE,
  start_time TIME,
  end_time TIME,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Exam attendance (student exam-day attendance)
CREATE TABLE IF NOT EXISTS exam_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES exam_schedules(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('present', 'absent', 'late')),
  marked_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(schedule_id, student_id)
);

-- AI exam insights
CREATE TABLE IF NOT EXISTS exam_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('prediction', 'risk', 'recommendation', 'readiness')),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  predicted_score DECIMAL(5,2),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  recommendations JSONB,
  readiness_score DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_exams_org_status ON exams(organisation_id, status);
  CREATE INDEX IF NOT EXISTS idx_exam_schedules_exam ON exam_schedules(exam_id);
  CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results(student_id);
  CREATE INDEX IF NOT EXISTS idx_exam_results_exam ON exam_results(exam_id);
  CREATE INDEX IF NOT EXISTS idx_exam_ai_insights_exam ON exam_ai_insights(exam_id);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
