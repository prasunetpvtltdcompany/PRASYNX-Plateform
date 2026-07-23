-- Risk Detection & Early Warning System Schema for Prasunet ERP
-- Run this in Supabase SQL Editor

-- 1. RISK ASSESSMENTS (stores computed risk scores per student over time)
CREATE TABLE IF NOT EXISTS risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  risk_score DECIMAL(5,2) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('attendance', 'academic', 'behavioral', 'composite', 'dropout')),
  factors JSONB DEFAULT '[]',
  attendance_pct DECIMAL(5,2),
  avg_grade DECIMAL(5,2),
  behavioral_incidents INTEGER DEFAULT 0,
  recommendation TEXT,
  assessed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_org ON risk_assessments(organisation_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_student ON risk_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_level ON risk_assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_type ON risk_assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_assessed ON risk_assessments(assessed_at DESC);

-- 2. RISK ALERTS (triggered warnings sent to staff/parents)
CREATE TABLE IF NOT EXISTS risk_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('attendance_drop', 'grade_decline', 'behavioral', 'dropout_risk', 'composite')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  risk_score DECIMAL(5,2),
  factors JSONB DEFAULT '[]',
  suggested_action TEXT,
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_risk_alerts_org ON risk_alerts(organisation_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_student ON risk_alerts(student_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_severity ON risk_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_unresolved ON risk_alerts(is_resolved) WHERE is_resolved = false;
CREATE INDEX IF NOT EXISTS idx_risk_alerts_created ON risk_alerts(created_at DESC);

-- 3. RISK THRESHOLDS (configurable per organisation)
CREATE TABLE IF NOT EXISTS risk_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  threshold_type TEXT NOT NULL CHECK (threshold_type IN ('attendance', 'academic', 'behavioral', 'composite')),
  low_risk_max DECIMAL(5,2) NOT NULL DEFAULT 30,
  medium_risk_max DECIMAL(5,2) NOT NULL DEFAULT 60,
  high_risk_max DECIMAL(5,2) NOT NULL DEFAULT 80,
  critical_risk_min DECIMAL(5,2) NOT NULL DEFAULT 80,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organisation_id, threshold_type)
);

-- Insert default risk thresholds for dev org
INSERT INTO risk_thresholds (organisation_id, threshold_type, low_risk_max, medium_risk_max, high_risk_max, critical_risk_min)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'attendance', 30, 60, 80, 80),
  ('00000000-0000-0000-0000-000000000001', 'academic', 30, 60, 80, 80),
  ('00000000-0000-0000-0000-000000000001', 'behavioral', 30, 60, 80, 80),
  ('00000000-0000-0000-0000-000000000001', 'composite', 30, 60, 80, 80)
ON CONFLICT (organisation_id, threshold_type) DO NOTHING;
