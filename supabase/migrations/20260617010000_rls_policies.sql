-- ═══════════════════════════════════════════════════════════════════════════
-- PRASYNX ERP – RLS Policies Migration
-- ═══════════════════════════════════════════════════════════════════════════
-- Creates row-level security policies for all tables.
-- Enables anon-key auth to replace service_role key pattern.
-- ═══════════════════════════════════════════════════════════════════════════
-- Helper: Drop existing policy if it exists
CREATE OR REPLACE FUNCTION drop_policy_if_exists(p_table TEXT, p_policy TEXT)
RETURNS VOID AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = p_table AND policyname = p_policy
  ) THEN
    EXECUTE format('DROP POLICY %I ON %I', p_policy, p_table);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- ORGANISATION-ISOLATED TABLES (have organisation_id column)
-- Policy: users can only access rows belonging to their JWT organisationId
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  tbl TEXT;
  policy_name TEXT;
  org_tables TEXT[] := ARRAY[
    'transport_routes', 'hostel_rooms', 'hostel_allocations',
    'grades', 'scholarships', 'clubs',
    'health_records', 'leave_applications',
    'documents', 'qr_sessions', 'payroll_records',
    'ledger_entries'
  ];
BEGIN
  FOREACH tbl IN ARRAY org_tables
  LOOP
    policy_name := 'org_isolation_' || tbl;
    PERFORM drop_policy_if_exists(tbl, policy_name);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL USING (
        organisation_id = (auth.jwt() ->> ''organisationId'')::UUID
      )',
      policy_name, tbl
    );
    RAISE NOTICE 'Created RLS policy % on %', policy_name, tbl;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- NOTIFICATIONS (has org_id + user_id, existing policy may differ)
-- ═══════════════════════════════════════════════════════════════════════════

SELECT drop_policy_if_exists('notifications', 'org_isolation_notifications');
CREATE POLICY org_isolation_notifications ON notifications FOR ALL USING (
  organisation_id = (auth.jwt() ->> 'organisationId')::UUID
  AND user_id = (auth.jwt() ->> 'userId')::UUID
);

-- ═══════════════════════════════════════════════════════════════════════════
-- FEE_ITEMS (no org_id — linked via fee_structure -> fee_structures -> org)
-- ═══════════════════════════════════════════════════════════════════════════

SELECT drop_policy_if_exists('fee_items', 'org_isolation_fee_items');
CREATE POLICY org_isolation_fee_items ON fee_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM fee_structures fs
    JOIN organisations o ON o.id = fs.organisation_id
    WHERE fs.id = fee_items.fee_structure_id
      AND o.id = (auth.jwt() ->> 'organisationId')::UUID
  )
);

-- ═══════════════════════════════════════════════════════════════════════════
-- CANTEEN_ORDERS (no org_id — linked via students -> classes -> org)
-- ═══════════════════════════════════════════════════════════════════════════

SELECT drop_policy_if_exists('canteen_orders', 'org_isolation_canteen_orders');
CREATE POLICY org_isolation_canteen_orders ON canteen_orders FOR ALL USING (
  EXISTS (
    SELECT 1 FROM students s
    JOIN classes c ON c.id = s.class_id
    WHERE s.id = canteen_orders.student_id
      AND c.organisation_id = (auth.jwt() ->> 'organisationId')::UUID
  )
);

-- ═══════════════════════════════════════════════════════════════════════════
-- COMPLAINTS (no org_id — linked via students -> classes -> org)
-- ═══════════════════════════════════════════════════════════════════════════

SELECT drop_policy_if_exists('complaints', 'org_isolation_complaints');
CREATE POLICY org_isolation_complaints ON complaints FOR ALL USING (
  EXISTS (
    SELECT 1 FROM students s
    JOIN classes c ON c.id = s.class_id
    WHERE s.id = complaints.student_id
      AND c.organisation_id = (auth.jwt() ->> 'organisationId')::UUID
  )
);

-- ═══════════════════════════════════════════════════════════════════════════
-- DIRECT_MESSAGES (no org_id — user-to-user, policy by sender/recipient)
-- ═══════════════════════════════════════════════════════════════════════════

SELECT drop_policy_if_exists('direct_messages', 'user_owns_direct_messages');
CREATE POLICY user_owns_direct_messages ON direct_messages FOR ALL USING (
  sender_id = (auth.jwt() ->> 'userId')::UUID
  OR recipient_id = (auth.jwt() ->> 'userId')::UUID
);

-- ═══════════════════════════════════════════════════════════════════════════
-- DROP helper function (no longer needed at runtime)
-- ═══════════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS drop_policy_if_exists(TEXT, TEXT);
