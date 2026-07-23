-- Institution Intelligence & Benchmarking Schema for Prasunet ERP
-- Run this in Supabase SQL Editor

-- 1. INSTITUTION METRICS SNAPSHOTS (periodic snapshots of key metrics per org)
CREATE TABLE IF NOT EXISTS institution_metrics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  period TEXT NOT NULL,
  total_students INTEGER DEFAULT 0,
  total_teachers INTEGER DEFAULT 0,
  total_staff INTEGER DEFAULT 0,
  total_classes INTEGER DEFAULT 0,
  avg_class_size DECIMAL(5,2) DEFAULT 0,
  student_teacher_ratio DECIMAL(5,2) DEFAULT 0,
  avg_attendance_pct DECIMAL(5,2) DEFAULT 0,
  avg_grade_score DECIMAL(5,2) DEFAULT 0,
  pass_rate DECIMAL(5,2) DEFAULT 0,
  fee_collection_rate DECIMAL(5,2) DEFAULT 0,
  total_fees_collected DECIMAL(12,2) DEFAULT 0,
  active_alumni_count INTEGER DEFAULT 0,
  library_books_per_student DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organisation_id, period)
);

CREATE INDEX IF NOT EXISTS idx_ims_org ON institution_metrics_snapshots(organisation_id);
CREATE INDEX IF NOT EXISTS idx_ims_period ON institution_metrics_snapshots(period);

-- 2. INSTITUTION BENCHMARKS (computed comparisons against peer groups)
CREATE TABLE IF NOT EXISTS institution_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  benchmark_date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('academic', 'operational', 'financial', 'engagement', 'composite')),
  metric_name TEXT NOT NULL,
  org_value DECIMAL(10,2) NOT NULL,
  peer_avg DECIMAL(10,2) NOT NULL,
  peer_p25 DECIMAL(10,2),
  peer_p75 DECIMAL(10,2),
  percentile_rank INTEGER CHECK (percentile_rank >= 0 AND percentile_rank <= 100),
  score DECIMAL(5,2) CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ib_org ON institution_benchmarks(organisation_id);
CREATE INDEX IF NOT EXISTS idx_ib_category ON institution_benchmarks(category);
CREATE INDEX IF NOT EXISTS idx_ib_date ON institution_benchmarks(benchmark_date);

-- 3. INSTITUTION TRENDS (month-over-month metric tracking)
CREATE TABLE IF NOT EXISTS institution_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(12,2) NOT NULL,
  recorded_at DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organisation_id, metric_name, recorded_at)
);

CREATE INDEX IF NOT EXISTS idx_it_org ON institution_trends(organisation_id);
CREATE INDEX IF NOT EXISTS idx_it_metric ON institution_trends(metric_name);
CREATE INDEX IF NOT EXISTS idx_it_date ON institution_trends(recorded_at);

-- 4. PEER GROUPS (group similar institutions for benchmarking)
CREATE TABLE IF NOT EXISTS peer_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS peer_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  peer_group_id UUID NOT NULL REFERENCES peer_groups(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(peer_group_id, organisation_id)
);

-- Insert default peer groups
INSERT INTO peer_groups (name, description, criteria)
VALUES
  ('All Schools', 'All active institutions on the platform', '{"status": "active"}'),
  ('Small Schools (<500)', 'Institutions with fewer than 500 students', '{"max_students": 500}'),
  ('Medium Schools (500-2000)', 'Institutions with 500-2000 students', '{"min_students": 500, "max_students": 2000}'),
  ('Large Schools (>2000)', 'Institutions with more than 2000 students', '{"min_students": 2000}')
ON CONFLICT DO NOTHING;
