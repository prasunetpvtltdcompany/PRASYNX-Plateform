-- organisation_portals: the portals a school is allowed to use.
-- PRASYNX (company admin) grants/revokes these per organisation. A domain user
-- can only sign in to a portal their school has been granted.
CREATE TABLE IF NOT EXISTS public.organisation_portals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  portal TEXT NOT NULL CHECK (portal IN ('management', 'staff', 'student', 'parent')),
  granted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (organisation_id, portal)
);

CREATE INDEX IF NOT EXISTS idx_organisation_portals_org ON public.organisation_portals(organisation_id);

ALTER TABLE public.organisation_portals ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  IF to_regprocedure('public.get_user_org_id()') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS org_isolation ON public.organisation_portals';
    EXECUTE E'CREATE POLICY org_isolation ON public.organisation_portals FOR ALL USING (organisation_id = public.get_user_org_id()) WITH CHECK (organisation_id = public.get_user_org_id())';
  END IF;
END $$;

-- Every existing school already has a management account (created at
-- registration). Keep those sign-ins working by granting the management portal.
INSERT INTO public.organisation_portals (organisation_id, portal)
SELECT o.id, 'management'
FROM public.organisations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.organisation_portals p WHERE p.organisation_id = o.id AND p.portal = 'management'
);