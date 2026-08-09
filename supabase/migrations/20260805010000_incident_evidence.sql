-- ============================================================================
-- DISCIPLINE — INCIDENT EVIDENCE IMAGE
-- ============================================================================
-- Adds an evidence image URL to incidents and creates a private storage bucket
-- for uploaded evidence photos (max 2 MB enforced by the API layer).
-- Idempotent + missing-table-safe.
-- ============================================================================

ALTER TABLE public.behavioral_incidents
  ADD COLUMN IF NOT EXISTS evidence_url TEXT;

-- Create a public storage bucket for incident evidence if it does not exist.
-- Public so uploaded evidence renders directly in the management dashboard.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'incident-evidence',
  'incident-evidence',
  true,
  2097152,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;
