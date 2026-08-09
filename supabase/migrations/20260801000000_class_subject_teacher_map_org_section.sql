-- Apply to LIVE project: gmqsgbrfnuwgnbutdizg (Supabase SQL Editor)
-- Matches the intended schema from production_hardening + class_hierarchy migrations.

-- 1. organisation_id (FK + backfill from classes + NOT NULL)
ALTER TABLE IF EXISTS public.class_subject_teacher_map
  ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE;

UPDATE public.class_subject_teacher_map cstm
  SET organisation_id = c.organisation_id
  FROM public.classes c
  WHERE c.id = cstm.class_id AND cstm.organisation_id IS NULL;

ALTER TABLE IF EXISTS public.class_subject_teacher_map
  ALTER COLUMN organisation_id SET NOT NULL;

-- 2. section_id (FK, nullable)
ALTER TABLE IF EXISTS public.class_subject_teacher_map
  ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL;

-- 3. Indexes (as in production_hardening)
CREATE INDEX IF NOT EXISTS idx_cstm_org_teacher ON public.class_subject_teacher_map(organisation_id, teacher_id);
CREATE INDEX IF NOT EXISTS idx_cstm_org_class ON public.class_subject_teacher_map(organisation_id, class_id);

-- 4. RLS: get_user_org_id() helper + org_isolation policy
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT organisation_id FROM public.users WHERE id = auth.uid();
$$;

ALTER TABLE IF EXISTS public.class_subject_teacher_map ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS org_isolation ON public.class_subject_teacher_map;
  CREATE POLICY org_isolation ON public.class_subject_teacher_map
    FOR ALL USING (organisation_id = public.get_user_org_id());
END $$;
