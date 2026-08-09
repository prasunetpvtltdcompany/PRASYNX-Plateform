-- ═══════════════════════════════════════════════════════════════════════════
-- PRASYNX ERP – Notifications & Communication Schema
-- Creates the notifications, communication_log, and change_events tables
-- that are referenced throughout the codebase but missing from the live DB.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── NOTIFICATIONS (in-app notification queue) ──────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT FALSE,
  reference_type TEXT,
  reference_id UUID,
  target_role TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_org ON notifications(organisation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ── COMMUNICATION LOG (sent/outgoing communications) ───────────────────────
CREATE TABLE IF NOT EXISTS communication_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  sender_type TEXT,
  sender_id UUID,
  receiver_type TEXT,
  receiver_id UUID,
  subject TEXT,
  message TEXT,
  channel TEXT,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_communication_log_org ON communication_log(organisation_id);
CREATE INDEX IF NOT EXISTS idx_communication_log_receiver ON communication_log(receiver_id);

-- ── CHANGE EVENTS (tracks all CRUD operations for real-time sync) ─────────
CREATE TABLE IF NOT EXISTS change_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id UUID,
  changed_data JSONB,
  performed_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_change_events_org ON change_events(organisation_id);
CREATE INDEX IF NOT EXISTS idx_change_events_table ON change_events(table_name);
CREATE INDEX IF NOT EXISTS idx_change_events_created ON change_events(created_at DESC);
