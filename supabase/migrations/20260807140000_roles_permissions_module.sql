-- roles / permissions / role_permissions / role_audit_logs
-- The Access Control (RolesManagement) module and legacy management.ts query these tables.
-- They were never created, causing "relation does not exist" DB errors on create role.

CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_org_name ON public.roles(organisation_id, name);
CREATE INDEX IF NOT EXISTS idx_roles_org ON public.roles(organisation_id);

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  action TEXT DEFAULT 'access',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_permissions_org_key ON public.permissions(organisation_id, key);
CREATE INDEX IF NOT EXISTS idx_permissions_org_module ON public.permissions(organisation_id, module);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_role_permissions_unique ON public.role_permissions(role_id, permission_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_perm ON public.role_permissions(permission_id);

CREATE TABLE IF NOT EXISTS public.role_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_role_audit_logs_org ON public.role_audit_logs(organisation_id);
CREATE INDEX IF NOT EXISTS idx_role_audit_logs_user ON public.role_audit_logs(user_id);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  IF to_regprocedure('public.get_user_org_id()') IS NOT NULL THEN
    FOREACH t IN ARRAY ARRAY['roles','permissions','role_permissions','role_audit_logs'] LOOP
      EXECUTE format('DROP POLICY IF EXISTS org_isolation ON public.%I', t);
      EXECUTE format('CREATE POLICY org_isolation ON public.%I FOR ALL USING (organisation_id = public.get_user_org_id()) WITH CHECK (organisation_id = public.get_user_org_id())', t);
    END LOOP;
  END IF;
END $$;

-- Seed default permission catalog for every existing organisation.
INSERT INTO public.permissions (organisation_id, module, key, name, action, description)
SELECT o.id, p.module, p.key, p.name, p.action, p.description
FROM public.organisations o
CROSS JOIN (VALUES
  ('dashboard','dashboard.view','View Dashboard','access','View the portal dashboard'),
  ('academics','academics.view','View Academics','access','Access academics module'),
  ('attendance','attendance.view','View Attendance','access','View attendance records'),
  ('attendance','attendance.mark','Mark Attendance','create','Mark attendance'),
  ('homework','homework.view','View Homework','access','View homework'),
  ('classes','classes.view','View Classes','access','View classes'),
  ('subjects','subjects.view','View Subjects','access','View subjects'),
  ('marks','marks.view','View Marks','access','View marks'),
  ('evaluation','evaluation.view','View Evaluations','access','View evaluations'),
  ('fees','fees.view','View Fees','access','View fees'),
  ('fees','fees.collect','Collect Fees','create','Collect fee payments'),
  ('payroll','payroll.view','View Payroll','access','View payroll'),
  ('payroll','payroll.run','Run Payroll','create','Run payroll'),
  ('transport','transport.view','View Transport','access','View transport module'),
  ('library','library.view','View Library','access','View library'),
  ('inventory','inventory.view','View Inventory','access','View inventory'),
  ('medical','medical.view','View Medical','access','View medical module'),
  ('sports','sports.view','View Sports','access','View sports module'),
  ('security','security.view','View Security','access','View security module'),
  ('workforce','workforce.view','View Workforce','access','View workforce/staff module'),
  ('staff','staff.view','View Staff','access','View staff module'),
  ('portal','portal.access','Portal Access','access','Sign in to the portal'),
  ('communication','communication.view','View Communications','access','View communications'),
  ('timetable','timetable.view','View Timetable','access','View timetable module'),
  ('leave','leave.view','View Leave','access','View leave module'),
  ('record','record.view','View Records','access','View records module'),
  ('general','general.access','General Access','access','General module access')
) AS p(module, key, name, action, description)
ON CONFLICT (organisation_id, key) DO NOTHING;