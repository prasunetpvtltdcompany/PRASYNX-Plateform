-- Teacher Performance AI Schema for Prasunet ERP
-- Run this in Supabase SQL Editor

-- 1. TEACHER PERFORMANCE METRICS (computed KPIs per teacher over time)
CREATE TABLE IF NOT EXISTS teacher_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('effectiveness', 'engagement', 'punctuality', 'student_feedback', 'observation', 'composite')),
  score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  period TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  factors JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tpm_org ON teacher_performance_metrics(organisation_id);
CREATE INDEX IF NOT EXISTS idx_tpm_teacher ON teacher_performance_metrics(teacher_id);
CREATE INDEX IF NOT EXISTS idx_tpm_type ON teacher_performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_tpm_period ON teacher_performance_metrics(period_start, period_end);

-- 2. TEACHER OBSERVATIONS (classroom observations and evaluations)
CREATE TABLE IF NOT EXISTS teacher_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  observer_id UUID NOT NULL,
  observation_date DATE NOT NULL,
  lesson_topic TEXT,
  teaching_methods TEXT[] DEFAULT '{}',
  strengths TEXT[] DEFAULT '{}',
  areas_for_improvement TEXT[] DEFAULT '{}',
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  notes TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_to_org ON teacher_observations(organisation_id);
CREATE INDEX IF NOT EXISTS idx_to_teacher ON teacher_observations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_to_observer ON teacher_observations(observer_id);

-- 3. TEACHER STUDENT FEEDBACK (anonymous student ratings for teachers)
CREATE TABLE IF NOT EXISTS teacher_student_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category TEXT NOT NULL CHECK (category IN ('teaching_clarity', 'engagement', 'helpfulness', 'fairness', 'overall')),
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(teacher_id, student_id, category, created_at)
);

CREATE INDEX IF NOT EXISTS idx_tsf_teacher ON teacher_student_feedback(teacher_id);
CREATE INDEX IF NOT EXISTS idx_tsf_category ON teacher_student_feedback(category);

-- 4. TEACHER RETENTION PREDICTIONS
CREATE TABLE IF NOT EXISTS teacher_retention_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  retention_score DECIMAL(5,2) NOT NULL CHECK (retention_score >= 0 AND retention_score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  factors JSONB DEFAULT '[]',
  recommendation TEXT,
  predicted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trp_org ON teacher_retention_predictions(organisation_id);
CREATE INDEX IF NOT EXISTS idx_trp_teacher ON teacher_retention_predictions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_trp_risk ON teacher_retention_predictions(risk_level);

-- 5. TEACHER PERFORMANCE REVIEWS (aligned with existing staff_performance_reviews)
CREATE TABLE IF NOT EXISTS teacher_performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  review_period TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  effectiveness_score DECIMAL(5,2),
  engagement_score DECIMAL(5,2),
  student_feedback_avg DECIMAL(5,2),
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  comments TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'acknowledged')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tpr_org ON teacher_performance_reviews(organisation_id);
CREATE INDEX IF NOT EXISTS idx_tpr_teacher ON teacher_performance_reviews(teacher_id);
CREATE INDEX IF NOT EXISTS idx_tpr_status ON teacher_performance_reviews(status);

-- Insert default performance review for dev org seed data
INSERT INTO teacher_performance_metrics (organisation_id, teacher_id, metric_type, score, period, period_start, period_end)
SELECT
  '00000000-0000-0000-0000-000000000001',
  t.id,
  'composite',
  75,
  '2026-Q1',
  '2026-01-01',
  '2026-03-31'
FROM teachers t
WHERE t.organisation_id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;
