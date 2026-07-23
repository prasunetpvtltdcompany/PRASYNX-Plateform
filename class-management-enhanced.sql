-- Class Management Enhanced Schema for Prasunet ERP
-- Premium class management with sections, rooms, teachers, student mapping
-- Run this in Supabase SQL Editor

-- 1. CLASS STUDENT MAP (bridge table for student-class assignment)
CREATE TABLE IF NOT EXISTS class_student_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'transferred', 'graduated', 'dropped')),
  UNIQUE(class_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_class_student_map_class ON class_student_map(class_id);
CREATE INDEX IF NOT EXISTS idx_class_student_map_student ON class_student_map(student_id);

-- 2. CLASS TEACHERS (primary and assistant teachers per class/section)
CREATE TABLE IF NOT EXISTS class_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('class_teacher', 'assistant_teacher', 'subject_teacher')),
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(class_id, teacher_id, role)
);

CREATE INDEX IF NOT EXISTS idx_class_teachers_class ON class_teachers(class_id);
CREATE INDEX IF NOT EXISTS idx_class_teachers_teacher ON class_teachers(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_teachers_role ON class_teachers(role);

-- 3. CLASS ROOMS (room allocation and capacity management)
CREATE TABLE IF NOT EXISTS class_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  building TEXT,
  floor INTEGER,
  capacity INTEGER DEFAULT 30,
  facilities JSONB DEFAULT '[]',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(class_id, room_number)
);

CREATE INDEX IF NOT EXISTS idx_class_rooms_class ON class_rooms(class_id);
CREATE INDEX IF NOT EXISTS idx_class_rooms_building ON class_rooms(building);

-- 4. CLASS ATTENDANCE SNAPSHOTS (aggregated daily attendance per class)
CREATE TABLE IF NOT EXISTS class_attendance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_students INTEGER NOT NULL DEFAULT 0,
  present_count INTEGER NOT NULL DEFAULT 0,
  absent_count INTEGER NOT NULL DEFAULT 0,
  late_count INTEGER DEFAULT 0,
  excused_count INTEGER DEFAULT 0,
  attendance_pct DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(class_id, date)
);

CREATE INDEX IF NOT EXISTS idx_class_attendance_snapshots_class ON class_attendance_snapshots(class_id);
CREATE INDEX IF NOT EXISTS idx_class_attendance_snapshots_date ON class_attendance_snapshots(date DESC);

-- 5. CLASS PERFORMANCE SNAPSHOTS (aggregated performance metrics per class)
CREATE TABLE IF NOT EXISTS class_performance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  total_students INTEGER DEFAULT 0,
  avg_score DECIMAL(5,2),
  pass_rate DECIMAL(5,2),
  highest_score DECIMAL(5,2),
  lowest_score DECIMAL(5,2),
  grade_distribution JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(class_id, term, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_class_performance_snapshots_class ON class_performance_snapshots(class_id);

-- Add room_number column to classes if not exists
ALTER TABLE classes ADD COLUMN IF NOT EXISTS room_number TEXT;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS attendance_pct DECIMAL(5,2) DEFAULT 0;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS performance_pct DECIMAL(5,2) DEFAULT 0;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS academic_year TEXT;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS class_teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS assistant_teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS student_count INTEGER DEFAULT 0;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Insert default class rooms for dev org
INSERT INTO class_rooms (organisation_id, class_id, room_number, building, floor, capacity, is_primary)
SELECT '00000000-0000-0000-0000-000000000001', id, 'RM-' || substr(md5(random()::text), 1, 4), 'Main Building', 1, capacity, true
FROM classes WHERE organisation_id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT (class_id, room_number) DO NOTHING;
