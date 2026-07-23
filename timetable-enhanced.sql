-- Timetable Management Enhanced Schema for Prasunet ERP
-- Interactive weekly schedules, conflict detection, AI generation
-- Run this in Supabase SQL Editor

-- Enhance existing timetable_entries with additional columns
ALTER TABLE timetable_entries ADD COLUMN IF NOT EXISTS period_number INTEGER;
ALTER TABLE timetable_entries ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE timetable_entries ADD COLUMN IF NOT EXISTS entry_type TEXT DEFAULT 'regular' CHECK (entry_type IN ('regular', 'lab', 'remedial', 'study', 'activity', 'assembly', 'break', 'exam'));
ALTER TABLE timetable_entries ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE timetable_entries ADD COLUMN IF NOT EXISTS substitute_teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL;
ALTER TABLE timetable_entries ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE timetable_entries ADD COLUMN IF NOT EXISTS term TEXT;
ALTER TABLE timetable_entries ADD COLUMN IF NOT EXISTS academic_year TEXT;
ALTER TABLE timetable_entries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 1. TEACHER AVAILABILITY (teacher free periods and availability)
CREATE TABLE IF NOT EXISTS teacher_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(teacher_id, day_of_week, start_time)
);

CREATE INDEX IF NOT EXISTS idx_teacher_availability_org ON teacher_availability(organisation_id);
CREATE INDEX IF NOT EXISTS idx_teacher_availability_teacher ON teacher_availability(teacher_id);

-- 2. ROOM SCHEDULE (room booking and availability tracking)
CREATE TABLE IF NOT EXISTS room_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  room TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  booked_by UUID,
  booking_type TEXT DEFAULT 'timetable' CHECK (booking_type IN ('timetable', 'event', 'meeting', 'maintenance', 'other')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room, day_of_week, start_time)
);

CREATE INDEX IF NOT EXISTS idx_room_schedules_org ON room_schedules(organisation_id);
CREATE INDEX IF NOT EXISTS idx_room_schedules_room ON room_schedules(room);

-- 3. TIMETABLE TEMPLATES (saved schedule templates for reuse)
CREATE TABLE IF NOT EXISTS timetable_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timetable_templates_org ON timetable_templates(organisation_id);

-- 4. SCHEDULE CONFLICT LOG (record of detected/modified conflicts)
CREATE TABLE IF NOT EXISTS schedule_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  conflict_type TEXT NOT NULL CHECK (conflict_type IN ('teacher', 'room', 'class', 'holiday', 'exam')),
  entry_id_a UUID REFERENCES timetable_entries(id) ON DELETE CASCADE,
  entry_id_b UUID REFERENCES timetable_entries(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schedule_conflicts_org ON schedule_conflicts(organisation_id);
CREATE INDEX IF NOT EXISTS idx_schedule_conflicts_type ON schedule_conflicts(conflict_type);

-- 5. TIMETABLE AUDIT LOG (track all timetable changes)
CREATE TABLE IF NOT EXISTS timetable_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entry_id UUID REFERENCES timetable_entries(id) ON DELETE SET NULL,
  changes JSONB DEFAULT '{}',
  performed_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timetable_audit_log_org ON timetable_audit_log(organisation_id);

-- 6. ACADEMIC CALENDAR (holidays, events, term dates)
CREATE TABLE IF NOT EXISTS academic_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('holiday', 'exam', 'event', 'term_start', 'term_end', 'holiday_start', 'holiday_end', 'meeting', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_holiday BOOLEAN DEFAULT false,
  affects_schedule BOOLEAN DEFAULT false,
  color TEXT DEFAULT '#7C3AED',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_academic_calendar_org ON academic_calendar(organisation_id);
CREATE INDEX IF NOT EXISTS idx_academic_calendar_dates ON academic_calendar(start_date, end_date);

-- Insert default academic calendar events for dev org
INSERT INTO academic_calendar (organisation_id, event_type, title, start_date, end_date, is_holiday, affects_schedule)
SELECT '00000000-0000-0000-0000-000000000001', 'term_start', 'Term 1', '2026-01-15', '2026-04-15', false, true
WHERE NOT EXISTS (SELECT 1 FROM academic_calendar WHERE organisation_id = '00000000-0000-0000-0000-000000000001' AND event_type = 'term_start');
