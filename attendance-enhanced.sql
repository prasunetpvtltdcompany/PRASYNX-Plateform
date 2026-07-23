-- Enhanced Attendance Management Schema
-- Extends existing attendance_records with new columns and supporting tables

-- Extend attendance_records with new columns
ALTER TABLE attendance_records
  ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS session TEXT CHECK (session IN ('morning', 'afternoon', 'evening')),
  ADD COLUMN IF NOT EXISTS check_in_time TIME,
  ADD COLUMN IF NOT EXISTS check_out_time TIME,
  ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS roll_number TEXT,
  ADD COLUMN IF NOT EXISTS admission_number TEXT,
  ADD COLUMN IF NOT EXISTS leave_reason TEXT,
  ADD COLUMN IF NOT EXISTS supporting_document TEXT,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS half_day BOOLEAN DEFAULT false;

-- Also add columns to legacy attendance table
ALTER TABLE attendance
  ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS session TEXT,
  ADD COLUMN IF NOT EXISTS check_in_time TIME,
  ADD COLUMN IF NOT EXISTS check_out_time TIME,
  ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS roll_number TEXT,
  ADD COLUMN IF NOT EXISTS admission_number TEXT,
  ADD COLUMN IF NOT EXISTS leave_reason TEXT,
  ADD COLUMN IF NOT EXISTS supporting_document TEXT,
  ADD COLUMN IF NOT EXISTS updated_by UUID,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS half_day BOOLEAN DEFAULT false;

-- Attendance Settings
CREATE TABLE IF NOT EXISTS attendance_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  academic_year TEXT,
  default_session TEXT DEFAULT 'morning',
  auto_mark_after_minutes INTEGER DEFAULT 30,
  late_threshold_minutes INTEGER DEFAULT 15,
  half_day_threshold_minutes INTEGER DEFAULT 240,
  weekly_off_days INTEGER[] DEFAULT ARRAY[0,6],
  enable_auto_attendance BOOLEAN DEFAULT false,
  enable_rfid BOOLEAN DEFAULT false,
  enable_qr BOOLEAN DEFAULT false,
  enable_biometric BOOLEAN DEFAULT false,
  enable_face_recognition BOOLEAN DEFAULT false,
  enable_sms_alerts BOOLEAN DEFAULT false,
  enable_whatsapp_alerts BOOLEAN DEFAULT false,
  enable_email_alerts BOOLEAN DEFAULT false,
  notify_parents_on_absence BOOLEAN DEFAULT true,
  notify_on_late BOOLEAN DEFAULT true,
  risk_threshold_low INTEGER DEFAULT 75,
  risk_threshold_medium INTEGER DEFAULT 60,
  risk_threshold_high INTEGER DEFAULT 40,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organisation_id, academic_year)
);

-- Attendance Automation Logs (RFID, QR, Biometric, Face Recognition)
CREATE TABLE IF NOT EXISTS attendance_automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'staff')),
  automation_type TEXT NOT NULL CHECK (automation_type IN ('rfid', 'qr', 'biometric', 'face_recognition')),
  device_id TEXT,
  direction TEXT CHECK (direction IN ('in', 'out')),
  match_score DECIMAL(5,2) CHECK (match_score >= 0 AND match_score <= 100),
  status TEXT NOT NULL CHECK (status IN ('verified', 'failed', 'timeout', 'error')),
  error_message TEXT,
  raw_data JSONB,
  verified_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Attendance Risk Flags
CREATE TABLE IF NOT EXISTS attendance_risk_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  attendance_pct DECIMAL(5,2),
  consecutive_absences INTEGER DEFAULT 0,
  total_absences INTEGER DEFAULT 0,
  dropout_probability DECIMAL(5,2),
  trend TEXT CHECK (trend IN ('improving', 'stable', 'declining')),
  flagged_at TIMESTAMPTZ DEFAULT now(),
  last_updated TIMESTAMPTZ DEFAULT now(),
  suggested_action TEXT,
  action_taken BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  UNIQUE(organisation_id, student_id)
);

-- Attendance Notifications
CREATE TABLE IF NOT EXISTS attendance_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('sms', 'whatsapp', 'email', 'push')),
  recipient TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Attendance imports log
CREATE TABLE IF NOT EXISTS attendance_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  file_name TEXT,
  file_type TEXT CHECK (file_type IN ('csv', 'excel', 'pdf', 'api')),
  total_rows INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  errors JSONB,
  imported_by UUID,
  imported_at TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON attendance_records(date);
  CREATE INDEX IF NOT EXISTS idx_attendance_records_student_date ON attendance_records(student_id, date);
  CREATE INDEX IF NOT EXISTS idx_attendance_records_class_date ON attendance_records(class_id, date);
  CREATE INDEX IF NOT EXISTS idx_attendance_records_status ON attendance_records(status);
  CREATE INDEX IF NOT EXISTS idx_attendance_automation_logs_student ON attendance_automation_logs(student_id);
  CREATE INDEX IF NOT EXISTS idx_attendance_risk_flags_level ON attendance_risk_flags(risk_level);
  CREATE INDEX IF NOT EXISTS idx_attendance_notifications_status ON attendance_notifications(status);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
