-- ============================================================================
-- TRANSPORT MODULE — Schema Alignment
-- ============================================================================
-- The transport service and management UI rely on columns that were never
-- added to the base tables, plus a `transport_expenses` table that did not
-- exist. This migration:
--   1. Adds missing columns to transport_routes / transport_vehicles / transport_assignments
--   2. Creates transport_expenses
--   3. Adds org-scoped RLS + indexes for all four tables
-- Idempotent + missing-table/column-safe.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. transport_routes — add route_code, fee
-- ----------------------------------------------------------------------------
ALTER TABLE public.transport_routes ADD COLUMN IF NOT EXISTS route_code TEXT;
ALTER TABLE public.transport_routes ADD COLUMN IF NOT EXISTS fee NUMERIC(10,2) DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_transport_routes_code ON public.transport_routes(route_code);
CREATE INDEX IF NOT EXISTS idx_transport_routes_status ON public.transport_routes(status);

-- ----------------------------------------------------------------------------
-- 2. transport_vehicles — add driver_license, fuel_type, last_service_date,
--    insurance_expiry, permit_expiry
-- ----------------------------------------------------------------------------
ALTER TABLE public.transport_vehicles ADD COLUMN IF NOT EXISTS driver_license TEXT;
ALTER TABLE public.transport_vehicles ADD COLUMN IF NOT EXISTS fuel_type TEXT DEFAULT 'diesel';
ALTER TABLE public.transport_vehicles ADD COLUMN IF NOT EXISTS last_service_date DATE;
ALTER TABLE public.transport_vehicles ADD COLUMN IF NOT EXISTS insurance_expiry DATE;
ALTER TABLE public.transport_vehicles ADD COLUMN IF NOT EXISTS permit_expiry DATE;
CREATE INDEX IF NOT EXISTS idx_transport_vehicles_status ON public.transport_vehicles(status);
CREATE INDEX IF NOT EXISTS idx_transport_vehicles_type ON public.transport_vehicles(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_transport_vehicles_route ON public.transport_vehicles(route_id);

-- ----------------------------------------------------------------------------
-- 3. transport_assignments — add monthly_fee
-- ----------------------------------------------------------------------------
ALTER TABLE public.transport_assignments ADD COLUMN IF NOT EXISTS monthly_fee NUMERIC(10,2) DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_transport_assignments_org ON public.transport_assignments(organisation_id);
CREATE INDEX IF NOT EXISTS idx_transport_assignments_student ON public.transport_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_transport_assignments_route ON public.transport_assignments(route_id);
CREATE INDEX IF NOT EXISTS idx_transport_assignments_vehicle ON public.transport_assignments(vehicle_id);

-- ----------------------------------------------------------------------------
-- 4. transport_expenses — create the missing table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transport_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.transport_vehicles(id) ON DELETE SET NULL,
  expense_type TEXT DEFAULT 'fuel',          -- fuel | maintenance | repair | insurance | permit | salary | other
  amount NUMERIC(10,2) DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transport_expenses_org ON public.transport_expenses(organisation_id);
CREATE INDEX IF NOT EXISTS idx_transport_expenses_vehicle ON public.transport_expenses(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_transport_expenses_type ON public.transport_expenses(expense_type);
CREATE INDEX IF NOT EXISTS idx_transport_expenses_date ON public.transport_expenses(date DESC);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY — org-scoped access for all four tables
-- ----------------------------------------------------------------------------
ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_expenses ENABLE ROW LEVEL SECURITY;

-- Org scope helper (safe to re-create; reused by other modules)
CREATE OR REPLACE FUNCTION public.fn_transport_org_scope()
RETURNS UUID AS $$
  SELECT organisation_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

DROP POLICY IF EXISTS "Transport routes org-scoped" ON public.transport_routes;
CREATE POLICY "Transport routes org-scoped"
  ON public.transport_routes FOR ALL
  USING (organisation_id = public.fn_transport_org_scope())
  WITH CHECK (organisation_id = public.fn_transport_org_scope());

DROP POLICY IF EXISTS "Transport vehicles org-scoped" ON public.transport_vehicles;
CREATE POLICY "Transport vehicles org-scoped"
  ON public.transport_vehicles FOR ALL
  USING (organisation_id = public.fn_transport_org_scope())
  WITH CHECK (organisation_id = public.fn_transport_org_scope());

DROP POLICY IF EXISTS "Transport assignments org-scoped" ON public.transport_assignments;
CREATE POLICY "Transport assignments org-scoped"
  ON public.transport_assignments FOR ALL
  USING (organisation_id = public.fn_transport_org_scope())
  WITH CHECK (organisation_id = public.fn_transport_org_scope());

DROP POLICY IF EXISTS "Transport expenses org-scoped" ON public.transport_expenses;
CREATE POLICY "Transport expenses org-scoped"
  ON public.transport_expenses FOR ALL
  USING (organisation_id = public.fn_transport_org_scope())
  WITH CHECK (organisation_id = public.fn_transport_org_scope());

COMMENT ON TABLE public.transport_expenses IS
  'Transport operating expenses (fuel, maintenance, repairs, insurance, permits, driver salaries).';
