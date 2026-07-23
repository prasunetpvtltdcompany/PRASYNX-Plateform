-- ============================================================
-- Real-Time Sync & Notification Schema for Prasunet
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. CHANGE EVENTS (tracks all CRUD operations for real-time sync)
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

-- 2. NOTIFICATIONS (in-app notification queue)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  reference_type TEXT,
  reference_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  channel TEXT[] DEFAULT '{app}',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_org ON notifications(organisation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- 3. NOTIFICATION DELIVERY (for email/sms/whatsapp tracking)
CREATE TABLE IF NOT EXISTS notification_delivery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('app', 'email', 'sms', 'whatsapp')),
  recipient TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_delivery_status ON notification_delivery(status);

-- 4. ENABLE REALTIME FOR KEY TABLES
-- Run these in Supabase Dashboard: Go to Database > Replication and enable for:
-- change_events, notifications, classes, subjects, timetable_entries,
-- attendance_records, exam_results, assignments, assignment_submissions

-- Helper function: Create notification for all users with a given role in an org
CREATE OR REPLACE FUNCTION notify_role(
  p_org_id UUID,
  p_role TEXT,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_ref_type TEXT DEFAULT NULL,
  p_ref_id UUID DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO notifications (organisation_id, user_id, title, message, type, reference_type, reference_id)
  SELECT p_org_id, id, p_title, p_message, p_type, p_ref_type, p_ref_id
  FROM users
  WHERE organisation_id = p_org_id AND role = p_role AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Helper function: Create notification for a single user
CREATE OR REPLACE FUNCTION notify_user(
  p_user_id UUID,
  p_org_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_ref_type TEXT DEFAULT NULL,
  p_ref_id UUID DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO notifications (organisation_id, user_id, title, message, type, reference_type, reference_id)
  VALUES (p_org_id, p_user_id, p_title, p_message, p_type, p_ref_type, p_ref_id);
END;
$$ LANGUAGE plpgsql;
