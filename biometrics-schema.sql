-- Biometrics Module Schema for Prasunet ERP
-- Biometric device management and integration
-- Run this in Supabase SQL Editor

-- 1. BIOMETRIC DEVICES (fingerprint scanners, face recognition cameras, iris scanners)
CREATE TABLE IF NOT EXISTS biometric_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('fingerprint', 'face_recognition', 'iris', 'palm', 'voice', 'multi')),
  model TEXT,
  serial_number TEXT,
  location TEXT,
  ip_address TEXT,
  port INTEGER,
  api_endpoint TEXT,
  api_key TEXT,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'maintenance', 'offline')),
  last_sync_at TIMESTAMPTZ,
  firmware_version TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_biometric_devices_org ON biometric_devices(organisation_id);
CREATE INDEX IF NOT EXISTS idx_biometric_devices_type ON biometric_devices(device_type);
CREATE INDEX IF NOT EXISTS idx_biometric_devices_status ON biometric_devices(status);

-- 2. BIOMETRIC TEMPLATES (stored biometric data for users)
CREATE TABLE IF NOT EXISTS biometric_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'staff', 'parent')),
  device_id UUID REFERENCES biometric_devices(id) ON DELETE SET NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('fingerprint', 'face', 'iris', 'palm', 'voice')),
  template_data TEXT NOT NULL,
  template_hash TEXT,
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  is_active BOOLEAN DEFAULT true,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  last_verified_at TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organisation_id, user_id, user_type, template_type)
);

CREATE INDEX IF NOT EXISTS idx_biometric_templates_org ON biometric_templates(organisation_id);
CREATE INDEX IF NOT EXISTS idx_biometric_templates_user ON biometric_templates(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_biometric_templates_type ON biometric_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_biometric_templates_active ON biometric_templates(is_active) WHERE is_active = true;

-- 3. BIOMETRIC ATTENDANCE LOGS
CREATE TABLE IF NOT EXISTS biometric_attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  device_id UUID REFERENCES biometric_devices(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'staff', 'parent')),
  template_id UUID REFERENCES biometric_templates(id) ON DELETE SET NULL,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('fingerprint', 'face', 'iris', 'palm', 'voice', 'multi')),
  match_score DECIMAL(5,2) CHECK (match_score >= 0 AND match_score <= 100),
  status TEXT NOT NULL CHECK (status IN ('verified', 'failed', 'timeout', 'error')),
  error_message TEXT,
  direction TEXT CHECK (direction IN ('in', 'out')),
  verified_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_biometric_attendance_logs_org ON biometric_attendance_logs(organisation_id);
CREATE INDEX IF NOT EXISTS idx_biometric_attendance_logs_user ON biometric_attendance_logs(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_biometric_attendance_logs_device ON biometric_attendance_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_biometric_attendance_logs_verified ON biometric_attendance_logs(verified_at DESC);
CREATE INDEX IF NOT EXISTS idx_biometric_attendance_logs_status ON biometric_attendance_logs(status);

-- 4. BIOMETRIC DEVICE ASSIGNMENTS (device-to-location mappings)
CREATE TABLE IF NOT EXISTS biometric_device_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES biometric_devices(id) ON DELETE CASCADE,
  location_type TEXT NOT NULL CHECK (location_type IN ('entrance', 'classroom', 'library', 'lab', 'hostel', 'office', 'other')),
  location_id UUID,
  location_name TEXT,
  is_primary BOOLEAN DEFAULT false,
  schedule JSONB DEFAULT '{}',
  assigned_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(device_id, location_type, location_id)
);

CREATE INDEX IF NOT EXISTS idx_biometric_device_assignments_org ON biometric_device_assignments(organisation_id);
CREATE INDEX IF NOT EXISTS idx_biometric_device_assignments_device ON biometric_device_assignments(device_id);
CREATE INDEX IF NOT EXISTS idx_biometric_device_assignments_location ON biometric_device_assignments(location_type, location_id);
