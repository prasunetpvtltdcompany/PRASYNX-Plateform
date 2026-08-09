-- ============================================================================
-- STAFF EXPENSES MODULE — staff-management Expenses tab (DB-backed)
-- ============================================================================
-- Creates the `org_expenses` table used by the Staff Management Expenses tab
-- with org-scoped RLS, indexes, and audit metadata. Idempotent.
-- NOTE: Run after the payroll module (staff_records) exists.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. org_expenses — the table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.org_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.staff_records(id) ON DELETE SET NULL, -- optional: focus on a staff member/department
  category TEXT DEFAULT 'Operations',  -- Operations | Transport | Supplies | Utilities | Maintenance | Welfare
  item TEXT NOT NULL DEFAULT '',
  amount NUMERIC(12,2) DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending',       -- pending | approved | rejected
  notes TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_expenses_org ON public.org_expenses(organisation_id);
CREATE INDEX IF NOT EXISTS idx_org_expenses_staff ON public.org_expenses(staff_id);
CREATE INDEX IF NOT EXISTS idx_org_expenses_category ON public.org_expenses(category);
CREATE INDEX IF NOT EXISTS idx_org_expenses_status ON public.org_expenses(status);
CREATE INDEX IF NOT EXISTS idx_org_expenses_date ON public.org_expenses(date DESC);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.fn_org_expenses_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_org_expenses_set_updated_at ON public.org_expenses;
CREATE TRIGGER trg_org_expenses_set_updated_at
  BEFORE UPDATE ON public.org_expenses
  FOR EACH ROW EXECUTE FUNCTION public.fn_org_expenses_set_updated_at();

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY — org-scoped
-- ----------------------------------------------------------------------------
ALTER TABLE public.org_expenses ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.fn_org_expenses_org_scope()
RETURNS UUID AS $$
  SELECT organisation_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

DROP POLICY IF EXISTS "Org expense org-scoped" ON public.org_expenses;
CREATE POLICY "Org expense org-scoped"
  ON public.org_expenses FOR ALL
  USING (organisation_id = public.fn_org_expenses_org_scope())
  WITH CHECK (organisation_id = public.fn_org_expenses_org_scope());

COMMENT ON TABLE public.org_expenses IS
  'Organisation/departmental expenses for Staff Management Expenses tab (DB-backed, no dummy data).';