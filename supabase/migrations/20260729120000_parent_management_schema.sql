-- Parent Management canonical schema.
-- Safe to run on existing projects: it creates missing tables and preserves
-- existing parent profiles and links.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL DEFAULT 'Parent',
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS generated_password TEXT;

ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE;
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.parents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS uq_parents_user_id
  ON public.parents(user_id)
  WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_parents_organisation_id
  ON public.parents(organisation_id);
CREATE INDEX IF NOT EXISTS idx_parents_organisation_email
  ON public.parents(organisation_id, email);

CREATE TABLE IF NOT EXISTS public.parent_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL DEFAULT 'guardian',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_parent_student_links_parent_student UNIQUE(parent_id, student_id)
);

ALTER TABLE public.parent_student_links ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE;
ALTER TABLE public.parent_student_links ADD COLUMN IF NOT EXISTS relationship TEXT DEFAULT 'guardian';
ALTER TABLE public.parent_student_links ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.parent_student_links ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS uq_parent_student_links_parent_student
  ON public.parent_student_links(parent_id, student_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_links_organisation_parent
  ON public.parent_student_links(organisation_id, parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_links_organisation_student
  ON public.parent_student_links(organisation_id, student_id);

-- Create missing profile rows for parent accounts already stored in users.
INSERT INTO public.parents (organisation_id, user_id, full_name, email, status)
SELECT u.organisation_id, u.id, COALESCE(u.full_name, 'Parent'), u.email, COALESCE(u.status, 'active')
FROM public.users u
WHERE u.role = 'parent'
  AND u.organisation_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.parents p WHERE p.user_id = u.id
  );

-- Complete organisation IDs for old links using their linked student.
UPDATE public.parent_student_links psl
SET organisation_id = s.organisation_id
FROM public.students s
WHERE psl.student_id = s.id
  AND psl.organisation_id IS NULL;

ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF to_regprocedure('public.get_user_org_id()') IS NOT NULL THEN
    DROP POLICY IF EXISTS org_isolation ON public.parents;
    CREATE POLICY org_isolation ON public.parents
      FOR ALL USING (organisation_id = public.get_user_org_id())
      WITH CHECK (organisation_id = public.get_user_org_id());

    DROP POLICY IF EXISTS org_isolation ON public.parent_student_links;
    CREATE POLICY org_isolation ON public.parent_student_links
      FOR ALL USING (organisation_id = public.get_user_org_id())
      WITH CHECK (organisation_id = public.get_user_org_id());
  END IF;
END $$;
