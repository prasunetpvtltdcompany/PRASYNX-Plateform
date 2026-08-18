-- platform_schema_consolidation: fixes gaps found by auditing every .sql file in the
-- repo root vs the LIVE database. The live schema follows the supabase/migrations
-- lineage; these root files were legacy / never applied / superseded. This migration
-- only makes safe, additive changes that match what the running platform actually uses.

-- ============================================================================
-- 1. credential_history
--    Referenced heavily by server/src/admin (credentialStore.ts, analytics.service.ts,
--    auth.service.ts) and the admin-panel "Credential History" tab, but the table
--    does not exist in the live database. Columns match credentialStore.logCredential().
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.credential_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  organisation_name TEXT,
  full_name TEXT,
  email TEXT,
  role TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credential_history_org ON public.credential_history(organisation_id);
CREATE INDEX IF NOT EXISTS idx_credential_history_created ON public.credential_history(created_at DESC);

ALTER TABLE public.credential_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF to_regprocedure('public.get_user_org_id()') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS org_isolation ON public.credential_history';
    EXECUTE E'CREATE POLICY org_isolation ON public.credential_history FOR ALL USING (organisation_id = public.get_user_org_id()) WITH CHECK (organisation_id = public.get_user_org_id())';
  END IF;
END $$;

-- ============================================================================
-- 2. organisations.code
--    prasunet-unique-identifiers.sql intended a human-friendly code but it was
--    never added to the live table. Add + backfill + unique partial index.
-- ============================================================================
ALTER TABLE public.organisations ADD COLUMN IF NOT EXISTS code TEXT;

UPDATE public.organisations
SET code = 'ORG-' || UPPER(SUBSTRING(REPLACE(id::text, '-', ''), 1, 8))
WHERE code IS NULL;

DROP INDEX IF EXISTS idx_organisations_code;
CREATE UNIQUE INDEX idx_organisations_code ON public.organisations(code) WHERE code IS NOT NULL;

-- ============================================================================
-- 3. Org-scoped performance indexes on hot multi-tenant tables.
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_org_role ON public.users(organisation_id, role);
CREATE INDEX IF NOT EXISTS idx_students_org ON public.students(organisation_id);
CREATE INDEX IF NOT EXISTS idx_parents_org ON public.parents(organisation_id);
CREATE INDEX IF NOT EXISTS idx_staff_records_org ON public.staff_records(organisation_id);
CREATE INDEX IF NOT EXISTS idx_classes_org ON public.classes(organisation_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_org_date ON public.attendance_records(organisation_id, date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON public.audit_logs(organisation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_class_student_map_org ON public.class_student_map(organisation_id);
CREATE INDEX IF NOT EXISTS idx_organisation_portals_org ON public.organisation_portals(organisation_id);

-- ============================================================================
-- 4. Missing FKs: organisation_id columns that exist but never got the constraint.
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'promotion_history_organisation_id_fkey') THEN
    ALTER TABLE public.promotion_history
      ADD CONSTRAINT promotion_history_organisation_id_fkey
      FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'communication_log_organisation_id_fkey') THEN
    ALTER TABLE public.communication_log
      ADD CONSTRAINT communication_log_organisation_id_fkey
      FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE CASCADE;
  END IF;
END $$;
