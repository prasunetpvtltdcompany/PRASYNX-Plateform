-- Assignments Management Enhanced Schema
-- Extends assignments + assignment_submissions with 5 new tables

ALTER TABLE assignments ADD COLUMN IF NOT EXISTS section TEXT;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS academic_year TEXT;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS assignment_type TEXT DEFAULT 'homework' CHECK (assignment_type IN ('homework','classwork','project','quiz','essay','research','other'));
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS instructions TEXT;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS attachment_urls JSONB DEFAULT '[]';
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS max_score NUMERIC(5,2) DEFAULT 100;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS passing_score NUMERIC(5,2) DEFAULT 40;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS allow_late_submission BOOLEAN DEFAULT false;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard','advanced'));
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS total_students INT DEFAULT 0;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS submitted_count INT DEFAULT 0;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS graded_count INT DEFAULT 0;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS avg_score NUMERIC(5,2);
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','closed','archived'));

ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS submitted_text TEXT;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS attachment_urls JSONB DEFAULT '[]';
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS is_late BOOLEAN DEFAULT false;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS grade NUMERIC(5,2);
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS max_score NUMERIC(5,2);
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS grading_rubric JSONB;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS feedback TEXT;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS ai_feedback TEXT;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS plagiarism_score NUMERIC(5,2);
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS graded_by UUID;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS graded_at TIMESTAMPTZ;
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'submitted' CHECK (status IN ('draft','submitted','graded','returned','resubmitted'));
ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS resubmitted_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS assignment_rubrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  criterion TEXT NOT NULL,
  max_score NUMERIC(5,2) NOT NULL,
  description TEXT,
  weight DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  title TEXT,
  description TEXT,
  data JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_subject ON assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON assignment_submissions(status);
CREATE INDEX IF NOT EXISTS idx_rubrics_assignment ON assignment_rubrics(assignment_id);
