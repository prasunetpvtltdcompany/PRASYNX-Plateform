-- staff_resources table (matching the existing staff_* schema pattern)
-- The management Resources panel (checkout/return/damage tracking) depends on this table,
-- which was never created. This creates it against the real "organisations" parent
-- table used by staff_tasks / staff_attendance / etc.

CREATE TABLE IF NOT EXISTS public.staff_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  resource_type TEXT DEFAULT 'DEVICE',
  resource_name TEXT NOT NULL,
  serial_number TEXT,
  status TEXT DEFAULT 'ISSUED',
  notes TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  returned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_resources_org ON public.staff_resources(organisation_id);
CREATE INDEX IF NOT EXISTS idx_staff_resources_staff ON public.staff_resources(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_resources_status ON public.staff_resources(status);

ALTER TABLE public.staff_resources ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF to_regprocedure('public.get_user_org_id()') IS NOT NULL THEN
    DROP POLICY IF EXISTS staff_portal_org_isolation ON public.staff_resources;
    CREATE POLICY staff_portal_org_isolation ON public.staff_resources
      FOR ALL
      USING (organisation_id = public.get_user_org_id())
      WITH CHECK (organisation_id = public.get_user_org_id());
  END IF;
END $$;