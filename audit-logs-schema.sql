-- Audit Logs Extended Schema for Prasunet ERP
-- Track all system activities with advanced filtering and retention
-- Run this in Supabase SQL Editor

-- Extend the existing audit_logs table with additional indexes and views
-- Base table already exists in prasunet-schema.sql

-- Additional indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON audit_logs(organisation_id, created_at DESC);

-- Audit log retention config per organisation
CREATE TABLE IF NOT EXISTS audit_retention_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  retention_days INTEGER NOT NULL DEFAULT 365,
  max_logs INTEGER DEFAULT 100000,
  auto_archive BOOLEAN DEFAULT false,
  archive_to TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organisation_id)
);

-- Audit log archive (for rotated logs)
CREATE TABLE IF NOT EXISTS audit_log_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  severity TEXT DEFAULT 'info',
  archived_at TIMESTAMPTZ DEFAULT now(),
  original_created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_log_archive_org ON audit_log_archive(organisation_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_archive_created ON audit_log_archive(archived_at DESC);

-- Insert default retention config for dev org
INSERT INTO audit_retention_config (organisation_id, retention_days, max_logs)
VALUES ('00000000-0000-0000-0000-000000000001', 365, 100000)
ON CONFLICT (organisation_id) DO NOTHING;
