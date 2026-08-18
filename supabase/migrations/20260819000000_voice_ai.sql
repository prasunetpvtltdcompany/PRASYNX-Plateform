-- Prasunet AI Voice Assistant - Database Schema
-- Ported from prasynx-voiceai-backend/schema.sql

-- ==================== VOICE CALLS ====================
CREATE TABLE IF NOT EXISTS voice_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_phone VARCHAR(20) NOT NULL,
  caller_name VARCHAR(255),
  caller_role VARCHAR(50) DEFAULT 'unknown',
  status VARCHAR(20) DEFAULT 'incoming' CHECK (status IN ('incoming', 'active', 'completed', 'missed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_secs INTEGER,
  transcript TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_calls_status ON voice_calls(status);
CREATE INDEX IF NOT EXISTS idx_voice_calls_created ON voice_calls(created_at DESC);

-- ==================== VOICE COMPLAINTS ====================
CREATE TABLE IF NOT EXISTS voice_complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id VARCHAR(50) UNIQUE NOT NULL,
  caller_id UUID,
  caller_name VARCHAR(255) NOT NULL,
  caller_role VARCHAR(50) NOT NULL,
  caller_phone VARCHAR(20),
  student_name VARCHAR(255),
  student_id VARCHAR(50),
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_complaints_id ON voice_complaints(complaint_id);
CREATE INDEX IF NOT EXISTS idx_voice_complaints_status ON voice_complaints(status);
CREATE INDEX IF NOT EXISTS idx_voice_complaints_created ON voice_complaints(created_at DESC);

-- ==================== VOICE APPOINTMENTS ====================
CREATE TABLE IF NOT EXISTS voice_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id UUID,
  caller_name VARCHAR(255) NOT NULL,
  caller_role VARCHAR(50) NOT NULL,
  with_person VARCHAR(255) NOT NULL,
  with_role VARCHAR(100) NOT NULL,
  purpose TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_appointments_date ON voice_appointments(date);
CREATE INDEX IF NOT EXISTS idx_voice_appointments_status ON voice_appointments(status);

-- ==================== VOICE TICKETS ====================
CREATE TABLE IF NOT EXISTS voice_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id VARCHAR(50) UNIQUE NOT NULL,
  caller_id UUID,
  caller_name VARCHAR(255) NOT NULL,
  caller_role VARCHAR(50) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_department VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_tickets_id ON voice_tickets(ticket_id);
CREATE INDEX IF NOT EXISTS idx_voice_tickets_status ON voice_tickets(status);

-- ==================== VOICE TRANSCRIPTS ====================
CREATE TABLE IF NOT EXISTS voice_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES voice_calls(id) ON DELETE CASCADE,
  caller_id UUID,
  caller_name VARCHAR(255) NOT NULL,
  caller_role VARCHAR(50) NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_transcripts_call ON voice_transcripts(call_id);

-- ==================== VOICE NOTIFICATIONS ====================
CREATE TABLE IF NOT EXISTS voice_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID,
  recipient_phone VARCHAR(20),
  recipient_email VARCHAR(255),
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('sms', 'email', 'whatsapp', 'app')),
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_voice_notifications_status ON voice_notifications(status);

-- ==================== VOICE JOBS ====================
CREATE TABLE IF NOT EXISTS voice_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID,
  provider_name VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('full-time', 'part-time', 'internship', 'contract')),
  location VARCHAR(255) NOT NULL,
  salary_range VARCHAR(100),
  skills TEXT[] NOT NULL DEFAULT '{}',
  target_audience VARCHAR(20)[] NOT NULL DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'filled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_jobs_type ON voice_jobs(type);
CREATE INDEX IF NOT EXISTS idx_voice_jobs_status ON voice_jobs(status);
CREATE INDEX IF NOT EXISTS idx_voice_jobs_created ON voice_jobs(created_at DESC);