-- Promotion Module: Promotion History
-- Self-contained, idempotent migration for the Promotion Management module.
-- Ensures the promotion_history table exists and matches the backend contract
-- (see prasynx-management-backend/src/services/promotion.service.ts).

-- ============================================================
-- 0. ACADEMIC YEARS (dependency — promotion history links to it)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organisation_id, name)
);

-- ============================================================
-- 1. PROMOTION HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.promotion_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  from_class_id UUID NOT NULL REFERENCES classes(id),
  from_section_id UUID REFERENCES sections(id),
  to_class_id UUID NOT NULL REFERENCES classes(id),
  to_section_id UUID REFERENCES sections(id),
  academic_year_id UUID REFERENCES academic_years(id),
  academic_year TEXT,
  promoted_by UUID REFERENCES users(id),
  remarks TEXT,
  promoted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Normalize org relationship & set RLS.
-- Drop any existing RLS policy first: Postgres refuses to change the type of a
-- column that a policy definition depends on.
DROP POLICY IF EXISTS org_isolation ON public.promotion_history;
ALTER TABLE IF EXISTS public.promotion_history
  ALTER COLUMN organisation_id TYPE UUID USING organisation_id::uuid;
ALTER TABLE IF EXISTS public.promotion_history
  ALTER COLUMN organisation_id SET NOT NULL;

ALTER TABLE IF EXISTS public.promotion_history ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. ENFORCE REGULAR RLS ORG ISOLATION POLICY (title-safe)
-- ============================================================
DO $$
DECLARE pol TEXT;
BEGIN
  SELECT policyname INTO pol FROM pg_policies
    WHERE tablename = 'promotion_history' LIMIT 1;
  IF pol IS NULL THEN
    EXECUTE 'CREATE POLICY org_isolation ON public.promotion_history
      FOR ALL USING (organisation_id = public.get_user_org_id())';
  END IF;
END $$;

-- ============================================================
-- 3. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_promotion_history_org ON public.promotion_history(organisation_id);
CREATE INDEX IF NOT EXISTS idx_promotion_history_student ON public.promotion_history(student_id);
CREATE INDEX IF NOT EXISTS idx_promotion_history_from_class ON public.promotion_history(from_class_id);
CREATE INDEX IF NOT EXISTS idx_promotion_history_to_class ON public.promotion_history(to_class_id);
CREATE INDEX IF NOT EXISTS idx_promotion_history_academic_year ON public.promotion_history(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_promotion_history_promoted_at ON public.promotion_history(promoted_at DESC);

-- Human-readable academic year label (e.g. "2026-27") so promotions always show
-- a year even when no academic_years row exists.
ALTER TABLE public.promotion_history ADD COLUMN IF NOT EXISTS academic_year TEXT;

-- Unique guard: a student can only be promoted ONCE per academic year.
-- Nullable academic_year_id means Postgres treats NULLs as distinct, so use a
-- partial unique index scoped to non-null years only.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'uq_promotion_history_student_year'
  ) THEN
    CREATE UNIQUE INDEX uq_promotion_history_student_year
      ON public.promotion_history(student_id, academic_year_id)
      WHERE academic_year_id IS NOT NULL;
  END IF;
END $$;

-- ============================================================
-- 4. TRIGGER: updated_at maintenance
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_promotion_history_updated_at') THEN
    CREATE TRIGGER set_promotion_history_updated_at
      BEFORE UPDATE ON public.promotion_history
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

COMMENT ON TABLE public.promotion_history IS
  'Tracks every student class promotion (from_class -> to_class) per academic year.';